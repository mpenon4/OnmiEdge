// Hardware Definition Layer
// Static specs and pin maps for supported MCUs.

export type McuId = "STM32H7" | "ESP32-S3" | "RP2040" | "NRF52840"

export type BusType = "i2c" | "spi" | "uart" | "can" | "usb" | "gpio"

export type PinSide = "top" | "right" | "bottom" | "left"

export type ComponentType = "lidar" | "bionic-hand" | "sensor" | "motor" | "display"

export interface PinDef {
  /** Pin label (e.g. "PB6") */
  id: string
  /** Position on the chip body */
  side: PinSide
  /** Index along that side, 0 == nearest to top-left corner walking clockwise */
  index: number
  /** Functional role for this pin in the active routing */
  role: string
  /** Optional bus this pin belongs to. When the bus is enabled, pin glows. */
  bus?: BusType
}

export interface BusSpec {
  type: BusType
  maxBandwidthMbps: number
  maxDevices: number
  description: string
}

export interface ComponentSpec {
  type: ComponentType
  displayName: string
  busType: BusType
  defaultPins: number // How many pins this component typically needs
  color: string
  description: string
}

export interface McuSpec {
  id: McuId
  fullName: string
  vendor: string
  arch: string
  core: string
  defaultClockMhz: number
  maxClockMhz: number
  flashKb: number
  sramKb: number
  package: string
  gpioCount: number
  voltage: string
  fpu: boolean
  dsp: boolean
  /** Pins per side for the schematic rendering. */
  pinsPerSide: number
  /** Important pins with bus mapping. Pins NOT listed render as plain GPIO. */
  pins: PinDef[]
}

const SIDES: PinSide[] = ["top", "right", "bottom", "left"]

/**
 * Build a generic pin grid for a chip. Returns N pins per side filled with
 * generic GPIO labels. Specific bus pins are layered on top by `withBuses`.
 */
function gpioGrid(pinsPerSide: number, prefix: string): PinDef[] {
  const pins: PinDef[] = []
  let counter = 0
  for (const side of SIDES) {
    for (let i = 0; i < pinsPerSide; i++) {
      pins.push({
        id: `${prefix}${counter++}`,
        side,
        index: i,
        role: "GPIO",
      })
    }
  }
  return pins
}

/**
 * Override specific pins on the grid with bus assignments.
 * Existing pin id is preserved; role/bus are merged in.
 */
function withBuses(
  base: PinDef[],
  overrides: { side: PinSide; index: number; id: string; role: string; bus: BusType }[],
): PinDef[] {
  const out = base.map((p) => ({ ...p }))
  for (const o of overrides) {
    const target = out.find((p) => p.side === o.side && p.index === o.index)
    if (target) {
      target.id = o.id
      target.role = o.role
      target.bus = o.bus
    }
  }
  return out
}

// ────────────────────────────────────────────────────────────────────────────────
// STM32H7 (LQFP-176, 14 visible pins per side schematic)
// ────────────────────────────────────────────────────────────────────────────────
const STM32H7: McuSpec = {
  id: "STM32H7",
  fullName: "STM32H753ZIT6",
  vendor: "STMicroelectronics",
  arch: "ARMv7E-M",
  core: "Cortex-M7",
  defaultClockMhz: 480,
  maxClockMhz: 480,
  flashKb: 2048,
  sramKb: 1024,
  package: "LQFP-176",
  gpioCount: 168,
  voltage: "1.62-3.6V",
  fpu: true,
  dsp: true,
  pinsPerSide: 14,
  pins: withBuses(gpioGrid(14, "P"), [
    // I2C1
    { side: "top", index: 4, id: "PB6", role: "I2C1_SCL", bus: "i2c" },
    { side: "top", index: 5, id: "PB7", role: "I2C1_SDA", bus: "i2c" },
    // SPI1
    { side: "left", index: 5, id: "PA5", role: "SPI1_SCK", bus: "spi" },
    { side: "left", index: 6, id: "PA6", role: "SPI1_MISO", bus: "spi" },
    { side: "left", index: 7, id: "PA7", role: "SPI1_MOSI", bus: "spi" },
    // USART1
    { side: "right", index: 5, id: "PA9", role: "USART1_TX", bus: "uart" },
    { side: "right", index: 6, id: "PA10", role: "USART1_RX", bus: "uart" },
    // FDCAN1
    { side: "right", index: 9, id: "PD0", role: "FDCAN1_RX", bus: "can" },
    { side: "right", index: 10, id: "PD1", role: "FDCAN1_TX", bus: "can" },
    // USB OTG_FS
    { side: "bottom", index: 5, id: "PA11", role: "OTG_FS_DM", bus: "usb" },
    { side: "bottom", index: 6, id: "PA12", role: "OTG_FS_DP", bus: "usb" },
  ]),
}

