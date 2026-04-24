"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Box } from "lucide-react";
import type { ScenarioState } from "@/lib/omni-types";
import { useEffect, useState } from "react";

interface SimulationPanelProps {
  state: ScenarioState;
}

export function SimulationPanel({ state }: SimulationPanelProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  // Reveal terminal lines progressively when scenario changes
  useEffect(() => {
    setVisibleLines([]);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setVisibleLines(state.terminalLines.slice(0, i));
      if (i >= state.terminalLines.length) clearInterval(id);
    }, 220);
    return () => clearInterval(id);
  }, [state.terminalLines]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Viewport */}
      <Card className="flex-1 rounded-none border-0 border-b border-border bg-card flex flex-col min-h-0">
        <CardHeader className="pb-3 border-b border-border shrink-0">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Box className="w-4 h-4 text-muted-foreground" />
            Simulation Viewport
            <span className="ml-auto text-xs font-mono text-muted-foreground">
              {state.viewportState === "scanning"
                ? "SCAN · 30 FPS"
                : state.viewportState === "frozen"
                ? "HALTED"
                : "IDLE"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 min-h-0 overflow-hidden">
          <RobotPlaceholder state={state} />
        </CardContent>
      </Card>

      {/* Terminal */}
      <Card className="h-56 rounded-none border-0 bg-card flex flex-col shrink-0">
        <CardHeader className="pb-2 border-b border-border shrink-0 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            System Log
            <span className="ml-auto text-xs font-mono text-muted-foreground">
              /dev/omni-edge
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-3 overflow-y-auto font-mono text-xs leading-relaxed">
          {visibleLines.map((line, i) => {
            const isFatal = line.startsWith("FATAL") || line.includes("[abort]") || line.includes("[exit]");
            const isWarn = line.startsWith("[warn]");
            const isOk = line.includes("— OK") || line.includes("Stable");
            return (
              <div
                key={i}
                className={
                  isFatal
                    ? "text-destructive"
                    : isWarn
                    ? "text-amber-400"
                    : isOk
                    ? "text-emerald-400"
                    : "text-foreground/80"
                }
              >
                <span className="text-muted-foreground mr-2 select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {line}
              </div>
            );
          })}
          {visibleLines.length < state.terminalLines.length && (
            <div className="text-muted-foreground animate-pulse">_</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RobotPlaceholder({ state }: { state: ScenarioState }) {
  const accent =
    state.scenario === "success"
      ? "#10b981"
      : state.scenario === "failure"
      ? "#ef4444"
      : "#f59e0b";

  const isScan = state.viewportState === "scanning";
  const isFrozen = state.viewportState === "frozen";

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_60%)]">
      {/* Grid backdrop */}
      <svg className="absolute inset-0 w-full h-full opacity-20" aria-hidden>
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Scan rings (only in success) */}
      {isScan && (
        <>
          <div
            className="absolute w-64 h-64 rounded-full border opacity-40 animate-ping"
            style={{ borderColor: accent, animationDuration: "2.4s" }}
          />
          <div
            className="absolute w-40 h-40 rounded-full border opacity-60 animate-ping"
            style={{ borderColor: accent, animationDuration: "1.6s" }}
          />
        </>
      )}

      {/* Robot arm SVG */}
      <svg viewBox="0 0 300 240" className="relative w-[60%] max-w-md">
        {/* Base */}
        <rect x="130" y="200" width="40" height="20" fill="currentColor" className="text-muted-foreground/40" />
        <rect x="120" y="190" width="60" height="12" fill="currentColor" className="text-muted-foreground/60" />

        {/* Arm segment 1 */}
        <g
          style={{
            transformOrigin: "150px 190px",
            animation: isScan ? "omni-joint1 4s ease-in-out infinite" : undefined,
          }}
        >
          <line
            x1="150"
            y1="190"
            x2="100"
            y2="120"
            stroke={isFrozen ? "#666" : accent}
            strokeWidth="6"
            strokeLinecap="round"
            opacity={isFrozen ? 0.4 : 1}
          />
          <circle cx="150" cy="190" r="8" fill={isFrozen ? "#666" : accent} opacity={isFrozen ? 0.4 : 1} />

          {/* Arm segment 2 */}
          <g
            style={{
              transformOrigin: "100px 120px",
              animation: isScan ? "omni-joint2 3s ease-in-out infinite" : undefined,
            }}
          >
            <line
              x1="100"
              y1="120"
              x2="180"
              y2="70"
              stroke={isFrozen ? "#666" : accent}
              strokeWidth="5"
              strokeLinecap="round"
              opacity={isFrozen ? 0.4 : 1}
            />
            <circle cx="100" cy="120" r="6" fill={isFrozen ? "#666" : accent} opacity={isFrozen ? 0.4 : 1} />

            {/* End effector */}
            <circle
              cx="180"
              cy="70"
              r="10"
              fill="none"
              stroke={isFrozen ? "#666" : accent}
              strokeWidth="2"
              opacity={isFrozen ? 0.4 : 1}
            />
            <circle
              cx="180"
              cy="70"
              r="4"
              fill={isFrozen ? "#666" : accent}
              opacity={isFrozen ? 0.4 : 1}
              style={{ animation: isScan ? "omni-pulse 1s ease-in-out infinite" : undefined }}
            />
          </g>
        </g>
      </svg>

      {/* Status tag */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
        <span>
          {isScan ? "scanning target" : isFrozen ? "runtime halted" : "idle / degraded"}
        </span>
      </div>

      <style jsx>{`
        @keyframes omni-joint1 {
          0%, 100% { transform: rotate(-6deg); }
          50% { transform: rotate(6deg); }
        }
        @keyframes omni-joint2 {
          0%, 100% { transform: rotate(10deg); }
          50% { transform: rotate(-10deg); }
        }
        @keyframes omni-pulse {
          0%, 100% { opacity: 1; r: 4; }
          50% { opacity: 0.4; r: 6; }
        }
      `}</style>
    </div>
  );
}
