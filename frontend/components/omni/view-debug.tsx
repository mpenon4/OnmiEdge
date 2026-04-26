"use client"

import { useEffect, useState } from "react"
import { Pause, Play, SkipForward, StepForward } from "lucide-react"
import { cn } from "@/lib/utils"
import { useOmniStore } from "@/lib/store"

const REG_NAMES = [
  "PC", "SP", "LR",
  "R0", "R1", "R2", "R3",
  "R4", "R5", "R6", "R7",
  "R8", "R9", "R10", "R11", "R12",
  "PSR",
]

function hex(n: number, width = 8) {
  return n.toString(16).toUpperCase().padStart(width, "0")
}

function randWord() {
  return Math.floor(Math.random() * 0xffffffff)
}

export function ViewDebug() {
  const isSimulating = useOmniStore((s) => s.isSimulating)
  const setSelection = useOmniStore((s) => s.setSelection)
  const [running, setRunning] = useState(isSimulating)
  const [regs, setRegs] = useState<Record<string, number>>(() =>
    Object.fromEntries(REG_NAMES.map((r) => [r, randWord()])),
  )
  const [changed, setChanged] = useState<Set<string>>(new Set())
  const [memBase] = useState(0x3fc88000)
  const [mem, setMem] = useState<number[]>(() => Array.from({ length: 256 }, () => Math.floor(Math.random() * 256)))

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setRegs((prev) => {
        const next = { ...prev }
        const ch = new Set<string>()
        for (let i = 0; i < 4; i++) {
          const reg = REG_NAMES[Math.floor(Math.random() * REG_NAMES.length)]
          next[reg] = randWord()
          ch.add(reg)
        }
        setChanged(ch)
        return next
      })
      setMem((prev) => {
        const next = [...prev]
        for (let i = 0; i < 8; i++) {
          next[Math.floor(Math.random() * next.length)] = Math.floor(Math.random() * 256)
        }
        return next
      })
    }, 600)
    return () => clearInterval(id)
  }, [running])

  return (
    <div className="grid h-full grid-rows-[auto_1fr] bg-background">
      {/* Execution toolbar */}
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">DEBUGGER</span>
        <span className="h-4 w-px bg-border" aria-hidden="true" />
        <DebugBtn icon={running ? <Pause className="size-3.5" /> : <Play className="size-3.5 fill-current" />}
                  label={running ? "Pause" : "Continue"} onClick={() => setRunning((v) => !v)} active={running} />
        <DebugBtn icon={<StepForward className="size-3.5" />} label="Step over" onClick={() => {}} />
        <DebugBtn icon={<SkipForward className="size-3.5" />} label="Step into" onClick={() => {}} />
        <span className="ml-auto flex items-center gap-2 font-mono text-[10px]">
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              running ? "text-primary" : "text-[var(--warning)]",
            )}
          >
            <span className={cn("block size-1.5", running ? "bg-primary signal-live" : "bg-[var(--warning)]")} />
            {running ? "RUNNING" : "HALTED · break @ 0x40080A1C"}
          </span>
          <span className="text-muted-foreground">cortex-m4 · jtag</span>
        </span>
      </div>

      <div className="grid min-h-0 grid-cols-[280px_1fr]">
        {/* Registers */}
        <aside className="overflow-y-auto border-r border-border bg-card">
          <header className="flex h-7 items-center bg-secondary px-3 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Registers
          </header>
          <ul>
            {REG_NAMES.map((name) => {
              const v = regs[name]
              const isChanged = changed.has(name)
              return (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => setSelection({ kind: "register", name, value: hex(v), width: 32 })}
                    className="flex w-full items-baseline justify-between border-b border-border px-3 py-1.5 font-mono text-[11px] hover:bg-secondary"
                  >
                    <span className="text-muted-foreground">{name.padEnd(4, " ")}</span>
                    <span className={cn("tabular-nums", isChanged ? "text-primary" : "text-foreground")}>
                      0x{hex(v)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* Memory hex viewer */}
        <div className="flex min-h-0 flex-col overflow-hidden">
          <header className="flex h-7 items-center justify-between bg-secondary px-3 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            <span>Memory · DRAM @ 0x{memBase.toString(16).toUpperCase()}</span>
            <span className="tracking-normal text-muted-foreground/70">256 B window · LE</span>
          </header>
          <div className="min-h-0 flex-1 overflow-auto py-2">
            <pre className="px-3 font-mono text-[11px] leading-5">
              {Array.from({ length: 16 }).map((_, row) => {
                const offset = memBase + row * 16
                const slice = mem.slice(row * 16, row * 16 + 16)
                const hexBytes = slice.map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ")
                const ascii = slice
                  .map((b) => (b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : "."))
                  .join("")
                return (
                  <div key={row} className="grid grid-cols-[110px_1fr_140px] gap-3">
                    <span className="text-muted-foreground">0x{offset.toString(16).toUpperCase()}</span>
                    <span className="text-foreground">{hexBytes}</span>
                    <span className="text-muted-foreground">|{ascii}|</span>
                  </div>
                )
              })}
            </pre>
          </div>

          {/* Disassembly preview */}
          <footer className="border-t border-border bg-card">
            <header className="flex h-7 items-center bg-secondary px-3 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              Disassembly
            </header>
            <div className="px-3 py-2 font-mono text-[11px] leading-5">
              {[
                ["0x40080A18", "f7ff fb18", "bl  0x40080A4C <camera_capture>"],
                ["0x40080A1C", "4604     ", "mov r4, r0"],
                ["0x40080A1E", "2c00     ", "cmp r4, #0"],
                ["0x40080A20", "d104     ", "bne 0x40080A2C"],
                ["0x40080A22", "f000 f808", "bl  0x40080A36 <fb_release>"],
              ].map(([addr, bytes, asm], i) => (
                <div
                  key={addr}
                  className={cn(
                    "grid grid-cols-[120px_120px_1fr] gap-3",
                    i === 1 && "bg-secondary text-primary",
                  )}
                >
                  <span className="text-muted-foreground">{addr}</span>
                  <span className="text-muted-foreground/70">{bytes}</span>
                  <span>{asm}</span>
                </div>
              ))}
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

function DebugBtn({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-6 w-6 items-center justify-center transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {icon}
    </button>
  )
}
