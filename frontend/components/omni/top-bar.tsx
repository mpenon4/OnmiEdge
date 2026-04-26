"use client"

import { Activity, GitBranch, Hexagon, Play, Save, Square } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const MENU = ["File", "Edit", "Project", "Build", "Simulate", "Train", "View", "Help"]

export function TopBar() {
  const [running, setRunning] = useState(false)

  return (
    <header className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-card pr-2 pl-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Hexagon className="size-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
          <span className="font-mono text-[11px] tracking-[0.2em] text-foreground uppercase">OmniEdge</span>
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground">v0.4.2</span>
        </div>

        <div className="h-5 w-px bg-border" aria-hidden="true" />

        <nav aria-label="Application menu" className="flex items-center">
          {MENU.map((item) => (
            <button
              key={item}
              type="button"
              className="px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          <GitBranch className="size-3" strokeWidth={1.5} aria-hidden="true" />
          <span>feature/omniedge-pro-shell</span>
        </div>

        <div className="h-5 w-px bg-border" aria-hidden="true" />

        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          <span className="text-muted-foreground">PROJECT</span>
          <span className="text-foreground">esp32-edge-vision</span>
        </div>

        <div className="h-5 w-px bg-border" aria-hidden="true" />

        <div className="flex items-center">
          <ToolbarBtn icon={<Save className="size-3.5" strokeWidth={1.5} />} label="Save" />
          <ToolbarBtn
            icon={
              running ? (
                <Square className="size-3.5 fill-current" strokeWidth={1.5} />
              ) : (
                <Play className="size-3.5 fill-current" strokeWidth={1.5} />
              )
            }
            label={running ? "Stop" : "Run"}
            active={running}
            onClick={() => setRunning((v) => !v)}
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
