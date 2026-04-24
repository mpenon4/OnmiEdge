'use client';

import { Activity } from 'lucide-react';

export function TopNavigation() {
  return (
    <div className="h-16 bg-[--bg-panel] border-b panel-border flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[--accent-cyan] rounded-sm flex items-center justify-center">
          <Activity className="w-5 h-5 text-[--bg-primary]" />
        </div>
        <span className="text-lg font-bold tracking-tight text-[--text-primary]">
          EdgeTwin OS
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="px-3 py-1 bg-[#1a1a1a] border panel-border rounded text-xs text-[--text-secondary]">
          Environment: <span className="text-[--text-primary]">Cloud Simulation</span>
        </div>
        <div className="px-3 py-1 bg-[#1a1a1a] border panel-border rounded text-xs">
          <span className="text-[--accent-cyan] font-semibold">●</span>{' '}
          <span className="text-[--text-secondary]">Status:</span>{' '}
          <span className="text-[--accent-cyan]">RUNNING</span>
        </div>
      </div>
    </div>
  );
}
