export type PinFunction =
  | "POWER"
  | "GND"
  | "GPIO"
  | "I2C_SDA"
  | "I2C_SCL"
  | "SPI_SCK"
  | "SPI_MISO"
  | "SPI_MOSI"
  | "SPI_CS"
  | "UART_TX"
  | "UART_RX"
  | "USB_DM"
  | "USB_DP"
  | "CAN_TX"
  | "CAN_RX"
  | "ADC"
  | "PWM"
  | "RESET"
  | "CLK"

export type Pin = {
  id: string
  label: string
  fn: PinFunction
}

export type McuModel = {
  id: string
  fullName: string
  vendor: string
  core: string
  defaultClockMhz: number
  flashKb: number
  sramKb: number
  // Pins per side, in clockwise order: top (left→right), right (top→bottom), bottom (right→left), left (bottom→top)
  top: Pin[]
  right: Pin[]
  bottom: Pin[]
  left: Pin[]
}

const p = (id: string, label: string, fn: PinFunction): Pin => ({ id, label, fn })

export const MCU_MODELS: Record<string, McuModel> = {
  STM32H7: {
    id: "STM32H7",
    fullName: "STM32H743ZI",
    vendor: "STMicroelectronics",
    core: "Cortex-M7",
    defaultClockMhz: 480,
    flashKb: 2048,
    sramKb: 1024,
    top: [
      p("VDD1", "VDD", "POWER"),
      p("PA0", "PA0", "ADC"),
      p("PA1", "PA1", "ADC"),
      p("PA2", "PA2", "UART_TX"),
      p("PA3", "PA3", "UART_RX"),
      p("PA4", "PA4", "GPIO"),
      p("PA5", "PA5", "SPI_SCK"),
      p("PA6", "PA6", "SPI_MISO"),
      p("PA7", "PA7", "SPI_MOSI"),
      p("GND1", "GND", "GND"),
    ],
    right: [
      p("PB6", "PB6", "I2C_SCL"),
      p("PB7", "PB7", "I2C_SDA"),
      p("PB8", "PB8", "CAN_RX"),
      p("PB9", "PB9", "CAN_TX"),
      p("PB10", "PB10", "GPIO"),
      p("PB12", "PB12", "SPI_CS"),
      p("PB13", "PB13", "PWM"),
      p("PB14", "PB14", "PWM"),
      p("PB15", "PB15", "GPIO"),
      p("VDD2", "VDD", "POWER"),
    ],
    bottom: [
      p("GND2", "GND", "GND"),
      p("PC0", "PC0", "ADC"),
      p("PC1", "PC1", "ADC"),
      p("PC2", "PC2", "GPIO"),
      p("PC3", "PC3", "GPIO"),
      p("PA11", "PA11", "USB_DM"),
      p("PA12", "PA12", "USB_DP"),
      p("PC10", "PC10", "GPIO"),
      p("PC11", "PC11", "GPIO"),
      p("VDD3", "VDD", "POWER"),
    ],
    left: [
      p("NRST", "NRST", "RESET"),
      p("OSC_IN", "OSC", "CLK"),
      p("OSC_OUT", "OSC", "CLK"),
      p("PD0", "PD0", "GPIO"),
      p("PD1", "PD1", "GPIO"),
      p("PD2", "PD2", "UART_TX"),
      p("PD3", "PD3", "UART_RX"),
      p("PD4", "PD4", "GPIO"),
      p("PD5", "PD5", "GPIO"),
      p("GND3", "GND", "GND"),
    ],
  },
  STM32F4: {
    id: "STM32F4",
    fullName: "STM32F407VG",
    vendor: "STMicroelectronics",
    core: "Cortex-M4",
    defaultClockMhz: 168,
    flashKb: 1024,
    sramKb: 192,
    top: [
      p("VDD1", "VDD", "POWER"),
      p("PA0", "PA0", "ADC"),
      p("PA1", "PA1", "ADC"),
      p("PA2", "PA2", "UART_TX"),
      p("PA3", "PA3", "UART_RX"),
      p("PA5", "PA5", "SPI_SCK"),
      p("PA6", "PA6", "SPI_MISO"),
      p("PA7", "PA7", "SPI_MOSI"),
      p("GND1", "GND", "GND"),
    ],
    right: [
      p("PB6", "PB6", "I2C_SCL"),
      p("PB7", "PB7", "I2C_SDA"),
      p("PB8", "PB8", "CAN_RX"),
      p("PB9", "PB9", "CAN_TX"),
      p("PB12", "PB12", "SPI_CS"),
      p("PB13", "PB13", "PWM"),
      p("PB14", "PB14", "GPIO"),
      p("PB15", "PB15", "GPIO"),
      p("VDD2", "VDD", "POWER"),
    ],
    bottom: [
      p("GND2", "GND", "GND"),
      p("PC0", "PC0", "ADC"),
      p("PC1", "PC1", "ADC"),
      p("PC2", "PC2", "GPIO"),
      p("PA11", "PA11", "USB_DM"),
      p("PA12", "PA12", "USB_DP"),
      p("PC10", "PC10", "GPIO"),
      p("PC11", "PC11", "GPIO"),
      p("VDD3", "VDD", "POWER"),
    ],
    left: [
      p("NRST", "NRST", "RESET"),
      p("OSC_IN", "OSC", "CLK"),
      p("OSC_OUT", "OSC", "CLK"),
      p("PD0", "PD0", "GPIO"),
      p("PD2", "PD2", "UART_TX"),
      p("PD3", "PD3", "UART_RX"),
      p("PD4", "PD4", "GPIO"),
      p("PD5", "PD5", "GPIO"),
      p("GND3", "GND", "GND"),
    ],
  },
  ESP32: {
    id: "ESP32",
    fullName: "ESP32-WROOM-32",
    vendor: "Espressif Systems",
    core: "Xtensa LX6 dual",
    defaultClockMhz: 240,
    flashKb: 4096,
    sramKb: 520,
    top: [
      p("3V3", "3V3", "POWER"),
      p("EN", "EN", "RESET"),
      p("IO36", "IO36", "ADC"),
      p("IO39", "IO39", "ADC"),
      p("IO34", "IO34", "GPIO"),
      p("IO35", "IO35", "GPIO"),
      p("IO32", "IO32", "PWM"),
      p("IO33", "IO33", "PWM"),
    ],
    right: [
      p("IO25", "IO25", "GPIO"),
      p("IO26", "IO26", "GPIO"),
      p("IO27", "IO27", "I2C_SCL"),
      p("IO14", "IO14", "I2C_SDA"),
      p("IO12", "IO12", "SPI_MISO"),
      p("IO13", "IO13", "SPI_MOSI"),
      p("GND1", "GND", "GND"),
      p("IO15", "IO15", "SPI_SCK"),
    ],
    bottom: [
      p("IO2", "IO2", "GPIO"),
      p("IO0", "IO0", "GPIO"),
      p("IO4", "IO4", "GPIO"),
      p("IO16", "IO16", "UART_RX"),
      p("IO17", "IO17", "UART_TX"),
      p("IO5", "IO5", "SPI_CS"),
      p("IO18", "IO18", "GPIO"),
      p("IO19", "IO19", "USB_DM"),
    ],
    left: [
      p("VIN", "VIN", "POWER"),
      p("GND2", "GND", "GND"),
      p("IO23", "IO23", "USB_DP"),
      p("IO22", "IO22", "CAN_TX"),
      p("TXD0", "TX0", "UART_TX"),
      p("RXD0", "RX0", "UART_RX"),
      p("IO21", "IO21", "CAN_RX"),
      p("GND3", "GND", "GND"),
    ],
  },
}

