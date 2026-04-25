"use client"

import { useRef, useState, useEffect } from "react"
import { Send, Sparkles, AlertTriangle, CheckCircle2, AlertCircle, Loader2, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"

interface HardwareSnapshot {
  mcuId: string
  mcuFullName: string
  mcuSramKb: number
  mcuFlashKb: number
  mcuClockMhz: number
  effectiveSramKb: number
  effectiveFlashKb: number
  effectiveClockMhz: number
  activeBuses: string[]
  busUtilization: { bus: string; componentCount: number; estimatedUtilizationPercent: number }[]
  pinConflicts: { pinId: string; components: string[] }[]
  components: { name: string; type: string; bus: string; pins: string[] }[]
  activePinCount: number
}

interface OracleChatProps {
  snapshot: HardwareSnapshot
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

type ValidateOutput = {
  verdict: "VALID" | "VALID_WITH_WARNINGS" | "INVALID"
  headline: string
  reason: string
  target: { mcu: string; clockMhz: number }
  memory: {
    sramTotalKb: number
    sramEstimatedUsedKb: number
    sramUtilizationPercent: number
    flashTotalKb: number
  }
  buses: { bus: string; components: number; utilizationPercent: number }[]
  pinConflicts: { pinId: string; components: string[] }[]
  issues: { severity: "info" | "warning" | "critical"; message: string }[]
  checksRun: number
  timestamp: string
} | { error: string }

export function OracleChat({ snapshot }: OracleChatProps) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [hardwareManifest, setHardwareManifest] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Cargar el hardware manifest del servidor
  useEffect(() => {
    const loadHardwareManifest = async () => {
      try {
        const response = await fetch("/api/hardware-manifest")
        if (response.ok) {
          const data = await response.json()
          setHardwareManifest(data)
        }
      } catch (error) {
        console.error("Error loading hardware manifest:", error)
        // Si no está disponible localmente, usar un objeto vacío
        setHardwareManifest({})
      }
    }
    loadHardwareManifest()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/oracle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mcu_id: snapshot.mcuId,
          hardware_manifest: hardwareManifest || {},
          query: input,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message || "Análisis completado",
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Error en la respuesta del servidor",
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    if (loading) return
    setInput(prompt)
    // Simulamos un submit automático después de establecer el input
    setTimeout(() => {
      const form = document.querySelector("form") as HTMLFormElement
      if (form) form.dispatchEvent(new Event("submit", { bubbles: true }))
    }, 0)
  }

  const busy = loading

  return (
    <div className="flex h-full flex-col bg-[#050505]">
      {/* Header */}
      <div className="flex h-7 shrink-0 items-center justify-between border-b border-[#1A1A1A] bg-[#0A0A0A] px-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-[#00E5FF]" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-white">
            OmniEdge Oracle
          </span>
          <span className="text-[#1A1A1A]">·</span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#666]">
            Silicon Intelligence Agent
          </span>
        </div>
        <span
          className={cn(
            "flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider",
            busy ? "text-[#FFAA00]" : "text-[#39FF14]",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5",
              busy
                ? "animate-pulse bg-[#FFAA00] shadow-[0_0_6px_rgba(255,170,0,0.8)]"
                : "bg-[#39FF14] shadow-[0_0_6px_rgba(57,255,20,0.8)]",
            )}
          />
          {busy ? "Thinking" : "Ready"}
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px]">
        {messages.length === 0 ? (
          <EmptyState onPrompt={handleQuickPrompt} />
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {busy && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-2 text-[#666]">
                <Loader2 className="h-3 w-3 animate-spin text-[#00E5FF]" />
                <span className="text-[10px] uppercase tracking-wider">Oracle is analyzing</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-center gap-2 border-t border-[#1A1A1A] bg-[#0A0A0A] px-2 py-2"
      >
        <span className="font-mono text-[10px] text-[#00E5FF]">{">"}</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Ask: "Is this setup viable?"'
          disabled={busy}
          className="flex-1 bg-transparent font-mono text-[11px] text-white placeholder:text-[#444] outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="flex h-5 w-5 items-center justify-center border border-[#1A1A1A] bg-[#111] text-[#00E5FF] transition-colors hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Send className="h-2.5 w-2.5" />
        </button>
      </form>
    </div>
  )
}

function EmptyState({ onPrompt }: { onPrompt: (p: string) => void }) {
  const prompts = [
    "Is this setup viable?",
    "Validate my configuration",
    "Check SRAM envelope",
  ]
  return (
    <div className="flex h-full flex-col items-start justify-center gap-3 py-4">
      <div className="flex items-center gap-2 text-[#666]">
        <Cpu className="h-3 w-3 text-[#00E5FF]" />
        <span className="text-[10px] uppercase tracking-wider">
          Oracle has read access to your manifest
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => onPrompt(p)}
            className="flex items-center gap-2 border border-[#1A1A1A] bg-[#0A0A0A] px-2 py-1 text-left text-[10px] text-[#AAA] transition-colors hover:border-[#00E5FF]/40 hover:bg-[#00E5FF]/5 hover:text-[#00E5FF]"
          >
            <span className="text-[#00E5FF]">{">"}</span>
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex flex-col gap-1.5", isUser ? "items-end" : "items-start")}>
      <span className="font-mono text-[9px] uppercase tracking-wider text-[#444]">
        {isUser ? "USER" : "ORACLE"}
      </span>
      <div
        className={cn(
          "max-w-full border px-2 py-1.5 font-mono text-[11px] leading-relaxed",
          isUser
            ? "border-[#1A1A1A] bg-[#0A0A0A] text-white"
            : "border-[#1A1A1A] bg-[#050505] text-[#CCC]",
        )}
      >
        {message.content}
      </div>
    </div>
  )
}
    

function ToolInvocation({ part }: { part: any }) {
  const state = part.state as
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error"

  if (state === "input-streaming" || state === "input-available") {
    return (
      <div className="flex items-center gap-2 border border-[#00E5FF]/30 bg-[#00E5FF]/5 px-2 py-1.5">
        <Loader2 className="h-3 w-3 animate-spin text-[#00E5FF]" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#00E5FF]">
          Running validateConfiguration()
        </span>
      </div>
    )
  }

  if (state === "output-error") {
    return (
      <div className="flex items-center gap-2 border border-[#FF3D00]/40 bg-[#FF3D00]/5 px-2 py-1.5">
        <AlertCircle className="h-3 w-3 text-[#FF3D00]" />
        <span className="font-mono text-[10px] text-[#FF3D00]">Tool execution failed</span>
      </div>
    )
  }

  const output = part.output as ValidateOutput
  if (!output || "error" in output) {
    return (
      <div className="border border-[#FF3D00]/40 bg-[#FF3D00]/5 px-2 py-1.5 font-mono text-[10px] text-[#FF3D00]">
        {output && "error" in output ? output.error : "No output"}
      </div>
    )
  }

  return <HardwareHealthCard report={output} />
}

function HardwareHealthCard({ report }: { report: Exclude<ValidateOutput, { error: string }> }) {
  const verdictConfig = {
    VALID: { color: "#39FF14", label: "HEALTHY", Icon: CheckCircle2 },
    VALID_WITH_WARNINGS: { color: "#FFAA00", label: "DEGRADED", Icon: AlertTriangle },
    INVALID: { color: "#FF3D00", label: "CRITICAL", Icon: AlertCircle },
  }[report.verdict]

  return (
    <div className="border border-[#1A1A1A] bg-[#0A0A0A]">
      {/* Card header */}
      <div
        className="flex items-center justify-between border-b px-2 py-1.5"
        style={{ borderColor: `${verdictConfig.color}40` }}
      >
        <div className="flex items-center gap-1.5">
          <verdictConfig.Icon className="h-3 w-3" style={{ color: verdictConfig.color }} />
          <span
            className="font-mono text-[10px] uppercase tracking-wider font-semibold"
            style={{ color: verdictConfig.color }}
          >
            Hardware Health · {verdictConfig.label}
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-wider text-[#444]">
          {report.checksRun} checks
        </span>
      </div>

      {/* Card body */}
      <div className="space-y-2 px-2 py-2">
        {/* Headline */}
        <div
          className="font-mono text-[11px] leading-relaxed"
          style={{ color: verdictConfig.color }}
        >
          {report.headline}
        </div>

        {/* Target */}
        <div className="flex items-center gap-2 border-t border-[#1A1A1A] pt-2">
          <Cpu className="h-3 w-3 text-[#00E5FF]" />
          <span className="font-mono text-[10px] text-[#AAA]">{report.target.mcu}</span>
          <span className="font-mono text-[9px] text-[#444]">@ {report.target.clockMhz}MHz</span>
        </div>

        {/* SRAM bar */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between font-mono text-[9px] uppercase tracking-wider">
            <span className="text-[#666]">SRAM Envelope</span>
            <span
              style={{
                color:
                  report.memory.sramUtilizationPercent > 90
                    ? "#FF3D00"
                    : report.memory.sramUtilizationPercent > 70
                      ? "#FFAA00"
                      : "#39FF14",
              }}
            >
              {report.memory.sramEstimatedUsedKb} / {report.memory.sramTotalKb} KB
            </span>
          </div>
          <div className="h-1.5 w-full border border-[#1A1A1A] bg-[#050505]">
            <div
              className="h-full transition-all"
              style={{
                width: `${Math.min(100, report.memory.sramUtilizationPercent)}%`,
                backgroundColor:
                  report.memory.sramUtilizationPercent > 90
                    ? "#FF3D00"
                    : report.memory.sramUtilizationPercent > 70
                      ? "#FFAA00"
                      : "#39FF14",
                boxShadow:
                  report.memory.sramUtilizationPercent > 70
                    ? `0 0 4px ${report.memory.sramUtilizationPercent > 90 ? "#FF3D00" : "#FFAA00"}`
                    : undefined,
              }}
            />
          </div>
        </div>

        {/* Bus utilization list */}
        {report.buses.length > 0 && (
          <div className="space-y-1">
            <div className="font-mono text-[9px] uppercase tracking-wider text-[#666]">
              Active Buses
            </div>
            {report.buses.map((b) => (
              <div key={b.bus} className="flex items-center gap-2">
                <span className="w-10 font-mono text-[10px] text-[#AAA]">{b.bus}</span>
                <div className="relative h-1 flex-1 border border-[#1A1A1A] bg-[#050505]">
                  <div
                    className="h-full"
                    style={{
                      width: `${b.utilizationPercent}%`,
                      backgroundColor:
                        b.utilizationPercent >= 90
                          ? "#FF3D00"
                          : b.utilizationPercent >= 75
                            ? "#FFAA00"
                            : "#00E5FF",
                    }}
                  />
                </div>
                <span
                  className="w-10 text-right font-mono text-[9px]"
                  style={{
                    color:
                      b.utilizationPercent >= 90
                        ? "#FF3D00"
                        : b.utilizationPercent >= 75
                          ? "#FFAA00"
                          : "#AAA",
                  }}
                >
                  {b.utilizationPercent}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Issues list */}
        {report.issues.length > 0 && (
          <div className="space-y-1 border-t border-[#1A1A1A] pt-2">
            <div className="font-mono text-[9px] uppercase tracking-wider text-[#666]">
              Diagnostics
            </div>
            {report.issues.map((issue, i) => {
              const color =
                issue.severity === "critical"
                  ? "#FF3D00"
                  : issue.severity === "warning"
                    ? "#FFAA00"
                    : "#00E5FF"
              return (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color, boxShadow: `0 0 3px ${color}` }}
                  />
                  <span className="font-mono text-[10px] leading-relaxed" style={{ color }}>
                    {issue.message}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#1A1A1A] pt-1.5 font-mono text-[8px] uppercase tracking-wider text-[#444]">
          <span>validateConfiguration() → {report.verdict}</span>
          <span>{new Date(report.timestamp).toLocaleTimeString("en-US", { hour12: false })}</span>
        </div>
      </div>
    </div>
  )
}
            <div className="font-mono text-[9px] uppercase tracking-wider text-[#666]">
              Diagnostics
            </div>
            {report.issues.map((issue, i) => {
              const color =
                issue.severity === "critical"
                  ? "#FF3D00"
                  : issue.severity === "warning"
                    ? "#FFAA00"
                    : "#00E5FF"
              return (
                <div key={i} className="flex items-start gap-1.5">
                  <span
                    className="mt-0.5 h-1 w-1 shrink-0"
                    style={{ backgroundColor: color, boxShadow: `0 0 3px ${color}` }}
                  />
                  <span className="font-mono text-[10px] leading-relaxed" style={{ color }}>
                    {issue.message}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#1A1A1A] pt-1.5 font-mono text-[8px] uppercase tracking-wider text-[#444]">
          <span>validateConfiguration() → {report.verdict}</span>
          <span>{new Date(report.timestamp).toLocaleTimeString("en-US", { hour12: false })}</span>
        </div>
      </div>
    </div>
  )
}
