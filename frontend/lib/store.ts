import { create } from "zustand"

/**
 * App-wide UI mode. Drives the Center Canvas view and the contextual
 * content of the Right Inspector.
 */
export type AppMode = "ide" | "schematic" | "3d" | "debug" | "ml" | "physics" | "deploy"

/**
 * The currently selected entity in the workstation. The Inspector reads
 * from here to render Properties / Metrics / Logs that match the user's
 * focus across modes.
 */
export type Selection =
  | { kind: "file"; path: string; lang: string; size: number; status: "compiled" | "warning" | "error" | "modified" }
  | { kind: "component"; ref: string; part: string; package: string; pins: number }
  | { kind: "model"; name: string; arch: string; quant: string; arena: number }
  | { kind: "register"; name: string; value: string; width: number }
  | { kind: "none" }

interface OmniState {
  // Mode
  mode: AppMode
  setMode: (mode: AppMode) => void

  // Selection (drives inspector context)
  selection: Selection
  setSelection: (s: Selection) => void

  // Simulation state
  isSimulating: boolean
  toggleSimulation: () => void
  fps: number
  cpu: number
  setSimMetrics: (fps: number, cpu: number) => void

  // Hardware live values (legacy — kept for compat with any consumer)
  voltage: number
  current: number
  updateMetrics: (v: number, i: number) => void

  // Project
  project: string
  setProject: (p: string) => void
}

export const useOmniStore = create<OmniState>((set) => ({
  mode: "ide",
  setMode: (mode) => set({ mode }),

  selection: { kind: "file", path: "firmware/main.cpp", lang: "C++", size: 1240, status: "compiled" },
  setSelection: (selection) => set({ selection }),

  isSimulating: false,
  toggleSimulation: () => set((s) => ({ isSimulating: !s.isSimulating })),
  fps: 60.0,
  cpu: 27,
  setSimMetrics: (fps, cpu) => set({ fps, cpu }),

  voltage: 0,
  current: 0,
  updateMetrics: (voltage, current) => set({ voltage, current }),

  project: "esp32-edge-vision",
  setProject: (project) => set({ project }),
}))

/* Backwards-compatible alias used by older imports. */
export const useHardwareStore = useOmniStore
