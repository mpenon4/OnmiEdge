export type HardwareId = "stm32h7" | "jetson-orin-nano";
export type AiModelId = "tiny-yolov8" | "llama-3-8b";
export type Scenario = "success" | "failure" | "caution";

export interface ScenarioState {
  scenario: Scenario;
  statusLabel: string;
  statusTone: "success" | "critical" | "warning";
  agentMessage: string;
  terminalLines: string[];
  metrics: {
    cpu: number; // baseline percentage
    memory: number;
    temperature: number;
    throughput: string;
  };
  viewportState: "scanning" | "frozen" | "idle";
}

export function getScenario(hw: HardwareId, ai: AiModelId): ScenarioState {
  // Scenario A — Failure: STM32 + Llama-3
  if (hw === "stm32h7" && ai === "llama-3-8b") {
    return {
      scenario: "failure",
      statusLabel: "OOM Error",
      statusTone: "critical",
      agentMessage:
        "Critical bottleneck detected. This MCU cannot run an LLM. Please use a Jetson target or quantize heavily.",
      terminalLines: [
        "[boot] omni-edge runtime v0.1.3 starting...",
        "[target] stm32h7 @ 480MHz, 2MB SRAM",
        "[loader] Mapping model llama-3-8b.onnx (4.5GB)",
        "[loader] Allocating tensor arena...",
        "FATAL: Model size (4.5GB) exceeds physical SRAM (2MB).",
        "[abort] OutOfMemoryError at 0x24000000",
        "[exit] runtime halted — code 0x0F",
      ],
      metrics: {
        cpu: 0,
        memory: 100,
        temperature: 0,
        throughput: "— FPS",
      },
      viewportState: "frozen",
    };
  }

  // Scenario B — Success: Jetson + Tiny-YOLO
  if (hw === "jetson-orin-nano" && ai === "tiny-yolov8") {
    return {
      scenario: "success",
      statusLabel: "Stable",
      statusTone: "success",
      agentMessage: "Configuration optimized. Ready for deployment.",
      terminalLines: [
        "[boot] omni-edge runtime v0.1.3 starting...",
        "[target] jetson-orin-nano, 8GB VRAM, 40 TOPS",
        "[loader] Mapping model tiny-yolov8.onnx (12MB)",
        "[loader] Allocating tensor arena — OK",
        "[cuda] Initializing TensorRT engine — OK",
        "Tensors loaded. Starting inference loop...",
        "[runtime] Stable 30 FPS — thermal headroom 22°C",
      ],
      metrics: {
        cpu: 34,
        memory: 28,
        temperature: 52,
        throughput: "30 FPS",
      },
      viewportState: "scanning",
    };
  }

  // Scenario C — Caution: any other combo
  const isJetsonLlm = hw === "jetson-orin-nano" && ai === "llama-3-8b";
  return {
    scenario: "caution",
    statusLabel: "Degraded",
    statusTone: "warning",
    agentMessage: isJetsonLlm
      ? "LLM on edge target detected. Expect 2–4 tok/s. Consider quantization for real-time use."
      : "High CPU load detected (85%). Edge case behavior expected.",
    terminalLines: [
      "[boot] omni-edge runtime v0.1.3 starting...",
      `[target] ${hw} initialized`,
      `[loader] Mapping model ${ai}...`,
      "[warn] Memory pressure elevated",
      "[warn] Thermal envelope approaching limit",
      "[runtime] Inference running — degraded mode",
    ],
    metrics: {
      cpu: 85,
      memory: 78,
      temperature: 76,
      throughput: isJetsonLlm ? "3 tok/s" : "8 FPS",
    },
    viewportState: "idle",
  };
}
