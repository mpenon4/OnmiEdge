"use client"

import { useState } from "react"
import { useOmniStore } from "@/lib/store"

type Pin = { name: string; type?: "in" | "out" | "io" | "pwr" | "gnd" }

type Block = {
  id: string
  ref: string
  part: string
  pkg: string
  /** Top-left corner */
  x: number
  y: number
  w: number
  h: number
  pinsLeft: Pin[]
  pinsRight: Pin[]
  pinsTop?: Pin[]
  pinsBottom?: Pin[]
  accent?: string
}

const ACCENT = {
  mcu: "#00d4a8",
  sensor: "#4a9eff",
  power: "#ff8c42",
  comms: "#8b5cf6",
}

const BLOCKS: Block[] = [
  {
    id: "u1",
    ref: "U1",
    part: "STM32H7",
    pkg: "LQFP-100",
    x: 360,
    y: 150,
    w: 200,
    h: 240,
    accent: ACCENT.mcu,
    pinsLeft: [
      { name: "PA0", type: "io" },
      { name: "PA1", type: "io" },
      { name: "PA2", type: "io" },
      { name: "PA3", type: "io" },
      { name: "PA4", type: "io" },
      { name: "PA5", type: "io" },
      { name: "PA6", type: "io" },
      { name: "PA7", type: "io" },
    ],
    pinsRight: [
      { name: "PB0", type: "io" },
      { name: "PB1", type: "io" },
      { name: "PB6 SCL", type: "io" },
      { name: "PB7 SDA", type: "io" },
      { name: "PA9 TX", type: "out" },
      { name: "PA10 RX", type: "in" },
      { name: "PB8 CAN+", type: "io" },
      { name: "PB9 CAN-", type: "io" },
    ],
    pinsTop: [
      { name: "VDD", type: "pwr" },
      { name: "VDDA", type: "pwr" },
      { name: "VBAT", type: "pwr" },
    ],
    pinsBottom: [
      { name: "GND", type: "gnd" },
      { name: "VSSA", type: "gnd" },
      { name: "VREF-", type: "gnd" },
    ],
  },
  {
    id: "u2",
    ref: "U2",
    part: "LSM6DSOX",
    pkg: "LGA-14",
    x: 110,
    y: 170,
    w: 130,
    h: 90,
    accent: ACCENT.sensor,
    pinsLeft: [
      { name: "INT1", type: "out" },
      { name: "INT2", type: "out" },
    ],
    pinsRight: [
      { name: "SCL", type: "io" },
      { name: "SDA", type: "io" },
      { name: "VDD", type: "pwr" },
      { name: "GND", type: "gnd" },
    ],
  },
  {
    id: "u3",
    ref: "U3",
    part: "BMP280",
    pkg: "LGA-8",
    x: 110,
    y: 290,
    w: 130,
    h: 80,
    accent: ACCENT.sensor,
    pinsLeft: [{ name: "CSB", type: "io" }],
    pinsRight: [
      { name: "SCL", type: "io" },
      { name: "SDA", type: "io" },
      { name: "VDDIO", type: "pwr" },
      { name: "GND", type: "gnd" },
    ],
  },
  {
    id: "u4",
    ref: "U4",
    part: "ICM-20948",
    pkg: "QFN-24",
    x: 680,
    y: 170,
    w: 130,
    h: 100,
    accent: ACCENT.sensor,
    pinsLeft: [
      { name: "SCL", type: "io" },
      { name: "SDA", type: "io" },
      { name: "INT", type: "out" },
      { name: "VDD", type: "pwr" },
    ],
    pinsRight: [{ name: "AUX", type: "io" }],
  },
  {
    id: "u5",
    ref: "U5",
    part: "TPS7A02",
    pkg: "SOT-23-5",
    x: 680,
    y: 300,
    w: 130,
    h: 80,
    accent: ACCENT.power,
    pinsLeft: [
      { name: "VIN", type: "pwr" },
      { name: "EN", type: "in" },
    ],
    pinsRight: [
      { name: "VOUT", type: "pwr" },
      { name: "GND", type: "gnd" },
    ],
  },
]

type Net = {
  id: string
  label: string
  color: string
  /** SVG polyline points */
  points: string
}

