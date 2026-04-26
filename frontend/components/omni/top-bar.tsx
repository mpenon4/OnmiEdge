"use client"

import { ChevronDown, MoreHorizontal } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { type AppMode, useOmniStore } from "@/lib/store"

const MODES: { id: AppMode; label: string }[] = [
  { id: "ide", label: "IDE" },
  { id: "schematic", label: "Schematic" },
  { id: "3d", label: "3D" },
  { id: "debug", label: "Debug" },
  { id: "ml", label: "ML" },
  { id: "physics", label: "Physics" },
  { id: "deploy", label: "Deploy" },
]

const PROJECTS = ["esp32-edge-vision", "stm32-thermal-control", "rp2040-mesh-node", "nrf52-wearable-imu"]

export function TopBar() {
  const mode = useOmniStore((s) => s.mode)
  const setMode = useOmniStore((s) => s.setMode)
  const project = useOmniStore((s) => s.project)
  const setProject = useOmniStore((s) => s.setProject)
  const isSimulating = useOmniStore((s) => s.isSimulating)
  const fps = useOmniStore((s) => s.fps)
  const cpu = useOmniStore((s) => s.cpu)
  const setSimMetrics = useOmniStore((s) => s.setSimMetrics)
  const [projectOpen, setProjectOpen] = useState(false)

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
    <header
      className="flex h-9 shrink-0 items-stretch border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]"
      style={{ height: 36 }}
    >
      {/* Logo */}
      <div className="flex shrink-0 items-center gap-2 px-3">
        <span className="font-mono text-[11px] font-medium tracking-[0.2em] text-[var(--color-text-primary)] uppercase">
          OmniEdge
        </span>
        <span className="font-mono text-[10px] tracking-wider text-[var(--color-text-secondary)]">v0.4.2</span>
      </div>

      <div className="my-2 w-px bg-[var(--color-border-tertiary)]" aria-hidden="true" />

      {/* Mode tabs — no icons, just text in caps */}
      <nav aria-label="Workstation mode" className="flex items-stretch">
        {MODES.map((m) => {
          const active = mode === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              aria-pressed={active}
              className={cn(
                "relative flex items-center px-3 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors",
                active
                  ? "bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
              )}
            >
              {m.label}
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[2px] bg-[var(--color-text-info)]"
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: status chips, project selector, branch, more */}
      <div className="flex shrink-0 items-center gap-4 pr-3">
        {/* Status chips — solo texto, sin bordes */}
        <div className="flex items-center gap-3 font-mono text-[10px] text-[var(--color-text-secondary)]">
          <span
            className={cn(
              "tracking-wider uppercase tabular-nums",
              isSimulating ? "text-[var(--color-text-success)]" : "text-[var(--color-text-secondary)]",
            )}
          >
            {isSimulating ? "RUNNING" : "IDLE"}
          </span>
          <span>
            FPS <span className="text-[var(--color-text-primary)] tabular-nums">{fps.toFixed(0)}</span>
          </span>
          <span>
            CPU{" "}
            <span
              className={cn(
                "tabular-nums",
                cpu > 80
                  ? "text-[var(--color-text-danger)]"
                  : cpu > 60
                    ? "text-[var(--color-text-warning)]"
                    : "text-[var(--color-text-primary)]",
              )}
            >
              {cpu}%
            </span>
          </span>
        </div>

        {/* Project selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProjectOpen((v) => !v)}
            className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            aria-haspopup="listbox"
            aria-expanded={projectOpen}
          >
            <span className="text-[var(--color-text-primary)]">{project}</span>
            <ChevronDown className="size-3" strokeWidth={1.5} aria-hidden="true" />
          </button>
          {projectOpen && (
            <ul
              role="listbox"
              className="absolute right-0 top-full z-50 mt-1 min-w-[220px] border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] shadow-lg"
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
                      "flex w-full items-center justify-between px-3 py-1.5 text-left font-mono text-[11px] hover:bg-[var(--color-background-secondary)]",
                      p === project
                        ? "text-[var(--color-text-info)]"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
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

        <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">v0/mpenon4-e83b86d8</span>

        <button
          type="button"
          aria-label="More"
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <MoreHorizontal className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}
