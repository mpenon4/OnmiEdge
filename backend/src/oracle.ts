// Oracle agent: AI SDK 6 streamText pipeline with the validateConfiguration tool.
// Pure function — takes a UIMessage list + hardware snapshot, returns a Response.

import { streamText, tool, stepCountIs, convertToModelMessages, type UIMessage } from "ai"
import { z } from "zod"
import { runValidation, type HardwareSnapshot } from "./validate-config.js"

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

const validateConfiguration = tool({
  description:
    "Validate the current hardware manifest against the selected MCU's datasheet. Checks SRAM envelope, bus saturation, pin conflicts, and component routing. Returns a structured health report.",
  inputSchema: z.object({
    reason: z
      .string()
      .describe("One-sentence reason why validation was triggered (used for the agent log trail)."),
  }),
})

export interface OracleRequest {
  messages: UIMessage[]
  hardwareSnapshot?: HardwareSnapshot
}

export async function streamOracleResponse(req: OracleRequest): Promise<Response> {
  const snapshot = req.hardwareSnapshot

  const systemPrompt =
    SYSTEM_PROMPT +
    (snapshot
      ? `\n\nCurrent hardware_manifest.yaml snapshot:\n- MCU: ${snapshot.mcuFullName} (${snapshot.mcuId})\n- Clock: ${snapshot.effectiveClockMhz} MHz\n- SRAM: ${snapshot.effectiveSramKb} KB\n- Flash: ${snapshot.effectiveFlashKb} KB\n- Active buses: ${snapshot.activeBuses.join(", ") || "none"}\n- Components: ${snapshot.components.map((c) => `${c.name}(${c.type}@${c.pins.join("/")})`).join(", ") || "none"}\n- Pin conflicts: ${snapshot.pinConflicts.length}\n- Active pins: ${snapshot.activePinCount}`
      : "\n\nNo hardware snapshot was provided.")

  const result = streamText({
    model: "openai/gpt-5-mini",
    system: systemPrompt,
    messages: await convertToModelMessages(req.messages),
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
