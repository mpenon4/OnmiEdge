"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Brain,
  Cpu,
  Zap,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Terminal,
} from "lucide-react"

export type OracleMessage = {
  id: string
  role: "user" | "oracle" | "system"
  content: string
  timestamp: number
  meta?: {
    tokensIn?: number
    tokensOut?: number
    error?: boolean
  }
}

type Props = {
  messages: OracleMessage[]
  onSend: (text: string) => void
  loading: boolean
  modelId: string
  backendUrl: string
  lastError: string | null
}

const QUICK_PROMPTS = [
  "Analyze power budget for current config",
  "Suggest pinout for adding an IMU",
  "Detect potential bus conflicts",
  "Explain memory utilization",
]

export function OracleChat({
  messages,
  onSend,
  loading,
  modelId,
  backendUrl,
  lastError,
}: Props) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, loading])

  const submit = () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return
    onSend(trimmed)
    setInput("")
  }

  return (
    <div className="flex h-full flex-col bg-[#0A0A0A]">
      {/* Header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-[#1A1A1A] bg-[#0A0A0A] px-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Brain className="h-3.5 w-3.5 text-[#00E5FF]" strokeWidth={2} />
            {loading && (
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <div className="h-full w-full rounded-full border border-[#00E5FF]/40 border-t-transparent" />
              </motion.div>
            )}
          </div>
          <span className="font-mono text-[11px] font-bold tracking-[0.15em] text-white">
            OMNIEDGE ORACLE
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[#666]">
          <Sparkles className="h-3 w-3 text-[#39FF14]" />
          <span className="text-[#39FF14]">silicon-agent</span>
        </div>
      </div>

      {/* Sub-header: target context */}
      <div className="flex h-7 shrink-0 items-center gap-2 border-b border-[#1A1A1A] bg-[#080808] px-3 font-mono text-[9px] uppercase tracking-wider">
        <Cpu className="h-3 w-3 text-[#00E5FF]" />
        <span className="text-[#666]">
          context <span className="text-[#00E5FF]">{modelId}</span>
        </span>
        <span className="text-[#222]">·</span>
        <Terminal className="h-3 w-3 text-[#666]" />
        <span className="text-[#666] truncate">{backendUrl}</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center border border-[#00E5FF]/30 bg-[#00E5FF]/5">
              <Brain className="h-5 w-5 text-[#00E5FF]" />
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888]">
              Silicon Intelligence
            </div>
            <div className="max-w-[260px] font-mono text-[10px] leading-relaxed text-[#555]">
              Edit{" "}
              <span className="text-[#39FF14]">hardware_manifest.yaml</span> or query
              the oracle directly. Every change is shipped to the agent at{" "}
              <span className="text-[#00E5FF]">{backendUrl}</span>.
            </div>

            <div className="mt-4 grid w-full grid-cols-1 gap-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => onSend(q)}
                  disabled={loading}
                  className="group flex items-center justify-between border border-[#1A1A1A] bg-[#0F0F0F] px-2.5 py-2 text-left font-mono text-[10px] text-[#888] hover:border-[#00E5FF]/40 hover:bg-[#00E5FF]/5 hover:text-[#00E5FF] disabled:opacity-40"
                >
                  <span>{q}</span>
                  <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <Message key={m.id} message={m} />
            ))}
          </AnimatePresence>

          {loading && <ProcessingIndicator />}
        </div>
      </div>

      {/* Error banner */}
      {lastError && (
        <div className="shrink-0 border-t border-[#FF3D00]/30 bg-[#FF3D00]/5 px-3 py-1.5">
          <div className="flex items-start gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[#FF3D00]">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="break-all">{lastError}</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-[#1A1A1A] bg-[#080808] p-2">
        <div className="flex items-stretch gap-2 border border-[#1A1A1A] bg-[#0A0A0A] focus-within:border-[#00E5FF]/40 focus-within:shadow-[0_0_12px_rgba(0,229,255,0.15)]">
          <span className="flex items-center pl-2 font-mono text-[10px] font-bold text-[#00E5FF]">
            ›
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="query the oracle..."
            rows={1}
            disabled={loading}
            className="min-h-[32px] flex-1 resize-none bg-transparent py-2 pr-2 font-mono text-[11px] text-white placeholder:text-[#444] outline-none disabled:opacity-50"
          />
          <button
            onClick={submit}
            disabled={loading || !input.trim()}
            className="flex shrink-0 items-center gap-1 border-l border-[#1A1A1A] bg-[#00E5FF]/10 px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-[#00E5FF] hover:bg-[#00E5FF]/20 disabled:opacity-30"
          >
            <Send className="h-3 w-3" />
            send
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between px-1 font-mono text-[8px] uppercase tracking-wider text-[#444]">
          <span>enter to send · shift+enter newline</span>
          <span className="flex items-center gap-1">
            <Zap className="h-2.5 w-2.5 text-[#FFAA00]" />
            yaml + query → /api/oracle
          </span>
        </div>
      </div>
    </div>
  )
}

function Message({ message }: { message: OracleMessage }) {
  const isUser = message.role === "user"
  const isSystem = message.role === "system"
  const isError = !!message.meta?.error
  const time = new Date(message.timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 border-l-2 border-[#444] bg-[#111] px-2 py-1.5"
      >
        <Terminal className="h-3 w-3 shrink-0 text-[#666]" />
        <span className="font-mono text-[10px] text-[#888]">{message.content}</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
    >
      <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.15em] text-[#444]">
        {isUser ? (
          <>
            <span>operator</span>
            <span>·</span>
            <span>{time}</span>
          </>
        ) : (
          <>
            <Brain className="h-2.5 w-2.5 text-[#00E5FF]" />
            <span className="text-[#00E5FF]">oracle</span>
            <span>·</span>
            <span>{time}</span>
            {message.meta?.tokensOut !== undefined && (
              <>
                <span>·</span>
                <span>{message.meta.tokensOut} tk</span>
              </>
            )}
          </>
        )}
      </div>
      <div
        className={`max-w-[92%] whitespace-pre-wrap break-words border px-2.5 py-1.5 font-mono text-[11px] leading-relaxed ${
          isUser
            ? "border-[#39FF14]/30 bg-[#39FF14]/5 text-[#e7ffe2]"
            : isError
              ? "border-[#FF3D00]/40 bg-[#FF3D00]/5 text-[#FFAA00]"
              : "border-[#00E5FF]/25 bg-[#00E5FF]/[0.04] text-[#dff8ff]"
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  )
}

function ProcessingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-start gap-1"
    >
      <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.15em] text-[#444]">
        <Brain className="h-2.5 w-2.5 text-[#00E5FF]" />
        <span className="text-[#00E5FF]">oracle</span>
        <span>·</span>
        <span>processing</span>
      </div>
      <div className="flex items-center gap-2 border border-[#00E5FF]/25 bg-[#00E5FF]/[0.04] px-2.5 py-1.5">
        <span className="font-mono text-[10px] text-[#888]">computing</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block h-1.5 w-1.5 bg-[#00E5FF]"
              animate={{
                opacity: [0.2, 1, 0.2],
                scaleY: [0.6, 1.2, 0.6],
              }}
              transition={{
                duration: 1.0,
                repeat: Infinity,
                delay: i * 0.18,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
