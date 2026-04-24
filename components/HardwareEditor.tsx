"use client";

import { FileCode2, GitBranch, Save, Play } from "lucide-react";

type TokenType = "key" | "string" | "number" | "comment" | "punct" | "text" | "bool";

const lines: { tokens: { text: string; type: TokenType }[]; indent: number }[] = [
  { indent: 0, tokens: [{ text: "# hardware_manifest.yml", type: "comment" }] },
  { indent: 0, tokens: [{ text: "# Target: Bionic-Arm VLA Controller", type: "comment" }] },
  { indent: 0, tokens: [{ text: "", type: "text" }] },
  { indent: 0, tokens: [
    { text: "mcu_id", type: "key" },
    { text: ": ", type: "punct" },
    { text: "stm32h7", type: "string" },
  ]},
  { indent: 0, tokens: [
    { text: "arch", type: "key" },
    { text: ": ", type: "punct" },
    { text: "arm-cortex-m7", type: "string" },
  ]},
  { indent: 0, tokens: [
    { text: "clock_speed_mhz", type: "key" },
    { text: ": ", type: "punct" },
    { text: "480", type: "number" },
  ]},
  { indent: 0, tokens: [{ text: "", type: "text" }] },
  { indent: 0, tokens: [
    { text: "sram_layout", type: "key" },
    { text: ":", type: "punct" },
  ]},
  { indent: 2, tokens: [
    { text: "total", type: "key" },
    { text: ": ", type: "punct" },
    { text: "2MB", type: "string" },
  ]},
  { indent: 2, tokens: [
    { text: "allocated", type: "key" },
    { text: ": ", type: "punct" },
    { text: "1.89MB", type: "string" },
  ]},
  { indent: 2, tokens: [
    { text: "reserved_for_dma", type: "key" },
    { text: ": ", type: "punct" },
    { text: "128KB", type: "string" },
  ]},
  { indent: 0, tokens: [{ text: "", type: "text" }] },
  { indent: 0, tokens: [
    { text: "sensors", type: "key" },
    { text: ":", type: "punct" },
  ]},
  { indent: 0, tokens: [
    { text: "  - ", type: "punct" },
    { text: "id", type: "key" },
    { text: ": ", type: "punct" },
    { text: "lidar_v4", type: "string" },
  ]},
  { indent: 4, tokens: [
    { text: "bus", type: "key" },
    { text: ": ", type: "punct" },
    { text: "spi-2", type: "string" },
  ]},
  { indent: 4, tokens: [
    { text: "sample_hz", type: "key" },
    { text: ": ", type: "punct" },
    { text: "100", type: "number" },
  ]},
  { indent: 0, tokens: [
    { text: "  - ", type: "punct" },
    { text: "id", type: "key" },
    { text: ": ", type: "punct" },
    { text: "emg_array_hd", type: "string" },
  ]},
  { indent: 4, tokens: [
    { text: "bus", type: "key" },
    { text: ": ", type: "punct" },
    { text: "i2c-1", type: "string" },
  ]},
  { indent: 4, tokens: [
    { text: "channels", type: "key" },
    { text: ": ", type: "punct" },
    { text: "64", type: "number" },
  ]},
  { indent: 0, tokens: [{ text: "", type: "text" }] },
  { indent: 0, tokens: [
    { text: "ai_payload", type: "key" },
    { text: ":", type: "punct" },
  ]},
  { indent: 2, tokens: [
    { text: "model", type: "key" },
    { text: ": ", type: "punct" },
    { text: "llama-3-8b-q4", type: "string" },
  ]},
  { indent: 2, tokens: [
    { text: "runtime", type: "key" },
    { text: ": ", type: "punct" },
    { text: "tflite-micro", type: "string" },
  ]},
  { indent: 2, tokens: [
    { text: "quantization", type: "key" },
    { text: ": ", type: "punct" },
    { text: "int4", type: "string" },
  ]},
  { indent: 2, tokens: [
    { text: "context_window", type: "key" },
    { text: ": ", type: "punct" },
    { text: "2048", type: "number" },
  ]},
  { indent: 2, tokens: [
    { text: "npu_accel", type: "key" },
    { text: ": ", type: "punct" },
    { text: "true", type: "bool" },
  ]},
  { indent: 0, tokens: [{ text: "", type: "text" }] },
  { indent: 0, tokens: [{ text: "# [WARN] SRAM utilization: 94.6%", type: "comment" }] },
];

