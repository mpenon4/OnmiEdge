"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Eye, Layers, Crosshair, Play, Pause } from "lucide-react";

type LogLine = { id: number; type: "info" | "warn" | "ok"; text: string };

const bootSequence: Omit<LogLine, "id">[] = [
  { type: "info", text: "> Booting Renode Core v3.2.1..." },
  { type: "ok", text: "> Renode Core [OK]" },
  { type: "info", text: "> Initializing STM32H7 emulator @ 480MHz..." },
  { type: "ok", text: "> Cortex-M7 FPU enabled" },
  { type: "info", text: "> Mounting SRAM: 2048KB @ 0x24000000" },
  { type: "info", text: "> Loading TFLite Micro runtime..." },
  { type: "info", text: "> Quantizing llama-3-8b-q4 for NPU..." },
  { type: "ok", text: "> Model loaded: 1792KB / 2048KB" },
  { type: "warn", text: "> [WARN] SRAM high-water-mark: 94.6%" },
  { type: "info", text: "> Binding sensors: lidar_v4, emg_array_hd" },
  { type: "ok", text: "> I2C-1 bus initialized @ 400kHz" },
  { type: "ok", text: "> SPI-2 bus initialized @ 10MHz" },
  { type: "info", text: "> Entering control loop..." },
  { type: "ok", text: "> Intention Loop Latency: 12ms" },
  { type: "info", text: "> Streaming VLA tokens -> actuator bus" },
];

