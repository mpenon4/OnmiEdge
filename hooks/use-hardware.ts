"use client"

import { useMemo } from "react"
import {
  type BusType,
  type ComponentType,
  COMPONENT_SPECS,
  BUS_SPECS,
  getMcu,
  type McuId,
  type McuSpec,
  type PinDef,
} from "@/lib/hardware-db"

export interface PeripheralFlags {
  i2c_bus: boolean
  spi_bus: boolean
  uart: boolean
  can_bus: boolean
  usb: boolean
}

export interface ComponentDef {
  name: string
  type: ComponentType
  bus: BusType
  pins: string[] // e.g. ["PA5", "PA6"]
}

export interface HardwareConfig {
  mcuId: McuId
  clockMhz: number | null
  flashKb: number | null
  sramKb: number | null
  peripherals: PeripheralFlags
  components: ComponentDef[]
  /** Lines that the parser flagged as warnings (e.g. unknown peripheral). */
  warnings: string[]
}

export interface PinConflict {
  pinId: string
  components: string[] // Component names sharing this pin
}

export interface BusUtilization {
  bus: BusType
  componentCount: number
  estimatedUtilizationPercent: number
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

/**
 * Parse components section: "components: [{name: lidar_0, type: lidar, pins: [PA5, PA6]}, ...]"
 */
function parseComponents(yaml: string): ComponentDef[] {
  const components: ComponentDef[] = []
  // Simple regex: look for "- name: ... type: ... pins: ..."
  const componentMatches = yaml.match(/- name:\s*(\w+)[\s\S]*?type:\s*(\w+)[\s\S]*?pins:\s*\[([\w\s,]+)\]/g)
  if (!componentMatches) return components

  for (const match of componentMatches) {
    const nameM = match.match(/name:\s*(\w+)/)
    const typeM = match.match(/type:\s*(\w+)/)
    const pinsM = match.match(/pins:\s*\[([\w\s,]+)\]/)

    if (nameM && typeM && pinsM) {
      const name = nameM[1]
      const type = typeM[1].toLowerCase() as ComponentType
      const pinsStr = pinsM[1]
      const pins = pinsStr.split(",").map((p) => p.trim())

      if (COMPONENT_SPECS[type]) {
        components.push({
          name,
          type,
          bus: COMPONENT_SPECS[type].busType,
          pins,
        })
      }
    }
  }

  return components
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

  const components = parseComponents(yaml)

  return {
    mcuId,
    clockMhz: readNumber(yaml, "clock_mhz"),
    flashKb: readNumber(yaml, "flash_kb"),
    sramKb: readNumber(yaml, "sram_kb"),
    peripherals,
    components,
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
  /** Pin conflicts (multiple components assigned to same pin). */
  pinConflicts: PinConflict[]
  /** Bus utilization estimates. */
  busUtilization: BusUtilization[]
  /** All component definitions. */
  components: ComponentDef[]
}

export function useHardware(yaml: string): UseHardwareResult {
  return useMemo(() => {
    const config = parseHardwareYaml(yaml)
    const mcu = getMcu(config.mcuId)

    const activeBuses = new Set<BusType>()
    for (const key of PERIPHERAL_KEYS) {
      if (config.peripherals[key]) activeBuses.add(PERIPHERAL_TO_BUS[key])
    }

    // Add buses from components
    for (const comp of config.components) {
      activeBuses.add(comp.bus)
    }

    const activePinIds = new Set<string>()
    for (const pin of mcu.pins) {
      if (pin.bus && activeBuses.has(pin.bus)) {
        activePinIds.add(pin.id)
      }
    }

    // Also add pins from component definitions
    for (const comp of config.components) {
      for (const pinId of comp.pins) {
        activePinIds.add(pinId)
      }
    }

    const pinsForBus = (bus: BusType) => mcu.pins.filter((p) => p.bus === bus)

    // Detect pin conflicts
    const pinConflicts: PinConflict[] = []
    const pinToComponents: Record<string, string[]> = {}
    for (const comp of config.components) {
      for (const pinId of comp.pins) {
        if (!pinToComponents[pinId]) pinToComponents[pinId] = []
        pinToComponents[pinId].push(comp.name)
      }
    }
    for (const [pinId, components] of Object.entries(pinToComponents)) {
      if (components.length > 1) {
        pinConflicts.push({ pinId, components })
      }
    }

    // Calculate bus utilization
    const busUtilization: BusUtilization[] = []
    for (const bus of ["i2c", "spi", "uart", "can", "usb"] as BusType[]) {
      const componentCount = config.components.filter((c) => c.bus === bus).length
      const spec = BUS_SPECS[bus]
      const utilization = Math.min(100, (componentCount / spec.maxDevices) * 100)
      busUtilization.push({
        bus,
        componentCount,
        estimatedUtilizationPercent: utilization,
      })
    }

    return {
      config,
      mcu,
      activePinIds,
      activeBuses,
      effectiveClockMhz: config.clockMhz ?? mcu.defaultClockMhz,
      effectiveFlashKb: config.flashKb ?? mcu.flashKb,
      effectiveSramKb: config.sramKb ?? mcu.sramKb,
      pinsForBus,
      pinConflicts,
      busUtilization,
      components: config.components,
    }
  }, [yaml])
}
