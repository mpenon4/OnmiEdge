"use client"

import { useOmniStore } from "@/lib/store"
import { CodeEditor } from "./code-editor"
import { PhysicsViewport } from "./physics-viewport"
import { SchematicView } from "./schematic-view"
import { View3D } from "./view-3d"
import { ViewDebug } from "./view-debug"
import { ViewDeploy } from "./view-deploy"
import { ViewML } from "./view-ml"
import { ViewPhysicsPanel } from "./view-physics-panel"

/**
 * The Center Canvas is the largest workspace surface. Its content
 * switches based on the global app mode set from the TopBar.
 *
 * IDE        → code editor (Monaco-style)
 * SCHEMATIC  → node-based circuit diagram
 * 3D         → PCB perspective viewport
 * DEBUG      → registers + memory hex viewer
 * ML         → model metrics + latency chart
 * PHYSICS    → environmental sliders + sensor readout (with viewport)
 * DEPLOY     → target MCU + build/flash flow
 */
export function CenterCanvas() {
  const mode = useOmniStore((s) => s.mode)

  return (
    <section
      aria-label="Workspace canvas"
      className="flex h-full flex-col bg-background"
    >
      <div className="min-h-0 flex-1">
        {mode === "ide" && <CodeEditor />}
        {mode === "schematic" && <SchematicView />}
        {mode === "3d" && <View3D />}
        {mode === "debug" && <ViewDebug />}
        {mode === "ml" && <ViewML />}
        {mode === "physics" && (
          <div className="grid h-full grid-rows-[auto_1fr]">
            <ViewPhysicsPanel />
            <PhysicsViewport />
          </div>
        )}
        {mode === "deploy" && <ViewDeploy />}
      </div>
    </section>
  )
}
