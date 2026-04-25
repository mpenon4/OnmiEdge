"""
OmniEdge Core Models - Single Source of Truth (SSoT)

These Pydantic models are the CONTRACT between:
- Dev A (Physics Engines)
- Dev B (MCP Integration)

RULE: No direct function calls between modules.
Data flows through these models only.
"""

from pydantic import BaseModel, Field, validator
from enum import Enum
from typing import Dict, List, Optional, Literal
from datetime import datetime


# ============================================================================
# ENUMERATIONS (Type Safety)
# ============================================================================

class MCUType(str, Enum):
    """Supported microcontroller families."""
    STM32H7 = "stm32h7"
    STM32F4 = "stm32f4"
    ESP32 = "esp32"
    RP2040 = "rp2040"
    NRFX = "nrfx"


class ComponentType(str, Enum):
    """Hardware component classes."""
    SERVO = "servo"
    MOTOR_DC = "motor_dc"
    MOTOR_BLDC = "motor_bldc"
    SENSOR_IMU = "sensor_imu"
    SENSOR_LIDAR = "sensor_lidar"
    SENSOR_TEMP = "sensor_temp"
    SENSOR_CURRENT = "sensor_current"
    SENSOR_VOLTAGE = "sensor_voltage"
    RF_MODULE = "rf_module"
    POWER_REGULATOR = "power_regulator"


class PeripheralType(str, Enum):
    """Microcontroller peripherals."""
    GPIO = "gpio"
    UART = "uart"
    SPI = "spi"
    I2C = "i2c"
    CAN = "can"
    ADC = "adc"
    PWM = "pwm"
    USB = "usb"
    ETHERNET = "ethernet"


class SimulationMode(str, Enum):
    """Simulation fidelity levels."""
    BEHAVIORAL = "behavioral"      # Fast, approx. values
    PHENOMENOLOGICAL = "phenomenological"  # Reality-based
    PHYSICS_ACCURATE = "physics_accurate"  # Full equations


# ============================================================================
# MCU SPECIFICATIONS
# ============================================================================

class CoreSpec(BaseModel):
    """CPU core details."""
    name: str = Field(..., description="Cortex-M7, Cortex-A53, etc.")
    frequency_mhz: float = Field(..., description="Default clock speed MHz")
    voltage_nominal_v: float = Field(3.3, description="Operating voltage")
    tdp_mw: float = Field(..., description="Thermal Design Power (mW)")


class MemorySpec(BaseModel):
    """RAM and Flash configuration."""
    flash_kb: int = Field(..., description="Flash storage KB")
    sram_kb: int = Field(..., description="SRAM KB")
    eeprom_kb: Optional[int] = Field(0, description="EEPROM KB")
    
    @validator('flash_kb', 'sram_kb', 'eeprom_kb')
    def must_be_positive(cls, v):
        if v < 0:
            raise ValueError('Memory size must be positive')
        return v


class PeripheralConfig(BaseModel):
    """Peripheral capability declaration."""
    type: PeripheralType
    count: int = Field(1, description="Number of instances")
    clock_mhz: float = Field(..., description="Peripheral clock frequency")
    features: List[str] = Field(default_factory=list, description="e.g., 'DMA', 'FIFO'")


class MCUSpec(BaseModel):
    """Complete microcontroller specification."""
    mcu_id: MCUType
    model_name: str = Field(..., description="e.g., STM32H743")
    vendor: str = Field(..., description="STMicroelectronics, Espressif, etc.")
    
    core: CoreSpec
    memory: MemorySpec
    peripherals: Dict[PeripheralType, PeripheralConfig] = Field(default_factory=dict)
    
    temperature_max_c: float = Field(85.0, description="Max operating temp °C")
    temperature_junction_c: Optional[float] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "mcu_id": "stm32h7",
                "model_name": "STM32H743",
                "vendor": "STMicroelectronics",
                "core": {"name": "Cortex-M7", "frequency_mhz": 480, "voltage_nominal_v": 3.3, "tdp_mw": 420},
                "memory": {"flash_kb": 2048, "sram_kb": 512},
            }
        }


# ============================================================================
# COMPONENT SPECIFICATIONS (Peripherals)
# ============================================================================

class ComponentSpec(BaseModel):
    """Base class for all components."""
    component_id: str = Field(..., description="Unique identifier")
    type: ComponentType
    manufacturer: str
    model: str
    
    # Physics properties
    voltage_nominal_v: float = Field(5.0, description="Nominal operating voltage")
    current_nominal_ma: float = Field(..., description="Nominal current consumption")
    power_nominal_mw: Optional[float] = None
    
    # Thermal properties
    thermal_resistance_ck: Optional[float] = Field(None, description="°C/mW")
    max_temperature_c: Optional[float] = Field(None, description="Max junction temp")
    
    # Connection
    peripheral_type: PeripheralType = Field(..., description="GPIO, PWM, I2C, SPI, etc.")
    pin_count: int = Field(1, description="Number of pins/connections")


