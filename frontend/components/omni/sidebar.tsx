"use client"

import { Cpu, FlaskConical, Brain, Cloud } from "lucide-react"
import { cn } from "@/lib/utils"

type SectionId = "hardware" | "simulation" | "training" | "cloud"

interface NavItem {
  id: SectionId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { id: "hardware", label: "Hardware", icon: Cpu },
  { id: "simulation", label: "Simulation", icon: FlaskConical },
  { id: "training", label: "AI Training", icon: Brain },
  { id: "cloud", label: "Cloud", icon: Cloud },
]

interface OmniSidebarProps {
  active: SectionId
  onSelect: (id: SectionId) => void
}

export function OmniSidebar({ active, onSelect }: OmniSidebarProps) {
  return (
    <aside
      className="flex w-12 shrink-0 flex-col items-center border-r border-[#1A1A1A] bg-[#050505] py-3"
      aria-label="Module navigation"
    >
      {/* Brand mark */}
      <div className="mb-4 flex h-8 w-8 items-center justify-center border border-[#00E5FF]/40 bg-[#00E5FF]/5">
        <span className="font-mono text-[10px] font-bold tracking-tight text-[#00E5FF]">OE</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex h-9 w-9 items-center justify-center border transition-colors",
                isActive
                  ? "border-[#00E5FF]/40 bg-[#00E5FF]/8 text-[#00E5FF]"
                  : "border-transparent text-[#555] hover:border-[#1A1A1A] hover:bg-[#0A0A0A] hover:text-[#888]",
              )}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute -left-3 top-1/2 h-5 w-0.5 -translate-y-1/2 bg-[#00E5FF]"
                />
              )}
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
      </nav>

      {/* Status dot */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="h-1.5 w-1.5 bg-[#39FF14] shadow-[0_0_6px_rgba(57,255,20,0.8)]" />
        <span className="font-mono text-[8px] text-[#444] [writing-mode:vertical-rl]">v0.1</span>
      </div>
    </aside>
  )
}

export type { SectionId }
