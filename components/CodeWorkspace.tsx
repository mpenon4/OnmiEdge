"use client";

import { useState } from "react";
import { FileCode, ChevronRight, Save, Play } from "lucide-react";

const hardwareManifest = `# OmniEdge Hardware Manifest
# Target: Embedded AI Robotics

hardware:
  target_mcu: 'STM32H7'
  architecture: 'ARM Cortex-M7'
  clock_speed: '480MHz'
  
memory:
  ram_limit: '2MB'
  flash_limit: '2MB'
  sram_banks: 4

ai_model:
  name: 'Llama-3-Tiny-Edge'
  size: '4.5MB'
  precision: 'FP16'
  quantization: 'dynamic'
  
peripherals:
  - type: 'servo_controller'
    count: 6
    protocol: 'PWM'
  - type: 'imu_sensor'
    model: 'BMI270'
    protocol: 'SPI'
  - type: 'vision_input'
    model: 'OV7670'
    resolution: '640x480'

constraints:
  max_latency_ms: 50
  power_budget_mw: 500
  thermal_limit_c: 85`;

export default function CodeWorkspace() {
  const [activeFile] = useState("hardware.yaml");
  
  const files = [
    { name: "hardware.yaml", icon: FileCode },
    { name: "model_config.json", icon: FileCode },
    { name: "peripherals.toml", icon: FileCode },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0A0A0A] border-r border-[#222]">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-[#222] bg-[#0A0A0A]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">Workspace</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-[#222] transition-colors">
            <Save className="w-3.5 h-3.5 text-[#888]" />
          </button>
          <button className="p-1.5 hover:bg-[#222] transition-colors">
            <Play className="w-3.5 h-3.5 text-[#00FF88]" />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="border-b border-[#222] py-2">
        {files.map((file) => (
          <div
            key={file.name}
            className={`flex items-center gap-2 px-3 py-1 cursor-pointer text-xs font-mono ${
              activeFile === file.name
                ? "bg-[#111] text-[#00D4FF]"
                : "text-[#888] hover:bg-[#111]"
            }`}
          >
            <ChevronRight className="w-3 h-3" />
            <file.icon className="w-3.5 h-3.5" />
            <span>{file.name}</span>
          </div>
        ))}
      </div>

      {/* Code Editor */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Line Numbers */}
          <div className="py-3 px-2 text-right select-none border-r border-[#222] bg-[#050505]">
            {hardwareManifest.split("\n").map((_, i) => (
              <div key={i} className="text-[10px] font-mono text-[#333] leading-5">
                {i + 1}
              </div>
            ))}
          </div>
          
          {/* Code Content */}
          <pre className="flex-1 py-3 px-3 text-xs font-mono leading-5 overflow-x-auto">
            {hardwareManifest.split("\n").map((line, i) => (
              <div key={i} className="whitespace-pre">
                {renderYamlLine(line)}
              </div>
            ))}
          </pre>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 flex items-center justify-between px-3 border-t border-[#222] bg-[#050505]">
        <span className="text-[9px] font-mono text-[#555]">YAML</span>
        <span className="text-[9px] font-mono text-[#555]">UTF-8 | LF</span>
      </div>
    </div>
  );
}

function renderYamlLine(line: string) {
  // Comments
  if (line.trim().startsWith("#")) {
    return <span className="text-[#555]">{line}</span>;
  }
  
  // Key-value pairs
  const keyMatch = line.match(/^(\s*)([a-z_]+)(:)/);
  if (keyMatch) {
    const [, indent, key, colon] = keyMatch;
    const rest = line.slice(keyMatch[0].length);
    
    // String values
    if (rest.includes("'")) {
      const stringMatch = rest.match(/(\s*)'([^']+)'/);
      if (stringMatch) {
        return (
          <>
            <span className="text-[#888]">{indent}</span>
            <span className="text-[#00D4FF]">{key}</span>
            <span className="text-white">{colon}</span>
            <span className="text-[#888]">{stringMatch[1]}</span>
            <span className="text-[#00FF88]">&apos;{stringMatch[2]}&apos;</span>
          </>
        );
      }
    }
    
    // Numeric values
    const numMatch = rest.match(/(\s*)(\d+)/);
    if (numMatch) {
      return (
        <>
          <span className="text-[#888]">{indent}</span>
          <span className="text-[#00D4FF]">{key}</span>
          <span className="text-white">{colon}</span>
          <span className="text-[#888]">{numMatch[1]}</span>
          <span className="text-[#FFAA00]">{numMatch[2]}</span>
        </>
      );
    }
    
    return (
      <>
        <span className="text-[#888]">{indent}</span>
        <span className="text-[#00D4FF]">{key}</span>
        <span className="text-white">{colon}</span>
        <span className="text-[#888]">{rest}</span>
      </>
    );
  }
  
  // List items
  if (line.trim().startsWith("-")) {
    return <span className="text-[#FFAA00]">{line}</span>;
  }
  
  return <span className="text-[#888]">{line}</span>;
}
