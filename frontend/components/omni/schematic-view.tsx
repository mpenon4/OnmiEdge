"use client"

import { useState } from "react"
import { useOmniStore } from "@/lib/store"

type Pin = { name: string; type?: "in" | "out" | "io" | "pwr" | "gnd" }

type Block = {
  id: string
  ref: string
  part: string
  pkg: string
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
  mcu: "var(--color-text-success)",
  sensor: "var(--color-text-info)",
  power: "var(--color-text-warning)",
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
      { name: "PA0" },
      { name: "PA1" },
      { name: "PA2" },
      { name: "PA3" },
      { name: "PA4" },
      { name: "PA5" },
      { name: "PA6" },
      { name: "PA7" },
    ],
    pinsRight: [
      { name: "PB0" },
      { name: "PB1" },
      { name: "PB6 SCL" },
      { name: "PB7 SDA" },
      { name: "PA9 TX" },
      { name: "PA10 RX" },
      { name: "PB8 CAN+" },
      { name: "PB9 CAN-" },
    ],
    pinsTop: [{ name: "VDD", type: "pwr" }, { name: "VDDA", type: "pwr" }, { name: "VBAT", type: "pwr" }],
    pinsBottom: [{ name: "GND", type: "gnd" }, { name: "VSSA", type: "gnd" }, { name: "VREF-", type: "gnd" }],
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
    pinsLeft: [{ name: "INT1" }, { name: "INT2" }],
    pinsRight: [{ name: "SCL" }, { name: "SDA" }, { name: "VDD" }, { name: "GND" }],
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
    pinsLeft: [{ name: "CSB" }],
    pinsRight: [{ name: "SCL" }, { name: "SDA" }, { name: "VDDIO" }, { name: "GND" }],
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
    pinsLeft: [{ name: "SCL" }, { name: "SDA" }, { name: "INT" }, { name: "VDD" }],
    pinsRight: [{ name: "AUX" }],
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
    pinsLeft: [{ name: "VIN" }, { name: "EN" }],
    pinsRight: [{ name: "VOUT" }, { name: "GND" }],
  },
]

const NETS = [
  { id: "scl-u2", color: ACCENT.mcu, points: "240,196 290,196 290,255 360,255" },
  { id: "sda-u2", color: ACCENT.mcu, points: "240,210 300,210 300,267 360,267" },
  { id: "scl-u3", color: ACCENT.mcu, points: "240,308 290,308 290,255 360,255" },
  { id: "sda-u3", color: ACCENT.mcu, points: "240,322 300,322 300,267 360,267" },
  { id: "scl-u4", color: ACCENT.sensor, points: "560,196 620,196 620,196 680,196" },
  { id: "sda-u4", color: ACCENT.sensor, points: "560,210 630,210 630,210 680,210" },
  { id: "int-u4", color: ACCENT.sensor, points: "560,224 645,224 645,224 680,224" },
  { id: "vdd-u5", color: ACCENT.power, points: "560,330 620,330 620,330 680,330" },
]

