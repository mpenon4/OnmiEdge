"use client"

import { useState } from "react"
import { useOmniStore } from "@/lib/store"

type Part = {
  id: string
  ref: string
  part: string
  pkg: string
  pins: number
  poly: string
  fill: string
  stroke: string
}

const PARTS: Part[] = [
  {
    id: "u1",
    ref: "U1",
    part: "ESP32-S3",
    pkg: "QFN-56",
    pins: 56,
    poly: "380,212 460,212 478,242 398,242",
    fill: "#11151a",
    stroke: "#e5e7ea",
  },
  {
    id: "u2",
    ref: "U2",
    part: "BME280",
    pkg: "LGA-8",
    pins: 8,
    poly: "320,224 348,224 358,238 330,238",
    fill: "#11151a",
    stroke: "#4a9eff",
  },
  {
    id: "u3",
    ref: "U3",
    part: "OV2640",
    pkg: "CMOS-DVP",
    pins: 24,
    poly: "498,224 526,224 538,238 510,238",
    fill: "#11151a",
    stroke: "#4a9eff",
  },
  {
    id: "y1",
    ref: "Y1",
    part: "40MHz XO",
    pkg: "5032-4",
    pins: 4,
    poly: "350,242 366,242 372,250 356,250",
    fill: "#11151a",
    stroke: "#ff8c42",
  },
  {
    id: "j1",
    ref: "J1",
    part: "USB-C",
    pkg: "TYPE-C-24",
    pins: 24,
    poly: "274,224 304,224 314,238 284,238",
    fill: "#11151a",
    stroke: "#8b5cf6",
  },
]

export function View3D() {
  const [hovered, setHovered] = useState<Part | null>(null)
  const setSelection = useOmniStore((s) => s.setSelection)

  function selectPart(p: Part) {
    setSelection({ kind: "component", ref: p.ref, part: p.part, package: p.pkg, pins: p.pins })
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-background bg-tech-grid">
      <div className="absolute top-3 left-3 font-mono text-[10px] tracking-wider text-muted-foreground">
        <div>VIEWPORT · 3D · PERSPECTIVE</div>
        <div className="mt-0.5">main_board.brd · {PARTS.length} parts · 24 nets</div>
      </div>

      <svg viewBox="0 0 800 500" className="absolute inset-0 h-full w-full" aria-label="3D PCB viewport">
        <defs>
          <linearGradient id="boardGloss" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00d4a8" stopOpacity="0.10" />
            <stop offset="1" stopColor="#00d4a8" stopOpacity="0.04" />
          </linearGradient>
          <pattern id="floorGrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#1c2228" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Floor plane */}
        <polygon points="80,420 720,420 880,500 -80,500" fill="url(#floorGrid)" stroke="#1c2228" strokeWidth="1" />

        {/* PCB body (isometric) */}
        <g stroke="#00d4a8" strokeWidth="1" fill="none">
          <polygon points="260,200 560,200 600,260 300,260" fill="url(#boardGloss)" />
          <polygon points="560,200 560,220 600,280 600,260" fill="#00d4a826" />
          <polygon points="260,200 260,220 300,280 300,260" fill="#00d4a81a" />
          <polygon points="260,220 560,220 600,280 300,280" fill="none" />
        </g>

        {/* Silkscreen */}
        <text x="270" y="216" fontFamily="monospace" fontSize="7" fill="#6b7480" letterSpacing="1.2">
          OMNIEDGE · MAIN_BOARD · REV C
        </text>

        {/* Components */}
        {PARTS.map((p) => {
          const isHover = hovered?.id === p.id
          return (
            <g key={p.id}>
              <polygon
                points={p.poly}
                fill={p.fill}
                stroke={isHover ? "#00d4a8" : p.stroke}
                strokeWidth={isHover ? "1.5" : "1"}
                onMouseEnter={() => setHovered(p)}
                onMouseLeave={() => setHovered((h) => (h?.id === p.id ? null : h))}
                onClick={() => selectPart(p)}
                className="cursor-pointer"
              />
            </g>
          )
        })}

        {/* Reference designator labels */}
        <text x="404" y="232" fontFamily="monospace" fontSize="9" fill="#6b7480">
          ESP32-S3
        </text>

        {/* Connection vector */}
        <g stroke="#8b5cf6" strokeWidth="1" strokeDasharray="2 3" opacity="0.7">
          <path d="M 420 220 Q 500 120 620 160" fill="none" />
          <circle cx="620" cy="160" r="3" fill="#8b5cf6" stroke="none" />
        </g>
        <text x="624" y="156" fontFamily="monospace" fontSize="8" fill="#8b5cf6">
          rx vector
        </text>

        {/* Axes */}
        <g transform="translate(60,440)" fontFamily="monospace" fontSize="9">
          <line x1="0" y1="0" x2="40" y2="0" stroke="#ef4444" strokeWidth="1" />
          <text x="44" y="3" fill="#ef4444">x</text>
          <line x1="0" y1="0" x2="0" y2="-40" stroke="#00d4a8" strokeWidth="1" />
          <text x="4" y="-44" fill="#00d4a8">y</text>
          <line x1="0" y1="0" x2="-28" y2="20" stroke="#4a9eff" strokeWidth="1" />
          <text x="-40" y="26" fill="#4a9eff">z</text>
        </g>
      </svg>

      {/* Hover card */}
      {hovered && (
        <div className="absolute left-3 bottom-3 border border-border bg-card px-3 py-2 font-mono text-[10px]">
          <div className="text-primary">
            {hovered.ref} · {hovered.part}
          </div>
          <div className="mt-0.5 text-muted-foreground">
            pkg {hovered.pkg} · pins {hovered.pins} · click to inspect
          </div>
        </div>
      )}

      {/* HUD */}
      <div className="absolute right-3 bottom-3 grid grid-cols-2 gap-x-4 gap-y-0.5 border border-border bg-card px-3 py-2 font-mono text-[10px]">
        <span className="text-muted-foreground">VIEW</span>
        <span className="text-right text-foreground">PERSPECTIVE</span>
        <span className="text-muted-foreground">LAYER</span>
        <span className="text-right text-foreground">TOP_COPPER</span>
        <span className="text-muted-foreground">PARTS</span>
        <span className="text-right text-foreground">{PARTS.length}</span>
        <span className="text-muted-foreground">DRC</span>
        <span className="text-right text-primary">PASS</span>
      </div>
    </div>
  )
}
