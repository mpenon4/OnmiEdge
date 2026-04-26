"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Eye, Layers, Maximize2, RotateCcw, Thermometer } from "lucide-react"
import { cn } from "@/lib/utils"
import { useOmniStore } from "@/lib/store"

type Hotspot = {
  id: string
  /** Position in % over the image */
  x: number
  y: number
  /** Heat radius scale */
  r: number
  /** Heat intensity 0..1 — drives alpha */
  intensity: number
  ref: string
  label: string
  pkg: string
  pins: number
  /** Side the label flag points to */
  side: "left" | "right"
}

const COMPONENTS: Hotspot[] = [
  { id: "u1", ref: "U1", label: "STM32H7", pkg: "LQFP-100", pins: 100, x: 50, y: 47, r: 220, intensity: 0.95, side: "right" },
  { id: "u2", ref: "U2", label: "LSM6DSOX", pkg: "LGA-14", pins: 14, x: 26, y: 36, r: 90, intensity: 0.45, side: "left" },
  { id: "u3", ref: "U3", label: "BMP280", pkg: "LGA-8", pins: 8, x: 74, y: 33, r: 70, intensity: 0.32, side: "right" },
  { id: "u4", ref: "U4", label: "ICM-20948", pkg: "QFN-24", pins: 24, x: 70, y: 65, r: 100, intensity: 0.55, side: "right" },
  { id: "u5", ref: "U5", label: "TPS7A02", pkg: "SOT-23-5", pins: 5, x: 23, y: 70, r: 80, intensity: 0.72, side: "left" },
]

const OVERLAYS = [
  { id: "thermal", label: "Temperatura", icon: <Thermometer className="size-3" strokeWidth={1.5} /> },
  { id: "labels", label: "Etiquetas", icon: <Layers className="size-3" strokeWidth={1.5} /> },
  { id: "vibration", label: "Vibración", icon: <RotateCcw className="size-3" strokeWidth={1.5} /> },
] as const

type OverlayId = (typeof OVERLAYS)[number]["id"]

