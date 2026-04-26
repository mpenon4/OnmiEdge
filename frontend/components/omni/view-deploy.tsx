"use client"

import { useEffect, useRef, useState } from "react"
import { Hammer, Usb } from "lucide-react"
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
  const [log, setLog] = useState<string[]>(["[deploy] ready · select target and build"])
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

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current)
    },
    [],
  )

  const t = TARGETS.find((x) => x.id === target)!

  return (
    <div className="grid h-full min-h-0" style={{ gridTemplateRows: "32px 1fr 28px" }}>
      <div className="flex items-center gap-3 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3">
        <span className="font-sans text-[10px] tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">
          Deploy · Build & Flash
        </span>
        <span className="font-mono text-[10px] text-[var(--color-text-primary)]">{t.label}</span>
        <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">{t.arch}</span>
      </div>

      <div className="grid min-h-0 bg-[var(--color-background-canvas)]" style={{ gridTemplateColumns: "320px 1fr" }}>
        <aside className="overflow-y-auto border-r border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]">
          <header className="flex h-7 items-center bg-[var(--color-background-secondary)] px-3 font-sans text-[10px] tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">
            Target MCU
          </header>
          <ul>
            {TARGETS.map((tg) => {
              const active = target === tg.id
              return (
                <li key={tg.id}>
                  <button
                    type="button"
                    onClick={() => setTarget(tg.id)}
                    className={cn(
                      "flex w-full flex-col items-start gap-0.5 border-b border-[var(--color-border-tertiary)] px-3 py-2 text-left transition-colors",
                      active
                        ? "bg-[var(--color-background-info)]"
                        : "hover:bg-[var(--color-background-secondary)]",
                    )}
                  >
                    <span className="flex w-full items-baseline justify-between">
                      <span
                        className={cn(
                          "font-mono text-[12px]",
                          active ? "text-[var(--color-text-info)]" : "text-[var(--color-text-primary)]",
                        )}
                      >
                        {tg.label}
                      </span>
                      {active && (
                        <span className="font-mono text-[9px] tracking-wider text-[var(--color-text-info)]">
                          SELECTED
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">{tg.arch}</span>
                    <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                      flash {tg.flash} · ram {tg.ram}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        <div className="grid min-h-0" style={{ gridTemplateRows: "auto auto 1fr" }}>
          <div className="flex items-center gap-2 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3 py-2.5">
            <ActionButton
              label="Build"
              icon={<Hammer className="size-3" strokeWidth={1.5} />}
              onClick={startBuild}
              running={phase === "building"}
              disabled={phase === "flashing"}
            />
            <ActionButton
              label="Flash"
              icon={<Usb className="size-3" strokeWidth={1.5} />}
              onClick={startFlash}
              running={phase === "flashing"}
              disabled={phase !== "done"}
              primary
            />
            <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)]">
              {phaseLabel(phase)}
            </span>
          </div>

          <div className="border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3 py-2">
            <div className="flex items-baseline justify-between font-mono text-[10px]">
              <span className="tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">
                {phase === "building" ? "Compiling" : phase === "flashing" ? "Flashing" : "Progress"}
              </span>
              <span className="text-[var(--color-text-primary)] tabular-nums">{Math.round(progress)}%</span>
            </div>
            <div
              className="mt-1.5 h-1 w-full bg-[var(--color-background-canvas)]"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemax={100}
            >
              <div
                className="h-full transition-all duration-150"
                style={{
                  width: `${Math.min(100, progress)}%`,
                  backgroundColor:
                    phase === "flashing" ? "var(--color-text-info)" : "var(--color-text-success)",
                }}
              />
            </div>
          </div>

          <div className="min-h-0 overflow-auto px-3 py-2 font-mono text-[11px] leading-5">
            {log.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "whitespace-pre-wrap",
                  line.includes(" OK ") || line.endsWith(" running")
                    ? "text-[var(--color-text-success)]"
                    : line.startsWith("[flash]")
                      ? "text-[var(--color-text-info)]"
                      : line.startsWith("[device]")
                        ? "text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-secondary)]",
                )}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3 font-mono text-[10px] text-[var(--color-text-secondary)]">
        <span>PORT · /dev/cu.usbserial-A4C1</span>
        <span>BAUD · 921600</span>
      </div>
    </div>
  )
}

function ActionButton({
  label,
  icon,
  onClick,
  running,
  disabled,
  primary,
}: {
  label: string
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
        "flex items-center gap-2 border px-3 py-1.5 font-mono text-[11px] tracking-wider uppercase transition-colors",
        primary
          ? "border-[var(--color-text-info)] text-[var(--color-text-info)] hover:bg-[var(--color-text-info)] hover:text-[var(--color-background-canvas)]"
          : "border-[var(--color-border-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)]",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
      )}
    >
      <span className={running ? "signal-live" : undefined}>{icon}</span>
      <span>{label}</span>
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
