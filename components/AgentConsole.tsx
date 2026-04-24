"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, Sparkles, AlertTriangle, CheckCircle2, Lightbulb, ChevronDown } from "lucide-react";

type Message = {
  id: number;
  role: "agent" | "user" | "system";
  type?: "warning" | "suggestion" | "success" | "info";
  text: string;
  timestamp: string;
  agent?: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "system",
    text: "Silicon Intelligence Agent initialized. Streaming from Renode_Emulator_v3.",
    timestamp: "12:04:07",
  },
  {
    id: 2,
    role: "agent",
    agent: "bus-analyzer",
    type: "warning",
    text: "I detected a bus contention on I2C-1. The Llama-3 payload is starving the Lidar sensor data. Suggestion: Apply 3-bit quantization to free up 400KB of SRAM.",
    timestamp: "12:04:12",
  },
  {
    id: 3,
    role: "agent",
    agent: "thermal-monitor",
    type: "info",
    text: "NPU core holding at 82°C. Thermal envelope is within spec but approaching throttle threshold. Consider reducing inference frequency from 42Hz to 30Hz during prolonged actuation.",
    timestamp: "12:04:18",
  },
  {
    id: 4,
    role: "user",
    text: "Can we apply the quantization without re-deploying? What's the runtime impact?",
    timestamp: "12:04:45",
  },
  {
    id: 5,
    role: "agent",
    agent: "deploy-advisor",
    type: "suggestion",
    text: "Yes — hot-swap is supported via TFLite Micro's dynamic loader. Estimated runtime impact: +0.8ms inference latency, -18% accuracy on long-tail tokens. SRAM freed: 412KB. Shall I stage the patch for review?",
    timestamp: "12:04:51",
  },
  {
    id: 6,
    role: "agent",
    agent: "kinematics-optimizer",
    type: "success",
    text: "Trajectory prediction updated. Joint J6 path re-routed to avoid singularity. End-effector error reduced from 2.3mm to 0.4mm.",
    timestamp: "12:05:02",
  },
];

const quickActions = [
  "Optimize memory layout",
  "Profile bus contention",
  "Reduce inference latency",
  "Validate manifest",
];

