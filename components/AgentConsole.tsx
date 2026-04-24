"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Activity,
  Cpu,
  Flame,
  Radio,
} from "lucide-react";
import type { OmniEdgeChatMessage } from "@/app/api/chat/route";
import { useSimulator } from "@/lib/simulator-context";

const quickActions = [
  "Can this model run on the current MCU?",
  "Analyze memory and thermal envelope",
  "Why is I2C-1 in contention?",
  "Recommend optimizations",
];

export default function AgentConsole() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const sim = useSimulator();
  const lastProcessedCallId = useRef<string | null>(null);

  const { messages, sendMessage, status } = useChat<OmniEdgeChatMessage>({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          id,
          messages,
          simulatorState: {
            mcu_id: sim.mcu.id,
            mcu_arch: sim.mcu.arch,
            sram_kb: sim.mcu.sram_kb,
            clock_mhz: sim.mcu.clock_mhz,
            ai_model: sim.model.id,
            model_size_kb: sim.model.size_kb,
            quantization: sim.model.quantization,
            context_window: sim.model.context_window,
          },
        },
      }),
    }),
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  // Bridge: when the tool resolves with a critical verdict, propagate to
  // the global simulator context so SiliconTelemetry flips into RED alert.
  useEffect(() => {
    for (const msg of messages) {
      if (msg.role !== "assistant") continue;
      for (const part of msg.parts) {
        if (part.type !== "tool-analyzeHardwareConfig") continue;
        if (part.state !== "output-available") continue;
        if (part.output.state !== "complete") continue;
        if (lastProcessedCallId.current === part.toolCallId) continue;

        lastProcessedCallId.current = part.toolCallId;

        sim.setAnalysis({
          verdict: part.output.verdict,
          overflow_kb: part.output.overflow_kb,
          timestamp: new Date().toTimeString().slice(0, 8),
        });

        if (part.output.verdict === "CRITICAL_MEMORY_OVERFLOW") {
          sim.triggerAlert(
            "critical",
            "analyzeHardwareConfig",
            `Memory overflow: model requires ${part.output.required_kb}KB but only ${part.output.usable_sram_kb}KB usable (${part.output.overflow_kb}KB short).`,
          );
        } else if (part.output.verdict === "WARNING_LOW_HEADROOM") {
          sim.triggerAlert(
            "warning",
            "analyzeHardwareConfig",
            "Low SRAM headroom detected — <10% free.",
          );
        } else {
          sim.triggerAlert("nominal", "analyzeHardwareConfig", "All envelopes nominal.");
        }
      }
    }
  }, [messages, sim]);

  const handleSend = () => {
    if (!input.trim() || status === "streaming" || status === "submitted") return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="h-64 flex bg-[#0A0A0A] border-t border-[#1A1A1A]">
      {/* Agents sidebar */}
      <div className="w-48 shrink-0 border-r border-[#1A1A1A] bg-[#050505] flex flex-col">
        <div className="h-7 flex items-center px-3 border-b border-[#1A1A1A]">
          <span className="text-[9px] font-mono text-[#555] uppercase tracking-wider">Agents</span>
          <span className="ml-auto text-[9px] font-mono text-[#39FF14]">1 active</span>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          <AgentRow
            name="silicon-intel"
            role="hw/sw co-design"
            active={status === "streaming" || status === "submitted"}
            color="#00E5FF"
          />
          <AgentRow name="bus-analyzer" role="bus monitor" active={false} color="#FFAA00" />
          <AgentRow name="thermal-monitor" role="thermal envelope" active={false} color="#39FF14" />
          <AgentRow name="deploy-advisor" role="deployment" active={false} color="#00E5FF" />
          <AgentRow name="kinematics-opt" role="trajectory" active={false} color="#39FF14" />
        </div>
      </div>

      {/* Chat main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-8 flex items-center justify-between px-3 border-b border-[#1A1A1A] bg-[#0A0A0A]">
          <div className="flex items-center gap-2">
            <div className="relative w-4 h-4 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-[#00E5FF]" />
              {(status === "streaming" || status === "submitted") && (
                <div className="absolute inset-0 rounded-full border border-[#00E5FF] animate-ping opacity-40" />
              )}
            </div>
            <span className="text-[10px] font-mono text-white uppercase tracking-wider">
              Silicon Intelligence Agent
            </span>
            <span className="text-[9px] font-mono text-[#333]">//</span>
            <span className="text-[9px] font-mono text-[#555]">
              {sim.mcu.id} · {sim.model.id}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 ${
                  status === "streaming" || status === "submitted"
                    ? "bg-[#FFAA00] animate-pulse"
                    : status === "error"
                      ? "bg-[#FF3D00]"
                      : "bg-[#39FF14]"
                }`}
              />
              <span
                className={`text-[9px] font-mono uppercase ${
                  status === "streaming" || status === "submitted"
                    ? "text-[#FFAA00]"
                    : status === "error"
                      ? "text-[#FF3D00]"
                      : "text-[#39FF14]"
                }`}
              >
                {status === "streaming"
                  ? "STREAMING"
                  : status === "submitted"
                    ? "THINKING"
                    : status === "error"
                      ? "ERROR"
                      : "READY"}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#555] cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          {messages.length === 0 && <EmptyState />}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageView key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
          {status === "submitted" && <ThinkingIndicator />}
        </div>

        {/* Quick actions */}
        <div className="h-7 flex items-center gap-1.5 px-3 border-t border-[#1A1A1A] bg-[#050505] overflow-x-auto">
          <Sparkles className="w-3 h-3 text-[#00E5FF] shrink-0" />
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => {
                if (status === "streaming" || status === "submitted") return;
                sendMessage({ text: action });
              }}
              disabled={status === "streaming" || status === "submitted"}
              className="shrink-0 px-2 h-5 border border-[#1A1A1A] bg-[#0A0A0A] hover:border-[#00E5FF] hover:text-[#00E5FF] text-[9px] font-mono text-[#888] uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="h-10 flex items-center gap-2 px-3 border-t border-[#1A1A1A] bg-[#0A0A0A]">
          <span className="text-[10px] font-mono text-[#00E5FF]">&gt;</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Query the silicon intelligence agent..."
            disabled={status === "streaming" || status === "submitted"}
            className="flex-1 bg-transparent text-[11px] font-mono text-white placeholder:text-[#333] outline-none disabled:opacity-50"
          />
          <span className="text-[8px] font-mono text-[#333]">⏎ to send</span>
          <button
            onClick={handleSend}
            disabled={status === "streaming" || status === "submitted" || !input.trim()}
            className="flex items-center gap-1 px-2 h-6 border border-[#1A1A1A] bg-[#050505] hover:border-[#00E5FF] text-[9px] font-mono text-[#888] hover:text-[#00E5FF] uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-2.5 h-2.5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  const sim = useSimulator();
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="h-px flex-1 bg-[#1A1A1A]" />
      <span className="text-[9px] font-mono text-[#444]">
        Silicon Intelligence Agent ready · MCU: {sim.mcu.id} · Model: {sim.model.id} · Ask about feasibility, memory or latency.
      </span>
      <div className="h-px flex-1 bg-[#1A1A1A]" />
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 text-[10px] font-mono text-[#00E5FF]"
    >
      <Loader2 className="w-3 h-3 animate-spin" />
      <span>Agent is analyzing simulator state...</span>
    </motion.div>
  );
}