// ────────────────────────────────────────────────────────────────────────────────
// ESP32-S3
// ────────────────────────────────────────────────────────────────────────────────
const ESP32_S3: McuSpec = {
  id: "ESP32-S3",
  fullName: "ESP32-S3-WROOM-1",
  vendor: "Espressif Systems",
  arch: "Xtensa LX7",
  core: "Dual-core LX7",
  defaultClockMhz: 240,
  maxClockMhz: 240,
  flashKb: 8192,
  sramKb: 512,
  package: "QFN-56 / Module",
  gpioCount: 45,
  voltage: "3.0-3.6V",
  fpu: true,
  dsp: true,
  pinsPerSide: 11,
  pins: withBuses(gpioGrid(11, "GPIO"), [
    { side: "top", index: 3, id: "GPIO9", role: "I2C0_SCL", bus: "i2c" },
    { side: "top", index: 4, id: "GPIO8", role: "I2C0_SDA", bus: "i2c" },
    { side: "left", index: 4, id: "GPIO12", role: "SPI2_SCK", bus: "spi" },
    { side: "left", index: 5, id: "GPIO13", role: "SPI2_MISO", bus: "spi" },
    { side: "left", index: 6, id: "GPIO11", role: "SPI2_MOSI", bus: "spi" },
    { side: "right", index: 4, id: "GPIO43", role: "UART0_TX", bus: "uart" },
    { side: "right", index: 5, id: "GPIO44", role: "UART0_RX", bus: "uart" },
    { side: "bottom", index: 4, id: "GPIO19", role: "USB_DM", bus: "usb" },
    { side: "bottom", index: 5, id: "GPIO20", role: "USB_DP", bus: "usb" },
  ]),
}

// ────────────────────────────────────────────────────────────────────────────────
// RP2040
// ────────────────────────────────────────────────────────────────────────────────
const RP2040: McuSpec = {
  id: "RP2040",
  fullName: "RP2040",
  vendor: "Raspberry Pi Ltd",
  arch: "ARMv6-M",
  core: "Dual Cortex-M0+",
  defaultClockMhz: 133,
  maxClockMhz: 133,
  flashKb: 0,
  sramKb: 264,
  package: "QFN-56",
  gpioCount: 30,
  voltage: "1.8-3.3V",
  fpu: false,
  dsp: false,
  pinsPerSide: 9,
  pins: withBuses(gpioGrid(9, "GP"), [
    { side: "top", index: 3, id: "GP4", role: "I2C0_SDA", bus: "i2c" },
    { side: "top", index: 4, id: "GP5", role: "I2C0_SCL", bus: "i2c" },
    { side: "left", index: 3, id: "GP18", role: "SPI0_SCK", bus: "spi" },
    { side: "left", index: 4, id: "GP19", role: "SPI0_TX", bus: "spi" },
    { side: "left", index: 5, id: "GP16", role: "SPI0_RX", bus: "spi" },
    { side: "right", index: 3, id: "GP0", role: "UART0_TX", bus: "uart" },
    { side: "right", index: 4, id: "GP1", role: "UART0_RX", bus: "uart" },
    { side: "bottom", index: 3, id: "USB_DM", role: "USB_DM", bus: "usb" },
    { side: "bottom", index: 4, id: "USB_DP", role: "USB_DP", bus: "usb" },
  ]),
}

