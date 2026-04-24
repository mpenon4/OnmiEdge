"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import type { ScenarioState } from "@/lib/omni-types";

interface HeaderProps {
  state: ScenarioState;
}

export function Header({ state }: HeaderProps) {
  const tone = state.statusTone;

  const statusClass =
    tone === "success"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : tone === "critical"
      ? "bg-destructive/15 text-destructive border-destructive/40"
      : "bg-amber-500/15 text-amber-400 border-amber-500/30";

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
          <div className="w-3 h-3 rotate-45 bg-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">OmniEdge Studio</span>
          <span className="text-xs text-muted-foreground leading-tight font-mono">
            v0.1-beta · MVP
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs font-mono">
          Sim-Clock SYNC
        </Badge>
        <Badge variant="outline" className="text-xs font-mono">
          MCP CONNECTED
        </Badge>
        <Badge
          variant="outline"
          className={`text-xs font-mono border ${statusClass}`}
        >
          Status: {state.statusLabel}
        </Badge>
        <Button size="sm" className="ml-2 h-8 text-xs">
          <Play className="w-3.5 h-3.5 mr-1.5" />
          Deploy
        </Button>
      </div>
    </header>
  );
}
