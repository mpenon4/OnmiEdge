"use client"

import { useOmniStore } from "@/lib/store"
import { CodeEditor } from "./code-editor"
import { PhysicsViewport } from "./physics-viewport"
import { SchematicView } from "./schematic-view"
import { View3D } from "./view-3d"
import { ViewDebug } from "./view-debug"
import { ViewDeploy } from "./view-deploy"
import { ViewML } from "./view-ml"

/**
 * Zone B — Canvas. Background is hard #0d1117. Each mode renders edge-to-edge
 * with no floating overlays. Sub-panels live INSIDE the mode component.
 */
export function CenterCanvas() {
  const mode = useOmniStore((s) => s.mode)

  return (
    <section
      aria-label="Workspace canvas"
      className="flex h-full min-h-0 flex-col bg-[var(--color-background-canvas)]"
    >
      {mode === "ide" && <CodeEditor />}
      {mode === "schematic" && <SchematicView />}
      {mode === "3d" && <View3D />}
      {mode === "debug" && <ViewDebug />}
      {mode === "ml" && <ViewML />}
      {mode === "physics" && <PhysicsViewport />}
      {mode === "deploy" && <ViewDeploy />}
    </section>
  )
}
