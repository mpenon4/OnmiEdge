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
    <div className="grid h-full min-h-0" style={{ gridTemplateRows: "32px 1fr 28px" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3">
        <DebugBtn icon={running ? <Pause className="size-3" /> : <Play className="size-3 fill-current" />}
                  label={running ? "Pause" : "Continue"} onClick={() => setRunning((v) => !v)} active={running} />
        <DebugBtn icon={<StepForward className="size-3" />} label="Step over" onClick={() => {}} />
        <DebugBtn icon={<SkipForward className="size-3" />} label="Step into" onClick={() => {}} />
        <span className="ml-3 font-mono text-[10px] tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">
          Debugger · cortex-m4 · jtag
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px]">
          <span
            className={cn(
              "block size-1.5",
              running ? "bg-[var(--color-text-success)] signal-live" : "bg-[var(--color-text-warning)]",
            )}
          />
          <span
            className={cn(
              "tracking-wider uppercase",
              running ? "text-[var(--color-text-success)]" : "text-[var(--color-text-warning)]",
            )}
          >
            {running ? "RUNNING" : "HALTED · break @ 0x40080A1C"}
          </span>
        </span>
      </div>

      {/* Body — Registers + Memory + Disasm */}
      <div className="grid min-h-0 bg-[var(--color-background-canvas)]" style={{ gridTemplateColumns: "260px 1fr" }}>
        <aside className="overflow-y-auto border-r border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]">
          <header className="flex h-7 items-center bg-[var(--color-background-secondary)] px-3 font-sans text-[10px] tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">
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
                    className="flex w-full items-baseline justify-between border-b border-[var(--color-border-tertiary)] px-3 py-1.5 font-mono text-[11px] hover:bg-[var(--color-background-secondary)]"
                  >
                    <span className="text-[var(--color-text-secondary)]">{name.padEnd(4, " ")}</span>
                    <span
                      className={cn(
                        "tabular-nums",
                        isChanged ? "text-[var(--color-text-success)]" : "text-[var(--color-text-primary)]",
                      )}
                    >
                      0x{hex(v)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        <div className="grid min-h-0" style={{ gridTemplateRows: "1fr auto" }}>
          {/* Memory */}
          <div className="flex min-h-0 flex-col overflow-hidden">
            <header className="flex h-7 shrink-0 items-center justify-between bg-[var(--color-background-secondary)] px-3 font-sans text-[10px] tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">
              <span>Memory · DRAM @ 0x{memBase.toString(16).toUpperCase()}</span>
              <span className="text-[10px] tracking-normal normal-case text-[var(--color-text-secondary)]">256 B · LE</span>
            </header>
            <div className="min-h-0 flex-1 overflow-auto py-2">
              <pre className="px-3 font-mono text-[11px] leading-5 text-[var(--color-text-primary)]">
                {Array.from({ length: 16 }).map((_, row) => {
                  const offset = memBase + row * 16
                  const slice = mem.slice(row * 16, row * 16 + 16)
                  const hexBytes = slice.map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ")
                  const ascii = slice.map((b) => (b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : ".")).join("")
                  return (
                    <div key={row} className="grid gap-3" style={{ gridTemplateColumns: "110px 1fr 140px" }}>
                      <span className="text-[var(--color-text-secondary)]">0x{offset.toString(16).toUpperCase()}</span>
                      <span>{hexBytes}</span>
                      <span className="text-[var(--color-text-secondary)]">|{ascii}|</span>
                    </div>
                  )
                })}
              </pre>
            </div>
          </div>

          {/* Disassembly */}
          <footer className="border-t border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]">
            <header className="flex h-7 items-center bg-[var(--color-background-secondary)] px-3 font-sans text-[10px] tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">
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
                    "grid gap-3",
                    i === 1 && "bg-[var(--color-background-info)] text-[var(--color-text-info)]",
                  )}
                  style={{ gridTemplateColumns: "120px 120px 1fr" }}
                >
                  <span className="text-[var(--color-text-secondary)]">{addr}</span>
                  <span className="text-[var(--color-text-secondary)]">{bytes}</span>
                  <span className={cn(i === 1 ? "text-[var(--color-text-info)]" : "text-[var(--color-text-primary)]")}>
                    {asm}
                  </span>
                </div>
              ))}
            </div>
          </footer>
        </div>
      </div>

      {/* Status bar 28px */}
      <div className="flex items-center justify-between border-t border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3 font-mono text-[10px] text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-4">
          <span>
            PC <span className="text-[var(--color-text-primary)] tabular-nums">0x40080A1C</span>
          </span>
          <span>
            CYCLES <span className="text-[var(--color-text-primary)] tabular-nums">1,234,567</span>
          </span>
          <span>
            TIME <span className="text-[var(--color-text-primary)] tabular-nums">00:00:12.345</span>
          </span>
        </div>
        <span>BREAKPOINTS · 2</span>
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
        "flex size-6 items-center justify-center transition-colors",
        active
          ? "bg-[var(--color-text-success)] text-[var(--color-background-canvas)]"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] hover:text-[var(--color-text-primary)]",
      )}
    >
      {icon}
    </button>
  )
}