function MessageView({ message }: { message: OmniEdgeChatMessage }) {
  if (message.role === "user") {
    const text = message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
    return (
      <motion.div
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-start gap-2 justify-end"
      >
        <div className="max-w-[70%] flex flex-col items-end gap-1">
          <span className="text-[9px] font-mono text-[#888] uppercase tracking-wider">you</span>
          <div className="px-3 py-1.5 border border-[#2A2A2A] bg-[#111] text-[11px] font-mono text-white leading-relaxed">
            {text}
          </div>
        </div>
      </motion.div>
    );
  }

  // Assistant
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="space-y-1.5">
      {message.parts.map((part, i) => {
        if (part.type === "text") {
          const isCritical = part.text.includes("[CRITICAL]");
          const color = isCritical ? "#FF3D00" : "#00E5FF";
          return (
            <div key={i} className="flex items-start gap-2">
              <div
                className="shrink-0 w-5 h-5 flex items-center justify-center border bg-[#050505] mt-0.5"
                style={{ borderColor: color, boxShadow: `0 0 4px ${color}40` }}
              >
                {isCritical ? (
                  <AlertTriangle className="w-2.5 h-2.5" style={{ color }} />
                ) : (
                  <Brain className="w-2.5 h-2.5" style={{ color }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color }}>
                    silicon-intel
                  </span>
                  {isCritical && (
                    <span
                      className="text-[8px] font-mono uppercase px-1 border"
                      style={{ color, borderColor: color + "80" }}
                    >
                      critical
                    </span>
                  )}
                </div>
                <div
                  className="px-2.5 py-1.5 border bg-[#050505] text-[11px] font-mono text-[#ccc] leading-relaxed whitespace-pre-wrap"
                  style={{ borderColor: color + "30" }}
                >
                  {part.text}
                </div>
              </div>
            </div>
          );
        }

        if (part.type === "tool-analyzeHardwareConfig") {
          return <AnalyzeHardwareCard key={i} part={part} />;
        }

        return null;
      })}
    </motion.div>
  );
}

