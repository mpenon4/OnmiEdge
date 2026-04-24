"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Activity, Thermometer, Zap, TrendingUp } from "lucide-react";

export default function SiliconTelemetry() {
  const [sram, setSram] = useState(95);
  const [latencySeries, setLatencySeries] = useState<number[]>(
    Array.from({ length: 40 }, () => 12 + Math.random() * 4),
  );
  const [npuTemp, setNpuTemp] = useState(82);
  const [joules, setJoules] = useState(0.847);

  useEffect(() => {
    const interval = setInterval(() => {
      setSram((s) => Math.max(92, Math.min(97, s + (Math.random() - 0.5) * 0.8)));
      setLatencySeries((prev) => {
        const spike = Math.random() > 0.85;
        const next = spike ? 30 + Math.random() * 20 : 10 + Math.random() * 8;
        return [...prev.slice(1), next];
      });
      setNpuTemp((t) => Math.max(78, Math.min(87, t + (Math.random() - 0.5) * 1.2)));
      setJoules((j) => Math.max(0.6, Math.min(1.2, j + (Math.random() - 0.5) * 0.03)));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#0A0A0A] border-l border-[#1A1A1A] overflow-hidden">
      {/* Header */}
      <div className="h-8 flex items-center justify-between px-3 border-b border-[#1A1A1A] bg-[#050505]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#00E5FF] glow-cyan" />
          <span className="text-[10px] font-mono text-white uppercase tracking-wider">
            Silicon Telemetry
          </span>
        </div>
        <span className="text-[9px] font-mono text-[#555]">HUB</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Widget 1: Memory */}
        <MemoryWidget sram={sram} />

        {/* Widget 2: Inference Latency */}
        <InferenceWidget latencySeries={latencySeries} />

        {/* Widget 3: Thermal */}
        <ThermalWidget temp={npuTemp} />

        {/* Widget 4: Energy */}
        <EnergyWidget joules={joules} />

        {/* Bus Activity */}
        <BusActivityWidget />
      </div>
    </div>
  );
}

function WidgetHeader({
  icon,
  title,
  status,
  statusColor,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
  statusColor: string;
}) {
  return (
    <div
      className="h-7 flex items-center justify-between px-3 border-b border-[#1A1A1A] bg-[#050505] cursor-default"
      title="MCP Data Source: Renode_Emulator_v3"
    >
      <div className="flex items-center gap-1.5">
        <div style={{ color: statusColor }}>{icon}</div>
        <span className="text-[10px] font-mono text-[#888] uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: statusColor }} />
        <span className="text-[9px] font-mono" style={{ color: statusColor }}>
          {status}
        </span>
      </div>
    </div>
  );
}

function MemoryWidget({ sram }: { sram: number }) {
  const isCritical = sram > 95;
  const color = isCritical ? "#FF3D00" : sram > 90 ? "#FFAA00" : "#39FF14";
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (sram / 100) * circumference;

  return (
    <div className="border-b border-[#1A1A1A]">
      <WidgetHeader
        icon={<Cpu className="w-3 h-3" />}
        title="SRAM Utilization"
        status={isCritical ? "CRITICAL" : "WARNING"}
        statusColor={color}
      />
      <div className="p-3 flex items-center gap-3">
        {/* Circular gauge */}
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="38" stroke="#1A1A1A" strokeWidth="6" fill="none" />
            <motion.circle
              cx="50"
              cy="50"
              r="38"
              stroke={color}
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.6 }}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[18px] font-mono font-bold" style={{ color }}>
              {sram.toFixed(1)}
            </span>
            <span className="text-[8px] font-mono text-[#555]">% USED</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-1.5">
          <StatRow label="TOTAL" value="2.00 MB" color="#888" />
          <StatRow label="USED" value={`${((sram / 100) * 2048).toFixed(0)} KB`} color={color} />
          <StatRow label="FREE" value={`${((1 - sram / 100) * 2048).toFixed(0)} KB`} color="#888" />
          <StatRow label="DMA RSV" value="128 KB" color="#00E5FF" />
        </div>
      </div>
    </div>
  );
}