const NETS: Net[] = [
  // I2C bus — sensors → MCU PB6/PB7
  { id: "scl-u2", label: "I2C0_SCL", color: ACCENT.mcu, points: "240,196 290,196 290,255 360,255" },
  { id: "sda-u2", label: "I2C0_SDA", color: ACCENT.mcu, points: "240,210 300,210 300,267 360,267" },
  { id: "scl-u3", label: "I2C0_SCL", color: ACCENT.mcu, points: "240,308 290,308 290,255 360,255" },
  { id: "sda-u3", label: "I2C0_SDA", color: ACCENT.mcu, points: "240,322 300,322 300,267 360,267" },
  // U4 → MCU
  { id: "scl-u4", label: "I2C1_SCL", color: ACCENT.sensor, points: "560,196 620,196 620,196 680,196" },
  { id: "sda-u4", label: "I2C1_SDA", color: ACCENT.sensor, points: "560,210 630,210 630,210 680,210" },
  { id: "int-u4", label: "INT_IMU2", color: ACCENT.sensor, points: "560,224 645,224 645,224 680,224" },
  // Power
  { id: "vdd-u5", label: "+3V3", color: ACCENT.power, points: "560,330 620,330 620,330 680,330" },
]

export function SchematicView() {
  const setSelection = useOmniStore((s) => s.setSelection)
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* HUD */}
      <div className="pointer-events-none absolute top-3 left-3 z-20 font-mono text-[10px] tracking-wider text-muted-foreground">
        <div>SHEET · main_board.sch · REV C</div>
        <div className="mt-0.5">NETS · 24 · COMPONENTS · {BLOCKS.length} · DRC · CLEAN</div>
      </div>

      <div className="pointer-events-none absolute top-3 right-3 z-20 flex flex-col items-end font-mono text-[10px] text-muted-foreground">
        <span className="tracking-[0.2em] uppercase">Auto-layout</span>
        <span className="text-foreground">orthogonal · grid 10mil</span>
      </div>

      <svg
        viewBox="0 0 920 540"
        className="absolute inset-0 h-full w-full bg-tech-grid-fine"
        aria-label="Esquemático smart-sensor-v2"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker id="net-dot" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6">
            <circle cx="3" cy="3" r="2" fill="currentColor" />
          </marker>
        </defs>

        {/* Power rail (top) */}
        <g>
          <line x1="40" y1="80" x2="880" y2="80" stroke={ACCENT.power} strokeWidth="1.5" />
          <line x1="460" y1="80" x2="460" y2="150" stroke={ACCENT.power} strokeWidth="1.5" />
          <line x1="170" y1="80" x2="170" y2="170" stroke={ACCENT.power} strokeWidth="1.5" />
          <line x1="170" y1="80" x2="170" y2="290" stroke={ACCENT.power} strokeWidth="1.5" />
          <line x1="745" y1="80" x2="745" y2="170" stroke={ACCENT.power} strokeWidth="1.5" />
          <text x="44" y="74" fontFamily="var(--font-mono)" fontSize="10" fill={ACCENT.power}>
            +3V3
          </text>
        </g>

        {/* Ground rail (bottom) */}
        <g>
          <line x1="40" y1="460" x2="880" y2="460" stroke="#6b7480" strokeWidth="1.5" />
          <line x1="460" y1="390" x2="460" y2="460" stroke="#6b7480" strokeWidth="1.5" />
          <line x1="175" y1="370" x2="175" y2="460" stroke="#6b7480" strokeWidth="1.5" />
          <line x1="175" y1="260" x2="175" y2="460" stroke="#6b7480" strokeWidth="1.5" />
          <line x1="745" y1="380" x2="745" y2="460" stroke="#6b7480" strokeWidth="1.5" />
          <text x="44" y="476" fontFamily="var(--font-mono)" fontSize="10" fill="#6b7480">
            GND
          </text>
        </g>

        {/* Nets */}
        <g fill="none" strokeWidth="1.2">
          {NETS.map((n) => (
            <g key={n.id}>
              <polyline points={n.points} stroke={n.color} opacity={hovered && hovered !== n.id ? 0.25 : 0.9} />
            </g>
          ))}
        </g>

        {/* Blocks */}
        {BLOCKS.map((b) => {
          const accent = b.accent ?? "#e5e7ea"
          return (
            <g
              key={b.id}
              onMouseEnter={() => setHovered(b.id)}
              onMouseLeave={() => setHovered((h) => (h === b.id ? null : h))}
              onClick={() =>
                setSelection({
                  kind: "component",
                  ref: b.ref,
                  part: b.part,
                  package: b.pkg,
                  pins: b.pinsLeft.length + b.pinsRight.length + (b.pinsTop?.length ?? 0) + (b.pinsBottom?.length ?? 0),
                })
              }
              className="cursor-pointer"
            >
              {/* Block body */}
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                fill="#11151a"
                stroke={accent}
                strokeWidth={hovered === b.id ? 1.5 : 1}
              />
              {/* Header bar */}
              <rect x={b.x} y={b.y} width={b.w} height={18} fill={accent} fillOpacity="0.10" />
              <text x={b.x + 8} y={b.y + 13} fontFamily="var(--font-mono)" fontSize="10" fill={accent}>
                {b.ref}
              </text>
              <text
                x={b.x + b.w - 8}
                y={b.y + 13}
                fontFamily="var(--font-mono)"
                fontSize="10"
                fill="#e5e7ea"
                textAnchor="end"
              >
                {b.part}
              </text>

              {/* Pins left */}
              {b.pinsLeft.map((p, i) => {
                const py = b.y + 32 + i * 14
                return (
                  <g key={`${b.id}-l-${i}`}>
                    <line x1={b.x - 12} y1={py} x2={b.x} y2={py} stroke="#6b7480" strokeWidth="1" />
                    <circle cx={b.x - 12} cy={py} r="1.5" fill="#6b7480" />
                    <text
                      x={b.x + 4}
                      y={py + 3}
                      fontFamily="var(--font-mono)"
                      fontSize="8"
                      fill="#e5e7ea"
                    >
                      {p.name}
                    </text>
                  </g>
                )
              })}

              {/* Pins right */}
              {b.pinsRight.map((p, i) => {
                const py = b.y + 32 + i * 14
                return (
                  <g key={`${b.id}-r-${i}`}>
                    <line x1={b.x + b.w} y1={py} x2={b.x + b.w + 12} y2={py} stroke="#6b7480" strokeWidth="1" />
                    <circle cx={b.x + b.w + 12} cy={py} r="1.5" fill="#6b7480" />
                    <text
                      x={b.x + b.w - 4}
                      y={py + 3}
                      fontFamily="var(--font-mono)"
                      fontSize="8"
                      fill="#e5e7ea"
                      textAnchor="end"
                    >
                      {p.name}
                    </text>
                  </g>
                )
              })}

              {/* Pins top */}
              {(b.pinsTop ?? []).map((p, i) => {
                const px = b.x + 30 + i * 50
                return (
                  <g key={`${b.id}-t-${i}`}>
                    <line x1={px} y1={b.y - 12} x2={px} y2={b.y} stroke={ACCENT.power} strokeWidth="1" />
                    <circle cx={px} cy={b.y - 12} r="1.5" fill={ACCENT.power} />
                    <text
                      x={px + 4}
                      y={b.y - 16}
                      fontFamily="var(--font-mono)"
                      fontSize="7"
                      fill={ACCENT.power}
                    >
                      {p.name}
                    </text>
                  </g>
                )
              })}

              {/* Pins bottom */}
              {(b.pinsBottom ?? []).map((p, i) => {
                const px = b.x + 30 + i * 50
                return (
                  <g key={`${b.id}-b-${i}`}>
                    <line x1={px} y1={b.y + b.h} x2={px} y2={b.y + b.h + 12} stroke="#6b7480" strokeWidth="1" />
                    <circle cx={px} cy={b.y + b.h + 12} r="1.5" fill="#6b7480" />
                    <text
                      x={px + 4}
                      y={b.y + b.h + 22}
                      fontFamily="var(--font-mono)"
                      fontSize="7"
                      fill="#6b7480"
                    >
                      {p.name}
                    </text>
                  </g>
                )
              })}

              {/* Footprint */}
              <text
                x={b.x + b.w / 2}
                y={b.y + b.h - 6}
                fontFamily="var(--font-mono)"
                fontSize="8"
                fill="#6b7480"
                textAnchor="middle"
              >
                {b.pkg}
              </text>
            </g>
          )
        })}

        {/* Net labels */}
        <g fontFamily="var(--font-mono)" fontSize="8" fill="#6b7480">
          <text x="295" y="252">I2C0</text>
          <text x="615" y="194">I2C1</text>
          <text x="615" y="328">3V3_AUX</text>
        </g>
      </svg>

      {/* Mini legend */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-3 border border-border bg-card/90 px-3 py-1.5 font-mono text-[10px] backdrop-blur">
        <LegendDot color={ACCENT.mcu} label="MCU" />
        <LegendDot color={ACCENT.sensor} label="Sensors" />
        <LegendDot color={ACCENT.power} label="Power" />
        <LegendDot color={ACCENT.comms} label="Comms" />
      </div>

      {/* Stats */}
      <div className="absolute right-3 bottom-3 z-20 grid grid-cols-2 gap-x-4 gap-y-0.5 border border-border bg-card/90 px-3 py-2 font-mono text-[10px] backdrop-blur">
        <span className="text-muted-foreground">COMPONENTS</span>
        <span className="text-right text-foreground">{BLOCKS.length}</span>
        <span className="text-muted-foreground">NETS</span>
        <span className="text-right text-foreground">24</span>
        <span className="text-muted-foreground">UNCONNECTED</span>
        <span className="text-right text-foreground">0</span>
        <span className="text-muted-foreground">DRC</span>
        <span className="text-right text-primary">PASS</span>
      </div>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="block size-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
      <span className="text-muted-foreground tracking-wider uppercase">{label}</span>
    </span>
  )
}