export const MCU_LIST = Object.values(MCU_MODELS)

// Color mapping by pin function
export const PIN_COLORS: Record<PinFunction, { active: string; idle: string; label: string }> = {
  POWER: { active: "#FF3D00", idle: "#3a1a10", label: "VDD" },
  GND: { active: "#555555", idle: "#222222", label: "GND" },
  GPIO: { active: "#888888", idle: "#2a2a2a", label: "GPIO" },
  I2C_SDA: { active: "#00E5FF", idle: "#0a3942", label: "I2C-SDA" },
  I2C_SCL: { active: "#00E5FF", idle: "#0a3942", label: "I2C-SCL" },
  SPI_SCK: { active: "#39FF14", idle: "#0e3a08", label: "SPI-SCK" },
  SPI_MISO: { active: "#39FF14", idle: "#0e3a08", label: "SPI-MISO" },
  SPI_MOSI: { active: "#39FF14", idle: "#0e3a08", label: "SPI-MOSI" },
  SPI_CS: { active: "#39FF14", idle: "#0e3a08", label: "SPI-CS" },
  UART_TX: { active: "#FFAA00", idle: "#3a2a08", label: "UART-TX" },
  UART_RX: { active: "#FFAA00", idle: "#3a2a08", label: "UART-RX" },
  USB_DM: { active: "#FF3DFF", idle: "#3a0e3a", label: "USB-DM" },
  USB_DP: { active: "#FF3DFF", idle: "#3a0e3a", label: "USB-DP" },
  CAN_TX: { active: "#FFAA00", idle: "#3a2a08", label: "CAN-TX" },
  CAN_RX: { active: "#FFAA00", idle: "#3a2a08", label: "CAN-RX" },
  ADC: { active: "#00E5FF", idle: "#0a3942", label: "ADC" },
  PWM: { active: "#39FF14", idle: "#0e3a08", label: "PWM" },
  RESET: { active: "#FF3D00", idle: "#3a1a10", label: "NRST" },
  CLK: { active: "#00E5FF", idle: "#0a3942", label: "CLOCK" },
}

export type BusId = "i2c" | "spi" | "uart" | "can" | "usb"

export const BUS_FUNCTIONS: Record<BusId, PinFunction[]> = {
  i2c: ["I2C_SDA", "I2C_SCL"],
  spi: ["SPI_SCK", "SPI_MISO", "SPI_MOSI", "SPI_CS"],
  uart: ["UART_TX", "UART_RX"],
  can: ["CAN_TX", "CAN_RX"],
  usb: ["USB_DM", "USB_DP"],
}

export const BUS_META: Record<BusId, { name: string; color: string }> = {
  i2c: { name: "I²C", color: "#00E5FF" },
  spi: { name: "SPI", color: "#39FF14" },
  uart: { name: "UART", color: "#FFAA00" },
  can: { name: "CAN", color: "#FFAA00" },
  usb: { name: "USB", color: "#FF3DFF" },
}
