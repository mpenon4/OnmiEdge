"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/omni/header";
import { ConfigPanel } from "@/components/omni/config-panel";
import { SimulationPanel } from "@/components/omni/simulation-panel";
import { TelemetryPanel } from "@/components/omni/telemetry-panel";
import { getScenario, type HardwareId, type AiModelId } from "@/lib/omni-types";

export default function Page() {
  const [hardware, setHardware] = useState<HardwareId>("jetson-orin-nano");
  const [ai, setAi] = useState<AiModelId>("tiny-yolov8");

  const state = useMemo(() => getScenario(hardware, ai), [hardware, ai]);

  return (
    <main className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Header state={state} />

      <div className="flex-1 min-h-0 grid grid-cols-[260px_1fr_340px]">
        <ConfigPanel
          hardware={hardware}
          onHardwareChange={setHardware}
          ai={ai}
          onAiChange={setAi}
        />
        <SimulationPanel state={state} />
        <TelemetryPanel state={state} />
      </div>

      <footer className="h-7 shrink-0 flex items-center justify-between px-4 border-t border-border bg-card">
        <span className="text-xs text-muted-foreground font-mono">
          {hardware} · {ai}
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          OmniEdge Studio
        </span>
      </footer>
    </main>
  );
}
