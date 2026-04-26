"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useOmniStore } from "@/lib/store"

type SceneId = "pcb" | "drone" | "quadruped"

type ScenePin = {
  id: string
  x: number
  y: number
  ref: string
  label: string
  detail: string
  side: "left" | "right"
}

type Scene = {
  id: SceneId
  short: string
  long: string
  src: string
  pins: ScenePin[]
}

const SCENES: Scene[] = [
  {
    id: "pcb",
    short: "PCB",
    long: "smart-sensor-v2",
    src: "/renders/pcb-board.jpg",
    pins: [
      { id: "u1", x: 50, y: 47, ref: "U1", label: "STM32H7", detail: "MCU · 480 MHz", side: "right" },
      { id: "u2", x: 26, y: 36, ref: "U2", label: "LSM6DSOX", detail: "IMU · 6DoF", side: "left" },
      { id: "u3", x: 74, y: 33, ref: "U3", label: "BMP280", detail: "Presión", side: "right" },
      { id: "u5", x: 23, y: 70, ref: "U5", label: "TPS7A02", detail: "LDO 3V3", side: "left" },
    ],
  },
  {
    id: "drone",
    short: "DRONE",
    long: "QuadX-7",
    src: "/renders/drone.jpg",
    pins: [
      { id: "fc", x: 50, y: 38, ref: "FC", label: "Flight Controller", detail: "STM32H7 · 480 MHz", side: "right" },
      { id: "m1", x: 22, y: 30, ref: "M1", label: "Motor frontal-izq", detail: "BLDC 2207 · KV1750", side: "left" },
      { id: "m4", x: 78, y: 30, ref: "M4", label: "Motor frontal-der", detail: "BLDC 2207 · KV1750", side: "right" },
      { id: "cam", x: 50, y: 72, ref: "CAM", label: "Gimbal RGB", detail: "1080p · 120° FOV", side: "right" },
      { id: "bat", x: 50, y: 55, ref: "BAT", label: "Batería 4S", detail: "5200 mAh · 14.8 V", side: "left" },
    ],
  },
  {
    id: "quadruped",
    short: "QUAD",
    long: "Atlas-Q4",
    src: "/renders/quadruped.jpg",
    pins: [
      { id: "head", x: 70, y: 35, ref: "HEAD", label: "Sensor array", detail: "RGB-D + LiDAR", side: "right" },
      { id: "imu", x: 55, y: 50, ref: "IMU", label: "ICM-20948", detail: "9DoF · 200 Hz", side: "right" },
      { id: "leg-fl", x: 30, y: 58, ref: "L-FL", label: "Pata FL", detail: "3 servos BLDC", side: "left" },
      { id: "leg-rr", x: 78, y: 60, ref: "L-RR", label: "Pata RR", detail: "3 servos BLDC", side: "right" },
      { id: "core", x: 50, y: 62, ref: "CORE", label: "Compute", detail: "Jetson Orin Nano", side: "left" },
    ],
  },
]

type FaultId = "emi" | "thermal" | "rf" | "voltage" | "memory"

const FAULTS: { id: FaultId; label: string; color: string }[] = [
  { id: "emi", label: "Interferencia EM", color: "var(--color-text-danger)" },
  { id: "thermal", label: "Sobrecalentamiento", color: "var(--color-text-warning)" },
  { id: "rf", label: "Pérdida señal RF", color: "#facc15" },
  { id: "voltage", label: "Caída de voltaje", color: "var(--color-text-info)" },
  { id: "memory", label: "Corrupción memoria", color: "#8b5cf6" },
]

