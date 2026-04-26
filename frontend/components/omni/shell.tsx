"use client"

import { useRef } from "react"
import type { ImperativePanelHandle } from "react-resizable-panels"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { TopBar } from "./top-bar"
import { LeftPanel } from "./left-panel"
import { CenterCanvas } from "./center-canvas"
import { RightPanel } from "./right-panel"
import { OracleConsole } from "./oracle-console"

/**
 * Resizable 4-zone layout.
 *
 *   ┌────────────── TopBar 36px ──────────────┐
 *   │ Sidebar │ Canvas │ Inspector            │   ← horizontal PanelGroup
 *   ├──────────────────────────────────────────┤
 *   │ Oracle Console                           │   ← vertical PanelGroup
 *   └──────────────────────────────────────────┘
 *
 * Each panel is independently collapsible/resizable. Sizes persist via
 * autoSaveId so the user's preferred layout is restored across reloads.
 */
export function OmniEdgeShell() {
  const sidebarRef = useRef<ImperativePanelHandle>(null)
  const inspectorRef = useRef<ImperativePanelHandle>(null)
  const oracleRef = useRef<ImperativePanelHandle>(null)

  return (
    <main
      className="grid h-screen w-screen text-[var(--color-text-primary)] bg-[var(--color-background-canvas)]"
      style={{ gridTemplateRows: "36px 1fr" }}
      role="application"
      aria-label="OmniEdge Workstation"
    >
      <TopBar
        onToggleSidebar={() => {
          const p = sidebarRef.current
          if (!p) return
          p.isCollapsed() ? p.expand() : p.collapse()
        }}
        onToggleInspector={() => {
          const p = inspectorRef.current
          if (!p) return
          p.isCollapsed() ? p.expand() : p.collapse()
        }}
        onToggleOracle={() => {
          const p = oracleRef.current
          if (!p) return
          p.isCollapsed() ? p.expand() : p.collapse()
        }}
      />

      <ResizablePanelGroup
        direction="vertical"
        autoSaveId="omni:vertical"
        className="min-h-0"
      >
        <ResizablePanel id="workbench" order={1} defaultSize={82} minSize={40}>
          <ResizablePanelGroup
            direction="horizontal"
            autoSaveId="omni:horizontal"
            className="min-h-0"
          >
            <ResizablePanel
              id="sidebar"
              order={1}
              ref={sidebarRef}
              defaultSize={14}
              minSize={10}
              maxSize={30}
              collapsible
              collapsedSize={0}
            >
              <LeftPanel />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel id="canvas" order={2} defaultSize={70} minSize={30}>
              <CenterCanvas />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel
              id="inspector"
              order={3}
              ref={inspectorRef}
              defaultSize={16}
              minSize={12}
              maxSize={40}
              collapsible
              collapsedSize={0}
            >
              <RightPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel
          id="oracle"
          order={2}
          ref={oracleRef}
          defaultSize={18}
          minSize={8}
          maxSize={60}
          collapsible
          collapsedSize={0}
        >
          <OracleConsole />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  )
}