class ServoSpec(ComponentSpec):
    """Servo motor specification."""
    type: Literal[ComponentType.SERVO] = ComponentType.SERVO
    
    torque_kg_cm: float = Field(..., description="Stall torque")
    speed_rpm_60deg: float = Field(..., description="Speed at 6.0V")
    weight_g: float = Field(..., description="Weight grams")
    response_time_ms: float = Field(100, description="Lag/response time")


class SensorSpec(ComponentSpec):
    """Generic sensor specification."""
    sample_rate_hz: float = Field(100, description="Default sampling rate")
    resolution_bits: int = Field(12, description="ADC resolution")
    accuracy_percent: float = Field(5.0, description="±accuracy %")


# ============================================================================
# HARDWARE MANIFEST (Configuration)
# ============================================================================

class HardwareManifestV1(BaseModel):
    """
    Complete hardware configuration.
    
    This is what lives in hardware_manifest.toml/yaml
    and represents ONE hardware configuration.
    """
    project_name: str
    version: str = "1.0.0"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # MCU Selection
    mcu_spec: MCUSpec
    
    # Connected Components
    components: List[ComponentSpec] = Field(default_factory=list)
    
    # Power Budget
    power_budget_mw: float = Field(..., description="Total available power")
    battery_voltage_v: float = Field(5.0)
    
    # Configuration
    simulation_mode: SimulationMode = SimulationMode.PHENOMENOLOGICAL
    timestep_us: int = Field(1000, description="Physics update interval µs")
    
    class Config:
        use_enum_values = False


# ============================================================================
# SIMULATION STATE (Real-time Data)
# ============================================================================

class ComponentState(BaseModel):
    """Real-time state of a component."""
    component_id: str
    is_active: bool = False
    
    # Electrical state
    current_ma: float = 0.0
    voltage_applied_v: float = 0.0
    power_consumed_mw: float = 0.0
    
    # Thermal state
    temperature_c: float = 25.0
    
    # Optional: Component-specific state
    servo_angle_deg: Optional[float] = None
    motor_rpm: Optional[float] = None
    sensor_value: Optional[float] = None


class SystemTelemetry(BaseModel):
    """Complete system state snapshot."""
    timestamp_us: int = Field(..., description="Simulation microsecond timestamp")
    mcu_core_temp_c: float = Field(25.0)
    
    # Power state
    total_current_ma: float = 0.0
    total_power_mw: float = 0.0
    power_headroom_mw: float = 0.0
    
    # Component states
    components: Dict[str, ComponentState] = Field(default_factory=dict)
    
    # System health
    is_thermal_throttled: bool = False
    is_vin_brown_out: bool = False
    warning_messages: List[str] = Field(default_factory=list)


class PhysicsOutput(BaseModel):
    """Output from physics engine simulation step."""
    timestep_us: int
    telemetry: SystemTelemetry
    error_code: Optional[int] = None
    error_message: Optional[str] = None


# ============================================================================
# MCP COMMAND TYPES (AI Integration)
# ============================================================================

class MCPQuery(BaseModel):
    """A query from an LLM via MCP."""
    query_id: str
    timestamp_ms: int
    question: str = Field(..., description="Natural language query")
    context: Optional[Dict] = Field(default_factory=dict)


class MCPResponse(BaseModel):
    """Response from OmniEdge to MCP client."""
    query_id: str
    timestamp_ms: int
    status: Literal["success", "error", "partial"]
    data: Dict = Field(default_factory=dict)
    reasoning: Optional[str] = Field(None, description="Explain answer")


class MCPCommand(BaseModel):
    """Command from LLM to hardware (via MCP)."""
    command_id: str
    component_id: str
    action: str = Field(..., description="set_pwm, read_sensor, etc.")
    parameters: Dict[str, float] = Field(default_factory=dict)


class MCPCommandResult(BaseModel):
    """Result of command execution."""
    command_id: str
    success: bool
    new_state: Optional[ComponentState] = None
    message: Optional[str] = None


# ============================================================================
# VALIDATION & EXPORTS
# ============================================================================

def validate_manifest(manifest: HardwareManifestV1) -> tuple[bool, List[str]]:
    """
    Validate hardware manifest for physical feasibility.
    
    Returns:
        (is_valid, warning_list)
    """
    warnings = []
    
    # Check total power budget
    total_nominal_power = sum(
        comp.power_nominal_mw or (comp.voltage_nominal_v * comp.current_nominal_ma)
        for comp in manifest.components
    )
    
    if total_nominal_power > manifest.power_budget_mw:
        warnings.append(
            f"Power budget exceeded: {total_nominal_power:.1f}mW > {manifest.power_budget_mw:.1f}mW"
        )
    
    # Check component count against MCU peripherals
    gpio_needed = sum(1 for c in manifest.components if c.peripheral_type == PeripheralType.GPIO)
    if gpio_needed > manifest.mcu_spec.peripherals.get(PeripheralType.GPIO, PeripheralConfig(type=PeripheralType.GPIO, clock_mhz=0, count=0)).count:
        warnings.append(f"GPIO count mismatch: need {gpio_needed}, have {manifest.mcu_spec.peripherals.get(PeripheralType.GPIO, PeripheralConfig(type=PeripheralType.GPIO, clock_mhz=0, count=0)).count}")
    
    return len(warnings) == 0, warnings
