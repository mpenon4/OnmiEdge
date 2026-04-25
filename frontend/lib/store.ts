import { create } from 'zustand'

interface HardwareState {
  isSimulating: boolean
  voltage: number
  current: number
  logs: string[]
  toggleSimulation: () => void
  updateMetrics: (v: number, i: number) => void
}

export const useHardwareStore = create<HardwareState>((set) => ({
  isSimulating: false,
  voltage: 0,
  current: 0,
  logs: ["System initialized..."],
  toggleSimulation: () => set((state) => ({ isSimulating: !state.isSimulating })),
  updateMetrics: (v, i) => set({ voltage: v, current: i }),
}))