function tokenColor(type: TokenType) {
  switch (type) {
    case "key":
      return "text-[#00E5FF]";
    case "string":
      return "text-[#39FF14]";
    case "number":
      return "text-[#FFAA00]";
    case "bool":
      return "text-[#FF3D00]";
    case "comment":
      return "text-[#444]";
    case "punct":
      return "text-[#666]";
    default:
      return "text-[#888]";
  }
}

export default function HardwareEditor() {
  return (
    <div className="h-full flex flex-col bg-[#0A0A0A] border-r border-[#1A1A1A]">
      {/* Editor Tab Bar */}
      <div className="h-8 flex items-center border-b border-[#1A1A1A] bg-[#050505]">
        <div className="h-full px-3 flex items-center gap-2 border-r border-[#1A1A1A] bg-[#0A0A0A] relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-[#00E5FF]" />
          <FileCode2 className="w-3 h-3 text-[#00E5FF]" />
          <span className="text-[10px] font-mono text-white">hardware_manifest.yml</span>
          <span className="text-[10px] font-mono text-[#FFAA00] ml-1">●</span>
        </div>
        <div className="h-full px-3 flex items-center gap-2 border-r border-[#1A1A1A]">
          <FileCode2 className="w-3 h-3 text-[#555]" />
          <span className="text-[10px] font-mono text-[#555]">control_loop.c</span>
        </div>
        <div className="h-full px-3 flex items-center gap-2 border-r border-[#1A1A1A]">
          <FileCode2 className="w-3 h-3 text-[#555]" />
          <span className="text-[10px] font-mono text-[#555]">vla_inference.py</span>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="h-6 flex items-center justify-between px-3 border-b border-[#1A1A1A] bg-[#0A0A0A]">
        <div className="flex items-center gap-1.5">
          <GitBranch className="w-2.5 h-2.5 text-[#555]" />
          <span className="text-[9px] font-mono text-[#666]">src</span>
          <span className="text-[9px] font-mono text-[#333]">/</span>
          <span className="text-[9px] font-mono text-[#666]">manifests</span>
          <span className="text-[9px] font-mono text-[#333]">/</span>
          <span className="text-[9px] font-mono text-white">hardware_manifest.yml</span>
        </div>
        <div className="flex items-center gap-2">
          <Save className="w-2.5 h-2.5 text-[#555] hover:text-[#00E5FF] cursor-pointer" />
          <Play className="w-2.5 h-2.5 text-[#555] hover:text-[#39FF14] cursor-pointer" />
        </div>
      </div>

      {/* Code body */}
      <div className="flex-1 overflow-auto bg-[#050505]">
        <div className="flex min-w-max">
          {/* Line numbers */}
          <div className="w-10 shrink-0 py-2 bg-[#050505] border-r border-[#1A1A1A] select-none">
            {lines.map((_, i) => (
              <div
                key={i}
                className="h-5 px-2 flex items-center justify-end text-[10px] font-mono text-[#333] leading-5"
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code lines */}
          <div className="flex-1 py-2">
            {lines.map((line, i) => (
              <div
                key={i}
                className={`h-5 px-3 flex items-center text-[11px] font-mono leading-5 whitespace-pre ${
                  i === 4 ? "bg-[#0A0A0A]" : ""
                }`}
              >
                {line.indent > 0 && " ".repeat(line.indent)}
                {line.tokens.map((token, j) => (
                  <span key={j} className={tokenColor(token.type)}>
                    {token.text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Problems */}
      <div className="h-7 flex items-center justify-between px-3 border-t border-[#1A1A1A] bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-[#FFAA00]" />
            <span className="text-[9px] font-mono text-[#FFAA00]">1 WARN</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-[#00E5FF]" />
            <span className="text-[9px] font-mono text-[#888]">YAML</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-[#555]">Ln 29, Col 1</span>
          <span className="text-[9px] font-mono text-[#555]">UTF-8</span>
          <span className="text-[9px] font-mono text-[#39FF14]">LF</span>
        </div>
      </div>
    </div>
  );
}
