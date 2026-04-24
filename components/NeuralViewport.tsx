"use client";

import { useEffect, useState } from "react";
import { Activity, Zap, Thermometer, Cpu } from "lucide-react";

interface IntentionNode {
  id: string;
  label: string;
  x: number;
  y: number;
  active: boolean;
  confidence: number;
}

export default function NeuralViewport() {
  const [nodes, setNodes] = useState<IntentionNode[]>([
    { id: "grip", label: "GRIP", x: 65, y: 25, active: true, confidence: 94 },
    { id: "rotate", label: "ROTATE", x: 45, y: 45, active: false, confidence: 78 },
    { id: "extend", label: "EXTEND", x: 75, y: 55, active: true, confidence: 89 },
    { id: "flex", label: "FLEX", x: 55, y: 70, active: false, confidence: 45 },
    { id: "release", label: "RELEASE", x: 35, y: 35, active: false, confidence: 12 },
  ]);
  
  const [thermalStatus, setThermalStatus] = useState(85);
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          active: Math.random() > 0.5,
          confidence: Math.min(99, Math.max(10, node.confidence + (Math.random() - 0.5) * 20)),
        }))
      );
      setThermalStatus((prev) => Math.min(95, Math.max(75, prev + (Math.random() - 0.4) * 5)));
      setFrameCount((prev) => prev + 1);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#050505]">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-[#222]">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">Neural-Physical Viewport</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#00FF88] animate-pulse" />
            <span className="text-[9px] font-mono text-[#00FF88]">LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-[#555]" />
            <span className="text-[9px] font-mono text-[#888]">STM32H7</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-[#00D4FF]" />
            <span className="text-[9px] font-mono text-[#888]">FRAME {frameCount.toString().padStart(4, "0")}</span>
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative overflow-hidden">
        {/* Grid Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, #111 1px, transparent 1px),
              linear-gradient(to bottom, #111 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Coordinate Axes */}
        <div className="absolute left-8 top-8 text-[8px] font-mono text-[#333]">
          <div>X: 0.00</div>
          <div>Y: 0.00</div>
          <div>Z: 0.00</div>
        </div>

        {/* Bionic Arm Visualization */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Base */}
          <rect x="25" y="75" width="20" height="8" fill="#222" stroke="#333" strokeWidth="0.5" />
          
          {/* Upper Arm */}
          <path
            d="M35 75 L35 50 L30 48 L30 45 L40 45 L40 48 L35 50"
            fill="none"
            stroke="#00D4FF"
            strokeWidth="0.8"
          />
          <rect x="28" y="45" width="14" height="8" fill="#0A0A0A" stroke="#00D4FF" strokeWidth="0.5" />
          
          {/* Elbow Joint */}
          <circle cx="35" cy="42" r="3" fill="#111" stroke="#00FF88" strokeWidth="0.5" />
          
          {/* Forearm */}
          <path
            d="M35 39 L55 25 L58 27 L60 25 L62 27 L60 29 L58 27"
            fill="none"
            stroke="#00D4FF"
            strokeWidth="0.8"
          />
          
          {/* Hand */}
          <g transform="translate(58, 22)">
            {/* Palm */}
            <rect x="0" y="0" width="12" height="8" fill="#111" stroke="#00D4FF" strokeWidth="0.5" />
            
            {/* Fingers */}
            {[0, 2.5, 5, 7.5].map((offset, i) => (
              <g key={i}>
                <rect x={offset + 1} y="-6" width="2" height="6" fill="#0A0A0A" stroke="#00FF88" strokeWidth="0.3" />
                <rect x={offset + 1} y="-10" width="2" height="4" fill="#0A0A0A" stroke="#00FF88" strokeWidth="0.3" />
              </g>
            ))}
            
            {/* Thumb */}
            <rect x="-2" y="2" width="3" height="5" fill="#0A0A0A" stroke="#00FF88" strokeWidth="0.3" transform="rotate(-30, -0.5, 4.5)" />
          </g>

          {/* Neural Connection Lines */}
          {nodes.map((node) => (
            <g key={node.id}>
              <line
                x1="35"
                y1="42"
                x2={node.x}
                y2={node.y}
                stroke={node.active ? "#00D4FF" : "#222"}
                strokeWidth="0.3"
                strokeDasharray={node.active ? "none" : "2,2"}
                opacity={node.active ? 0.6 : 0.3}
              />
            </g>
          ))}
        </svg>

        {/* Intention Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <div
              className={`px-2 py-1 border ${
                node.active
                  ? "border-[#00D4FF] bg-[#00D4FF]/10"
                  : "border-[#333] bg-[#111]"
              }`}
            >
              <div className="text-[8px] font-mono text-[#888]">{node.label}</div>
              <div
                className={`text-[10px] font-mono ${
                  node.active ? "text-[#00D4FF]" : "text-[#555]"
                }`}
              >
                {node.confidence.toFixed(0)}%
              </div>
            </div>
            {node.active && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#00FF88] animate-pulse" />
            )}
          </div>
        ))}

        {/* Status Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between p-3 bg-[#0A0A0A]/90 border border-[#222]">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-[#FFAA00]" />
              <span className="text-[10px] font-mono text-[#888]">SIMULATION STATUS:</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold ${
                  thermalStatus > 90 ? "text-[#FF3333]" : thermalStatus > 80 ? "text-[#FFAA00]" : "text-[#00FF88]"
                }`}
              >
                {thermalStatus.toFixed(0)}% THERMAL THROTTLING EXPECTED
              </span>
              <Zap className={`w-4 h-4 ${thermalStatus > 85 ? "text-[#FFAA00] animate-pulse" : "text-[#555]"}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
