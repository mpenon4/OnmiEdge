"use client"

import { useEffect, useRef, useState } from "react"
import { Bug, ChevronRight, Cpu, Search, Sparkles, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

type LogLevel = "info" | "ok" | "warn" | "error" | "user" | "oracle"
type LogEntry = { id: number; ts: string; level: LogLevel; source: string; message: string }

const SEED: LogEntry[] = [
  { id: 1, ts: "14:22:01", level: "info", source: "build", message: "platformio · linking firmware.elf (1.84 MB)" },
  { id: 2, ts: "14:22:03", level: "ok", source: "build", message: "OK · firmware ready · 38% RAM · 45% Flash" },
  { id: 3, ts: "14:22:08", level: "info", source: "device", message: "esp32-s3@A4C1 connected · COM7 · 921600" },
  { id: 4, ts: "14:22:09", level: "ok", source: "ota", message: "flash complete · verified · reset issued" },
  {
    id: 5,
    ts: "14:22:14",
    level: "warn",
    source: "tinyml",
    message: "model arena utilization at 87% — consider quantizing dense_3",
  },
  { id: 6, ts: "14:22:18", level: "info", source: "mesh", message: "esp-now joined · channel 6 · 4 peers" },
]

const ts = () =>
  new Date().toTimeString().slice(0, 8)

export function OracleConsole() {
  const [log, setLog] = useState<LogEntry[]>(SEED)
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idRef = useRef(SEED.length + 1)

  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight
  }, [log])

  const append = (entry: Omit<LogEntry, "id" | "ts">) => {
    setLog((l) => [...l, { id: idRef.current++, ts: ts(), ...entry }])
  }

  async function ask(q: string) {
    if (!q.trim() || pending) return
    append({ level: "user", source: "you", message: q })
    setPending(true)

    // Connects the frontend to your existing Hono backend at app/api/[[...route]]/route.ts.
    // POSTs to /api/chat using the AI SDK message shape; tolerates both JSON and streamed text replies.
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: q }],
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const contentType = res.headers.get("content-type") ?? ""
      let reply = ""
      if (contentType.includes("application/json")) {
        const data = (await res.json().catch(() => ({}))) as {
          reply?: string
          text?: string
          message?: string
        }
        reply = data.reply ?? data.text ?? data.message ?? "(empty response)"
      } else {
        // Plain text or AI SDK text stream — concatenate the body.
        reply = (await res.text()).trim() || "(empty response)"
      }
      append({ level: "oracle", source: "gemini", message: reply })
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

  const QUICK_ACTIONS = [
    {
      id: "fault",
      label: "Inject Fault",
      icon: <Bug className="size-3" strokeWidth={1.5} />,
      prompt:
        "Inject a fault scenario into the simulator: brown-out at 2.7V on the 3V3 rail. Predict which sensors and tasks are affected and propose a recovery sequence.",
    },
    {
      id: "optimize",
      label: "Optimize Model",
      icon: <Cpu className="size-3" strokeWidth={1.5} />,
      prompt:
        "Analyze the current TFLite model (anomaly.tflite, INT8, arena 256KB). Suggest concrete optimizations to reduce arena and inference latency without losing more than 1% accuracy.",
    },
    {
      id: "analyze",
      label: "Analyze System",
      icon: <Search className="size-3" strokeWidth={1.5} />,
      prompt:
        "Run a holistic system analysis: I²C bus health, RSSI trend, memory pressure, inference latency. Surface anomalies and rank them by severity.",
    },
  ]

  return (
    <section
      aria-label="Oracle AI console"
      className="flex h-full flex-col border-t border-border bg-card"
      onClick={() => inputRef.current?.focus()}
    >
      <header className="flex h-8 shrink-0 items-center justify-between border-b border-border px-3">
        <div className="flex items-center gap-2">
          <Terminal className="size-3 text-primary" strokeWidth={1.5} aria-hidden="true" />
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Oracle · Engineering Console
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
          <span>gemini · gateway/hono</span>
          <span className="flex items-center gap-1.5">
            <span
              className={cn("block size-1.5", pending ? "bg-[#ff8c42] signal-live" : "bg-primary")}
              aria-hidden="true"
            />
            {pending ? "thinking" : "ready"}
          </span>
        </div>
      </header>

      <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-5">
        {log.map((entry) => (
          <LogRow key={entry.id} entry={entry} />
        ))}
        {pending && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-[#ff8c42]">[{ts()}]</span>
            <span className="signal-live">oracle &rarr; computing…</span>
          </div>
        )}
      </div>

      <div className="flex h-8 shrink-0 items-center gap-2 border-t border-border bg-card px-3">
        <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">Quick</span>
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={pending}
            onClick={() => ask(a.prompt)}
            className={cn(
              "flex items-center gap-1.5 border border-border bg-background px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase transition-colors",
              pending
                ? "cursor-not-allowed text-muted-foreground/40"
                : "text-muted-foreground hover:border-primary hover:text-primary",
            )}
          >
            <span aria-hidden="true">{a.icon}</span>
            {a.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-[9px] text-muted-foreground/60">
          press a quick action or type a free-form command
        </span>
      </div>

      <form onSubmit={submit} className="flex h-9 shrink-0 items-center gap-2 border-t border-border px-3">
        <Sparkles className="size-3 text-primary" strokeWidth={1.5} aria-hidden="true" />
        <ChevronRight className="size-3 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
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
          placeholder="explain the I²C timing on bus 0  ·  optimize tflite arena  ·  why is RSSI dropping?"
          className="flex-1 bg-transparent font-mono text-[12px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-60"
        />
        <span className="font-mono text-[9px] tracking-wider text-muted-foreground/60">⏎ send</span>
      </form>
    </section>
  )
}

function LogRow({ entry }: { entry: LogEntry }) {
  const levelColor: Record<LogLevel, string> = {
    info: "text-muted-foreground",
    ok: "text-primary",
    warn: "text-[#ff8c42]",
    error: "text-destructive",
    user: "text-foreground",
    oracle: "text-primary",
  }
  const sourceWidth = "w-16"
  return (
    <div className="flex gap-2">
      <span className="shrink-0 text-muted-foreground/60 tabular-nums">[{entry.ts}]</span>
      <span className={cn("shrink-0 truncate uppercase tracking-wider text-[10px] tabular-nums", sourceWidth, levelColor[entry.level])}>
        {entry.source}
      </span>
      <span className={cn("min-w-0 break-words", entry.level === "user" ? "text-foreground" : "text-foreground/90")}>
        {entry.level === "user" && <span className="text-primary">&rarr; </span>}
        {entry.message}
      </span>
    </div>
  )
}
