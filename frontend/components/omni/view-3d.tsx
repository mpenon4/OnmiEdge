"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useOmniStore } from "@/lib/store"

type Hotspot = {
  id: string
  x: number
  y: number
  intensity: number
  ref: string
  label: string
  pkg: string
  pins: number
  side: "left" | "right"
}

const COMPONENTS: Hotspot[] = [
  { id: "u1", ref: "U1", label: "STM32H7", pkg: "LQFP-100", pins: 100, x: 50, y: 47, intensity: 0.95, side: "right" },
  { id: "u2", ref: "U2", label: "LSM6DSOX", pkg: "LGA-14", pins: 14, x: 26, y: 36, intensity: 0.45, side: "left" },
  { id: "u3", ref: "U3", label: "BMP280", pkg: "LGA-8", pins: 8, x: 74, y: 33, intensity: 0.32, side: "right" },
  { id: "u4", ref: "U4", label: "ICM-20948", pkg: "QFN-24", pins: 24, x: 70, y: 65, intensity: 0.55, side: "right" },
  { id: "u5", ref: "U5", label: "TPS7A02", pkg: "SOT-23-5", pins: 5, x: 23, y: 70, intensity: 0.72, side: "left" },
]

type ViewMode = "perspective" | "ortho" | "wire"

export function View3D() {
  const setSelection = useOmniStore((s) => s.setSelection)
  const selection = useOmniStore((s) => s.selection)
  const isSimulating = useOmniStore((s) => s.isSimulating)
  const [view, setView] = useState<ViewMode>("perspective")
  const [tempMax, setTempMax] = useState(68.7)

  useEffect(() => {
    const id = setInterval(() => {
      setTempMax((t) => Math.max(64, Math.min(72, t + (Math.random() - 0.5) * 0.4)))
    }, 800)
    return () => clearInterval(id)
  }, [])

  const selectedRef = selection.kind === "component" ? selection.ref : null

  return (
    <div
      className="grid h-full min-h-0"
      style={{ gridTemplateRows: "32px 1fr 28px" }}
    >
      {/* Toolbar 32px */}
      <div className="flex items-center gap-1 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3">
        {(["perspective", "ortho", "wire"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "px-2 py-0.5 font-mono text-[10px] tracking-[0.18em] uppercase transition-colors",
              view === v
                ? "bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
            )}
          >
            {v}
          </button>
        ))}
        <span className="ml-auto font-mono text-[10px] text-[var(--color-text-secondary)]">
          smart-sensor-v2.brd · rev C
        </span>
      </div>

      {/* Canvas — edge-to-edge, no overlays */}
      <div className="relative min-h-0 overflow-hidden bg-[var(--color-background-canvas)]">
        <div className="absolute inset-0 bg-tech-grid-fine" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-full w-full">
            <Image
              src="/renders/pcb-board.jpg"
              alt="PCB smart-sensor-v2"
              fill
              priority
              className={cn(
                "object-contain transition-all duration-500",
                view === "ortho" && "scale-105",
                view === "wire" && "opacity-50 saturate-0",
              )}
              sizes="60vw"
            />

            {/* Thermal heatmap (always visible — that's the engineering value) */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                {COMPONENTS.map((c) => (
                  <radialGradient key={c.id} id={`heat-${c.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={c.intensity * 0.7} />
                    <stop offset="35%" stopColor="#ea7916" stopOpacity={c.intensity * 0.5} />
                    <stop offset="65%" stopColor="#facc15" stopOpacity={c.intensity * 0.3} />
                    <stop offset="100%" stopColor="#84cc16" stopOpacity="0" />
                  </radialGradient>
                ))}
              </defs>
              {COMPONENTS.map((c) => (
                <ellipse
                  key={c.id}
                  cx={c.x}
                  cy={c.y}
                  rx={c.intensity * 14}
                  ry={c.intensity * 10}
                  fill={`url(#heat-${c.id})`}
                  style={{ mixBlendMode: "screen" }}
                />
              ))}
            </svg>

            {/* Component pins */}
            <div className="pointer-events-none absolute inset-0">
              {COMPONENTS.map((c) => {
                const isSelected = selectedRef === c.ref
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      setSelection({
                        kind: "component",
                        ref: c.ref,
                        part: c.label,
                        package: c.pkg,
                        pins: c.pins,
                      })
                    }
                    style={{ left: `${c.x}%`, top: `${c.y}%` }}
                    className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 group"
                    aria-label={`Inspect ${c.ref} ${c.label}`}
                  >
                    <span
                      className={cn(
                        "block size-2 rounded-full border transition-all",
                        isSelected
                          ? "scale-150 border-[var(--color-text-info)] bg-[var(--color-text-info)] shadow-[0_0_10px_rgba(55,138,221,0.8)]"
                          : "border-[var(--color-text-info)]/60 bg-[var(--color-background-canvas)]/80 group-hover:border-[var(--color-text-info)] group-hover:bg-[var(--color-text-info)]/40",
                      )}
                    />
                    <span
                      className={cn(
                        "absolute top-1/2 h-px bg-[var(--color-text-info)]/60 transition-opacity",
                        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                        c.side === "left" ? "right-2 w-6" : "left-2 w-6",
                      )}
                      style={{ transform: "translateY(-50%)" }}
                    />
                    <span
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 border bg-[var(--color-background-primary)]/95 px-1.5 py-0.5 font-mono text-[9px] backdrop-blur whitespace-nowrap transition-all",
                        isSelected
                          ? "border-[var(--color-text-info)] text-[var(--color-text-info)]"
                          : "border-[var(--color-border-tertiary)] text-[var(--color-text-primary)] opacity-0 group-hover:opacity-100",
                        c.side === "left" ? "right-9" : "left-9",
                      )}
                    >
                      <span className="text-[var(--color-text-info)]">{c.ref}</span>
                      <span className="text-[var(--color-text-secondary)]">·</span>
                      <span>{c.label}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Status bar 28px */}
      <div className="flex items-center justify-between border-t border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3 font-mono text-[10px] text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-4">
          <span>
            FPS <span className="text-[var(--color-text-primary)] tabular-nums">{isSimulating ? "59.8" : "60.0"}</span>
          </span>
          <span>
            STEP <span className="text-[var(--color-text-primary)] tabular-nums">16.57 ms</span>
          </span>
          <span>
            BODIES <span className="text-[var(--color-text-primary)] tabular-nums">12</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>
            T MAX{" "}
            <span
              className={cn(
                "tabular-nums",
                tempMax > 70 ? "text-[var(--color-text-warning)]" : "text-[var(--color-text-primary)]",
              )}
            >
              {tempMax.toFixed(1)} °C
            </span>
          </span>
          <span>SOLVER · RAPIER 60Hz</span>
        </div>
      </div>
    </div>
  )
}
