"use client";

import TopNavigation from "@/components/TopNavigation";
import HardwareEditor from "@/components/HardwareEditor";
import SimulationViewport from "@/components/SimulationViewport";
import SiliconTelemetry from "@/components/SiliconTelemetry";
import AgentConsole from "@/components/AgentConsole";
import { SimulatorProvider, useSimulator, MCU_PRESETS, MODEL_PRESETS } from "@/lib/simulator-context";
import { useEffect, useState } from "react";

export default function Home() {
  return (
    <SimulatorProvider>
      <Dashboard />
    </SimulatorProvider>
  );
}

function Dashboard() {
  const sim = useSimulator();
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

  const memColor =
    sim.alertLevel === "critical" ? "#FF3D00" : sim.alertLevel === "warning" ? "#FFAA00" : "#39FF14";
  const npuColor =
    sim.alertLevel === "critical" ? "#FF3D00" : sim.alertLevel === "warning" ? "#FFAA00" : "#39FF14";

  return (
    <main className="h-screen w-screen flex flex-col bg-[#050505] overflow-hidden">
      {/* 1. TOP NAVIGATION */}
      <TopNavigation />

      {/* Secondary workspace bar with MCU / Model selectors */}
      <div className="h-7 flex items-center justify-between px-4 border-b border-[#1A1A1A] bg-[#050505]">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-[#555] uppercase tracking-wider">Target:</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-[#555]">MCU</span>
            <select
              value={sim.mcuId}
              onChange={(e) => sim.setMcu(e.target.value)}
              className="bg-[#0A0A0A] border border-[#1A1A1A] hover:border-[#00E5FF] text-[9px] font-mono text-white px-2 py-0.5 outline-none cursor-pointer"
            >
              {Object.values(MCU_PRESETS).map((m) => (
                <option key={m.id} value={m.id} className="bg-[#0A0A0A]">
                  {m.id} · {(m.sram_kb / 1024).toFixed(m.sram_kb < 1024 ? 2 : 1)}MB SRAM
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-[#555]">Model</span>
            <select
              value={sim.modelId}
              onChange={(e) => sim.setModel(e.target.value)}
              className="bg-[#0A0A0A] border border-[#1A1A1A] hover:border-[#00E5FF] text-[9px] font-mono text-white px-2 py-0.5 outline-none cursor-pointer"
            >
              {Object.values(MODEL_PRESETS).map((m) => (
                <option key={m.id} value={m.id} className="bg-[#0A0A0A]">
                  {m.id} · {m.size_kb > 1000 ? `${(m.size_kb / 1024).toFixed(1)}MB` : `${m.size_kb}KB`}
                </option>
              ))}
            </select>
          </div>

          <div className="w-px h-3 bg-[#1A1A1A]" />
          <span className="text-[9px] font-mono text-[#555]">Branch:</span>
          <span className="text-[9px] font-mono text-[#39FF14]">main</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono text-[#555]">
            UPTIME <span className="text-[#888]">{formatUptime(uptime)}</span>
          </span>
          <span className="text-[9px] font-mono text-[#555]">
            MEM <span style={{ color: memColor }}>
              {sim.alertLevel === "critical" ? "99.4%" : sim.alertLevel === "warning" ? "94.6%" : "62.1%"}
            </span>
          </span>
          <span className="text-[9px] font-mono text-[#555]">
            NPU <span style={{ color: npuColor }}>
              {sim.alertLevel === "critical" ? "93°C" : sim.alertLevel === "warning" ? "82°C" : "64°C"}
            </span>
          </span>
        </div>
      </div>

      {/* MAIN CONTENT - 3 column layout */}
      <div className="flex-1 flex min-h-0">
        <div className="w-80 shrink-0">
          <HardwareEditor />
        </div>
        <div className="flex-1 min-w-0">
          <SimulationViewport />
        </div>
        <div className="w-80 shrink-0">
          <SiliconTelemetry />
        </div>
      </div>

      {/* 5. AI AGENT CONSOLE */}
      <AgentConsole />

      {/* Footer */}
      <footer className="h-5 flex items-center justify-between px-4 border-t border-[#1A1A1A] bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-mono text-[#444]">OmniEdge Studio v0.1-beta</span>
          <span className="text-[8px] font-mono text-[#333]">//</span>
          <span className="text-[8px] font-mono text-[#444]">Hardware-as-Code Runtime</span>
          <span className="text-[8px] font-mono text-[#333]">//</span>
          <span className="text-[8px] font-mono text-[#00E5FF]">AI SDK 6 · streamText · tools</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-mono text-[#444]">
            {sim.mcu.arch} @ {sim.mcu.clock_mhz}MHz
          </span>
          <span className="text-[8px] font-mono text-[#333]">//</span>
          <span
            className="text-[8px] font-mono"
            style={{
              color:
                sim.alertLevel === "critical"
                  ? "#FF3D00"
                  : sim.alertLevel === "warning"
                    ? "#FFAA00"
                    : "#39FF14",
            }}
          >
            Envelope: {sim.alertLevel.toUpperCase()}
          </span>
        </div>
      </footer>
    </main>
  );
}
