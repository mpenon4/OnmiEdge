"use client"

import { useState } from "react"
import { Box, CircuitBoard, Code2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { CodeEditor } from "./code-editor"
import { PhysicsViewport } from "./physics-viewport"
import { SchematicView } from "./schematic-view"

type TabId = "ide" | "physics" | "schematic"

const TABS: { id: TabId; label: string; icon: React.ReactNode; subtitle: string }[] = [
  { id: "ide", label: "main.cpp", icon: <Code2 className="size-3" />, subtitle: "IDE · Monaco" },
  { id: "physics", label: "rigid_body.sim", icon: <Box className="size-3" />, subtitle: "3D · Rapier" },
  { id: "schematic", label: "main_board.sch", icon: <CircuitBoard className="size-3" />, subtitle: "Schematic" },
]

export function CenterCanvas() {
  const [active, setActive] = useState<TabId>("ide")

  return (
    <section aria-label="Workspace canvas" className="flex h-full flex-col bg-background">
      <div className="flex h-9 shrink-0 items-stretch border-b border-border bg-card">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={cn(
              "group flex items-center gap-2 border-r border-border px-3 font-mono text-[11px] transition-colors",
              active === t.id
                ? "bg-background text-foreground"
                : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <span className={cn(active === t.id ? "text-primary" : "text-muted-foreground")} aria-hidden="true">
              {t.icon}
            </span>
            <span>{t.label}</span>
            <span className="text-[9px] tracking-wider text-muted-foreground">{t.subtitle}</span>
            <X
              className="size-3 text-muted-foreground/40 hover:text-foreground"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </button>
        ))}
        <div className="flex-1 border-r-0" aria-hidden="true" />
      </div>

      <div className="min-h-0 flex-1">
        {active === "ide" && <CodeEditor />}
        {active === "physics" && <PhysicsViewport />}
        {active === "schematic" && <SchematicView />}
      </div>
    </section>
  )
}
