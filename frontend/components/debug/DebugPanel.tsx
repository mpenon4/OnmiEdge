"use client"

import { Bug, Activity, Zap, Cpu } from "lucide-react"

// Usamos export named para que coincida con tu import { DebugPanel } en page.tsx
export function DebugPanel({ telemetry }: { telemetry?: any }) { 
  return (
    <div className="p-4 h-full flex flex-col bg-[#050505]">
      {/* Header del Panel */}
      <div className="mb-6 flex items-center gap-2 text-[#EF4444]">
        <Bug className="h-4 w-4" />
        <span className="text-[11px] uppercase tracking-[0.2em] font-bold">
          Live Debugger
        </span>
      </div>

      {/* Stats Simbolizadas */}
      <div className="space-y-4 flex-1">
        <div className="border border-[#1A1A1A] bg-[#0A0A0A] p-3 shadow-sm">
          <div className="flex items-center gap-2 text-[#666] mb-3">
            <Cpu className="h-3 w-3 text-[#00E5FF]" />
            <span className="text-[9px] uppercase tracking-wider">Registros CPU (Live)</span>
          </div>
          
          <div className="grid grid-cols-1 gap-2 text-[10px] font-mono">
            <div className="flex justify-between border-b border-[#1A1A1A] pb-1">
              <span className="text-[#444]">R0</span>
              <span className="text-[#00E5FF]">{telemetry?.registers?.R0 ?? "0x00000000"}</span>
            </div>
            <div className="flex justify-between border-b border-[#1A1A1A] pb-1">
              <span className="text-[#444]">PC</span>
              <span className="text-[#39FF14]">{telemetry?.registers?.PC ?? "0x08000F42"}</span>
            </div>
            <div className="flex justify-between border-b border-[#1A1A1A] pb-1">
              <span className="text-[#444]">SP</span>
              <span className="text-[#666]">{telemetry?.registers?.SP ?? "0x2001FFFC"}</span>
            </div>
          </div>
        </div>

        <div className="border border-[#1A1A1A] bg-[#0A0A0A] p-3 shadow-sm">
          <div className="flex items-center gap-2 text-[#666] mb-3">
            <Zap className="h-3 w-3 text-[#FFD700]" />
            <span className="text-[9px] uppercase tracking-wider">Fault Injection</span>
          </div>
          <button 
            onClick={() => alert("Inyectando interferencia electromagnética...")}
            className="w-full border border-[#EF4444]/30 bg-[#EF4444]/5 py-2 text-[9px] uppercase text-[#EF4444] hover:bg-[#EF4444]/15 transition-all duration-200 active:scale-95"
          >
            Simular EMI Fault
          </button>
        </div>
      </div>

      {/* Status de Conexión */}
      <div className="mt-auto pt-4 border-t border-[#1A1A1A]">
        <div className="flex items-center justify-between">
          <p className="text-[9px] text-[#444] uppercase tracking-widest">
            Simulator Engine:
          </p>
          <span className="text-[9px] text-[#39FF14] font-mono animate-pulse">
            CONNECTED_PORT_8000
          </span>
        </div>
      </div>
    </div>
  )
}