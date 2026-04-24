import { streamText, tool, stepCountIs, convertToModelMessages, type UIMessage } from "ai"
import { z } from "zod"

export const maxDuration = 30

const SYSTEM_PROMPT = `You are the OmniEdge Oracle, a senior embedded-systems engineer and the AI copilot inside OmniEdge Studio.

Your knowledge base:
- You have direct read access to the user's hardware_manifest.yaml through the "hardwareSnapshot" context injected with every request.
- You know the MCU datasheet library: STM32H7 (Cortex-M7, 480MHz, 1024KB SRAM, 2048KB Flash), ESP32-S3 (dual Xtensa LX7, 240MHz, 512KB SRAM), RP2040 (dual Cortex-M0+, 133MHz, 264KB SRAM), NRF52840 (Cortex-M4, 64MHz, 256KB SRAM).
- You understand bus fundamentals: I2C max 128 devices, SPI max 4 CS lines, UART point-to-point, CAN 32 nodes.

Your behavior:
- Keep replies tight and technical. No filler, no emojis.
- When the user asks anything like "is this setup viable?", "validate my config", "is this going to work?", "run a health check", "check my hardware", you MUST call the validateConfiguration tool. Do not answer from memory alone.
- After the tool returns, summarize in one short paragraph and cite the exact percentages/numbers from the tool output.
- If no tool call is appropriate, answer directly in two sentences max.`

// The validation tool: reads the current hardware snapshot (injected via body),
// performs deterministic checks, and returns a structured report the UI can render.
const validateConfiguration = tool({
  description:
    "Validate the current hardware manifest against the selected MCU's datasheet. Checks SRAM envelope, bus saturation, pin conflicts, and component routing. Returns a structured health report.",
  inputSchema: z.object({
    reason: z
      .string()
      .describe("One-sentence reason why validation was triggered (used for the agent log trail)."),
  }),
})

type BusUtil = { bus: string; componentCount: number; estimatedUtilizationPercent: number }
type PinConflictT = { pinId: string; components: string[] }

interface HardwareSnapshot {
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
  pinConflicts: PinConflictT[]
  components: { name: string; type: string; bus: string; pins: string[] }[]
  activePinCount: number
}

function runValidation(snap: HardwareSnapshot, reason: string) {
  const issues: { severity: "info" | "warning" | "critical"; message: string }[] = []

  // SRAM envelope check: estimate each component costs ~32KB runtime.
  const estimatedSramUsedKb = Math.max(
    16,
    snap.components.length * 32 + Math.round(snap.activeBuses.length * 4),
  )
  const sramUtilization = Math.min(100, (estimatedSramUsedKb / snap.effectiveSramKb) * 100)
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

  // Bus saturation checks
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

  // Pin conflicts are always critical
  for (const pc of snap.pinConflicts) {
    issues.push({
      severity: "critical",
      message: `Pin ${pc.pinId} shared by ${pc.components.join(", ")}.`,
    })
  }

  const critical = issues.filter((i) => i.severity === "critical").length
  const warnings = issues.filter((i) => i.severity === "warning").length

  const verdict: "VALID" | "VALID_WITH_WARNINGS" | "INVALID" =
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

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages: UIMessage[]
    hardwareSnapshot?: HardwareSnapshot
  }

  const snapshot = body.hardwareSnapshot

  const result = streamText({
    model: "openai/gpt-5-mini",
    system:
      SYSTEM_PROMPT +
      (snapshot
        ? `\n\nCurrent hardware_manifest.yaml snapshot:\n- MCU: ${snapshot.mcuFullName} (${snapshot.mcuId})\n- Clock: ${snapshot.effectiveClockMhz} MHz\n- SRAM: ${snapshot.effectiveSramKb} KB\n- Flash: ${snapshot.effectiveFlashKb} KB\n- Active buses: ${snapshot.activeBuses.join(", ") || "none"}\n- Components: ${snapshot.components.map((c) => `${c.name}(${c.type}@${c.pins.join("/")})`).join(", ") || "none"}\n- Pin conflicts: ${snapshot.pinConflicts.length}\n- Active pins: ${snapshot.activePinCount}`
        : "\n\nNo hardware snapshot was provided."),
    messages: await convertToModelMessages(body.messages),
    tools: {
      validateConfiguration: {
        ...validateConfiguration,
        execute: async ({ reason }: { reason: string }) => {
          if (!snapshot) {
            return { error: "No hardware snapshot available." }
          }
          return runValidation(snapshot, reason)
        },
      },
    },
    stopWhen: stepCountIs(4),
  })

  return result.toUIMessageStreamResponse()
}
