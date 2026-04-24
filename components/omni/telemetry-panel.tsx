"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Bot } from "lucide-react";
import type { ScenarioState } from "@/lib/omni-types";
import { useEffect, useState } from "react";

interface TelemetryPanelProps {
  state: ScenarioState;
}

export function TelemetryPanel({ state }: TelemetryPanelProps) {
  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Telemetry Charts */}
      <Card className="flex-1 rounded-none border-0 border-b border-border bg-card flex flex-col min-h-0">
        <CardHeader className="pb-3 border-b border-border shrink-0">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Activity className="w-4 h-4 text-muted-foreground" />
            Telemetry
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
          <MetricRow
            label="CPU Load"
            unit="%"
            baseline={state.metrics.cpu}
            scenario={state.scenario}
            isFlat={state.scenario === "failure"}
          />
          <MetricRow
            label="Memory"
            unit="%"
            baseline={state.metrics.memory}
            scenario={state.scenario}
            isFlat={state.scenario === "failure"}
          />
          <MetricRow
            label="Temperature"
            unit="°C"
            baseline={state.metrics.temperature}
            scenario={state.scenario}
            isFlat={state.scenario === "failure"}
          />

          <div className="pt-4 border-t border-border">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Throughput</span>
              <span
                className="text-lg font-mono font-semibold"
                style={{ color: toneColor(state.statusTone) }}
              >
                {state.metrics.throughput}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Advisory */}
      <Card className="h-auto rounded-none border-0 bg-card shrink-0">
        <CardHeader className="pb-3 border-b border-border py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Bot className="w-4 h-4 text-muted-foreground" />
            Agent Advisory
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div
            className="flex items-start gap-2 p-3 rounded-md border text-sm leading-relaxed"
            style={{
              borderColor: toneColor(state.statusTone),
              background: `color-mix(in oklab, ${toneColor(state.statusTone)} 8%, transparent)`,
            }}
          >
            <div
              className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: toneColor(state.statusTone) }}
            />
            <div className="flex-1 min-w-0">
              <div
                className="text-xs font-mono uppercase tracking-wider mb-1"
                style={{ color: toneColor(state.statusTone) }}
              >
                Agent · {state.statusLabel}
              </div>
              <p className="text-foreground">{state.agentMessage}</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            Reasoning model: omni-advisor-v1 · updated on config change
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function toneColor(tone: ScenarioState["statusTone"]): string {
  switch (tone) {
    case "success":
      return "#10b981";
    case "critical":
      return "#ef4444";
    case "warning":
      return "#f59e0b";
  }
}

interface MetricRowProps {
  label: string;
  unit: string;
  baseline: number;
  scenario: ScenarioState["scenario"];
  isFlat: boolean;
}

function MetricRow({ label, unit, baseline, scenario, isFlat }: MetricRowProps) {
  const [series, setSeries] = useState<number[]>(() =>
    Array.from({ length: 32 }, () => baseline),
  );

  useEffect(() => {
    // Reset to baseline on scenario change
    setSeries(Array.from({ length: 32 }, () => baseline));
    if (isFlat) return;
    const noise = scenario === "caution" ? 10 : 5;
    const id = setInterval(() => {
      setSeries((prev) => {
        const next = Math.max(
          0,
          Math.min(100, baseline + (Math.random() - 0.5) * noise * 2),
        );
        return [...prev.slice(1), next];
      });
    }, 400);
    return () => clearInterval(id);
  }, [baseline, scenario, isFlat]);

  const color = toneColor(
    scenario === "failure" ? "critical" : scenario === "success" ? "success" : "warning",
  );

  const current = isFlat ? 0 : series[series.length - 1];
  const width = 240;
  const height = 40;
  const max = 100;
  const points = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * width;
      const y = height - (v / max) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-mono font-semibold" style={{ color }}>
          {isFlat ? "—" : current.toFixed(0)}
          {!isFlat && <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>}
        </span>
      </div>
      <div className="h-10 bg-muted/30 rounded-sm border border-border/50 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          {isFlat ? (
            <line
              x1="0"
              y1={height - 1}
              x2={width}
              y2={height - 1}
              stroke={color}
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          ) : (
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