export default function SimulationViewport() {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [pulse, setPulse] = useState(0);
  const [running, setRunning] = useState(true);
  const [latency, setLatency] = useState(12);
  const idRef = useRef(0);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootSequence.length) {
        idRef.current += 1;
        setLogs((prev) => [...prev, { ...bootSequence[i], id: idRef.current }]);
        i++;
      } else {
        idRef.current += 1;
        const runtimeLogs = [
          { type: "info" as const, text: `> Inference: tok/s=42, latency=${(10 + Math.random() * 6).toFixed(1)}ms` },
          { type: "info" as const, text: `> Actuator update: joint_${Math.floor(Math.random() * 6)} -> ${(Math.random() * 180 - 90).toFixed(2)}°` },
          { type: "info" as const, text: `> EMG sample batch: 64ch @ ${(99 + Math.random() * 2).toFixed(1)}Hz` },
        ];
        const pick = runtimeLogs[Math.floor(Math.random() * runtimeLogs.length)];
        setLogs((prev) => [...prev.slice(-40), { ...pick, id: idRef.current }]);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => (p + 1) % 6);
      setLatency(10 + Math.random() * 8);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-full flex flex-col bg-[#050505]">
      {/* Viewport Toolbar */}
      <div className="h-8 flex items-center justify-between px-3 border-b border-[#1A1A1A] bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-[#888] uppercase tracking-wider">
            Unified Sim Viewport
          </span>
          <div className="h-3 w-px bg-[#1A1A1A]" />
          <div className="flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-[#00E5FF]" />
            <span className="text-[9px] font-mono text-[#00E5FF]">NEURAL HEATMAP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-3 h-3 text-[#39FF14]" />
            <span className="text-[9px] font-mono text-[#39FF14]">PATH PREDICT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-[#555]" />
            <span className="text-[9px] font-mono text-[#555]">KINEMATICS</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-[#555]">FPS:</span>
          <span className="text-[9px] font-mono text-[#39FF14]">60.0</span>
          <div className="h-3 w-px bg-[#1A1A1A]" />
          <button
            onClick={() => setRunning((r) => !r)}
            className="flex items-center gap-1 text-[9px] font-mono text-[#888] hover:text-white"
          >
            {running ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {running ? "PAUSE" : "PLAY"}
          </button>
          <Maximize2 className="w-3 h-3 text-[#555] hover:text-[#888] cursor-pointer" />
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 relative grid-bg overflow-hidden">
        {/* Dense grid overlay */}
        <div className="absolute inset-0 grid-bg-dense opacity-50" />

        {/* Corner HUD */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          <div className="text-[9px] font-mono text-[#00E5FF]">[ VIEW: PERSPECTIVE ]</div>
          <div className="text-[9px] font-mono text-[#555]">ROBOT: bionic_arm_v2</div>
          <div className="text-[9px] font-mono text-[#555]">DOF: 6 | JOINTS: 6</div>
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-10">
          <div className="text-[9px] font-mono text-[#39FF14]">● LIVE</div>
          <div className="text-[9px] font-mono text-[#555]">
            LAT: <span className="text-[#00E5FF]">{latency.toFixed(1)}ms</span>
          </div>
          <div className="text-[9px] font-mono text-[#555]">
            TOK/S: <span className="text-[#FFAA00]">42</span>
          </div>
        </div>

        {/* Coordinate axes indicator bottom left */}
        <div className="absolute bottom-20 left-3 z-10">
          <svg width="60" height="60" viewBox="0 0 60 60">
            <line x1="30" y1="30" x2="55" y2="30" stroke="#FF3D00" strokeWidth="1.5" />
            <line x1="30" y1="30" x2="30" y2="5" stroke="#39FF14" strokeWidth="1.5" />
            <line x1="30" y1="30" x2="10" y2="50" stroke="#00E5FF" strokeWidth="1.5" />
            <text x="56" y="34" fill="#FF3D00" fontSize="8" fontFamily="monospace">X</text>
            <text x="32" y="6" fill="#39FF14" fontSize="8" fontFamily="monospace">Y</text>
            <text x="4" y="54" fill="#00E5FF" fontSize="8" fontFamily="monospace">Z</text>
          </svg>
        </div>

        {/* Robotic Arm SVG */}
        <div className="absolute inset-0 flex items-center justify-center">
          <RoboticArm pulse={pulse} running={running} />
        </div>

        {/* Scanline effect */}
        <div className="absolute inset-0 scanline pointer-events-none" />

        {/* Live Terminal Stream */}
        <div className="absolute bottom-0 left-0 right-0 h-40 border-t border-[#1A1A1A] bg-[#050505]/95 backdrop-blur-sm">
          <div className="h-5 flex items-center justify-between px-3 border-b border-[#1A1A1A] bg-[#0A0A0A]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#39FF14] animate-pulse" />
              <span className="text-[9px] font-mono text-[#888] uppercase tracking-wider">
                Renode Stream
              </span>
              <span className="text-[9px] font-mono text-[#333]">//</span>
              <span className="text-[9px] font-mono text-[#555]">stdout</span>
            </div>
            <span className="text-[9px] font-mono text-[#555]">{logs.length} lines</span>
          </div>
          <div
            ref={logContainerRef}
            className="h-[calc(100%-20px)] overflow-y-auto px-3 py-1.5 font-mono text-[10px] leading-[14px]"
          >
            <AnimatePresence initial={false}>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={
                    log.type === "ok"
                      ? "text-[#39FF14]"
                      : log.type === "warn"
                        ? "text-[#FFAA00]"
                        : "text-[#888]"
                  }
                >
                  {log.text}
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="flex items-center text-[#00E5FF]">
              <span>&gt; </span>
              <span className="terminal-cursor ml-0.5">▊</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoboticArm({ pulse, running }: { pulse: number; running: boolean }) {
  const joints = [
    { x: 300, y: 420, label: "J1", temp: 42 },
    { x: 300, y: 330, label: "J2", temp: 58 },
    { x: 360, y: 250, label: "J3", temp: 71 },
    { x: 440, y: 190, label: "J4", temp: 68 },
    { x: 510, y: 150, label: "J5", temp: 54 },
    { x: 560, y: 130, label: "J6", temp: 82 },
  ];

  return (
    <svg viewBox="0 0 700 500" className="w-full max-w-3xl h-full">
      <defs>
        <linearGradient id="armGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#333" />
          <stop offset="100%" stopColor="#111" />
        </linearGradient>
        <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2A2A2A" />
          <stop offset="50%" stopColor="#3A3A3A" />
          <stop offset="100%" stopColor="#2A2A2A" />
        </linearGradient>
        <radialGradient id="heatRed" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF3D00" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FF3D00" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="heatCyan" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="heatGreen" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#39FF14" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#39FF14" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Floor grid shadow */}
      <ellipse cx="300" cy="450" rx="120" ry="12" fill="#00E5FF" opacity="0.08" />

      {/* Base */}
      <rect x="240" y="420" width="120" height="40" fill="url(#armGrad)" stroke="#1A1A1A" />
      <rect x="260" y="415" width="80" height="8" fill="#1A1A1A" />
      <rect x="270" y="430" width="60" height="4" fill="#00E5FF" opacity="0.4" />

      {/* Arm links */}
      <line x1={joints[0].x} y1={joints[0].y} x2={joints[1].x} y2={joints[1].y} stroke="url(#linkGrad)" strokeWidth="18" strokeLinecap="round" />
      <line x1={joints[1].x} y1={joints[1].y} x2={joints[2].x} y2={joints[2].y} stroke="url(#linkGrad)" strokeWidth="16" strokeLinecap="round" />
      <line x1={joints[2].x} y1={joints[2].y} x2={joints[3].x} y2={joints[3].y} stroke="url(#linkGrad)" strokeWidth="14" strokeLinecap="round" />
      <line x1={joints[3].x} y1={joints[3].y} x2={joints[4].x} y2={joints[4].y} stroke="url(#linkGrad)" strokeWidth="12" strokeLinecap="round" />
      <line x1={joints[4].x} y1={joints[4].y} x2={joints[5].x} y2={joints[5].y} stroke="url(#linkGrad)" strokeWidth="10" strokeLinecap="round" />

      {/* End effector / gripper */}
      <g transform={`translate(${joints[5].x}, ${joints[5].y})`}>
        <rect x="-6" y="-14" width="12" height="8" fill="#2A2A2A" stroke="#00E5FF" strokeWidth="0.5" />
        <line x1="-8" y1="-14" x2="-14" y2="-22" stroke="#3A3A3A" strokeWidth="2" />
        <line x1="8" y1="-14" x2="14" y2="-22" stroke="#3A3A3A" strokeWidth="2" />
        <line x1="-14" y1="-22" x2="-14" y2="-30" stroke="#3A3A3A" strokeWidth="2" />
        <line x1="14" y1="-22" x2="14" y2="-30" stroke="#3A3A3A" strokeWidth="2" />
      </g>

      {/* Path prediction (dashed) */}
      <path
        d={`M ${joints[5].x} ${joints[5].y - 30} Q 620 80 640 40`}
        stroke="#39FF14"
        strokeWidth="1"
        strokeDasharray="3 3"
        fill="none"
        opacity="0.6"
      />
      <circle cx="640" cy="40" r="4" fill="none" stroke="#39FF14" strokeWidth="1" />
      <circle cx="640" cy="40" r="1.5" fill="#39FF14" />
      <text x="650" y="44" fill="#39FF14" fontSize="9" fontFamily="monospace">target</text>

      {/* Trajectory history */}
      <path
        d={`M ${joints[5].x - 40} ${joints[5].y + 10} Q ${joints[5].x - 20} ${joints[5].y - 10} ${joints[5].x} ${joints[5].y}`}
        stroke="#00E5FF"
        strokeWidth="1"
        strokeDasharray="1 2"
        fill="none"
        opacity="0.4"
      />

      {/* Neural heatmap pulses on joints */}
      {joints.map((joint, i) => {
        const isHot = joint.temp > 70;
        const isMid = joint.temp > 55 && joint.temp <= 70;
        const isActive = running && pulse === i;
        const grad = isHot ? "url(#heatRed)" : isMid ? "url(#heatCyan)" : "url(#heatGreen)";
        const color = isHot ? "#FF3D00" : isMid ? "#00E5FF" : "#39FF14";
        return (
          <g key={joint.label}>
            {/* Heat aura */}
            <motion.circle
              cx={joint.x}
              cy={joint.y}
              r={isActive ? 28 : 20}
              fill={grad}
              animate={{ r: isActive ? [20, 35, 20] : 20, opacity: isActive ? [0.5, 1, 0.5] : 0.6 }}
              transition={{ duration: 1 }}
            />
            {/* Joint marker */}
            <circle cx={joint.x} cy={joint.y} r="7" fill="#0A0A0A" stroke={color} strokeWidth="1.5" />
            <circle cx={joint.x} cy={joint.y} r="2.5" fill={color} />
            {/* Label */}
            <text
              x={joint.x + 12}
              y={joint.y - 10}
              fill={color}
              fontSize="9"
              fontFamily="monospace"
              opacity="0.9"
            >
              {joint.label}
            </text>
            <text
              x={joint.x + 12}
              y={joint.y - 1}
              fill="#555"
              fontSize="8"
              fontFamily="monospace"
            >
              {joint.temp}°C
            </text>
          </g>
        );
      })}

      {/* Floor reference grid */}
      <g stroke="#1A1A1A" strokeWidth="0.5" opacity="0.8">
        <line x1="150" y1="460" x2="550" y2="460" />
        <line x1="180" y1="465" x2="520" y2="465" />
        <line x1="210" y1="470" x2="490" y2="470" />
      </g>
    </svg>
  );
}
