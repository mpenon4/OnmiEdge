'use client';

import { useEffect, useState } from 'react';

interface TerminalProps {
  isRunning: boolean;
}

interface LogLine {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'error';
}

export function Terminal({ isRunning }: TerminalProps) {
  const [logs, setLogs] = useState<LogLine[]>([]);

  useEffect(() => {
    if (!isRunning) {
      setLogs([]);
      return;
    }

    const initialLogs = [
      { id: '1', text: '[INFO] Starting EdgeTwin Simulator v2.4.1', type: 'info' as const },
      { id: '2', text: '[INFO] Loading AI payload: TinyLlama 1.1B (4-bit Quantized)', type: 'info' as const },
      { id: '3', text: '[INFO] Target device: STM32H7 Cortex-M7 (2MB SRAM)', type: 'info' as const },
      { id: '4', text: '[INFO] Quantization profile: INT4 activation, INT8 weights', type: 'info' as const },
      { id: '5', text: '[INFO] Memory layout: Code=512KB, Model=1400KB, Runtime=88KB', type: 'info' as const },
    ];

    setLogs(initialLogs);

    const warningTimer = setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        { id: '6', text: '[WARNING] Approaching SRAM capacity: 1.95MB / 2.00MB utilized', type: 'warning' as const },
      ]);
    }, 1500);

    const errorTimer = setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          id: '7',
          text: '[FATAL] OutOfMemoryError: Tensor allocation failed.',
          type: 'error' as const,
        },
        {
          id: '8',
          text: '[FATAL] Model size exceeds physical SRAM by 150KB. Robot motor loop interrupted.',
          type: 'error' as const,
        },
      ]);
    }, 3500);

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(errorTimer);
    };
  }, [isRunning]);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-[--accent-red]';
      case 'warning':
        return 'text-[--accent-amber]';
      default:
        return 'text-[--accent-cyan]';
    }
  };

  return (
    <div className="bg-[--bg-panel] border-t panel-border rounded-t flex flex-col h-full">
      <div className="px-6 py-3 border-b panel-border">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[--text-secondary]">
          ▶ System Log
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-1">
        {logs.length === 0 && (
          <p className="text-xs text-[--text-tertiary] font-mono">
            Ready. Click "RUN HARDWARE SIMULATION" to start...
          </p>
        )}

        {logs.map((log) => (
          <p key={log.id} className={`text-xs font-mono ${getLogColor(log.type)}`}>
            {log.text}
          </p>
        ))}

        {isRunning && logs.length > 0 && (
          <span className="inline-block w-2 h-4 bg-[--accent-cyan] ml-1 terminal-cursor" />
        )}
      </div>
    </div>
  );
}
