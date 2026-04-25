import { type BusId } from "./mcu-data"

export type ManifestComponent = {
  name: string
  type: string
  pins: string[]
}

export type ParsedManifest = {
  mcuId: string | null
  clockMhz: number | null
  flashKb: number | null
  sramKb: number | null
  buses: Record<BusId, boolean>
  components: ManifestComponent[]
}

const ALL_BUSES: BusId[] = ["i2c", "spi", "uart", "can", "usb"]

/**
 * Lightweight, forgiving YAML parser tailored for the hardware manifest.
 * Not a full YAML implementation — only what we need:
 *   mcu_id, clock_mhz, memory.flash_kb/sram_kb,
 *   peripherals.<bus>: enabled|disabled,
 *   components: list with name/type/pins.
 */
export function parseManifest(yaml: string): ParsedManifest {
  const result: ParsedManifest = {
    mcuId: null,
    clockMhz: null,
    flashKb: null,
    sramKb: null,
    buses: { i2c: false, spi: false, uart: false, can: false, usb: false },
    components: [],
  }

  const stripComment = (s: string) => s.replace(/#.*$/, "").trim()
  const lines = yaml.split(/\r?\n/)

  let context: "root" | "memory" | "peripherals" | "components" = "root"
  let currentComponent: ManifestComponent | null = null

  const indent = (l: string) => l.length - l.trimStart().length

  for (const rawLine of lines) {
    const line = stripComment(rawLine)
    if (!line) continue
    const ind = indent(rawLine)

    // Top-level keys
    if (ind === 0 && /^[a-z_]+\s*:/i.test(line)) {
      if (currentComponent) {
        result.components.push(currentComponent)
        currentComponent = null
      }
      const [k, vRaw] = line.split(":")
      const key = k.trim()
      const v = (vRaw ?? "").trim()

      if (key === "memory") {
        context = "memory"
        continue
      }
      if (key === "peripherals") {
        context = "peripherals"
        continue
      }
      if (key === "components") {
        context = "components"
        continue
      }

      context = "root"
      if (key === "mcu_id") result.mcuId = v.replace(/['"]/g, "").toUpperCase()
      else if (key === "clock_mhz") {
        const n = parseInt(v, 10)
        if (!isNaN(n)) result.clockMhz = n
      }
      continue
    }

    // Nested
    if (context === "memory" && ind > 0) {
      const m = line.match(/^([a-z_]+)\s*:\s*(\d+)/i)
      if (m) {
        const n = parseInt(m[2], 10)
        if (m[1] === "flash_kb") result.flashKb = n
        if (m[1] === "sram_kb") result.sramKb = n
      }
      continue
    }

    if (context === "peripherals" && ind > 0) {
      const m = line.match(/^([a-z_]+)\s*:\s*([a-z]+)/i)
      if (m) {
        const k = m[1].toLowerCase()
        const v = m[2].toLowerCase()
        const enabled = v === "enabled" || v === "true" || v === "on"
        let bus: BusId | null = null
        if (k.includes("i2c")) bus = "i2c"
        else if (k.includes("spi")) bus = "spi"
        else if (k.includes("uart") || k.includes("serial")) bus = "uart"
        else if (k.includes("can")) bus = "can"
        else if (k.includes("usb")) bus = "usb"
        if (bus && ALL_BUSES.includes(bus)) result.buses[bus] = enabled
      }
      continue
    }

    if (context === "components") {
      // List item start: "- name: foo"
      const itemStart = line.match(/^-\s*name\s*:\s*(.+)$/i)
      if (itemStart) {
        if (currentComponent) result.components.push(currentComponent)
        currentComponent = {
          name: itemStart[1].trim().replace(/['"]/g, ""),
          type: "unknown",
          pins: [],
        }
        continue
      }
      if (!currentComponent) continue

      const typeMatch = line.match(/^type\s*:\s*(.+)$/i)
      if (typeMatch) {
        currentComponent.type = typeMatch[1].trim().replace(/['"]/g, "")
        continue
      }
      const pinsMatch = line.match(/^pins\s*:\s*\[(.+)\]$/i)
      if (pinsMatch) {
        currentComponent.pins = pinsMatch[1]
          .split(",")
          .map((s) => s.trim().replace(/['"]/g, ""))
          .filter(Boolean)
        continue
      }
    }
  }

  if (currentComponent) result.components.push(currentComponent)

  return result
}