type ToolPart = Extract<
  OmniEdgeChatMessage["parts"][number],
  { type: "tool-analyzeHardwareConfig" }
>;

function AnalyzeHardwareCard({ part }: { part: ToolPart }) {
  if (part.state === "input-streaming" || part.state === "input-available") {
    return (
      <div className="ml-7 border border-[#00E5FF]/40 bg-[#050505] px-3 py-2 flex items-center gap-2">
        <Loader2 className="w-3 h-3 text-[#00E5FF] animate-spin" />
        <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-wider">
          Invoking tool: analyzeHardwareConfig
        </span>
        {part.state === "input-available" && (
          <span className="text-[9px] font-mono text-[#555] ml-auto">
            {part.input.mcu_id} · {part.input.ai_model}
          </span>
        )}
      </div>
    );
  }

  if (part.state === "output-error") {
    return (
      <div className="ml-7 border border-[#FF3D00]/60 bg-[#1a0505] px-3 py-2">
        <span className="text-[10px] font-mono text-[#FF3D00]">
          Tool error: {part.errorText}
        </span>
      </div>
    );
  }

  if (part.state !== "output-available") return null;

  const out = part.output;

  if (out.state === "analyzing") {
    return (
      <div className="ml-7 border border-[#00E5FF]/40 bg-[#050505] px-3 py-2 flex items-center gap-2">
        <Loader2 className="w-3 h-3 text-[#00E5FF] animate-spin" />
        <span className="text-[10px] font-mono text-[#00E5FF]">{out.phase}</span>
      </div>
    );
  }

  // out.state === "complete"
  const critical = out.verdict === "CRITICAL_MEMORY_OVERFLOW";
  const warning = out.verdict === "WARNING_LOW_HEADROOM";
  const color = critical ? "#FF3D00" : warning ? "#FFAA00" : "#39FF14";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="ml-7 border bg-[#050505]"
      style={{ borderColor: color + "60", boxShadow: `0 0 8px ${color}20` }}
    >
      {/* Header */}
      <div
        className="px-3 h-8 flex items-center justify-between border-b"
        style={{ borderColor: color + "30" }}
      >
        <div className="flex items-center gap-2">
          {critical ? (
            <AlertTriangle className="w-3.5 h-3.5" style={{ color }} />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color }} />
          )}
          <span
            className="text-[10px] font-mono uppercase tracking-wider font-semibold"
            style={{ color }}
          >
            Hardware Diagnostic · {out.verdict}
          </span>
        </div>
        <span className="text-[9px] font-mono text-[#555]">
          confidence {(out.confidence * 100).toFixed(0)}%
        </span>
      </div>

      {/* Target */}
      <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center gap-4 text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-[#00E5FF]" />
          <span className="text-[#555] uppercase">MCU</span>
          <span className="text-white">{out.mcu_id}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Brain className="w-3 h-3 text-[#00E5FF]" />
          <span className="text-[#555] uppercase">Model</span>
          <span className="text-white">{out.ai_model}</span>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-4 gap-px bg-[#1A1A1A] border-b border-[#1A1A1A]">
        <Metric label="SRAM Usable" value={`${out.usable_sram_kb}`} unit="KB" />
        <Metric label="Required" value={`${out.required_kb}`} unit="KB" color={critical ? "#FF3D00" : undefined} />
        <Metric
          label="Overflow"
          value={out.overflow_kb > 0 ? `+${out.overflow_kb}` : `${out.overflow_kb}`}
          unit="KB"
          color={critical ? "#FF3D00" : "#39FF14"}
        />
        <Metric
          label="Utilization"
          value={`${out.utilization_pct}`}
          unit="%"
          color={critical ? "#FF3D00" : warning ? "#FFAA00" : "#39FF14"}
        />
      </div>

      {/* Utilization bar */}
      <div className="px-3 py-2 border-b border-[#1A1A1A]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-mono text-[#555] uppercase tracking-wider">SRAM Pressure</span>
          <span className="text-[9px] font-mono" style={{ color }}>
            {out.utilization_pct}% of usable
          </span>
        </div>
        <div className="h-1.5 bg-[#0A0A0A] border border-[#1A1A1A] relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, out.utilization_pct)}%` }}
            transition={{ duration: 0.8 }}
          />
          {out.utilization_pct > 100 && (
            <div
              className="absolute inset-y-0 right-0 w-1 bg-[#FF3D00] animate-pulse"
              style={{ boxShadow: "0 0 6px #FF3D00" }}
            />
          )}
        </div>
      </div>

      {/* Secondary signals */}
      <div className="grid grid-cols-3 gap-px bg-[#1A1A1A] border-b border-[#1A1A1A]">
        <SignalCell
          icon={<Activity className="w-3 h-3" />}
          label="Tokens/s"
          value={`${out.tokens_per_sec}`}
        />
        <SignalCell
          icon={<Flame className="w-3 h-3" />}
          label="Thermal"
          value={`${out.estimated_temp_c}°C`}
          accent={out.thermal_risk === "HIGH" ? "#FF3D00" : out.thermal_risk === "MODERATE" ? "#FFAA00" : "#39FF14"}
          hint={out.thermal_risk}
        />
        <SignalCell
          icon={<Radio className="w-3 h-3" />}
          label="Bus Conflict"
          value={out.bus_contention.length > 0 ? out.bus_contention.join(", ") : "none"}
          accent={out.bus_contention.length > 0 ? "#FF3D00" : "#39FF14"}
        />
      </div>

      {/* Recommendations */}
      <div className="px-3 py-2">
        <div className="text-[9px] font-mono text-[#555] uppercase tracking-wider mb-1">
          Recommendations
        </div>
        <ul className="space-y-1">
          {out.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[10px] font-mono text-[#00E5FF] mt-0.5">›</span>
              <span className="text-[10px] font-mono text-[#bbb] leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function Metric({
  label,
  value,
  unit,
  color = "#FFFFFF",
}: {
  label: string;
  value: string;
  unit: string;
  color?: string;
}) {
  return (
    <div className="bg-[#050505] px-2 py-1.5">
      <div className="text-[8px] font-mono text-[#555] uppercase tracking-wider">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-[13px] font-mono font-semibold" style={{ color }}>
          {value}
        </span>
        <span className="text-[8px] font-mono text-[#555]">{unit}</span>
      </div>
    </div>
  );
}

function SignalCell({
  icon,
  label,
  value,
  accent = "#888",
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
  hint?: string;
}) {
  return (
    <div className="bg-[#050505] px-2 py-1.5">
      <div className="flex items-center gap-1 text-[8px] font-mono text-[#555] uppercase tracking-wider">
        <div style={{ color: accent }}>{icon}</div>
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[10px] font-mono text-white truncate" style={{ color: accent }}>
          {value}
        </span>
        {hint && <span className="text-[8px] font-mono text-[#555]">{hint}</span>}
      </div>
    </div>
  );
}

function AgentRow({
  name,
  role,
  active,
  color,
}: {
  name: string;
  role: string;
  active: boolean;
  color: string;
}) {
  return (
    <div className="h-10 flex items-center gap-2 px-3 hover:bg-[#0A0A0A] cursor-pointer border-l-2 border-transparent hover:border-[#00E5FF]/50 transition-colors">
      <div className="relative">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: active ? color : "#333",
            boxShadow: active ? `0 0 4px ${color}` : "none",
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-mono text-white truncate">{name}</div>
        <div className="text-[8px] font-mono text-[#555] truncate uppercase tracking-wider">{role}</div>
      </div>
    </div>
  );
}
