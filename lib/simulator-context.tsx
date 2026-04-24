"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";

export type MCUPreset = {
  id: string;
  arch: string;
  clock_mhz: number;
  sram_kb: number;
};

export type ModelPreset = {
  id: string;
  size_kb: number;
  quantization: string;
  context_window: number;
};

export const MCU_PRESETS: Record<string, MCUPreset> = {
  stm32h7: { id: "stm32h7", arch: "arm-cortex-m7", clock_mhz: 480, sram_kb: 2048 },
  stm32f4: { id: "stm32f4", arch: "arm-cortex-m4", clock_mhz: 168, sram_kb: 192 },
  esp32s3: { id: "esp32s3", arch: "xtensa-lx7", clock_mhz: 240, sram_kb: 512 },
  rp2040: { id: "rp2040", arch: "arm-cortex-m0+", clock_mhz: 133, sram_kb: 264 },
  nrf52840: { id: "nrf52840", arch: "arm-cortex-m4", clock_mhz: 64, sram_kb: 256 },
};

export const MODEL_PRESETS: Record<string, ModelPreset> = {
  "llama-3-8b-q4": { id: "llama-3-8b-q4", size_kb: 4_100_000, quantization: "int4", context_window: 2048 },
  "tinyllama-1.1b-q4": { id: "tinyllama-1.1b-q4", size_kb: 560_000, quantization: "int4", context_window: 2048 },
  "phi-3-mini-q4": { id: "phi-3-mini-q4", size_kb: 2_200_000, quantization: "int4", context_window: 4096 },
  "mobilenet-v3": { id: "mobilenet-v3", size_kb: 1_800, quantization: "int8", context_window: 0 },
  "yolo-nano": { id: "yolo-nano", size_kb: 1_200, quantization: "int8", context_window: 0 },
  "custom-vla-3b-q3": { id: "custom-vla-3b-q3", size_kb: 1_150_000, quantization: "int3", context_window: 1024 },
};

export type AlertLevel = "nominal" | "warning" | "critical";

export type SimulatorState = {
  mcuId: string;
  modelId: string;
  alertLevel: AlertLevel;
  alertSource: string | null;
  diagnosticMessage: string | null;
  lastAnalysis: {
    verdict: string;
    overflow_kb: number;
    timestamp: string;
  } | null;
};

export type SimulatorContextValue = SimulatorState & {
  mcu: MCUPreset;
  model: ModelPreset;
  setMcu: (id: string) => void;
  setModel: (id: string) => void;
  triggerAlert: (level: AlertLevel, source: string, message: string) => void;
  setAnalysis: (analysis: SimulatorState["lastAnalysis"]) => void;
  clearAlert: () => void;
};

const SimulatorContext = createContext<SimulatorContextValue | null>(null);

export function SimulatorProvider({ children }: { children: ReactNode }) {
  const [mcuId, setMcuId] = useState<string>("stm32h7");
  const [modelId, setModelId] = useState<string>("llama-3-8b-q4");
  const [alertLevel, setAlertLevel] = useState<AlertLevel>("warning");
  const [alertSource, setAlertSource] = useState<string | null>(null);
  const [diagnosticMessage, setDiagnosticMessage] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<SimulatorState["lastAnalysis"]>(null);

  const value = useMemo<SimulatorContextValue>(() => {
    const mcu = MCU_PRESETS[mcuId] ?? MCU_PRESETS.stm32h7;
    const model = MODEL_PRESETS[modelId] ?? MODEL_PRESETS["llama-3-8b-q4"];
    return {
      mcuId,
      modelId,
      mcu,
      model,
      alertLevel,
      alertSource,
      diagnosticMessage,
      lastAnalysis,
      setMcu: setMcuId,
      setModel: setModelId,
      triggerAlert: (level, source, message) => {
        setAlertLevel(level);
        setAlertSource(source);
        setDiagnosticMessage(message);
      },
      setAnalysis: setLastAnalysis,
      clearAlert: () => {
        setAlertLevel("nominal");
        setAlertSource(null);
        setDiagnosticMessage(null);
      },
    };
  }, [mcuId, modelId, alertLevel, alertSource, diagnosticMessage, lastAnalysis]);

  return <SimulatorContext.Provider value={value}>{children}</SimulatorContext.Provider>;
}

export function useSimulator() {
  const ctx = useContext(SimulatorContext);
  if (!ctx) throw new Error("useSimulator must be used within SimulatorProvider");
  return ctx;
}
