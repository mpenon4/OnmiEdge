"use client"

import { Cpu, Zap, Activity, Wifi } from "lucide-react"
import { MCU_LIST } from "@/lib/mcu-data"

type Props = {
  modelId: string
  onModelChange: (id: string) => void
  status: "idle" | "loading" | "error" | "ready"
}

export function TopBar({ modelId, onModelChange, status }: Props) {
  const statusColor =
    status === "loading"
      ? "#FFAA00"
      : status === "error"
        ? "#FF3D00"
        : status === "ready"
          ? "#39FF14"
          : "#00E5FF"

  const statusLabel =
    status === "loading"
      ? "ORACLE PROCESSING"
      : status === "error"
        ? "BACKEND OFFLINE"
        : status === "ready"
          ? "ORACLE READY"
          : "AWAITING QUERY"

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#1A1A1A] bg-[#0A0A0A] px-4">
      {/* Brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-7 w-7 items-center justify-center border border-[#39FF14]/40 bg-[#39FF14]/5">
            <Cpu className="h-3.5 w-3.5 text-[#39FF14]" strokeWidth={2.5} />
            <div className="absolute inset-0 border border-[#39FF14]/0 shadow-[inset_0_0_8px_rgba(57,255,20,0.3)]" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              OmniEdge
            </span>
            <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#39FF14]">
              Silicon Intelligence
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#1A1A1A]" />

        <nav className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
          <button className="border border-[#00E5FF]/30 bg-[#00E5FF]/5 px-2.5 py-1 text-[#00E5FF]">
            Hardware
          </button>
          <button className="px-2.5 py-1 text-[#444] hover:text-[#888]">Firmware</button>
          <button className="px-2.5 py-1 text-[#444] hover:text-[#888]">Telemetry</button>
          <button className="px-2.5 py-1 text-[#444] hover:text-[#888]">Deploy</button>
        </nav>
      </div>

      {/* Center - Model selector */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#666]">
          Target Silicon
        </span>
        <div className="relative">
          <select
            value={modelId}
            onChange={(e) => onModelChange(e.target.value)}
            className="cursor-pointer appearance-none border border-[#39FF14]/40 bg-[#0A0A0A] py-1.5 pl-7 pr-8 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-[#39FF14] outline-none focus:border-[#39FF14] focus:shadow-[0_0_12px_rgba(57,255,20,0.4)]"
          >
            {MCU_LIST.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#0A0A0A] text-[#39FF14]">
                {m.id} · {m.fullName}
              </option>
            ))}
          </select>
          <Cpu
            className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#39FF14]"
            strokeWidth={2.5}
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#39FF14]">
            ▾
          </span>
        </div>
      </div>

      {/* Right - status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[#666]">
          <Activity className="h-3 w-3" style={{ color: statusColor }} />
          <span style={{ color: statusColor }}>{statusLabel}</span>
        </div>
        <div className="h-6 w-px bg-[#1A1A1A]" />
        <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[#666]">
          <Wifi className="h-3 w-3 text-[#00E5FF]" />
          <span>:8000</span>
        </div>
        <div className="h-6 w-px bg-[#1A1A1A]" />
        <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[#666]">
          <Zap className="h-3 w-3 text-[#FFAA00]" />
          <span>v0.1-beta</span>
        </div>
      </div>
    </header>
  )
}