function InferenceWidget({ latencySeries }: { latencySeries: number[] }) {
  const max = Math.max(...latencySeries, 50);
  const min = Math.min(...latencySeries, 0);
  const current = latencySeries[latencySeries.length - 1];
  const avg = latencySeries.reduce((a, b) => a + b, 0) / latencySeries.length;
  const width = 280;
  const height = 60;

  const points = latencySeries
    .map((v, i) => {
      const x = (i / (latencySeries.length - 1)) * width;
      const y = height - ((v - min) / (max - min)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath = `M 0,${height} L ${points.split(" ").join(" L ")} L ${width},${height} Z`;

  return (
    <div className="border-b border-[#1A1A1A]">
      <WidgetHeader
        icon={<Activity className="w-3 h-3" />}
        title="AI Inference Latency"
        status="LIVE"
        statusColor="#00E5FF"
      />
      <div className="p-3">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-[22px] font-mono font-bold text-[#00E5FF]">
              {current.toFixed(1)}
            </span>
            <span className="text-[10px] font-mono text-[#555] ml-1">ms</span>
          </div>
          <div className="text-right space-y-0.5">
            <div className="text-[9px] font-mono text-[#555]">
              AVG <span className="text-[#888]">{avg.toFixed(1)}ms</span>
            </div>
            <div className="text-[9px] font-mono text-[#555]">
              MAX <span className="text-[#FFAA00]">{Math.max(...latencySeries).toFixed(1)}ms</span>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="relative bg-[#050505] border border-[#1A1A1A] p-1">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-14">
            <defs>
              <linearGradient id="latGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Reference lines */}
            <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#1A1A1A" strokeDasharray="2 2" />
            <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#1A1A1A" strokeDasharray="2 2" />
            <path d={areaPath} fill="url(#latGrad)" />
            <polyline
              points={points}
              fill="none"
              stroke="#00E5FF"
              strokeWidth="1.5"
              style={{ filter: "drop-shadow(0 0 2px #00E5FF)" }}
            />
            {/* Current point */}
            {(() => {
              const lastX = width;
              const lastY = height - ((current - min) / (max - min)) * height;
              return (
                <>
                  <circle cx={lastX} cy={lastY} r="2" fill="#00E5FF" />
                  <circle cx={lastX} cy={lastY} r="4" fill="none" stroke="#00E5FF" opacity="0.4" />
                </>
              );
            })()}
          </svg>
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[8px] font-mono text-[#444]">-40s</span>
          <span className="text-[8px] font-mono text-[#444]">now</span>
        </div>
      </div>
    </div>
  );
}

function ThermalWidget({ temp }: { temp: number }) {
  const percent = ((temp - 40) / 50) * 100;
  const isCritical = temp > 85;
  const color = isCritical ? "#FF3D00" : temp > 75 ? "#FFAA00" : "#39FF14";

  return (
    <div className="border-b border-[#1A1A1A]">
      <WidgetHeader
        icon={<Thermometer className="w-3 h-3" />}
        title="NPU Core Temperature"
        status={isCritical ? "THROTTLING" : "NOMINAL"}
        statusColor={color}
      />
      <div className="p-3">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-[22px] font-mono font-bold" style={{ color }}>
              {temp.toFixed(1)}
            </span>
            <span className="text-[10px] font-mono text-[#555] ml-1">°C</span>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-mono text-[#555]">TJUNC MAX</div>
            <div className="text-[10px] font-mono text-[#FF3D00]">95°C</div>
          </div>
        </div>

        {/* Heatmap bar */}
        <div className="relative h-5 bg-[#050505] border border-[#1A1A1A] overflow-hidden">
          <div className="absolute inset-0 flex">
            <div className="flex-1" style={{ background: "linear-gradient(90deg, #39FF14, #FFAA00, #FF3D00)" }} />
          </div>
          <div className="absolute inset-0 bg-[#050505]" style={{ left: `${percent}%` }} />
          {/* Indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white"
            style={{ left: `${percent}%`, boxShadow: "0 0 4px white" }}
          />
          {/* Scale markers */}
          {[0, 25, 50, 75, 100].map((p) => (
            <div key={p} className="absolute top-0 bottom-0 w-px bg-black/40" style={{ left: `${p}%` }} />
          ))}
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-[8px] font-mono text-[#444]">40°C</span>
          <span className="text-[8px] font-mono text-[#444]">65°C</span>
          <span className="text-[8px] font-mono text-[#444]">90°C</span>
        </div>

        {/* Thermal zones */}
        <div className="grid grid-cols-4 gap-1 mt-2">
          <ThermalZone label="L1" value={58} />
          <ThermalZone label="L2" value={64} />
          <ThermalZone label="NPU" value={temp} primary />
          <ThermalZone label="RAM" value={52} />
        </div>
      </div>
    </div>
  );
}

function ThermalZone({ label, value, primary }: { label: string; value: number; primary?: boolean }) {
  const color = value > 80 ? "#FF3D00" : value > 65 ? "#FFAA00" : "#39FF14";
  return (
    <div
      className="border border-[#1A1A1A] bg-[#050505] p-1.5"
      style={primary ? { borderColor: color, boxShadow: `0 0 4px ${color}40` } : {}}
    >
      <div className="text-[8px] font-mono text-[#555] uppercase">{label}</div>
      <div className="text-[10px] font-mono font-semibold" style={{ color }}>
        {value.toFixed(0)}°
      </div>
    </div>
  );
}

function EnergyWidget({ joules }: { joules: number }) {
  return (
    <div className="border-b border-[#1A1A1A]">
      <WidgetHeader
        icon={<Zap className="w-3 h-3" />}
        title="Joules per Action"
        status="EFFICIENT"
        statusColor="#39FF14"
      />
      <div className="p-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[22px] font-mono font-bold text-[#39FF14]">
              {joules.toFixed(3)}
            </span>
            <span className="text-[10px] font-mono text-[#555] ml-1">J/act</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5 text-[#39FF14]" />
            <span className="text-[9px] font-mono text-[#39FF14]">-12.4%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 mt-2">
          <MiniMetric label="POWER" value="2.14" unit="W" />
          <MiniMetric label="ACT/S" value="2.52" unit="Hz" />
          <MiniMetric label="BUDGET" value="78" unit="%" />
        </div>
      </div>
    </div>
  );
}

function BusActivityWidget() {
  const buses = [
    { name: "I2C-1", usage: 92, state: "contention", color: "#FF3D00" },
    { name: "SPI-2", usage: 64, state: "ok", color: "#00E5FF" },
    { name: "CAN-0", usage: 34, state: "ok", color: "#39FF14" },
    { name: "UART-3", usage: 18, state: "ok", color: "#39FF14" },
  ];

  return (
    <div className="border-b border-[#1A1A1A]">
      <WidgetHeader
        icon={<Activity className="w-3 h-3" />}
        title="Bus Activity"
        status="4 ACTIVE"
        statusColor="#00E5FF"
      />
      <div className="p-3 space-y-1.5">
        {buses.map((bus) => (
          <div key={bus.name} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1" style={{ backgroundColor: bus.color }} />
                <span className="text-[9px] font-mono text-[#888]">{bus.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono" style={{ color: bus.color }}>
                  {bus.usage}%
                </span>
                {bus.state === "contention" && (
                  <span className="text-[8px] font-mono text-[#FF3D00]">CONTENTION</span>
                )}
              </div>
            </div>
            <div className="h-1 bg-[#050505] border border-[#1A1A1A]">
              <motion.div
                className="h-full"
                style={{ backgroundColor: bus.color }}
                animate={{ width: `${bus.usage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[9px] font-mono text-[#555] uppercase tracking-wider">{label}</span>
      <span className="text-[10px] font-mono" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function MiniMetric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="border border-[#1A1A1A] bg-[#050505] p-1.5">
      <div className="text-[8px] font-mono text-[#555] uppercase tracking-wider">{label}</div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-[11px] font-mono font-semibold text-white">{value}</span>
        <span className="text-[8px] font-mono text-[#555]">{unit}</span>
      </div>
    </div>
  );
}