// ────────────────────────────────────────────────────────────────────────────────
// NRF52840
// ────────────────────────────────────────────────────────────────────────────────
const NRF52840: McuSpec = {
  id: "NRF52840",
  fullName: "nRF52840-QIAA",
  vendor: "Nordic Semiconductor",
  arch: "ARMv7E-M",
  core: "Cortex-M4F",
  defaultClockMhz: 64,
  maxClockMhz: 64,
  flashKb: 1024,
  sramKb: 256,
  package: "aQFN-73",
  gpioCount: 48,
  voltage: "1.7-5.5V",
  fpu: true,
  dsp: true,
  pinsPerSide: 12,
  pins: withBuses(gpioGrid(12, "P0."), [
    { side: "top", index: 4, id: "P0.27", role: "TWI0_SCL", bus: "i2c" },
    { side: "top", index: 5, id: "P0.26", role: "TWI0_SDA", bus: "i2c" },
    { side: "left", index: 5, id: "P0.13", role: "SPI0_SCK", bus: "spi" },
    { side: "left", index: 6, id: "P0.14", role: "SPI0_MOSI", bus: "spi" },
    { side: "left", index: 7, id: "P0.15", role: "SPI0_MISO", bus: "spi" },
    { side: "right", index: 4, id: "P0.06", role: "UART0_TX", bus: "uart" },
    { side: "right", index: 5, id: "P0.08", role: "UART0_RX", bus: "uart" },
    { side: "bottom", index: 5, id: "USB_DM", role: "USB_DM", bus: "usb" },
    { side: "bottom", index: 6, id: "USB_DP", role: "USB_DP", bus: "usb" },
  ]),
}

export const HARDWARE_DB: Record<McuId, McuSpec> = {
  STM32H7,
  "ESP32-S3": ESP32_S3,
  RP2040,
  NRF52840,
}

export const SUPPORTED_MCUS: McuId[] = ["STM32H7", "ESP32-S3", "RP2040", "NRF52840"]

export const BUS_SPECS: Record<BusType, BusSpec> = {
  i2c: {
    type: "i2c",
    maxBandwidthMbps: 3.4,
    maxDevices: 128,
    description: "Inter-Integrated Circuit",
  },
  spi: {
    type: "spi",
    maxBandwidthMbps: 100,
    maxDevices: 4,
    description: "Serial Peripheral Interface",
  },
  uart: {
    type: "uart",
    maxBandwidthMbps: 0.115,
    maxDevices: 1,
    description: "Universal Async Receiver-Transmitter",
  },
  can: {
    type: "can",
    maxBandwidthMbps: 1.0,
    maxDevices: 32,
    description: "Controller Area Network",
  },
  usb: {
    type: "usb",
    maxBandwidthMbps: 480,
    maxDevices: 127,
    description: "Universal Serial Bus",
  },
  gpio: {
    type: "gpio",
    maxBandwidthMbps: 0,
    maxDevices: 255,
    description: "General Purpose Input Output",
  },
}

export const COMPONENT_SPECS: Record<ComponentType, ComponentSpec> = {
  lidar: {
    type: "lidar",
    displayName: "LiDAR Sensor",
    busType: "spi",
    defaultPins: 4,
    color: "#FF8C00",
    description: "3D depth sensing via SPI protocol",
  },
  "bionic-hand": {
    type: "bionic-hand",
    displayName: "Bionic Hand Controller",
    busType: "i2c",
    defaultPins: 2,
    color: "#00E5FF",
    description: "I2C-based prosthetic control",
  },
  sensor: {
    type: "sensor",
    displayName: "Multi-Axis Sensor",
    busType: "i2c",
    defaultPins: 2,
    color: "#39FF14",
    description: "Accelerometer, gyro, thermometer via I2C",
  },
  motor: {
    type: "motor",
    displayName: "Motor Driver",
    busType: "gpio",
    defaultPins: 6,
    color: "#FFAA00",
    description: "PWM motor control via GPIO",
  },
  display: {
    type: "display",
    displayName: "OLED Display",
    busType: "i2c",
    defaultPins: 2,
    color: "#E5E5E5",
    description: "128x64 monochrome display via I2C",
  },
}

export function getMcu(id: string | undefined | null): McuSpec {
  if (id && (id as McuId) in HARDWARE_DB) {
    return HARDWARE_DB[id as McuId]
  }
  return HARDWARE_DB.STM32H7
}
