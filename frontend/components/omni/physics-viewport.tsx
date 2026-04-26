"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AlertTriangle, Bot, Cpu, Plane, Radio, Zap } from "lucide-react"
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
  name: string
  subtitle: string
  icon: React.ReactNode
  src: string
  pins: ScenePin[]
}

const SCENES: Scene[] = [
  {
    id: "pcb",
    name: "PCB · smart-sensor-v2",
    subtitle: "Termodinámica + EMI sobre placa",
    icon: <Cpu className="size-3" strokeWidth={1.5} />,
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
    name: "Drone · QuadX-7",
    subtitle: "Carbon-frame · 4S · gimbal RGB",
    icon: <Plane className="size-3" strokeWidth={1.5} />,
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
    name: "Robot · Atlas-Q4",
    subtitle: "Locomoción dinámica · 12 actuadores",
    icon: <Bot className="size-3" strokeWidth={1.5} />,
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

const FAULTS = [
  { id: "emi", label: "Interferencia EM", color: "#ef4444", icon: <Zap className="size-3" strokeWidth={1.5} /> },
  { id: "thermal", label: "Sobrecalentamiento", color: "#ff8c42", icon: <AlertTriangle className="size-3" strokeWidth={1.5} /> },
  { id: "rf", label: "Pérdida señal RF", color: "#facc15", icon: <Radio className="size-3" strokeWidth={1.5} /> },
] as const

type FaultId = (typeof FAULTS)[number]["id"]

export function PhysicsViewport() {
  const setSelection = useOmniStore((s) => s.setSelection)
  const [sceneId, setSceneId] = useState<SceneId>("quadruped")
  const [activeFault, setActiveFault] = useState<FaultId | null>("emi")
  const [tick, setTick] = useState(0)

  // Live tick to drive subtle metric drift
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 700)
    return () => clearInterval(id)
  }, [])

  const scene = SCENES.find((s) => s.id === sceneId) ?? SCENES[0]
  const fault = FAULTS.find((f) => f.id === activeFault)

  const fps = (60 + Math.sin(tick / 4) * 2).toFixed(1)
  const stepMs = (16.6 + Math.sin(tick / 4) * 0.4).toFixed(2)
  const bodies = sceneId === "quadruped" ? 24 : sceneId === "drone" ? 18 : 12

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* HUD top-left */}
      <div className="pointer-events-none absolute top-3 left-3 z-20 font-mono text-[10px] tracking-wider text-muted-foreground">
        <div>VIEWPORT · ISAAC · {scene.name.split(" · ")[0].toUpperCase()}</div>
        <div className="mt-0.5">SOLVER · RAPIER + ISAAC SIM</div>
        <div className="mt-0.5 text-foreground">{scene.subtitle}</div>
      </div>

      {/* Scene switcher (top center) */}
      <div className="absolute top-3 left-1/2 z-20 -translate-x-1/2">
        <div className="flex items-center gap-1 border border-border bg-card/90 p-0.5 backdrop-blur">
          {SCENES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSceneId(s.id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] tracking-wider uppercase transition-colors",
                sceneId === s.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className={sceneId === s.id ? "text-primary" : ""}>{s.icon}</span>
              {s.id}
            </button>
          ))}
        </div>
      </div>

      {/* Fault injection control (top right) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-stretch gap-0 border border-border bg-card/90 backdrop-blur min-w-[200px]">
        <span className="border-b border-border px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
          Fault injection
        </span>
        {FAULTS.map((f) => {
          const on = activeFault === f.id
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFault(on ? null : f.id)}
              aria-pressed={on}
              className={cn(
                "flex items-center gap-2 px-2 py-1 font-mono text-[10px] tracking-wider uppercase transition-colors",
                on ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              style={on ? { borderLeft: `2px solid ${f.color}` } : { borderLeft: "2px solid transparent" }}
            >
              <span aria-hidden="true" style={{ color: on ? f.color : "var(--muted-foreground)" }}>
                {f.icon}
              </span>
              <span>{f.label}</span>
              <span className="ml-auto text-[9px]" style={on ? { color: f.color } : undefined}>
                {on ? "ACTIVE" : "—"}
              </span>
            </button>
          )
        })}
      </div>

      {/* Scene render */}
      <div className="absolute inset-0 flex items-center justify-center bg-tech-grid-fine">
        <div className="relative h-full w-full">
          <Image
            key={scene.id}
            src={scene.src}
            alt={`Render fotorealista — ${scene.name}`}
            fill
            priority
            className="object-contain transition-opacity duration-300"
            sizes="(min-width: 1024px) 60vw, 100vw"
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
                  <stop offset="0%" stopColor={fault.color} stopOpacity="0.55" />
                  <stop offset="50%" stopColor={fault.color} stopOpacity="0.20" />
                  <stop offset="100%" stopColor={fault.color} stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Multiple fault glows on different areas to simulate distributed damage */}
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

          {/* Component pins (always shown for the scene) */}
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
                aria-label={`Inspeccionar ${p.ref} ${p.label}`}
              >
                <span className="block size-2 rounded-full border border-primary/70 bg-background/80 transition-all group-hover:border-primary group-hover:bg-primary/60 group-hover:scale-150" />
                <span
                  className={cn(
                    "absolute top-1/2 h-px bg-primary/60 opacity-0 transition-opacity group-hover:opacity-100",
                    p.side === "left" ? "right-2 w-6" : "left-2 w-6",
                  )}
                  style={{ transform: "translateY(-50%)" }}
                />
                <span
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 border border-border bg-card/95 px-1.5 py-0.5 font-mono text-[9px] whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100",
                    p.side === "left" ? "right-9" : "left-9",
                  )}
                >
                  <span className="text-primary">{p.ref}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-foreground">{p.label}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{p.detail}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom-left: active fault detail */}
      {fault && (
        <div className="absolute bottom-3 left-3 z-20 border-l-2 bg-card/90 px-3 py-2 font-mono text-[10px] backdrop-blur" style={{ borderLeftColor: fault.color }}>
          <div className="tracking-[0.18em] text-muted-foreground uppercase">Falla activa</div>
          <div className="mt-0.5 flex items-center gap-2">
            <span style={{ color: fault.color }}>{fault.icon}</span>
            <span className="text-foreground">{fault.label}</span>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
            <span>Severidad</span>
            <span className="text-right" style={{ color: fault.color }}>
              Alta
            </span>
            <span>Duración</span>
            <span className="text-right text-foreground tabular-nums">{(tick * 0.7).toFixed(1)} s</span>
            <span>Impacto</span>
            <span className="text-right text-foreground">Moderado</span>
          </div>
        </div>
      )}

      {/* Bottom-right: physics HUD */}
      <div className="absolute right-3 bottom-3 z-20 grid grid-cols-2 gap-x-4 gap-y-0.5 border border-border bg-card/90 px-3 py-2 font-mono text-[10px] backdrop-blur">
        <span className="col-span-2 mb-0.5 tracking-[0.18em] text-muted-foreground uppercase">Solver</span>
        <span className="text-muted-foreground">FPS</span>
        <span className="text-right text-foreground tabular-nums">{fps}</span>
        <span className="text-muted-foreground">Bodies</span>
        <span className="text-right text-foreground tabular-nums">{bodies}</span>
        <span className="text-muted-foreground">Contacts</span>
        <span className="text-right text-foreground tabular-nums">{(bodies * 0.4).toFixed(0)}</span>
        <span className="text-muted-foreground">Step</span>
        <span className="text-right text-primary tabular-nums">{stepMs} ms</span>
      </div>
    </div>
  )
}
