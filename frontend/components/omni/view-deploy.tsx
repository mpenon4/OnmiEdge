"use client"

import { useEffect, useRef, useState } from "react"
import { Cpu, Hammer, Usb, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const TARGETS = [
  { id: "esp32-s3", label: "ESP32-S3", arch: "Xtensa LX7 · 240 MHz", flash: "8 MB", ram: "512 KB" },
  { id: "stm32-h743", label: "STM32H743", arch: "Cortex-M7 · 480 MHz", flash: "2 MB", ram: "1 MB" },
  { id: "rp2040", label: "RP2040", arch: "Cortex-M0+ · 133 MHz", flash: "16 MB", ram: "264 KB" },
  { id: "nrf52840", label: "nRF52840", arch: "Cortex-M4F · 64 MHz", flash: "1 MB", ram: "256 KB" },
]

type Phase = "idle" | "building" | "flashing" | "done"

export function ViewDeploy() {
  const [target, setTarget] = useState(TARGETS[0].id)
  const [phase, setPhase] = useState<Phase>("idle")
  const [progress, setProgress] = useState(0)
  const [log, setLog] = useState<string[]>([
    "[deploy] ready · select target and build",
  ])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function append(line: string) {
    setLog((l) => [...l, line])
  }

  function startBuild() {
    if (phase !== "idle" && phase !== "done") return
    setProgress(0)
    setPhase("building")
    append(`[build] target=${target}  toolchain=xtensa-esp32-elf-gcc  -O3 -DNDEBUG`)
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + 4 + Math.random() * 6
        if (next >= 100) {
          if (timerRef.current) clearInterval(timerRef.current)
          append("[build] OK · firmware.elf 1.84 MB · 38% RAM · 45% Flash")
          setPhase("done")
          return 100
        }
        if (next > 30 && p < 30) append("[link] resolving 218 symbols")
        if (next > 60 && p < 60) append("[link] section .text 1.32 MB · .rodata 412 KB")
        if (next > 85 && p < 85) append("[image] generating firmware.bin · CRC32 0xA1B4F2C9")
        return next
      })
    }, 120)
  }

  function startFlash() {
    if (phase !== "done") return
    setProgress(0)
    setPhase("flashing")
    append("[flash] esptool.py · 921600 baud · /dev/cu.usbserial-A4C1")
    append("[flash] erasing region 0x10000–0x1F0000 (1.84 MB)")
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + 5 + Math.random() * 8
        if (next >= 100) {
          if (timerRef.current) clearInterval(timerRef.current)
          append("[flash] OK · verified · hard reset issued")
          append("[device] esp32-s3@A4C1 boot · firmware.elf running")
          setPhase("done")
          return 100
        }
        return next
      })
    }, 100)
  }

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const t = TARGETS.find((x) => x.id === target)!

  return (
    <div className="grid h-full grid-cols-[360px_1fr] bg-background">
      {/* Target panel */}
      <aside className="overflow-y-auto border-r border-border bg-card">
        <header className="flex h-9 items-center bg-secondary px-3 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Target MCU
        </header>
        <ul>
          {TARGETS.map((t) => {
            const active = target === t.id
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setTarget(t.id)}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 border-b border-border px-3 py-2.5 text-left transition-colors",
                    active ? "bg-secondary" : "hover:bg-secondary/60",
                  )}
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-1.5 font-mono text-[12px]">
                      <Cpu className={cn("size-3", active ? "text-primary" : "text-muted-foreground")} strokeWidth={1.5} />
                      <span className={active ? "text-foreground" : "text-foreground/80"}>{t.label}</span>
                    </span>
                    {active && <span className="font-mono text-[9px] tracking-wider text-primary">SELECTED</span>}
                  </span>
                  <span className="ml-4 font-mono text-[10px] text-muted-foreground">{t.arch}</span>
                  <span className="ml-4 font-mono text-[10px] text-muted-foreground">
                    flash {t.flash} · ram {t.ram}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      {/* Build / Flash workflow */}
      <div className="grid min-h-0 grid-rows-[auto_auto_1fr]">
        {/* Action buttons */}
        <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-3">
          <ActionButton
            label="Build"
            description={`compile for ${t.label}`}
            icon={<Hammer className="size-3.5" strokeWidth={1.5} />}
            onClick={startBuild}
            running={phase === "building"}
            disabled={phase === "flashing"}
          />
          <ActionButton
            label="Flash"
            description="upload firmware over USB"
            icon={<Usb className="size-3.5" strokeWidth={1.5} />}
            onClick={startFlash}
            running={phase === "flashing"}
            disabled={phase !== "done"}
            primary
          />
          <div className="ml-auto flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Zap className="size-3 text-primary" strokeWidth={1.5} />
              <span>{phaseLabel(phase)}</span>
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="border-b border-border bg-card px-3 py-2.5">
          <div className="flex items-baseline justify-between font-mono text-[10px]">
            <span className="tracking-[0.18em] text-muted-foreground uppercase">
              {phase === "building" ? "Compiling" : phase === "flashing" ? "Flashing" : "Progress"}
            </span>
            <span className="text-foreground tabular-nums">{Math.min(100, Math.round(progress))}%</span>
          </div>
          <div className="mt-1.5 h-1 w-full bg-background" role="progressbar" aria-valuenow={progress} aria-valuemax={100}>
            <div
              className={cn(
                "h-full transition-all duration-150",
                phase === "flashing" ? "bg-[var(--telemetry)]" : "bg-primary",
              )}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* Log */}
        <div className="min-h-0 overflow-auto px-3 py-2 font-mono text-[11px] leading-5">
          {log.map((line, i) => (
            <div
              key={i}
              className={cn(
                "whitespace-pre-wrap",
                line.includes(" OK ") || line.endsWith(" running")
                  ? "text-primary"
                  : line.startsWith("[flash]")
                    ? "text-[var(--telemetry)]"
                    : line.startsWith("[device]")
                      ? "text-foreground"
                      : "text-muted-foreground",
              )}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ActionButton({
  label,
  description,
  icon,
  onClick,
  running,
  disabled,
  primary,
}: {
  label: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  running?: boolean
  disabled?: boolean
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || running}
      className={cn(
        "group flex items-center gap-2 border px-3 py-1.5 font-mono text-[11px] tracking-wider uppercase transition-colors",
        primary
          ? "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          : "border-border text-foreground hover:bg-secondary",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
      )}
    >
      <span className={running ? "signal-live" : undefined}>{icon}</span>
      <span className="flex flex-col items-start gap-0.5">
        <span>{label}</span>
        <span className="text-[9px] tracking-normal normal-case text-muted-foreground group-hover:text-current/70">
          {description}
        </span>
      </span>
    </button>
  )
}

function phaseLabel(p: Phase) {
  switch (p) {
    case "idle":
      return "ready"
    case "building":
      return "building…"
    case "flashing":
      return "flashing…"
    case "done":
      return "complete"
  }
}
