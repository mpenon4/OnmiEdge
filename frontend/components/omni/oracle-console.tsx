"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type LogLevel = "info" | "ok" | "warn" | "error" | "user" | "oracle"
type LogSource = "build" | "device" | "ota" | "tinyml" | "mesh" | "i2c" | "rssi" | "oracle" | "you" | "fault" | string
type LogEntry = { id: number; ts: string; level: LogLevel; source: LogSource; message: string }

type Filter = "all" | "build" | "ml" | "faults"

const SEED: LogEntry[] = [
  { id: 1, ts: "14:22:01", level: "info", source: "build", message: "platformio · linking firmware.elf (1.84 MB)" },
  { id: 2, ts: "14:22:18", level: "info", source: "mesh", message: "esp-now joined · channel 6 · 4 peers" },
  { id: 3, ts: "14:24:01", level: "warn", source: "tinyml", message: "SRAM at 71% — approaching arena ceiling" },
]

const ts = () => new Date().toTimeString().slice(0, 8)

const FILTERS: Filter[] = ["all", "build", "ml", "faults"]

const QUICK_ACTIONS = [
  {
    id: "fault",
    label: "Inject Fault",
    prompt:
      "Inject a fault scenario into the simulator: brown-out at 2.7V on the 3V3 rail. Predict which sensors and tasks are affected and propose a recovery sequence.",
  },
  {
    id: "optimize",
    label: "Optimize Model",
    prompt:
      "Analyze the current TFLite model (anomaly.tflite, INT8, arena 256KB). Suggest concrete optimizations to reduce arena and inference latency without losing more than 1% accuracy.",
  },
  {
    id: "analyze",
    label: "Analyze System",
    prompt:
      "Run a holistic system analysis: I²C bus health, RSSI trend, memory pressure, inference latency. Surface anomalies and rank them by severity.",
  },
] as const

function matchFilter(source: string, filter: Filter): boolean {
  if (filter === "all") return true
  if (filter === "build") return source === "build" || source === "ota" || source === "device"
  if (filter === "ml") return source === "tinyml" || source === "oracle" || source === "you"
  if (filter === "faults") return source === "fault" || source === "rssi" || source === "i2c"
  return true
}

