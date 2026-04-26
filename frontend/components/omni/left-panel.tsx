"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useOmniStore } from "@/lib/store"

/* ---------- file dot color by type ---------- */

const TYPE_COLOR: Record<string, string> = {
  cpp: "var(--color-text-info)",
  h: "var(--color-text-info)",
  sch: "var(--color-text-warning)",
  brd: "var(--color-text-warning)",
  tflite: "#8b5cf6",
  onnx: "#8b5cf6",
  ipynb: "#8b5cf6",
  sim: "var(--color-text-secondary)",
  ini: "var(--color-text-secondary)",
  md: "var(--color-text-secondary)",
}

const ext = (name: string) => name.split(".").pop() ?? ""

/* ---------- tree data ---------- */

type Node = {
  name: string
  type: "folder" | "file"
  children?: Node[]
  active?: boolean
  badge?: "M" | "OK" | "!"
}

const TREE: Node[] = [
  {
    name: "esp32-edge-vision",
    type: "folder",
    children: [
      {
        name: "firmware",
        type: "folder",
        children: [
          { name: "main.cpp", type: "file", active: true },
          { name: "sensors.cpp", type: "file" },
          { name: "i2c_bus.cpp", type: "file" },
          { name: "wifi_stack.cpp", type: "file", badge: "M" },
        ],
      },
      {
        name: "models",
        type: "folder",
        children: [
          { name: "vision_v3.tflite", type: "file" },
          { name: "anomaly.onnx", type: "file" },
          { name: "training.ipynb", type: "file" },
        ],
      },
      {
        name: "schematic",
        type: "folder",
        children: [
          { name: "main_board.sch", type: "file" },
          { name: "power_rail.sch", type: "file" },
          { name: "antenna.sch", type: "file", badge: "!" },
        ],
      },
      {
        name: "simulation",
        type: "folder",
        children: [
          { name: "thermal.sim", type: "file" },
          { name: "rigid_body.sim", type: "file" },
        ],
      },
      { name: "platformio.ini", type: "file" },
      { name: "README.md", type: "file" },
    ],
  },
]

const langOf = (name: string) => {
  const e = ext(name)
  if (e === "cpp" || e === "h") return "C++"
  if (e === "tflite" || e === "onnx") return "Model"
  if (e === "sch") return "Schematic"
  if (e === "sim") return "Simulation"
  if (e === "ipynb") return "Notebook"
  if (e === "ini") return "Config"
  if (e === "md") return "Markdown"
  return "File"
}

export function LeftPanel() {
  const [filter, setFilter] = useState("")

  return (
    <aside
      aria-label="Project explorer"
      className="flex h-full min-h-0 flex-col bg-[var(--color-background-primary)]"
    >
      {/* Explorer (flex 1) */}
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex h-7 shrink-0 items-center justify-between px-3">
          <span className="font-sans text-[10px] tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">
            Explorer
          </span>
          <button
            type="button"
            aria-label="New file"
            className="flex size-4 items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <Plus className="size-3" strokeWidth={1.5} />
          </button>
        </header>

        <div className="px-3 pb-1.5">
          <input
            type="search"
            placeholder="Filter files..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full border-b border-transparent bg-transparent py-0.5 font-sans text-[11px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-text-info)] focus:outline-none"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {TREE.map((n) => (
            <TreeRow key={n.name} node={n} depth={0} initiallyOpen filter={filter} />
          ))}
        </div>
      </div>

      {/* MCU Summary (120px fixed) */}
      <McuSummary />
    </aside>
  )
}

