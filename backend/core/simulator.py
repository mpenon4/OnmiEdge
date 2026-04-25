"""
Hardware Simulator - Lectura y procesamiento del manifest YAML

Este módulo centraliza toda la lógica de lectura y simulación del hardware.
Responsabilidades:
  - Parsear hardware_manifest.yaml
  - Simular lecturas de sensores y estado del MCU
  - Validar configuración de hardware
"""

import yaml
import os
from pathlib import Path
from typing import Dict, Any

# Ruta relativa del manifest - funciona desde cualquier lugar
MANIFEST_PATH = Path(__file__).parent.parent / "hardware_manifest.yaml"


class HardwareSimulator:
    """
    Simulador de hardware que lee y procesa el manifest YAML.
    
    Separa la lógica de simulación del API, permitiendo:
    - Reutilización en múltiples endpoints
    - Testing independiente
    - Fácil extensión para MCP Server
    """
    
    def __init__(self, manifest_path: str = None):
        """
        Inicializa el simulador con el manifest.
        
        Args:
            manifest_path: Ruta al archivo YAML (default: backend/hardware_manifest.yaml)
        """
        self.manifest_path = manifest_path or str(MANIFEST_PATH)
        self.manifest_data = self._load_manifest()
    
    def _load_manifest(self) -> Dict[str, Any]:
        """
        Carga y valida el archivo YAML.
        
        Returns:
            Diccionario con los datos del manifest
        
        Raises:
            FileNotFoundError: Si el archivo no existe
            yaml.YAMLError: Si el YAML es inválido
        """
        if not os.path.exists(self.manifest_path):
            raise FileNotFoundError(
                f"hardware_manifest.yaml no encontrado en {self.manifest_path}"
            )
        
        with open(self.manifest_path, "r", encoding="utf-8") as file:
            data = yaml.safe_load(file)
        
        return data or {}
    
    def get_mcu_info(self) -> Dict[str, Any]:
        """
        Extrae información del MCU desde el manifest.
        
        Returns:
            Dict con id, arquitectura, speed, memoria
        """
        hw = self.manifest_data.get("target_hardware", {})
        return {
            "mcu_id": hw.get("mcu_id", "Unknown"),
            "architecture": hw.get("architecture", "Unknown"),
            "clock_speed": hw.get("clock_speed", "Unknown"),
            "sram": hw.get("sram", "Unknown"),
        }
    
    def get_components(self) -> list:
        """
        Obtiene la lista de componentes conectados.
        
        Returns:
            Lista de componentes con sus configs
        """
        return self.manifest_data.get("components", [])
    
    def get_ai_config(self) -> Dict[str, Any]:
        """
        Obtiene la configuración de AI/ML del proyecto.
        
        Returns:
            Dict con rutas de modelos, runtime, optimizaciones
        """
        return self.manifest_data.get("ai_config", {})


# Instancia global del simulador (lazy-loaded)
_simulator_instance = None


def get_simulator(manifest_path: str = None) -> HardwareSimulator:
    """
    Factory para obtener la instancia del simulador.
    Patrón Singleton para reutilizar conexiones/parseos.
    
    Args:
        manifest_path: Ruta al manifest (solo para testing)
    
    Returns:
        HardwareSimulator instance
    """
    global _simulator_instance
    
    if manifest_path or _simulator_instance is None:
        _simulator_instance = HardwareSimulator(manifest_path)
    
    return _simulator_instance


def get_hardware_status() -> Dict[str, Any]:
    """
    Endpoint principal que retorna el estado completo del hardware.
    
    Simula lecturas en tiempo real combinando datos del manifest
    con telemetría sintética.
    
    Returns:
        Dict con MCU info, componentes, y telemetría simulada
    """
    sim = get_simulator()
    mcu_info = sim.get_mcu_info()
    
    return {
        "mcu_detectado": mcu_info["mcu_id"],
        "memoria_disponible": mcu_info["sram"],
        "arquitectura": mcu_info["architecture"],
        "velocidad": mcu_info["clock_speed"],
        "componentes_activos": len(sim.get_components()),
        "estado": "Sincronizado",
        "telemetria": {
            "cpu_usage": "15%",
            "temp": "38°C"
        },
        "manifest_version": sim.manifest_data.get("version", "unknown")
    }
