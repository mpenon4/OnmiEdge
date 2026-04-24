"use client";

import { useEffect, useState, useRef } from "react";
import { AlertTriangle, TrendingUp, Zap, HardDrive } from "lucide-react";

export default function EdgeAnalytics() {
  const [sramUtil, setSramUtil] = useState(98);
  const [latencyData, setLatencyData] = useState<number[]>(Array(30).fill(120));
  const [tokenRate, setTokenRate] = useState(24.5);
  const [isFlickering, setIsFlickering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      // Flicker SRAM when critical
      if (sramUtil > 95) {
        setIsFlickering((prev) => !prev);
      }

      // Update metrics
      setSramUtil((prev) => Math.min(99.5, Math.max(94, prev + (Math.random() - 0.4) * 2)));
      setTokenRate((prev) => Math.max(15, Math.min(35, prev + (Math.random() - 0.5) * 5)));

      // Update latency with occasional spikes
      setLatencyData((prev) => {
        const newData = [...prev.slice(1)];
        const spike = Math.random() > 0.85;
        const newValue = spike ? 400 + Math.random() * 100 : 100 + Math.random() * 80;
        newData.push(newValue);
        return newData;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [sramUtil]);

  // Draw latency chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const maxLatency = 500;

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw latency line
    ctx.beginPath();
    ctx.strokeStyle = "#00D4FF";
    ctx.lineWidth = 2;

    latencyData.forEach((value, i) => {
      const x = (i / (latencyData.length - 1)) * width;
      const y = height - (value / maxLatency) * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw spike markers
    latencyData.forEach((value, i) => {
      if (value > 350) {
        const x = (i / (latencyData.length - 1)) * width;
        const y = height - (value / maxLatency) * height;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#FF3333";
        ctx.fill();
      }
    });

    // Current value indicator
    const lastValue = latencyData[latencyData.length - 1];
    const lastX = width - 2;
    const lastY = height - (lastValue / maxLatency) * height;

    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = lastValue > 350 ? "#FF3333" : "#00D4FF";
    ctx.fill();
  }, [latencyData]);

  const currentLatency = latencyData[latencyData.length - 1];
  const isLatencyCritical = currentLatency > 350;

  return (
    <div className="h-full flex flex-col bg-[#0A0A0A] border-l border-[#222]">
      {/* Header */}
      <div className="h-10 flex items-center px-4 border-b border-[#222]">
        <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">Edge Analytics</span>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-auto">
        {/* SRAM Utilization */}
        <div className="border border-[#222] p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-[#888]" />
              <span className="text-[10px] font-mono text-[#555] uppercase">SRAM Utilization</span>
            </div>
            <div className="flex items-center gap-1">
              {sramUtil > 95 && <AlertTriangle className="w-3 h-3 text-[#FF3333] animate-pulse" />}
              <span
                className={`text-sm font-mono font-bold ${
                  isFlickering && sramUtil > 95 ? "text-[#FF3333]" : "text-[#FFAA00]"
                }`}
              >
                {sramUtil.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="h-2 bg-[#111] border border-[#222]">
            <div
              className={`h-full transition-all ${
                sramUtil > 95 ? "bg-[#FF3333]" : sramUtil > 85 ? "bg-[#FFAA00]" : "bg-[#00FF88]"
              }`}
              style={{ width: `${sramUtil}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] font-mono text-[#555]">0 KB</span>
            <span className="text-[8px] font-mono text-[#555]">2048 KB</span>
          </div>
          <div className="mt-2 text-[9px] font-mono text-[#FF3333]">
            WARNING: Near memory limit. Risk of allocation failure.
          </div>
        </div>

        {/* Inference Latency */}
        <div className="border border-[#222] p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#888]" />
              <span className="text-[10px] font-mono text-[#555] uppercase">Inference Latency</span>
            </div>
            <span
              className={`text-sm font-mono font-bold ${
                isLatencyCritical ? "text-[#FF3333]" : "text-[#00D4FF]"
              }`}
            >
              {currentLatency.toFixed(0)}ms
            </span>
          </div>
          <div className="h-24 bg-[#050505] border border-[#222] relative">
            <canvas ref={canvasRef} width={280} height={96} className="w-full h-full" />
            {/* Y-axis labels */}
            <div className="absolute left-1 top-0 text-[7px] font-mono text-[#333]">500ms</div>
            <div className="absolute left-1 bottom-0 text-[7px] font-mono text-[#333]">0ms</div>
          </div>
          {isLatencyCritical && (
            <div className="mt-2 flex items-center gap-1 text-[9px] font-mono text-[#FF3333]">
              <AlertTriangle className="w-3 h-3" />
              SPIKE DETECTED: {currentLatency.toFixed(0)}ms exceeds 50ms target
            </div>
          )}
        </div>

        {/* VLA Token Rate */}
        <div className="border border-[#222] p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#888]" />
              <span className="text-[10px] font-mono text-[#555] uppercase">VLA Token Rate</span>
            </div>
            <span className="text-sm font-mono font-bold text-[#00FF88]">
              {tokenRate.toFixed(1)} <span className="text-[10px] text-[#555]">tok/s</span>
            </span>
          </div>
          <div className="grid grid-cols-10 gap-0.5">
            {Array(30)
              .fill(0)
              .map((_, i) => {
                const isActive = i < Math.floor(tokenRate);
                return (
                  <div
                    key={i}
                    className={`h-3 ${isActive ? "bg-[#00FF88]" : "bg-[#111]"} border border-[#222]`}
                  />
                );
              })}
          </div>
          <div className="mt-2 text-[9px] font-mono text-[#888]">
            Hardware-emulated environment | ARM Cortex-M7
          </div>
        </div>

        {/* Memory Map */}
        <div className="border border-[#222] p-3">
          <div className="text-[10px] font-mono text-[#555] uppercase mb-2">Memory Map</div>
          <div className="space-y-1 text-[9px] font-mono">
            <div className="flex justify-between">
              <span className="text-[#888]">Model Weights</span>
              <span className="text-[#FFAA00]">1.8 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Activation Buffer</span>
              <span className="text-[#FF3333]">156 KB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">System Stack</span>
              <span className="text-[#00FF88]">32 KB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Peripheral DMA</span>
              <span className="text-[#00D4FF]">24 KB</span>
            </div>
            <div className="flex justify-between border-t border-[#222] pt-1 mt-1">
              <span className="text-white">FREE</span>
              <span className="text-[#FF3333]">8 KB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