export default function AgentConsole() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [idCounter, setIdCounter] = useState(100);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date().toTimeString().slice(0, 8);
    const userMsg: Message = {
      id: idCounter,
      role: "user",
      text: input,
      timestamp: now,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIdCounter((c) => c + 1);

    setTimeout(() => {
      const reply: Message = {
        id: idCounter + 1,
        role: "agent",
        agent: "silicon-intel",
        type: "info",
        text: "Processing request against live simulation state. Running impact analysis on edge-node STM32H7-EMULATED...",
        timestamp: new Date().toTimeString().slice(0, 8),
      };
      setMessages((prev) => [...prev, reply]);
      setIdCounter((c) => c + 1);
    }, 600);
  };

  return (
    <div className="h-56 flex bg-[#0A0A0A] border-t border-[#1A1A1A]">
      {/* Agents sidebar */}
      <div className="w-48 shrink-0 border-r border-[#1A1A1A] bg-[#050505] flex flex-col">
        <div className="h-7 flex items-center px-3 border-b border-[#1A1A1A]">
          <span className="text-[9px] font-mono text-[#555] uppercase tracking-wider">Agents</span>
          <span className="ml-auto text-[9px] font-mono text-[#39FF14]">4 online</span>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          <AgentRow name="silicon-intel" role="orchestrator" active color="#00E5FF" />
          <AgentRow name="bus-analyzer" role="bus monitor" active color="#FFAA00" />
          <AgentRow name="thermal-monitor" role="thermal envelope" active color="#39FF14" />
          <AgentRow name="deploy-advisor" role="deployment" active color="#00E5FF" />
          <AgentRow name="kinematics-opt" role="trajectory" active color="#39FF14" />
        </div>
      </div>

      {/* Chat main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-8 flex items-center justify-between px-3 border-b border-[#1A1A1A] bg-[#0A0A0A]">
          <div className="flex items-center gap-2">
            <div className="relative w-4 h-4 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-[#00E5FF]" />
              <div className="absolute inset-0 rounded-full border border-[#00E5FF] animate-ping opacity-30" />
            </div>
            <span className="text-[10px] font-mono text-white uppercase tracking-wider">
              Silicon Intelligence Agent
            </span>
            <span className="text-[9px] font-mono text-[#333]">//</span>
            <span className="text-[9px] font-mono text-[#555]">MCP-linked</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#39FF14] animate-pulse" />
              <span className="text-[9px] font-mono text-[#39FF14]">STREAMING</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#555] cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
        </div>

        {/* Quick actions */}
        <div className="h-7 flex items-center gap-1.5 px-3 border-t border-[#1A1A1A] bg-[#050505] overflow-x-auto">
          <Sparkles className="w-3 h-3 text-[#00E5FF] shrink-0" />
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => setInput(action)}
              className="shrink-0 px-2 h-5 border border-[#1A1A1A] bg-[#0A0A0A] hover:border-[#00E5FF] hover:text-[#00E5FF] text-[9px] font-mono text-[#888] uppercase tracking-wider transition-colors"
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
            className="flex-1 bg-transparent text-[11px] font-mono text-white placeholder:text-[#333] outline-none"
          />
          <span className="text-[8px] font-mono text-[#333]">⏎ to send</span>
          <button
            onClick={handleSend}
            className="flex items-center gap-1 px-2 h-6 border border-[#1A1A1A] bg-[#050505] hover:border-[#00E5FF] text-[9px] font-mono text-[#888] hover:text-[#00E5FF] uppercase tracking-wider"
          >
            <Send className="w-2.5 h-2.5" />
            Send
          </button>
        </div>
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
          style={{ backgroundColor: active ? color : "#333", boxShadow: active ? `0 0 4px ${color}` : "none" }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-mono text-white truncate">{name}</div>
        <div className="text-[8px] font-mono text-[#555] truncate uppercase tracking-wider">{role}</div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === "system") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 py-1"
      >
        <div className="h-px flex-1 bg-[#1A1A1A]" />
        <span className="text-[9px] font-mono text-[#444]">{message.text}</span>
        <div className="h-px flex-1 bg-[#1A1A1A]" />
      </motion.div>
    );
  }

  if (message.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-start gap-2 justify-end"
      >
        <div className="max-w-[70%] flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-[#444]">{message.timestamp}</span>
            <span className="text-[9px] font-mono text-[#888] uppercase tracking-wider">you</span>
          </div>
          <div className="px-3 py-1.5 border border-[#2A2A2A] bg-[#111] text-[11px] font-mono text-white leading-relaxed">
            {message.text}
          </div>
        </div>
      </motion.div>
    );
  }

  const typeColor =
    message.type === "warning"
      ? "#FFAA00"
      : message.type === "suggestion"
        ? "#00E5FF"
        : message.type === "success"
          ? "#39FF14"
          : "#888";

  const TypeIcon =
    message.type === "warning"
      ? AlertTriangle
      : message.type === "suggestion"
        ? Lightbulb
        : message.type === "success"
          ? CheckCircle2
          : Brain;

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2">
      <div
        className="shrink-0 w-5 h-5 flex items-center justify-center border bg-[#050505] mt-0.5"
        style={{ borderColor: typeColor, boxShadow: `0 0 4px ${typeColor}40` }}
      >
        <TypeIcon className="w-2.5 h-2.5" style={{ color: typeColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: typeColor }}>
            {message.agent ?? "agent"}
          </span>
          {message.type && (
            <span className="text-[8px] font-mono uppercase px-1 border" style={{ color: typeColor, borderColor: typeColor + "40" }}>
              {message.type}
            </span>
          )}
          <span className="text-[9px] font-mono text-[#333]">{message.timestamp}</span>
        </div>
        <div
          className="px-2.5 py-1.5 border bg-[#050505] text-[11px] font-mono text-[#ccc] leading-relaxed"
          style={{ borderColor: typeColor + "30" }}
        >
          {message.text}
        </div>
      </div>
    </motion.div>
  );
}
