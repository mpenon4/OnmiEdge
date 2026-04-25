"""
OmniEdge Hardware Simulator - Physics Engine Core

This is the SINGLE SOURCE OF TRUTH for hardware simulation.

Architecture:
- Reads hardware_manifest.(yaml|toml)
- Maintains SystemTelemetry as authoritative state
- Exposes physics simulation via standardized models
- Integrates with MCP via data models only

Physics Responsibilities:
1. Power budgeting and thermal modeling
2. Kinematics for robotics
3. Sensor simulation
4. Hardware conflict detection
5. Deterministic timestep-based simulation
"""

import yaml
import os
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List
from datetime import datetime
import json

from .models import (
    HardwareManifestV1,
    MCUSpec,
    ComponentSpec,
    SystemTelemetry,
    ComponentState,
    PhysicsOutput,
    validate_manifest,
    MCUType,
    PeripheralType,
    SimulationMode,
)


# Paths
MANIFEST_PATH = Path(__file__).parent.parent / "hardware_manifest.yaml"
SPECS_DIR = Path(__file__).parent.parent / "specs"


class PhysicsEngine:
    """
    Core physics simulation engine.
    
    Responsible for:
    - Reading component specifications
    - Computing power consumption
    - Thermal modeling
    - Conflict detection
    - State advancement
    """
    
    def __init__(self):
        self.state: SystemTelemetry = None
        self.manifest: HardwareManifestV1 = None
        self.timestep_us = 1000
    
    def load_manifest(self, manifest_path: str) -> HardwareManifestV1:
        """Parse hardware_manifest.yaml into typed model."""
        if not os.path.exists(manifest_path):
            raise FileNotFoundError(f"Manifest not found: {manifest_path}")
        
        with open(manifest_path, 'r', encoding='utf-8') as f:
            raw = yaml.safe_load(f)
        
        # TODO: Convert YAML to HardwareManifestV1
        # For now, store raw data
        self.manifest = raw
        return self.manifest
    
    def initialize_telemetry(self) -> SystemTelemetry:
        """Create initial system state."""
        self.state = SystemTelemetry(
            timestamp_us=0,
            mcu_core_temp_c=25.0,
            total_current_ma=0.0,
            total_power_mw=0.0,
            components={}
        )
        return self.state
    
    def step(self, delta_us: int = 1000) -> PhysicsOutput:
        """
        Advance simulation ONE timestep.
        
        This is called by:
        - Dev A for verification
        - Dev B for MCP query results
        - main.py for /status endpoint
        
        All simulation logic happens here.
        """
        if self.state is None:
            self.initialize_telemetry()
        
        # Advance timestamp
        self.state.timestamp_us += delta_us
        
        # TODO: compute_power_consumption()
        # TODO: compute_thermal_state()
        # TODO: advance_component_states()
        # TODO: check_hardware_conflicts()
        
        return PhysicsOutput(
            timestep_us=self.state.timestamp_us,
            telemetry=self.state
        )
    
    def compute_thermal_model(self) -> float:
        """
        Compute MCU junction temperature based on:
        - Component power dissipation
        - Thermal resistance
        - Ambient conditions
        
        Return: Temperature (°C)
        """
        # Simplified thermal model
        # TODO: Real thermal dynamics
        return 25.0 + (self.state.total_power_mw * 0.05)  # 0.05°C per mW


