"use client"

import { TopBar } from "./top-bar"
import { LeftPanel } from "./left-panel"
import { CenterCanvas } from "./center-canvas"
import { RightPanel } from "./right-panel"
import { OracleConsole } from "./oracle-console"

/**
 * 4-zone layout — strict, fixed widths.
 *
 *   ┌────── TopBar 36px ──────┐
 *   │ Sidebar │ Canvas │ Insp │
 *   │  200px  │ flex 1 │ 240  │
 *   ├────────── Oracle 140px ──┤
 */
export function OmniEdgeShell() {
  return (
    <main
      className="grid h-screen w-screen text-[var(--color-text-primary)] bg-[var(--color-background-canvas)]"
      style={{ gridTemplateRows: "36px 1fr 140px" }}
      role="application"
      aria-label="OmniEdge Workstation"
    >
      <TopBar />

      <div
        className="grid min-h-0"
        style={{ gridTemplateColumns: "200px 1fr 240px" }}
      >
        <LeftPanel />
        <CenterCanvas />
        <RightPanel />
      </div>

      <OracleConsole />
    </main>
  )
}