export function OracleConsole() {
  const [log, setLog] = useState<LogEntry[]>(SEED)
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)
  const [filter, setFilter] = useState<Filter>("all")
  const scrollerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idRef = useRef(SEED.length + 1)

  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight
  }, [log, filter])

  const append = (entry: Omit<LogEntry, "id" | "ts">) => {
    setLog((l) => [...l, { id: idRef.current++, ts: ts(), ...entry }])
  }

  async function ask(q: string) {
    if (!q.trim() || pending) return
    append({ level: "user", source: "you", message: q })
    setPending(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: q }] }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const ct = res.headers.get("content-type") ?? ""
      let reply = ""
      if (ct.includes("application/json")) {
        const data = (await res.json().catch(() => ({}))) as {
          reply?: string
          text?: string
          message?: string
        }
        reply = data.reply ?? data.text ?? data.message ?? "(empty response)"
      } else {
        reply = (await res.text()).trim() || "(empty response)"
      }
      append({ level: "oracle", source: "oracle", message: reply })
    } catch (err) {
      append({
        level: "error",
        source: "oracle",
        message: `transport · ${err instanceof Error ? err.message : "unknown error"} · is /api/chat reachable?`,
      })
    } finally {
      setPending(false)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = input.trim()
    if (!q) return
    setInput("")
    await ask(q)
  }

  const visibleLog = log.filter((l) => matchFilter(l.source, filter))

  return (
    <section
      aria-label="Oracle AI console"
      className="grid h-full min-h-0 border-t border-[var(--color-border-secondary)] bg-[var(--color-background-primary)]"
      style={{ gridTemplateRows: "32px 1fr 48px" }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Header — Oracle accent (the only zone with green chrome) */}
      <header
        className="flex shrink-0 items-center justify-between border-b border-[var(--color-border-tertiary)] px-3"
        style={{ background: "var(--color-background-canvas)" }}
      >
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase">
          <span style={{ color: "var(--color-oracle-accent)" }}>&gt;_</span>
          <span style={{ color: "var(--color-oracle-accent)" }}>Oracle</span>
          <span className="text-[var(--color-text-secondary)]">· Engineering Console</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 border border-[var(--color-border-tertiary)]">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2 py-0.5 font-mono text-[9px] tracking-[0.18em] uppercase transition-colors",
                  filter === f
                    ? "bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <span
            className="font-mono text-[10px] tracking-wider uppercase"
            style={{
              color: pending
                ? "var(--color-text-warning)"
                : "var(--color-oracle-accent)",
            }}
          >
            {pending ? "thinking" : "ready"}
          </span>
        </div>
      </header>

      {/* Log area */}
      <div ref={scrollerRef} className="min-h-0 overflow-y-auto px-3 py-1.5">
        {visibleLog.map((entry) => (
          <LogRow key={entry.id} entry={entry} />
        ))}
        {pending && (
          <div className="flex items-center gap-2 py-0.5 font-mono text-[11px] text-[var(--color-text-secondary)]">
            <span className="text-[var(--color-text-secondary)]">[{ts()}]</span>
            <span className="signal-live" style={{ color: "var(--color-oracle-accent)" }}>
              oracle &rarr; computing…
            </span>
          </div>
        )}
      </div>

      {/* Input row — quick actions + free-form */}
      <form
        onSubmit={submit}
        className="flex shrink-0 items-center gap-3 border-t border-[var(--color-border-tertiary)] px-3"
      >
        <div className="flex items-center gap-1">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.id}
              type="button"
              disabled={pending}
              onClick={() => ask(a.prompt)}
              className={cn(
                "border px-2 py-1 font-mono text-[10px] tracking-wider uppercase transition-colors",
                pending
                  ? "cursor-not-allowed border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)]/40"
                  : "border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-info)] hover:text-[var(--color-text-info)]",
              )}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center gap-2">
          <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">$</span>
          <ChevronRight className="size-3 text-[var(--color-text-secondary)]" strokeWidth={1.5} aria-hidden="true" />
          <label htmlFor="oracle-input" className="sr-only">
            Ask the Oracle
          </label>
          <input
            ref={inputRef}
            id="oracle-input"
            autoComplete="off"
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={pending}
            placeholder="press a quick action or type a free-form command"
            className="flex-1 bg-transparent font-mono text-[11px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none disabled:opacity-60"
          />
          <span className="font-mono text-[9px] tracking-wider text-[var(--color-text-secondary)]">⏎</span>
        </div>
      </form>
    </section>
  )
}

function LogRow({ entry }: { entry: LogEntry }) {
  const sourceColor: Record<string, string> = {
    build: "var(--color-text-info)",
    ota: "var(--color-text-info)",
    device: "var(--color-text-success)",
    mesh: "var(--color-text-info)",
    tinyml: "var(--color-text-warning)",
    i2c: "var(--color-text-secondary)",
    rssi: "var(--color-text-secondary)",
    fault: "var(--color-text-danger)",
    oracle: "var(--color-oracle-accent)",
    you: "var(--color-text-primary)",
  }

  const msgColor: Record<LogLevel, string> = {
    info: "var(--color-text-primary)",
    ok: "var(--color-text-success)",
    warn: "var(--color-text-warning)",
    error: "var(--color-text-danger)",
    user: "var(--color-text-primary)",
    oracle: "var(--color-text-primary)",
  }

  return (
    <div className="grid gap-2 py-[1px]" style={{ gridTemplateColumns: "60px 70px 1fr" }}>
      <span className="font-mono text-[10px] tabular-nums text-[var(--color-text-secondary)]">[{entry.ts}]</span>
      <span
        className="truncate font-mono text-[10px] tracking-wider uppercase"
        style={{ color: sourceColor[entry.source] ?? "var(--color-text-secondary)" }}
      >
        {entry.source}
      </span>
      <span className="min-w-0 truncate font-sans text-[11px]" style={{ color: msgColor[entry.level] }}>
        {entry.level === "user" && (
          <span className="mr-1" style={{ color: "var(--color-oracle-accent)" }}>
            &rarr;
          </span>
        )}
        {entry.message}
      </span>
    </div>
  )
}