class HardwareSimulator:
    """
    High-level simulator orchestrator.
    
    Combines:
    - Manifest parsing
    - Physics engine
    - Component validation
    - State management
    """
    
    def __init__(self, manifest_path: str = None):
        self.manifest_path = manifest_path or str(MANIFEST_PATH)
        self.physics_engine = PhysicsEngine()
        self.manifest_data = self._load_manifest()
        self.physics_engine.initialize_telemetry()
    
    def _load_manifest(self) -> Dict[str, Any]:
        """Load and validate hardware manifest."""
        if not os.path.exists(self.manifest_path):
            raise FileNotFoundError(
                f"hardware_manifest.yaml not found in {self.manifest_path}\n"
                f"Expected at: {self.manifest_path}"
            )
        
        with open(self.manifest_path, "r", encoding="utf-8") as file:
            data = yaml.safe_load(file)
        
        if not data:
            raise ValueError("hardware_manifest.yaml is empty")
        
        return data
    
    def get_mcu_info(self) -> Dict[str, Any]:
        """Extract and validate MCU information."""
        hw = self.manifest_data.get("target_hardware", {})
        return {
            "mcu_id": hw.get("mcu_id", "Unknown"),
            "architecture": hw.get("architecture", "Unknown"),
            "clock_speed": hw.get("clock_speed", "Unknown"),
            "sram": hw.get("sram", "Unknown"),
        }
    
    def get_components(self) -> List[Dict[str, Any]]:
        """Get list of connected peripherals."""
        return self.manifest_data.get("components", [])
    
    def get_ai_config(self) -> Dict[str, Any]:
        """Get AI/ML configuration."""
        return self.manifest_data.get("ai_config", {})
    
    def compute_power_budget(self) -> Dict[str, float]:
        """
        PHYSICS FUNCTION: Calculate power consumption.
        
        Returns:
            {
                'total_mw': X,
                'headroom_mw': Y,
                'by_component': {...}
            }
        """
        # Placeholder for detailed power calculation
        components = self.get_components()
        total_mw = 0
        
        by_component = {}
        for comp in components:
            # P = V * I
            comp_power = comp.get('voltage', 5.0) * comp.get('current_ma', 100) / 1000
            total_mw += comp_power
            by_component[comp.get('id', 'unknown')] = comp_power
        
        return {
            "total_mw": total_mw,
            "by_component": by_component,
            "MCU reserved": 50,  # MCU + peripherals
        }
    
    def get_simulation_state(self) -> Dict[str, Any]:
        """
        Return current timestep state.
        Used by both MCP and REST API.
        """
        return {
            "timestamp_us": self.physics_engine.state.timestamp_us,
            "mcu_temp_c": self.physics_engine.state.mcu_core_temp_c,
            "total_power_mw": self.physics_engine.state.total_power_mw,
            "components": {
                cid: cstate.dict()
                for cid, cstate in self.physics_engine.state.components.items()
            },
            "warnings": self.physics_engine.state.warning_messages
        }


# Singleton instance (lazy-loaded)
_simulator_instance: Optional[HardwareSimulator] = None


def get_simulator(manifest_path: str = None) -> HardwareSimulator:
    """
    Factory function: Get singleton simulator instance.
    
    Benefits:
    - Manifest loaded once
    - Physics state shared across requests
    - Testable (can inject manifest_path)
    """
    global _simulator_instance
    
    if manifest_path or _simulator_instance is None:
        _simulator_instance = HardwareSimulator(manifest_path)
    
    return _simulator_instance


def reset_simulator() -> None:
    """Reset simulator (useful for testing)."""
    global _simulator_instance
    _simulator_instance = None


# ============================================================================
# PUBLIC API - What MCP and REST endpoints call
# ============================================================================

def get_hardware_status() -> Dict[str, Any]:
    """
    MAIN ENDPOINT: Returns complete hardware status.
    
    Called by:
    - REST API: GET /status
    - MCP query handler
    - Frontend telemetry
    
    Returns: SystemTelemetry JSON
    """
    sim = get_simulator()
    mcu_info = sim.get_mcu_info()
    power_info = sim.compute_power_budget()
    sim_state = sim.get_simulation_state()
    
    return {
        "mcu_info": mcu_info,
        "components_active": len(sim.get_components()),
        "power": power_info,
        "simulation": sim_state,
        "timestamp_ms": int(sim_state["timestamp_us"] / 1000),
        "status": "operational"
    }


def validate_hardware_config() -> Tuple[bool, List[str]]:
    """
    VALIDATION ENDPOINT: Check for conflicts/violations.
    
    Returns:
        (is_valid, warning_messages)
    """
    sim = get_simulator()
    power_info = sim.compute_power_budget()
    
    warnings = []
    
    # Power budget check
    if power_info["total_mw"] > 500:
        warnings.append(
            f"High power consumption: {power_info['total_mw']:.1f}mW "
            "(typical system < 250mW)"
        )
    
    # TODO: More validation logic
    
    return len(warnings) == 0, warnings