export function PhysicsViewport() {
  const setSelection = useOmniStore((s) => s.setSelection)
  const isSimulating = useOmniStore((s) => s.isSimulating)
  const [sceneId, setSceneId] = useState<SceneId>("quadruped")
  const [activeFault, setActiveFault] = useState<FaultId | null>("emi")
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 700)
    return () => clearInterval(id)
  }, [])

  const scene = SCENES.find((s) => s.id === sceneId) ?? SCENES[0]
  const fault = FAULTS.find((f) => f.id === activeFault)

  const fps = isSimulating ? (59 + Math.sin(tick / 4) * 1.2).toFixed(1) : "—"
  const bodies = sceneId === "quadruped" ? 24 : sceneId === "drone" ? 18 : 12
  const stepMs = (16.57 + Math.sin(tick / 4) * 0.3).toFixed(2)

  return (
    <div
      className="grid h-full min-h-0"
      style={{ gridTemplateRows: "32px 1fr 28px" }}
    >
      {/* Tabs of view (32px) */}
      <div className="flex items-center border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]">
        {SCENES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSceneId(s.id)}
            className={cn(
              "relative px-3 py-1 font-mono text-[10px] tracking-[0.18em] uppercase transition-colors",
              sceneId === s.id
                ? "bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
            )}
          >
            {s.short}
            {sceneId === s.id && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[2px] bg-[var(--color-text-info)]"
              />
            )}
          </button>
        ))}
        <span className="ml-auto pr-3 font-mono text-[10px] text-[var(--color-text-secondary)]">{scene.long}</span>
      </div>

      {/* Body — viewport + lateral fault injection (220px) */}
      <div
        className="grid min-h-0 bg-[var(--color-background-canvas)]"
        style={{ gridTemplateColumns: "1fr 220px" }}
      >
        {/* Viewport */}
        <div className="relative min-h-0 overflow-hidden">
          <div className="absolute inset-0 bg-tech-grid-fine" />
          <Image
            key={scene.id}
            src={scene.src}
            alt={scene.long}
            fill
            priority
            className="object-contain transition-opacity duration-300"
            sizes="60vw"
          />

          {/* Fault overlay */}
          {fault && (
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="fault-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={resolveColor(fault.color)} stopOpacity="0.55" />
                  <stop offset="50%" stopColor={resolveColor(fault.color)} stopOpacity="0.20" />
                  <stop offset="100%" stopColor={resolveColor(fault.color)} stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="50" cy="50" rx="35" ry="28" fill="url(#fault-glow)" style={{ mixBlendMode: "screen" }}>
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
              </ellipse>
              {fault.id === "emi" && (
                <>
                  <ellipse cx="30" cy="40" rx="12" ry="10" fill="url(#fault-glow)" style={{ mixBlendMode: "screen" }}>
                    <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.6s" repeatCount="indefinite" />
                  </ellipse>
                  <ellipse cx="70" cy="55" rx="14" ry="11" fill="url(#fault-glow)" style={{ mixBlendMode: "screen" }}>
                    <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.6s" repeatCount="indefinite" />
                  </ellipse>
                </>
              )}
            </svg>
          )}

          {/* Component pins */}
          <div className="pointer-events-none absolute inset-0">
            {scene.pins.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  setSelection({
                    kind: "component",
                    ref: p.ref,
                    part: p.label,
                    package: p.detail,
                    pins: 0,
                  })
                }
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 group"
                aria-label={`Inspeccionar ${p.ref}`}
              >
                <span className="block size-2 rounded-full border border-[var(--color-text-info)]/70 bg-[var(--color-background-canvas)]/80 transition-all group-hover:scale-150 group-hover:border-[var(--color-text-info)] group-hover:bg-[var(--color-text-info)]/60" />
                <span
                  className={cn(
                    "absolute top-1/2 h-px bg-[var(--color-text-info)]/60 opacity-0 transition-opacity group-hover:opacity-100",
                    p.side === "left" ? "right-2 w-6" : "left-2 w-6",
                  )}
                  style={{ transform: "translateY(-50%)" }}
                />
                <span
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]/95 px-1.5 py-0.5 font-mono text-[9px] backdrop-blur whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100",
                    p.side === "left" ? "right-9" : "left-9",
                  )}
                >
                  <span className="text-[var(--color-text-info)]">{p.ref}</span>
                  <span className="text-[var(--color-text-secondary)]">·</span>
                  <span className="text-[var(--color-text-primary)]">{p.label}</span>
                  <span className="text-[var(--color-text-secondary)]">·</span>
                  <span className="text-[var(--color-text-secondary)]">{p.detail}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Fault Injection panel — 220px lateral */}
        <aside className="flex min-h-0 flex-col border-l border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]">
          <header className="flex h-7 shrink-0 items-center px-3">
            <span className="font-sans text-[10px] tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">
              Fault Injection
            </span>
          </header>

          <ul className="min-h-0 flex-1 overflow-y-auto">
            {FAULTS.map((f) => {
              const on = activeFault === f.id
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setActiveFault(on ? null : f.id)}
                    aria-pressed={on}
                    className={cn(
                      "flex w-full items-center justify-between border-l-2 px-3 py-1.5 text-left font-mono text-[11px] transition-colors",
                      on
                        ? "bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]"
                        : "border-l-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]/50 hover:text-[var(--color-text-primary)]",
                    )}
                    style={on ? { borderLeftColor: resolveColor(f.color) } : undefined}
                  >
                    <span className="truncate">{f.label}</span>
                    <span className="font-mono text-[9px] tracking-[0.2em] uppercase" style={on ? { color: resolveColor(f.color) } : undefined}>
                      {on ? "ACTIVE" : "—"}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          {fault && (
            <div className="shrink-0 border-t border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] p-3 font-mono text-[10px]">
              <div className="flex items-baseline justify-between">
                <span className="tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">Falla activa</span>
                <span className="tabular-nums text-[var(--color-text-secondary)]">
                  {(tick * 0.7).toFixed(1)}s
                </span>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[var(--color-text-secondary)]">
                <span>Tipo</span>
                <span className="text-right" style={{ color: resolveColor(fault.color) }}>
                  {fault.label.split(" ")[0]}
                </span>
                <span>Severidad</span>
                <span className="text-right" style={{ color: resolveColor(fault.color) }}>
                  Alta
                </span>
                <span>Impacto</span>
                <span className="text-right text-[var(--color-text-primary)]">Moderado</span>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Canvas status bar 28px */}
      <div className="flex items-center justify-between border-t border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3 font-mono text-[10px] text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-4">
          <span>
            FPS <span className="text-[var(--color-text-primary)] tabular-nums">{fps}</span>
          </span>
          <span>
            BODIES <span className="text-[var(--color-text-primary)] tabular-nums">{bodies}</span>
          </span>
          <span>
            CONTACTS <span className="text-[var(--color-text-primary)] tabular-nums">{Math.round(bodies * 0.4)}</span>
          </span>
          <span>
            STEP <span className="text-[var(--color-text-primary)] tabular-nums">{stepMs} ms</span>
          </span>
        </div>
        {fault && (
          <span
            className="px-1.5 py-0.5 text-[10px] tracking-wider uppercase"
            style={{
              color: resolveColor(fault.color),
              borderLeft: `2px solid ${resolveColor(fault.color)}`,
              paddingLeft: 8,
            }}
          >
            {fault.label}
          </span>
        )}
      </div>
    </div>
  )
}

function resolveColor(c: string): string {
  // Resolve var(--...) by reading the stylesheet at runtime if needed.
  // For SVG fills we need a concrete color.
  if (typeof window === "undefined" || !c.startsWith("var(")) return c
  const v = c.replace(/var\((--[^)]+)\)/, "$1")
  const computed = getComputedStyle(document.documentElement).getPropertyValue(v).trim()
  return computed || c
}
