"use client";

import { useEffect, useState, useRef } from "react";
import { Bot, Send, ChevronUp, ChevronDown } from "lucide-react";

interface Message {
  id: string;
  agent: string;
  content: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    agent: "Agent-01",
    content: "Analyzing hardware manifest... Target MCU: STM32H7 detected.",
    type: "info",
    timestamp: "00:00:01",
  },
  {
    id: "2",
    agent: "Agent-01",
    content: "WARNING: Model size (4.5MB) exceeds physical Flash (2MB). Initiating optimization...",
    type: "warning",
    timestamp: "00:00:03",
  },
  {
    id: "3",
    agent: "Agent-02",
    content: "Applying 3-bit quantization to Llama-3-Tiny-Edge layers 1-12...",
    type: "info",
    timestamp: "00:00:05",
  },
  {
    id: "4",
    agent: "Agent-02",
    content: "Pruning Layer 4 attention heads (redundancy score: 0.94)...",
    type: "info",
    timestamp: "00:00:08",
  },
  {
    id: "5",
    agent: "Agent-01",
    content: "Optimization complete. New model size: 1.8MB. Latency reduced by 40%.",
    type: "success",
    timestamp: "00:00:12",
  },
];

const additionalMessages: Message[] = [
  {
    id: "6",
    agent: "Agent-03",
    content: "SRAM pressure detected. Recommending activation checkpointing for Layer 8-12.",
    type: "warning",
    timestamp: "00:00:15",
  },
  {
    id: "7",
    agent: "Agent-01",
    content: "Thermal analysis: 85% throttling expected at sustained inference. Consider duty cycling.",
    type: "warning",
    timestamp: "00:00:18",
  },
  {
    id: "8",
    agent: "Agent-02",
    content: "VLA token pipeline optimized. Achieved 24.5 tok/s on ARM Cortex-M7 @ 480MHz.",
    type: "success",
    timestamp: "00:00:22",
  },
  {
    id: "9",
    agent: "Agent-01",
    content: "Peripheral latency: IMU (BMI270) SPI read: 0.8ms, Vision (OV7670): 12ms/frame.",
    type: "info",
    timestamp: "00:00:25",
  },
  {
    id: "10",
    agent: "Agent-03",
    content: "ERROR: Tensor allocation failed for grip_intention buffer. Reducing batch size to 1...",
    type: "error",
    timestamp: "00:00:28",
  },
  {
    id: "11",
    agent: "Agent-03",
    content: "Recovery successful. Grip intention inference stabilized at 45ms latency.",
    type: "success",
    timestamp: "00:00:31",
  },
];

export default function AgentAdvisory() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageIndex >= additionalMessages.length) return;

    const timeout = setTimeout(() => {
      setMessages((prev) => [...prev, additionalMessages[messageIndex]]);
      setMessageIndex((prev) => prev + 1);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [messageIndex]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getTypeColor = (type: Message["type"]) => {
    switch (type) {
      case "success":
        return "text-[#00FF88]";
      case "warning":
        return "text-[#FFAA00]";
      case "error":
        return "text-[#FF3333]";
      default:
        return "text-[#00D4FF]";
    }
  };

  const getAgentColor = (agent: string) => {
    if (agent === "Agent-01") return "text-[#00D4FF]";
    if (agent === "Agent-02") return "text-[#00FF88]";
    return "text-[#FFAA00]";
  };

  return (
    <div className={`bg-[#0A0A0A] border-t border-[#222] transition-all ${isExpanded ? "h-48" : "h-10"}`}>
      {/* Header */}
      <div
        className="h-10 flex items-center justify-between px-4 border-b border-[#222] cursor-pointer hover:bg-[#111]"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#00D4FF]" />
          <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">Neural Agent Advisory</span>
          <div className="flex items-center gap-1 ml-2">
            <div className="w-1.5 h-1.5 bg-[#00FF88] animate-pulse" />
            <span className="text-[8px] font-mono text-[#00FF88]">3 AGENTS ONLINE</span>
          </div>
        </div>
        <button className="p-1 hover:bg-[#222]">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-[#555]" />
          ) : (
            <ChevronUp className="w-4 h-4 text-[#555]" />
          )}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Messages */}
          <div ref={scrollRef} className="h-[calc(100%-80px)] overflow-auto p-3 space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-2 text-xs font-mono">
                <span className="text-[#333] shrink-0">[{msg.timestamp}]</span>
                <span className={`shrink-0 ${getAgentColor(msg.agent)}`}>{msg.agent}:</span>
                <span className={getTypeColor(msg.type)}>{msg.content}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 text-[#555]">
              <span className="animate-pulse">_</span>
            </div>
          </div>

          {/* Input */}
          <div className="h-10 flex items-center gap-2 px-3 border-t border-[#222]">
            <span className="text-[10px] font-mono text-[#555]">{">"}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query agents..."
              className="flex-1 bg-transparent text-xs font-mono text-white placeholder:text-[#333] outline-none"
            />
            <button className="p-1.5 hover:bg-[#222]">
              <Send className="w-3.5 h-3.5 text-[#555]" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
