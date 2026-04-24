"use client";

import { motion } from "framer-motion";
import { Zap, Activity, Server, Cpu } from "lucide-react";

export default function TopNavigation() {
  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-[#1A1A1A] bg-[#0A0A0A] relative z-20">
      {/* Brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute inset-0 border border-[#00E5FF] rotate-45" />
            <div className="absolute inset-1 bg-[#00E5FF] rotate-45 opacity-80" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-sans font-semibold text-white tracking-tight">
              OmniEdge Studio
            </span>
            <span className="text-[10px] font-mono text-[#00E5FF]">//</span>
            <span className="text-[10px] font-mono text-[#888]">v0.1-beta</span>
          </div>
        </div>

        <div className="h-5 w-px bg-[#1A1A1A]" />

        {/* Status Badges */}
        <div className="flex items-center gap-2">
          <StatusBadge
            icon={<Activity className="w-3 h-3" />}
            label="Sim-Clock"
            value="SYNCHRONIZED"
            color="#39FF14"
          />
          <StatusBadge
            icon={<Server className="w-3 h-3" />}
            label="MCP Server"
            value="CONNECTED"
            color="#00E5FF"
          />
          <StatusBadge
            icon={<Cpu className="w-3 h-3" />}
            label="Edge-Node"
            value="STM32H7-EMULATED"
            color="#FFAA00"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2">
          <span className="text-[9px] font-mono text-[#555] uppercase tracking-wider">User</span>
          <div className="w-5 h-5 rounded-full bg-[#1A1A1A] border border-[#222] flex items-center justify-center">
            <span className="text-[8px] font-mono text-[#888]">KV</span>
          </div>
        </div>

        <div className="h-5 w-px bg-[#1A1A1A]" />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative group flex items-center gap-2 px-4 h-8 bg-[#00E5FF] hover:bg-[#00F5FF] transition-colors"
          style={{
            boxShadow:
              "0 0 12px rgba(0, 229, 255, 0.5), 0 0 24px rgba(0, 229, 255, 0.25), inset 0 0 8px rgba(255,255,255,0.1)",
          }}
        >
          <Zap className="w-3.5 h-3.5 text-[#050505]" strokeWidth={2.5} />
          <span className="text-[11px] font-mono font-bold text-[#050505] uppercase tracking-wider">
            Compile &amp; Deploy
          </span>
        </motion.button>
      </div>
    </header>
  );
}

function StatusBadge({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="group flex items-center gap-1.5 px-2 h-6 border border-[#1A1A1A] bg-[#050505] hover:border-[#2A2A2A] transition-colors cursor-default"
      title="MCP Data Source: Renode_Emulator_v3"
    >
      <div style={{ color }}>{icon}</div>
      <span className="text-[9px] font-mono text-[#555] uppercase tracking-wider">{label}:</span>
      <div className="flex items-center gap-1.5">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        />
        <span className="text-[9px] font-mono font-medium" style={{ color }}>
          {value}
        </span>
      </div>
    </div>
  );
}
