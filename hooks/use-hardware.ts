"use client"

import { useMemo } from "react"
import { type BusType, getMcu, type McuId, type McuSpec, type PinDef } from "@/lib/hardware-db"

export interface PeripheralFlags {
  i2c_bus: boolean
  spi_bus: boolean
  uart: boolean
  can_bus: boolean
  usb: boolean
}

export interface HardwareConfig {
  mcuId: McuId
  clockMhz: number | null
  flashKb: number | null
  sramKb: number | null
  peripherals: PeripheralFlags
  /** Lines that the parser flagged as warnings (e.g. unknown peripheral). */
  warnings: string[]
}

const PERIPHERAL_KEYS: (keyof PeripheralFlags)[] = ["i2c_bus", "spi_bus", "uart", "can_bus", "usb"]

const PERIPHERAL_TO_BUS: Record<keyof PeripheralFlags, BusType> = {
  i2c_bus: "i2c",
  spi_bus: "spi",
  uart: "uart",
  can_bus: "can",
  usb: "usb",
}

/**
 * Strip a trailing inline comment from a YAML value.
 */
function stripComment(value: string): string {
  const hashIdx = value.indexOf("#")
  return (hashIdx >= 0 ? value.slice(0, hashIdx) : value).trim().replace(/^["']|["']$/g, "")
}

/**
 * Find the first non-empty value for a key in a YAML document.
 * Indentation is ignored (we only have a tiny fixed schema).
 */
function readKey(yaml: string, key: string): string | undefined {
  const re = new RegExp(`^\\s*${key}\\s*:\\s*(.*)$`, "m")
  const m = yaml.match(re)
  if (!m) return undefined
  const v = stripComment(m[1] ?? "")
  return v.length > 0 ? v : undefined
}

function readNumber(yaml: string, key: string): number | null {
  const v = readKey(yaml, key)
  if (v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function readBool(yaml: string, key: string): boolean {
  const v = readKey(yaml, key)?.toLowerCase()
  return v === "enabled" || v === "true" || v === "on" || v === "1"
}

export function parseHardwareYaml(yaml: string): HardwareConfig {
  const warnings: string[] = []

  const rawMcu = readKey(yaml, "mcu_id")
  // Normalise common variations users might type
  const normalised = rawMcu?.toUpperCase().replace(/[\s_]/g, "")
  let mcuId: McuId = "STM32H7"
  if (normalised) {
    if (normalised.startsWith("STM32H7")) mcuId = "STM32H7"
    else if (normalised.startsWith("ESP32S3") || normalised === "ESP32-S3") mcuId = "ESP32-S3"
    else if (normalised === "RP2040") mcuId = "RP2040"
    else if (normalised.startsWith("NRF52840") || normalised === "NRF52840") mcuId = "NRF52840"
    else warnings.push(`Unknown mcu_id "${rawMcu}". Falling back to STM32H7.`)
  }

  const peripherals = PERIPHERAL_KEYS.reduce((acc, key) => {
    acc[key] = readBool(yaml, key)
    return acc
  }, {} as PeripheralFlags)

  return {
    mcuId,
    clockMhz: readNumber(yaml, "clock_mhz"),
    flashKb: readNumber(yaml, "flash_kb"),
    sramKb: readNumber(yaml, "sram_kb"),
    peripherals,
    warnings,
  }
}

export interface UseHardwareResult {
  /** Parsed configuration from the YAML source. */
  config: HardwareConfig
  /** Resolved MCU specification. */
  mcu: McuSpec
  /** Set of pin ids that should glow (active bus pins). */
  activePinIds: Set<string>
  /** Bus types currently enabled. */
  activeBuses: Set<BusType>
  /** Resolved clock value (config override or MCU default). */
  effectiveClockMhz: number
  /** Resolved flash value. */
  effectiveFlashKb: number
  /** Resolved SRAM value. */
  effectiveSramKb: number
  /** Pins that map to the listed buses, grouped for the right panel. */
  pinsForBus: (bus: BusType) => PinDef[]
}

export function useHardware(yaml: string): UseHardwareResult {
  return useMemo(() => {
    const config = parseHardwareYaml(yaml)
    const mcu = getMcu(config.mcuId)

    const activeBuses = new Set<BusType>()
    for (const key of PERIPHERAL_KEYS) {
      if (config.peripherals[key]) activeBuses.add(PERIPHERAL_TO_BUS[key])
    }

    const activePinIds = new Set<string>()
    for (const pin of mcu.pins) {
      if (pin.bus && activeBuses.has(pin.bus)) {
        activePinIds.add(pin.id)
      }
    }

    const pinsForBus = (bus: BusType) => mcu.pins.filter((p) => p.bus === bus)

    return {
      config,
      mcu,
      activePinIds,
      activeBuses,
      effectiveClockMhz: config.clockMhz ?? mcu.defaultClockMhz,
      effectiveFlashKb: config.flashKb ?? mcu.flashKb,
      effectiveSramKb: config.sramKb ?? mcu.sramKb,
      pinsForBus,
    }
  }, [yaml])
}