function TreeRow({
  node,
  depth,
  initiallyOpen = false,
  filter = "",
}: {
  node: Node
  depth: number
  initiallyOpen?: boolean
  filter?: string
}) {
  const [open, setOpen] = useState(initiallyOpen || depth < 2)
  const setSelection = useOmniStore((s) => s.setSelection)
  const isFolder = node.type === "folder"

  // Filter visibility: a folder shows if any child matches.
  if (filter) {
    const q = filter.toLowerCase()
    const match = (n: Node): boolean =>
      n.name.toLowerCase().includes(q) || (n.children?.some(match) ?? false)
    if (!match(node)) return null
  }

  const dotColor = !isFolder ? TYPE_COLOR[ext(node.name)] ?? "var(--color-text-secondary)" : ""

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (isFolder) setOpen((v) => !v)
          else
            setSelection({
              kind: "file",
              path: node.name,
              lang: langOf(node.name),
              size: 1024 + Math.floor(Math.random() * 8192),
              status: node.badge === "!" ? "error" : node.badge === "M" ? "modified" : "compiled",
            })
        }}
        style={{ paddingLeft: `${depth === 0 ? 12 : 12 + (depth - 1) * 12}px` }}
        className={cn(
          "group flex h-6 w-full items-center gap-1.5 pr-2 text-left transition-colors",
          node.active
            ? "bg-[var(--color-background-info)] text-[var(--color-text-info)]"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] hover:text-[var(--color-text-primary)]",
        )}
      >
        {isFolder ? (
          open ? (
            <ChevronDown className="size-3 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <ChevronRight className="size-3 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          )
        ) : (
          <span className="ml-3 flex size-3 shrink-0 items-center justify-center" aria-hidden="true">
            <span className="block size-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
          </span>
        )}
        <span
          className={cn(
            "truncate font-sans text-[11px]",
            isFolder
              ? node.active
                ? ""
                : "text-[var(--color-text-primary)]"
              : "",
          )}
        >
          {node.name}
        </span>
        {node.badge && (
          <span
            className={cn(
              "ml-auto px-1 font-mono text-[9px] tracking-wider",
              node.badge === "!"
                ? "text-[var(--color-text-danger)]"
                : node.badge === "M"
                  ? "text-[var(--color-text-warning)]"
                  : "text-[var(--color-text-success)]",
            )}
          >
            {node.badge}
          </span>
        )}
      </button>
      {isFolder && open && node.children?.map((c) => <TreeRow key={c.name} node={c} depth={depth + 1} filter={filter} />)}
    </div>
  )
}

/* ---------- MCU Summary (fixed 120px) ---------- */

function McuSummary() {
  const isSimulating = useOmniStore((s) => s.isSimulating)
  return (
    <div
      className="shrink-0 border-t border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-3 py-2"
      style={{ height: 120 }}
    >
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] text-[var(--color-text-primary)]">STM32H743</span>
        <span
          className={cn(
            "font-mono text-[9px] tracking-[0.2em] uppercase",
            isSimulating ? "text-[var(--color-text-success)]" : "text-[var(--color-text-secondary)]",
          )}
        >
          {isSimulating ? "LIVE" : "IDLE"}
        </span>
      </div>
      <div className="mt-2 space-y-1.5">
        <Bar label="Flash" pct={45} value="921 KB / 2 MB" />
        <Bar label="SRAM" pct={71} value="728 KB / 1 MB" tone="warning" />
        <Bar label="CPU" pct={isSimulating ? 32 : 4} value={isSimulating ? "32%" : "4%"} />
      </div>
      <div className="mt-1.5 flex items-baseline justify-between font-mono text-[9px] text-[var(--color-text-secondary)]">
        <span>POWER</span>
        <span className="text-[var(--color-text-primary)]">178 mW</span>
      </div>
    </div>
  )
}

function Bar({
  label,
  pct,
  value,
  tone,
}: {
  label: string
  pct: number
  value: string
  tone?: "warning" | "danger"
}) {
  const color =
    tone === "danger"
      ? "var(--color-text-danger)"
      : tone === "warning" || pct > 80
        ? "var(--color-text-warning)"
        : "var(--color-text-info)"
  return (
    <div>
      <div className="flex items-baseline justify-between font-mono text-[9px] tabular-nums">
        <span className="tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">{label}</span>
        <span className="text-[var(--color-text-primary)]">{value}</span>
      </div>
      <div
        className="mt-0.5 h-[3px] w-full bg-[var(--color-background-canvas)]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemax={100}
      >
        <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
