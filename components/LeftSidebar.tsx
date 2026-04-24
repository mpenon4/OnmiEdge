'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface LeftSidebarProps {
  onRunSimulation: () => void;
  isRunning: boolean;
}

export function LeftSidebar({ onRunSimulation, isRunning }: LeftSidebarProps) {
  const [selectedModel, setSelectedModel] = useState('TinyLlama 1.1B (4-bit Quantized)');
  const [selectedHardware, setSelectedHardware] = useState('STM32H7 Cortex-M7 (2MB RAM)');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showHardwareDropdown, setShowHardwareDropdown] = useState(false);

  const models = [
    'TinyLlama 1.1B (4-bit Quantized)',
    'DistilBERT (2-bit Quantized)',
    'MobileNetV3 (INT8)',
    'Custom Model',
  ];

  const hardware = [
    'STM32H7 Cortex-M7 (2MB RAM)',
    'ESP32-S3 (8MB RAM)',
    'Arduino Portenta H7 (1MB RAM)',
    'Raspberry Pi Pico (264KB RAM)',
  ];

  return (
    <div className="w-72 bg-[--bg-panel] border-r panel-border flex flex-col h-full">
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="mb-8">
          <label className="block text-xs font-mono text-[--text-secondary] uppercase tracking-wider mb-3">
            Select AI Payload
          </label>
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="w-full px-3 py-2 bg-[#1a1a1a] border panel-border rounded text-sm text-[--text-primary] flex items-center justify-between hover:bg-[#1e1e1e] transition-colors"
            >
              <span className="font-mono text-xs">{selectedModel}</span>
              <ChevronDown className="w-4 h-4 text-[--text-tertiary]" />
            </button>
            {showModelDropdown && (
              <div className="absolute top-full mt-1 w-full bg-[#0a0a0a] border panel-border rounded z-10">
                {models.map((model) => (
                  <button
                    key={model}
                    onClick={() => {
                      setSelectedModel(model);
                      setShowModelDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-mono transition-colors ${
                      model === selectedModel
                        ? 'bg-[#00E5FF]/10 text-[--accent-cyan]'
                        : 'text-[--text-secondary] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mb-12">
          <label className="block text-xs font-mono text-[--text-secondary] uppercase tracking-wider mb-3">
            Target Edge Architecture
          </label>
          <div className="relative">
            <button
              onClick={() => setShowHardwareDropdown(!showHardwareDropdown)}
              className="w-full px-3 py-2 bg-[#1a1a1a] border panel-border rounded text-sm text-[--text-primary] flex items-center justify-between hover:bg-[#1e1e1e] transition-colors"
            >
              <span className="font-mono text-xs">{selectedHardware}</span>
              <ChevronDown className="w-4 h-4 text-[--text-tertiary]" />
            </button>
            {showHardwareDropdown && (
              <div className="absolute top-full mt-1 w-full bg-[#0a0a0a] border panel-border rounded z-10">
                {hardware.map((hw) => (
                  <button
                    key={hw}
                    onClick={() => {
                      setSelectedHardware(hw);
                      setShowHardwareDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-mono transition-colors ${
                      hw === selectedHardware
                        ? 'bg-[#00E5FF]/10 text-[--accent-cyan]'
                        : 'text-[--text-secondary] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    {hw}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 border-t panel-border">
        <button
          onClick={onRunSimulation}
          disabled={isRunning}
          className={`w-full py-3 px-4 font-mono font-bold text-sm tracking-wider rounded transition-all duration-300 ${
            isRunning
              ? 'bg-[--accent-cyan] text-[--bg-primary] cursor-not-allowed shadow-lg'
              : 'bg-[--accent-cyan] text-[--bg-primary] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] active:shadow-[0_0_30px_rgba(0,229,255,0.5)]'
          }`}
        >
          {isRunning ? 'SIMULATION RUNNING' : 'RUN HARDWARE SIMULATION'}
        </button>
      </div>
    </div>
  );
}
