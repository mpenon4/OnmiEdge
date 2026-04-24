"use client";

import TopNavigation from "@/components/TopNavigation";
import HardwareEditor from "@/components/HardwareEditor";
import SimulationViewport from "@/components/SimulationViewport";
import SiliconTelemetry from "@/components/SiliconTelemetry";
import AgentConsole from "@/components/AgentConsole";
import { useEffect, useState } from "react";

export default function Home() {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setUptime((p) => p + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <main className="h-screen w-screen flex flex-col bg-[#050505] overflow-hidden">
      {/* 1. TOP NAVIGATION */}
      <TopNavigation />

      {/* Secondary workspace bar */}
      <div className="h-6 flex items-center justify-between px-4 border-b border-[#1A1A1A] bg-[#050505]">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-[#555] uppercase tracking-wider">Workspace:</span>
          <span className="text-[9px] font-mono text-white">bionic-arm-vla-v2</span>
          <div className="w-px h-3 bg-[#1A1A1A]" />
          <span className="text-[9px] font-mono text-[#555]">Branch:</span>
          <span className="text-[9px] font-mono text-[#39FF14]">main</span>
          <div className="w-px h-3 bg-[#1A1A1A]" />
          <span className="text-[9px] font-mono text-[#555]">Last sync:</span>
          <span className="text-[9px] font-mono text-[#888]">2s ago</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono text-[#555]">
            UPTIME <span className="text-[#888]">{formatUptime(uptime)}</span>
          </span>
          <span className="text-[9px] font-mono text-[#555]">
            MEM <span className="text-[#FFAA00]">94.6%</span>
          </span>
          <span className="text-[9px] font-mono text-[#555]">
            NPU <span className="text-[#FF3D00]">82°C</span>
          </span>
        </div>
      </div>

      {/* MAIN CONTENT - 3 column layout */}
      <div className="flex-1 flex min-h-0">
        {/* 2. HARDWARE-AS-CODE EDITOR */}
        <div className="w-80 shrink-0">
          <HardwareEditor />
        </div>

        {/* 3. UNIFIED SIMULATION VIEWPORT */}
        <div className="flex-1 min-w-0">
          <SimulationViewport />
        </div>

        {/* 4. SILICON TELEMETRY HUB */}
        <div className="w-80 shrink-0">
          <SiliconTelemetry />
        </div>
      </div>

      {/* 5. AI AGENT CONSOLE (Bottom Dock) */}
      <AgentConsole />

      {/* Status Footer */}
      <footer className="h-5 flex items-center justify-between px-4 border-t border-[#1A1A1A] bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-mono text-[#444]">OmniEdge Studio v0.1-beta</span>
          <span className="text-[8px] font-mono text-[#333]">//</span>
          <span className="text-[8px] font-mono text-[#444]">Hardware-as-Code Runtime</span>
          <span className="text-[8px] font-mono text-[#333]">//</span>
          <span className="text-[8px] font-mono text-[#00E5FF]">MCP · Renode_Emulator_v3</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-mono text-[#444]">ARM Cortex-M7 @ 480MHz</span>
          <span className="text-[8px] font-mono text-[#333]">//</span>
          <span className="text-[8px] font-mono text-[#39FF14]">5 Agents Online</span>
        </div>
      </footer>
    </main>
  );
}
