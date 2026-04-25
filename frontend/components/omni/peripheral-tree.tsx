"use client"

import type { BusUtilization, ComponentDef, PinConflict } from "@/hooks/use-hardware"
import { BUS_SPECS } from "@/lib/hardware-db"
import { AlertTriangle } from "lucide-react"

interface PeripheralTreeProps {
  busUtilization: BusUtilization[]
  pinConflicts: PinConflict[]
  components: ComponentDef[]
}

export function PeripheralTree({ busUtilization, pinConflicts, components }: PeripheralTreeProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#050505] border-t border-[#1A1A1A]">
      {/* Header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-[#1A1A1A] bg-[#0A0A0A] px-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-white">
          Peripheral Tree · Bandwidth & Conflicts
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-4">
        {/* Buses Section */}
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-[#555] mb-2">Active Buses</div>
          <div className="space-y-2">
            {busUtilization.map(({ bus, componentCount, estimatedUtilizationPercent }) => {
              const spec = BUS_SPECS[bus]
              const isHighUtilization = estimatedUtilizationPercent > 75
              return (
                <div key={bus} className="border border-[#1A1A1A] bg-[#0A0A0A] p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-white uppercase">{bus}</span>
                    <span className="font-mono text-[9px] text-[#555]">
                      {componentCount}/{spec.maxDevices}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Utilization bar */}
                    <div className="flex-1 h-2 bg-[#1A1A1A] border border-[#222]">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${estimatedUtilizationPercent}%`,
                          backgroundColor:
                            estimatedUtilizationPercent > 90
                              ? "#FF3D00"
                              : estimatedUtilizationPercent > 75
                                ? "#FFAA00"
                                : "#39FF14",
                        }}
                      />
                    </div>
                    <span className="font-mono text-[8px] text-[#555] w-10 text-right">
                      {estimatedUtilizationPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[8px] text-[#444]">{spec.description}</div>
                  {componentCount > 0 && (
                    <div className="mt-1 text-[8px] text-[#555]">
                      {components
                        .filter((c) => c.bus === bus)
                        .map((c) => c.name)
                        .join(", ")}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Conflicts Section */}
        {pinConflicts.length > 0 && (
          <div className="border-t border-[#1A1A1A] pt-3">
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-[#FF3D00] mb-2">
              <AlertTriangle className="w-3 h-3" />
              Bus Conflicts ({pinConflicts.length})
            </div>
            <div className="space-y-2">
              {pinConflicts.map(({ pinId, components: conflictComponents }) => (
                <div key={pinId} className="border border-[#FF3D00]/40 bg-[#1a0505] p-2">
                  <div className="font-mono text-[10px] text-[#FF3D00] mb-1">{pinId}</div>
                  <div className="text-[8px] text-[#ff9980]">
                    Assigned to: <span className="font-mono">{conflictComponents.join(", ")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {components.length === 0 && pinConflicts.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="font-mono text-[9px] text-[#444] mb-1">No components configured</div>
              <div className="font-mono text-[8px] text-[#333]">Add components to the YAML to see bus usage</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
