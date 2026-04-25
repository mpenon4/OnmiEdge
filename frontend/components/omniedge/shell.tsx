"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { TopBar } from "./top-bar"
import { LeftPanel } from "./left-panel"
import { CenterCanvas } from "./center-canvas"
import { RightPanel } from "./right-panel"
import { OracleConsole } from "./oracle-console"
import { StatusBar } from "./status-bar"

export function OmniEdgeShell() {
  return (
    <main
      className="flex h-screen w-screen flex-col bg-background text-foreground"
      role="application"
      aria-label="OmniEdge Workstation"
    >
      <TopBar />

      <div className="min-h-0 flex-1">
        <ResizablePanelGroup direction="vertical" autoSaveId="omniedge:vertical">
          <ResizablePanel defaultSize={72} minSize={40}>
            <ResizablePanelGroup direction="horizontal" autoSaveId="omniedge:horizontal">
              <ResizablePanel defaultSize={20} minSize={14} maxSize={32}>
                <LeftPanel />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={56} minSize={30}>
                <CenterCanvas />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={24} minSize={18} maxSize={36}>
                <RightPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={28} minSize={12} maxSize={60}>
            <OracleConsole />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <StatusBar />
    </main>
  )
}