export function View3D() {
  const setSelection = useOmniStore((s) => s.setSelection)
  const selection = useOmniStore((s) => s.selection)
  const [active, setActive] = useState<Record<OverlayId, boolean>>({
    thermal: true,
    labels: true,
    vibration: false,
  })
  const [tempMax, setTempMax] = useState(68.7)
  const [view, setView] = useState<"perspective" | "top" | "side">("perspective")

  // Live drift on max temperature so the heatmap feels alive
  useEffect(() => {
    const id = setInterval(() => {
      setTempMax((t) => {
        const next = t + (Math.random() - 0.5) * 0.4
        return Math.max(64, Math.min(72, next))
      })
    }, 800)
    return () => clearInterval(id)
  }, [])

  const selectedRef = selection?.kind === "component" ? selection.ref : null

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* HUD top-left: viewport info */}
      <div className="pointer-events-none absolute top-3 left-3 z-20 font-mono text-[10px] tracking-wider text-muted-foreground">
        <div>VIEWPORT · {view.toUpperCase()}</div>
        <div className="mt-0.5">SOLVER · RAPIER · 60 Hz</div>
        <div className="mt-0.5">BOARD · smart-sensor-v2.brd</div>
      </div>

      {/* HUD top-right: view + overlay controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2">
        <div className="flex items-center gap-1 border border-border bg-card/90 p-0.5 backdrop-blur">
          {(["perspective", "top", "side"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "px-2 py-1 font-mono text-[9px] tracking-wider uppercase transition-colors",
                view === v ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-stretch border border-border bg-card/90 backdrop-blur min-w-[160px]">
          <span className="border-b border-border px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
            Overlays
          </span>
          {OVERLAYS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setActive((a) => ({ ...a, [o.id]: !a[o.id] }))}
              aria-pressed={active[o.id]}
              className={cn(
                "flex items-center gap-2 px-2 py-1 font-mono text-[10px] tracking-wider uppercase transition-colors",
                active[o.id] ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span aria-hidden="true">{o.icon}</span>
              <span>{o.label}</span>
              <span className="ml-auto text-[9px]">{active[o.id] ? "ON" : "OFF"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scene */}
      <div className="absolute inset-0 flex items-center justify-center bg-tech-grid-fine">
        <div className="relative h-full w-full">
          {/* Photoreal PCB render */}
          <Image
            src="/renders/pcb-board.jpg"
            alt="Render fotorealista de la PCB smart-sensor-v2"
            fill
            priority
            className={cn(
              "object-contain transition-all duration-500",
              view === "top" && "scale-110",
              view === "side" && "scale-95 saturate-50",
            )}
            sizes="(min-width: 1024px) 60vw, 100vw"
          />

          {/* Thermal heatmap overlay */}
          {active.thermal && (
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
                    <stop offset="35%" stopColor="#ff8c42" stopOpacity={c.intensity * 0.5} />
                    <stop offset="65%" stopColor="#facc15" stopOpacity={c.intensity * 0.3} />
                    <stop offset="100%" stopColor="#00d4a8" stopOpacity="0" />
                  </radialGradient>
                ))}
              </defs>
              {COMPONENTS.map((c) => (
                <ellipse
                  key={c.id}
                  cx={c.x}
                  cy={c.y}
                  rx={c.r * 0.06}
                  ry={c.r * 0.04}
                  fill={`url(#heat-${c.id})`}
                  style={{ mixBlendMode: "screen" }}
                />
              ))}
            </svg>
          )}

          {/* Vibration overlay */}
          {active.vibration && (
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 animate-pulse border border-primary/20" />
              <div className="absolute top-1/2 left-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/40 animate-ping" />
            </div>
          )}

          {/* Component labels */}
          {active.labels && (
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
                    aria-label={`Seleccionar ${c.ref} ${c.label}`}
                  >
                    {/* Pin dot */}
                    <span
                      className={cn(
                        "block size-2 rounded-full border transition-all",
                        isSelected
                          ? "border-primary bg-primary scale-150 shadow-[0_0_12px_rgba(0,212,168,0.8)]"
                          : "border-primary/70 bg-background/80 group-hover:border-primary group-hover:bg-primary/40",
                      )}
                    />

                    {/* Lead line */}
                    <span
                      className={cn(
                        "absolute top-1/2 h-px bg-primary/50 transition-opacity",
                        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-70",
                        c.side === "left" ? "right-2 w-6" : "left-2 w-6",
                      )}
                      style={{ transform: "translateY(-50%)" }}
                    />

                    {/* Flag */}
                    <span
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 border bg-card/95 px-1.5 py-0.5 font-mono text-[9px] backdrop-blur transition-all whitespace-nowrap",
                        isSelected
                          ? "border-primary text-primary"
                          : "border-border text-foreground opacity-90 group-hover:border-primary/60",
                        c.side === "left" ? "right-9" : "left-9",
                      )}
                    >
                      <span className="text-primary">{c.ref}</span>
                      <span className="text-muted-foreground">·</span>
                      <span>{c.label}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Temperature legend (right) */}
      {active.thermal && (
        <div className="pointer-events-none absolute top-1/2 right-3 z-10 flex -translate-y-1/2 flex-col items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
            T (°C)
          </span>
          <div className="flex items-stretch gap-2">
            <div
              className="h-40 w-2 border border-border"
              style={{
                background:
                  "linear-gradient(to bottom, #ef4444 0%, #ff8c42 30%, #facc15 55%, #00d4a8 100%)",
              }}
              aria-hidden="true"
            />
            <div className="flex h-40 flex-col justify-between font-mono text-[9px] text-muted-foreground tabular-nums">
              <span className="text-foreground">85</span>
              <span>62</span>
              <span>40</span>
              <span>22</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom-left: live metrics */}
      <div className="absolute bottom-3 left-3 z-20 grid grid-cols-2 gap-x-4 gap-y-0.5 border border-border bg-card/90 px-3 py-2 font-mono text-[10px] backdrop-blur">
        <span className="col-span-2 mb-0.5 tracking-[0.18em] text-muted-foreground uppercase">
          Métricas en tiempo real
        </span>
        <span className="text-muted-foreground">Temperatura máx</span>
        <span className="text-right text-foreground tabular-nums">{tempMax.toFixed(1)} °C</span>
        <span className="text-muted-foreground">CPU Load</span>
        <span className="text-right text-foreground tabular-nums">32.1%</span>
        <span className="text-muted-foreground">Consumo total</span>
        <span className="text-right text-primary tabular-nums">112.4 mA</span>
        <span className="text-muted-foreground">FPS</span>
        <span className="text-right text-foreground tabular-nums">60</span>
      </div>

      {/* Bottom-right: viewport tools */}
      <div className="absolute right-3 bottom-3 z-20 flex items-center gap-1 border border-border bg-card/90 p-0.5 backdrop-blur">
        <button
          type="button"
          className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label="Reset view"
          onClick={() => setView("perspective")}
        >
          <RotateCcw className="size-3.5" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label="Toggle visibility"
        >
          <Eye className="size-3.5" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label="Fullscreen"
        >
          <Maximize2 className="size-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
