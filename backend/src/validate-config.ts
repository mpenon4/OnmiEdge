// Deterministic hardware validator used by the validateConfiguration tool.
// Lives in the backend so the math stays out of the frontend bundle and the
// MCU datasheet thresholds can evolve independently of the UI.

export type BusUtil = {
  bus: string
  componentCount: number
  estimatedUtilizationPercent: number
}

export type PinConflict = { pinId: string; components: string[] }

export interface HardwareSnapshot {
  mcuId: string
  mcuFullName: string
  mcuSramKb: number
  mcuFlashKb: number
  mcuClockMhz: number
  effectiveSramKb: number
  effectiveFlashKb: number
  effectiveClockMhz: number
  activeBuses: string[]
  busUtilization: BusUtil[]
  pinConflicts: PinConflict[]
  components: { name: string; type: string; bus: string; pins: string[] }[]
  activePinCount: number
}

export type ValidationVerdict = "VALID" | "VALID_WITH_WARNINGS" | "INVALID"

export interface ValidationReport {
  verdict: ValidationVerdict
  headline: string
  reason: string
  target: { mcu: string; clockMhz: number }
  memory: {
    sramTotalKb: number
    sramEstimatedUsedKb: number
    sramUtilizationPercent: number
    flashTotalKb: number
  }
  buses: { bus: string; components: number; utilizationPercent: number }[]
  pinConflicts: PinConflict[]
  issues: { severity: "info" | "warning" | "critical"; message: string }[]
  checksRun: number
  timestamp: string
}

export function runValidation(snap: HardwareSnapshot, reason: string): ValidationReport {
  const issues: ValidationReport["issues"] = []

  // SRAM envelope: ~32KB runtime cost per active component + ~4KB per bus driver.
  const estimatedSramUsedKb = Math.max(
    16,
    snap.components.length * 32 + Math.round(snap.activeBuses.length * 4),
  )
  const sramUtilization = Math.min(
    100,
    (estimatedSramUsedKb / Math.max(1, snap.effectiveSramKb)) * 100,
  )
  if (sramUtilization > 90) {
    issues.push({
      severity: "critical",
      message: `SRAM at ${sramUtilization.toFixed(1)}% — risk of stack overflow under peak load.`,
    })
  } else if (sramUtilization > 70) {
    issues.push({
      severity: "warning",
      message: `SRAM at ${sramUtilization.toFixed(1)}% — above the 70% safety threshold.`,
    })
  }

  // Bus saturation: tier into critical/warning bands.
  for (const bu of snap.busUtilization) {
    if (bu.estimatedUtilizationPercent >= 90) {
      issues.push({
        severity: "critical",
        message: `${bu.bus.toUpperCase()}-1 at ${bu.estimatedUtilizationPercent.toFixed(0)}% capacity — saturation imminent.`,
      })
    } else if (bu.estimatedUtilizationPercent >= 75) {
      issues.push({
        severity: "warning",
        message: `${bu.bus.toUpperCase()}-1 at ${bu.estimatedUtilizationPercent.toFixed(0)}% capacity — consider load balancing.`,
      })
    }
  }

  // Pin conflicts always escalate to critical: two drivers fighting one line is undefined behaviour.
  for (const pc of snap.pinConflicts) {
    issues.push({
      severity: "critical",
      message: `Pin ${pc.pinId} shared by ${pc.components.join(", ")}.`,
    })
  }

  const critical = issues.filter((i) => i.severity === "critical").length
  const warnings = issues.filter((i) => i.severity === "warning").length

  const verdict: ValidationVerdict =
    critical > 0 ? "INVALID" : warnings > 0 ? "VALID_WITH_WARNINGS" : "VALID"

  const headline =
    verdict === "VALID"
      ? "Configuration valid. All envelopes nominal."
      : verdict === "VALID_WITH_WARNINGS"
        ? `Configuration valid, but ${warnings} peripheral${warnings > 1 ? "s" : ""} flagged.`
        : `Configuration invalid — ${critical} critical issue${critical > 1 ? "s" : ""}.`

  return {
    verdict,
    headline,
    reason,
    target: {
      mcu: snap.mcuFullName,
      clockMhz: snap.effectiveClockMhz,
    },
    memory: {
      sramTotalKb: snap.effectiveSramKb,
      sramEstimatedUsedKb: estimatedSramUsedKb,
      sramUtilizationPercent: Math.round(sramUtilization * 10) / 10,
      flashTotalKb: snap.effectiveFlashKb,
    },
    buses: snap.busUtilization
      .filter((b) => b.componentCount > 0)
      .map((b) => ({
        bus: b.bus.toUpperCase(),
        components: b.componentCount,
        utilizationPercent: Math.round(b.estimatedUtilizationPercent),
      })),
    pinConflicts: snap.pinConflicts,
    issues,
    checksRun: 4 + snap.busUtilization.length + snap.pinConflicts.length,
    timestamp: new Date().toISOString(),
  }
}
