"use client";

import CodeWorkspace from "@/components/CodeWorkspace";
import NeuralViewport from "@/components/NeuralViewport";
import EdgeAnalytics from "@/components/EdgeAnalytics";
import AgentAdvisory from "@/components/AgentAdvisory";
import { Cpu, Wifi, Battery, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [time, setTime] = useState("00:00:00");
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toTimeString().slice(0, 8));
      setUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen flex flex-col bg-[#050505]">
      {/* Top Bar */}
      <header className="h-10 flex items-center justify-between px-4 border-b border-[#222] bg-[#0A0A0A]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border border-[#00D4FF] flex items-center justify-center">
              <div className="w-2 h-2 bg-[#00D4FF]" />
            </div>
            <span className="text-sm font-mono font-bold text-white tracking-tight">OmniEdge</span>
            <span className="text-[10px] font-mono text-[#555]">IDE</span>
          </div>
          <div className="h-4 w-px bg-[#222]" />
          <nav className="flex items-center gap-4">
            <button className="text-[10px] font-mono text-[#00D4FF] uppercase tracking-wider">Workspace</button>
            <button className="text-[10px] font-mono text-[#555] uppercase tracking-wider hover:text-[#888]">Deploy</button>
            <button className="text-[10px] font-mono text-[#555] uppercase tracking-wider hover:text-[#888]">Fleet</button>
            <button className="text-[10px] font-mono text-[#555] uppercase tracking-wider hover:text-[#888]">Docs</button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-[#00FF88]" />
            <span className="text-[9px] font-mono text-[#888]">CONNECTED</span>
          </div>
          <div className="flex items-center gap-2">
            <Battery className="w-3.5 h-3.5 text-[#FFAA00]" />
            <span className="text-[9px] font-mono text-[#888]">78%</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span className="text-[9px] font-mono text-[#888]">STM32H7</span>
          </div>
          <div className="h-4 w-px bg-[#222]" />
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#555]" />
            <span className="text-[9px] font-mono text-[#888]">{time}</span>
          </div>
        </div>
      </header>

      {/* Secondary Bar */}
      <div className="h-8 flex items-center justify-between px-4 border-b border-[#222] bg-[#050505]">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-[#555]">PROJECT:</span>
          <span className="text-[9px] font-mono text-white">bionic-arm-vla-v2</span>
          <div className="w-px h-3 bg-[#222]" />
          <span className="text-[9px] font-mono text-[#555]">BRANCH:</span>
          <span className="text-[9px] font-mono text-[#00FF88]">main</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#00FF88] animate-pulse" />
            <span className="text-[9px] font-mono text-[#00FF88]">SIMULATION ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-[#555]">UPTIME:</span>
            <span className="text-[9px] font-mono text-[#888]">{formatUptime(uptime)}</span>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Workspace */}
        <div className="w-80 shrink-0">
          <CodeWorkspace />
        </div>

        {/* Center: Neural-Physical Viewport */}
        <div className="flex-1 min-w-0">
          <NeuralViewport />
        </div>

        {/* Right: Edge Analytics Panel */}
        <div className="w-80 shrink-0">
          <EdgeAnalytics />
        </div>
      </div>

      {/* Bottom: Agent Advisory */}
      <AgentAdvisory />

      {/* Status Footer */}
      <footer className="h-6 flex items-center justify-between px-4 border-t border-[#222] bg-[#050505]">
        <div className="flex items-center gap-4">
          <span className="text-[8px] font-mono text-[#333]">OmniEdge IDE v0.9.4-beta</span>
          <span className="text-[8px] font-mono text-[#333]">|</span>
          <span className="text-[8px] font-mono text-[#333]">Hardware-as-Code Runtime</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[8px] font-mono text-[#333]">ARM Cortex-M7 Emulation</span>
          <span className="text-[8px] font-mono text-[#333]">|</span>
          <span className="text-[8px] font-mono text-[#00FF88]">3 Neural Agents Online</span>
        </div>
      </footer>
    </div>
  );
}