export function SchematicView() {
  const setSelection = useOmniStore((s) => s.setSelection)
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="grid h-full min-h-0" style={{ gridTemplateRows: "32px 1fr 28px" }}>
      <div className="flex items-center gap-3 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3">
        <span className="font-sans text-[10px] tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">
          Schematic
        </span>
        <span className="font-mono text-[10px] text-[var(--color-text-primary)]">main_board.sch</span>
        <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">rev C · grid 10mil</span>
        <span className="ml-auto flex items-center gap-3 font-mono text-[10px] text-[var(--color-text-secondary)]">
          <span>
            DRC <span className="text-[var(--color-text-success)]">PASS</span>
          </span>
        </span>
      </div>

      <div className="relative min-h-0 overflow-hidden bg-[var(--color-background-canvas)]">
        <svg
          viewBox="0 0 920 540"
          className="absolute inset-0 h-full w-full bg-tech-grid-fine"
          aria-label="Esquemático smart-sensor-v2"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Power rail */}
          <g>
            <line x1="40" y1="80" x2="880" y2="80" stroke="var(--color-text-warning)" strokeWidth="1.5" />
            <line x1="460" y1="80" x2="460" y2="150" stroke="var(--color-text-warning)" strokeWidth="1.5" />
            <line x1="170" y1="80" x2="170" y2="170" stroke="var(--color-text-warning)" strokeWidth="1.5" />
            <line x1="170" y1="80" x2="170" y2="290" stroke="var(--color-text-warning)" strokeWidth="1.5" />
            <line x1="745" y1="80" x2="745" y2="170" stroke="var(--color-text-warning)" strokeWidth="1.5" />
            <text x="44" y="74" fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-text-warning)">
              +3V3
            </text>
          </g>

          {/* Ground rail */}
          <g>
            <line x1="40" y1="460" x2="880" y2="460" stroke="var(--color-text-secondary)" strokeWidth="1.5" />
            <line x1="460" y1="390" x2="460" y2="460" stroke="var(--color-text-secondary)" strokeWidth="1.5" />
            <line x1="175" y1="370" x2="175" y2="460" stroke="var(--color-text-secondary)" strokeWidth="1.5" />
            <line x1="175" y1="260" x2="175" y2="460" stroke="var(--color-text-secondary)" strokeWidth="1.5" />
            <line x1="745" y1="380" x2="745" y2="460" stroke="var(--color-text-secondary)" strokeWidth="1.5" />
            <text x="44" y="476" fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-text-secondary)">
              GND
            </text>
          </g>

          {/* Nets */}
          <g fill="none" strokeWidth="1.2">
            {NETS.map((n) => (
              <polyline
                key={n.id}
                points={n.points}
                stroke={n.color}
                opacity={hovered && hovered !== n.id ? 0.25 : 0.9}
              />
            ))}
          </g>

          {/* Blocks */}
          {BLOCKS.map((b) => {
            const accent = b.accent ?? "var(--color-text-primary)"
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
                    pins:
                      b.pinsLeft.length +
                      b.pinsRight.length +
                      (b.pinsTop?.length ?? 0) +
                      (b.pinsBottom?.length ?? 0),
                  })
                }
                className="cursor-pointer"
              >
                <rect
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  fill="var(--color-background-primary)"
                  stroke={accent}
                  strokeWidth={hovered === b.id ? 1.5 : 1}
                />
                <rect x={b.x} y={b.y} width={b.w} height={18} fill={accent} fillOpacity="0.10" />
                <text x={b.x + 8} y={b.y + 13} fontFamily="var(--font-mono)" fontSize="10" fill={accent}>
                  {b.ref}
                </text>
                <text
                  x={b.x + b.w - 8}
                  y={b.y + 13}
                  fontFamily="var(--font-mono)"
                  fontSize="10"
                  fill="var(--color-text-primary)"
                  textAnchor="end"
                >
                  {b.part}
                </text>

                {b.pinsLeft.map((p, i) => {
                  const py = b.y + 32 + i * 14
                  return (
                    <g key={`${b.id}-l-${i}`}>
                      <line x1={b.x - 12} y1={py} x2={b.x} y2={py} stroke="var(--color-text-secondary)" strokeWidth="1" />
                      <circle cx={b.x - 12} cy={py} r="1.5" fill="var(--color-text-secondary)" />
                      <text x={b.x + 4} y={py + 3} fontFamily="var(--font-mono)" fontSize="8" fill="var(--color-text-primary)">
                        {p.name}
                      </text>
                    </g>
                  )
                })}

                {b.pinsRight.map((p, i) => {
                  const py = b.y + 32 + i * 14
                  return (
                    <g key={`${b.id}-r-${i}`}>
                      <line x1={b.x + b.w} y1={py} x2={b.x + b.w + 12} y2={py} stroke="var(--color-text-secondary)" strokeWidth="1" />
                      <circle cx={b.x + b.w + 12} cy={py} r="1.5" fill="var(--color-text-secondary)" />
                      <text
                        x={b.x + b.w - 4}
                        y={py + 3}
                        fontFamily="var(--font-mono)"
                        fontSize="8"
                        fill="var(--color-text-primary)"
                        textAnchor="end"
                      >
                        {p.name}
                      </text>
                    </g>
                  )
                })}

                {(b.pinsTop ?? []).map((p, i) => {
                  const px = b.x + 30 + i * 50
                  return (
                    <g key={`${b.id}-t-${i}`}>
                      <line x1={px} y1={b.y - 12} x2={px} y2={b.y} stroke="var(--color-text-warning)" strokeWidth="1" />
                      <circle cx={px} cy={b.y - 12} r="1.5" fill="var(--color-text-warning)" />
                      <text x={px + 4} y={b.y - 16} fontFamily="var(--font-mono)" fontSize="7" fill="var(--color-text-warning)">
                        {p.name}
                      </text>
                    </g>
                  )
                })}

                {(b.pinsBottom ?? []).map((p, i) => {
                  const px = b.x + 30 + i * 50
                  return (
                    <g key={`${b.id}-b-${i}`}>
                      <line x1={px} y1={b.y + b.h} x2={px} y2={b.y + b.h + 12} stroke="var(--color-text-secondary)" strokeWidth="1" />
                      <circle cx={px} cy={b.y + b.h + 12} r="1.5" fill="var(--color-text-secondary)" />
                      <text x={px + 4} y={b.y + b.h + 22} fontFamily="var(--font-mono)" fontSize="7" fill="var(--color-text-secondary)">
                        {p.name}
                      </text>
                    </g>
                  )
                })}

                <text
                  x={b.x + b.w / 2}
                  y={b.y + b.h - 6}
                  fontFamily="var(--font-mono)"
                  fontSize="8"
                  fill="var(--color-text-secondary)"
                  textAnchor="middle"
                >
                  {b.pkg}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3 font-mono text-[10px] text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-4">
          <span>
            COMPONENTS <span className="text-[var(--color-text-primary)]">{BLOCKS.length}</span>
          </span>
          <span>
            NETS <span className="text-[var(--color-text-primary)]">24</span>
          </span>
          <span>
            UNCONNECTED <span className="text-[var(--color-text-primary)]">0</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <LegendDot color={ACCENT.mcu} label="MCU" />
          <LegendDot color={ACCENT.sensor} label="Sensors" />
          <LegendDot color={ACCENT.power} label="Power" />
        </div>
      </div>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="block size-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
      <span className="tracking-wider uppercase text-[var(--color-text-secondary)]">{label}</span>
    </span>
  )
}
