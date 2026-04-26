"use client"

import {
  Activity,
  Atom,
  Box,
  Brain,
  Bug,
  ChevronDown,
  CircuitBoard,
  Code2,
  GitBranch,
  Hexagon,
  Play,
  Rocket,
  Save,
  Square,
} from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { type AppMode, useOmniStore } from "@/lib/store"

const MODES: { id: AppMode; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { id: "ide", label: "IDE", icon: Code2 },
  { id: "schematic", label: "Schematic", icon: CircuitBoard },
  { id: "3d", label: "3D", icon: Box },
  { id: "debug", label: "Debug", icon: Bug },
  { id: "ml", label: "ML", icon: Brain },
  { id: "physics", label: "Physics", icon: Atom },
  { id: "deploy", label: "Deploy", icon: Rocket },
]

const PROJECTS = ["esp32-edge-vision", "stm32-thermal-control", "rp2040-mesh-node", "nrf52-wearable-imu"]

export function TopBar() {
  const mode = useOmniStore((s) => s.mode)
  const setMode = useOmniStore((s) => s.setMode)
  const project = useOmniStore((s) => s.project)
  const setProject = useOmniStore((s) => s.setProject)
  const isSimulating = useOmniStore((s) => s.isSimulating)
  const toggle = useOmniStore((s) => s.toggleSimulation)
  const fps = useOmniStore((s) => s.fps)
  const cpu = useOmniStore((s) => s.cpu)
  const setSimMetrics = useOmniStore((s) => s.setSimMetrics)

  const [projectOpen, setProjectOpen] = useState(false)

  // Live FPS / CPU drift while simulation is running.
  useEffect(() => {
    if (!isSimulating) return
    const id = setInterval(() => {
      const f = 58 + Math.random() * 4
      const c = 22 + Math.random() * 18
      setSimMetrics(Number(f.toFixed(1)), Math.round(c))
    }, 700)
    return () => clearInterval(id)
  }, [isSimulating, setSimMetrics])

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card pr-2 pl-3">
      {/* Logo + Mode tabs */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Hexagon className="size-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
          <span className="font-mono text-[11px] tracking-[0.2em] text-foreground uppercase">OmniEdge</span>
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground">v0.4.2</span>
        </div>

        <div className="h-5 w-px bg-border" aria-hidden="true" />

        <nav aria-label="Workstation mode" className="flex items-stretch h-12 -my-px">
          {MODES.map((m) => {
            const Icon = m.icon
            const active = mode === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                aria-pressed={active}
                className={cn(
                  "relative flex h-full items-center gap-1.5 px-3 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="size-3" strokeWidth={1.5} />
                <span>{m.label}</span>
                {active && (
                  <span
                    className="absolute inset-x-2 bottom-0 h-px bg-primary"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Right cluster: simulation status, project selector, transport */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-3 border border-border bg-background px-2.5 py-1 font-mono text-[10px]"
          aria-label="Simulation status"
        >
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "block size-1.5",
                isSimulating ? "bg-primary signal-live" : "bg-muted-foreground/50",
              )}
              aria-hidden="true"
            />
            <span className={isSimulating ? "text-foreground" : "text-muted-foreground"}>
              {isSimulating ? "RUNNING" : "IDLE"}
            </span>
          </span>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <span className="flex items-baseline gap-1">
            <span className="text-muted-foreground">FPS</span>
            <span className="text-foreground tabular-nums">{fps.toFixed(1)}</span>
          </span>
          <span className="flex items-baseline gap-1">
            <span className="text-muted-foreground">CPU</span>
            <span
              className={cn(
                "tabular-nums",
                cpu > 80 ? "text-destructive" : cpu > 60 ? "text-[var(--warning)]" : "text-foreground",
              )}
            >
              {cpu}%
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          <GitBranch className="size-3" strokeWidth={1.5} aria-hidden="true" />
          <span>v0/mpenon4-e83b86d8</span>
        </div>

        {/* Project selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProjectOpen((v) => !v)}
            className="flex items-center gap-1.5 border border-border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground hover:text-foreground"
            aria-haspopup="listbox"
            aria-expanded={projectOpen}
          >
            <span className="text-muted-foreground">PROJECT</span>
            <span className="text-foreground">{project}</span>
            <ChevronDown className="size-3" strokeWidth={1.5} aria-hidden="true" />
          </button>
          {projectOpen && (
            <ul
              role="listbox"
              className="absolute right-0 top-full z-50 mt-1 min-w-[220px] border border-border bg-card shadow-lg"
            >
              {PROJECTS.map((p) => (
                <li key={p}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={p === project}
                    onClick={() => {
                      setProject(p)
                      setProjectOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-1.5 text-left font-mono text-[11px] hover:bg-secondary",
                      p === project ? "text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span>{p}</span>
                    {p === project && <span className="text-[9px] tracking-wider">ACTIVE</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="h-5 w-px bg-border" aria-hidden="true" />

        <div className="flex items-center">
          <ToolbarBtn icon={<Save className="size-3.5" strokeWidth={1.5} />} label="Save" />
          <ToolbarBtn
            icon={
              isSimulating ? (
                <Square className="size-3.5 fill-current" strokeWidth={1.5} />
              ) : (
                <Play className="size-3.5 fill-current" strokeWidth={1.5} />
              )
            }
            label={isSimulating ? "Stop" : "Run"}
            active={isSimulating}
            onClick={toggle}
          />
          <ToolbarBtn icon={<Activity className="size-3.5" strokeWidth={1.5} />} label="Telemetry" />
        </div>
      </div>
    </header>
  )
}

function ToolbarBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-7 w-7 items-center justify-center transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {icon}
    </button>
  )
}
