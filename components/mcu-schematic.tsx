"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"
import { type McuModel, type Pin, PIN_COLORS, BUS_FUNCTIONS, BUS_META, type BusId } from "@/lib/mcu-data"
import { Cpu, Maximize2, Layers, Crosshair } from "lucide-react"

type Props = {
  mcu: McuModel
  activeBuses: Set<BusId>
  highlightedPinIds: Set<string>
}

// Geometry constants
const CANVAS = 720
const CHIP_SIZE = 320
const CHIP_X = (CANVAS - CHIP_SIZE) / 2
const CHIP_Y = (CANVAS - CHIP_SIZE) / 2
const PIN_LEN = 38
const PIN_W = 6
const PIN_GAP = 12
const PAD_SIZE = 9

type PinLayout = {
  pin: Pin
  side: "top" | "right" | "bottom" | "left"
  // Coordinates of the pin "tip" (the outer tip away from chip)
  tipX: number
  tipY: number
  // Coordinates where the pin meets the chip body
  bodyX: number
  bodyY: number
  // Anchor for label
  labelX: number
  labelY: number
  labelAnchor: "start" | "middle" | "end"
}

function layoutPins(mcu: McuModel): PinLayout[] {
  const layouts: PinLayout[] = []

  const placeRow = (pins: Pin[], side: PinLayout["side"]) => {
    const count = pins.length
    if (count === 0) return
    const step = (CHIP_SIZE - PIN_GAP * 2) / (count + 1)

    pins.forEach((pin, idx) => {
      const offset = PIN_GAP + step * (idx + 1)
      let bodyX = 0,
        bodyY = 0,
        tipX = 0,
        tipY = 0,
        labelX = 0,
        labelY = 0,
        labelAnchor: PinLayout["labelAnchor"] = "start"

      if (side === "top") {
        bodyX = CHIP_X + offset
        bodyY = CHIP_Y
        tipX = bodyX
        tipY = bodyY - PIN_LEN
        labelX = tipX
        labelY = tipY - 8
        labelAnchor = "middle"
      } else if (side === "bottom") {
        bodyX = CHIP_X + (CHIP_SIZE - offset)
        bodyY = CHIP_Y + CHIP_SIZE
        tipX = bodyX
        tipY = bodyY + PIN_LEN
        labelX = tipX
        labelY = tipY + 14
        labelAnchor = "middle"
      } else if (side === "right") {
        bodyX = CHIP_X + CHIP_SIZE
        bodyY = CHIP_Y + offset
        tipX = bodyX + PIN_LEN
        tipY = bodyY
        labelX = tipX + 6
        labelY = tipY + 3
        labelAnchor = "start"
      } else if (side === "left") {
        bodyX = CHIP_X
        bodyY = CHIP_Y + (CHIP_SIZE - offset)
        tipX = bodyX - PIN_LEN
        tipY = bodyY
        labelX = tipX - 6
        labelY = tipY + 3
        labelAnchor = "end"
      }

      layouts.push({ pin, side, tipX, tipY, bodyX, bodyY, labelX, labelY, labelAnchor })
    })
  }

  placeRow(mcu.top, "top")
  placeRow(mcu.right, "right")
  placeRow(mcu.bottom, "bottom")
  placeRow(mcu.left, "left")

  return layouts
}

export function McuSchematic({ mcu, activeBuses, highlightedPinIds }: Props) {
  const pinLayouts = useMemo(() => layoutPins(mcu), [mcu])

  // A pin counts as "active" if its function belongs to an enabled bus,
  // OR it's POWER / GND / CLK / RESET (always active),
  // OR it's referenced by a component in the manifest.
  const isPinActive = (p: Pin) => {
    if (p.fn === "POWER" || p.fn === "GND" || p.fn === "CLK" || p.fn === "RESET") return true
    for (const bus of activeBuses) {
      if (BUS_FUNCTIONS[bus].includes(p.fn)) return true
    }
    if (highlightedPinIds.has(p.id)) return true
    return false
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-[#050505]">
      {/* Header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-[#1A1A1A] bg-[#0A0A0A] px-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-[#00E5FF]" strokeWidth={2} />
          <span className="font-mono text-[11px] font-bold tracking-wide text-white">
            silicon_view
          </span>
          <span className="font-mono text-[10px] text-[#444]">// {mcu.fullName}</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-[#666]">
          <Layers className="h-3 w-3 text-[#666]" />
          <span>schematic</span>
          <span className="text-[#222]">·</span>
          <Maximize2 className="h-3 w-3 text-[#666]" />
          <span>1.0x</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="grid-bg relative flex flex-1 items-center justify-center overflow-hidden">
        {/* Subtle scan line */}
        <div className="pointer-events-none absolute inset-0">
          <div className="scanline absolute inset-0" />
        </div>

        <svg
          viewBox={`0 0 ${CANVAS} ${CANVAS}`}
          className="h-full max-h-full w-full max-w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="chipGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.08" />
              <stop offset="60%" stopColor="#00E5FF" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
            </radialGradient>
            <pattern id="chipGrid" width="14" height="14" patternUnits="userSpaceOnUse">
              <path
                d="M 14 0 L 0 0 0 14"
                fill="none"
                stroke="#00E5FF"
                strokeOpacity="0.06"
                strokeWidth="0.5"
              />
            </pattern>
            <filter id="pinGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Halo */}
          <circle cx={CANVAS / 2} cy={CANVAS / 2} r={CANVAS * 0.45} fill="url(#chipGlow)" />

          {/* Outer crosshair */}
          <g stroke="#1A1A1A" strokeWidth="0.5">
            <line x1={CANVAS / 2} y1="0" x2={CANVAS / 2} y2={CANVAS} strokeDasharray="2 4" />
            <line x1="0" y1={CANVAS / 2} x2={CANVAS} y2={CANVAS / 2} strokeDasharray="2 4" />
          </g>

          {/* Pin traces & pads */}
          {pinLayouts.map((pl, idx) => {
            const active = isPinActive(pl.pin)
            const colors = PIN_COLORS[pl.pin.fn]
            const stroke = active ? colors.active : colors.idle
            const labelColor = active ? colors.active : "#333"
            return (
              <g key={pl.pin.id}>
                {/* Outer label (function tag) */}
                <text
                  x={pl.labelX}
                  y={pl.labelY}
                  textAnchor={pl.labelAnchor}
                  className="font-mono"
                  fontSize="8"
                  fill={labelColor}
                  opacity={active ? 1 : 0.55}
                >
                  {pl.pin.label}
                </text>

                {/* Pin trace */}
                <line
                  x1={pl.bodyX}
                  y1={pl.bodyY}
                  x2={pl.tipX}
                  y2={pl.tipY}
                  stroke={stroke}
                  strokeWidth={PIN_W * 0.6}
                  opacity={active ? 0.95 : 0.6}
                />

                {/* Pin pad */}
                <rect
                  x={pl.tipX - PAD_SIZE / 2}
                  y={pl.tipY - PAD_SIZE / 2}
                  width={PAD_SIZE}
                  height={PAD_SIZE}
                  fill={active ? colors.active : "#1A1A1A"}
                  stroke={active ? colors.active : "#2A2A2A"}
                  strokeWidth="0.8"
                  filter={active ? "url(#pinGlow)" : undefined}
                  opacity={active ? 1 : 0.7}
                />

                {/* Animated pulse for active bus pins */}
                {active && pl.pin.fn !== "POWER" && pl.pin.fn !== "GND" && (
                  <motion.circle
                    cx={pl.bodyX}
                    cy={pl.bodyY}
                    r={2}
                    fill={colors.active}
                    initial={{
                      cx: pl.bodyX,
                      cy: pl.bodyY,
                      opacity: 0,
                    }}
                    animate={{
                      cx: pl.tipX,
                      cy: pl.tipY,
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: (idx % 8) * 0.1,
                    }}
                  />
                )}
              </g>
            )
          })}

          {/* Chip body */}
          <g>
            {/* Outer border with glow */}
            <rect
              x={CHIP_X}
              y={CHIP_Y}
              width={CHIP_SIZE}
              height={CHIP_SIZE}
              fill="#0A0A0A"
              stroke="#00E5FF"
              strokeOpacity="0.4"
              strokeWidth="1.5"
            />
            {/* Inner grid */}
            <rect
              x={CHIP_X + 6}
              y={CHIP_Y + 6}
              width={CHIP_SIZE - 12}
              height={CHIP_SIZE - 12}
              fill="url(#chipGrid)"
              stroke="#1A1A1A"
              strokeWidth="0.5"
            />
            {/* Pin-1 indicator dot */}
            <circle cx={CHIP_X + 14} cy={CHIP_Y + 14} r="3" fill="#39FF14" />
            <circle cx={CHIP_X + 14} cy={CHIP_Y + 14} r="6" fill="none" stroke="#39FF14" strokeOpacity="0.4" />

            {/* Notch at top */}
            <rect
              x={CHIP_X + CHIP_SIZE / 2 - 14}
              y={CHIP_Y - 1}
              width={28}
              height={6}
              fill="#0A0A0A"
              stroke="#00E5FF"
              strokeOpacity="0.5"
              strokeWidth="0.8"
            />

            {/* Chip die details */}
            <rect
              x={CHIP_X + 30}
              y={CHIP_Y + 30}
              width={CHIP_SIZE - 60}
              height={CHIP_SIZE - 60}
              fill="none"
              stroke="#00E5FF"
              strokeOpacity="0.25"
              strokeWidth="0.6"
              strokeDasharray="3 3"
            />

            {/* Center label */}
            <text
              x={CANVAS / 2}
              y={CANVAS / 2 - 18}
              textAnchor="middle"
              className="font-mono"
              fontSize="11"
              fill="#666"
              letterSpacing="3"
            >
              {mcu.vendor.toUpperCase()}
            </text>
            <text
              x={CANVAS / 2}
              y={CANVAS / 2 + 8}
              textAnchor="middle"
              className="font-mono"
              fontSize="22"
              fontWeight="bold"
              fill="#00E5FF"
              letterSpacing="2"
            >
              {mcu.fullName}
            </text>
            <text
              x={CANVAS / 2}
              y={CANVAS / 2 + 28}
              textAnchor="middle"
              className="font-mono"
              fontSize="9"
              fill="#888"
              letterSpacing="2"
            >
              {mcu.core} · {mcu.defaultClockMhz}MHz
            </text>
            <text
              x={CANVAS / 2}
              y={CANVAS / 2 + 46}
              textAnchor="middle"
              className="font-mono"
              fontSize="8"
              fill="#444"
              letterSpacing="2"
            >
              FLASH {mcu.flashKb}KB · SRAM {mcu.sramKb}KB
            </text>

            {/* Bus indicators inside the die */}
            <g transform={`translate(${CHIP_X + 22}, ${CHIP_Y + CHIP_SIZE - 32})`}>
              {(["i2c", "spi", "uart", "can", "usb"] as BusId[]).map((bus, i) => {
                const isOn = activeBuses.has(bus)
                const meta = BUS_META[bus]
                return (
                  <g key={bus} transform={`translate(${i * 50}, 0)`}>
                    <rect
                      width="44"
                      height="14"
                      fill={isOn ? meta.color : "#1A1A1A"}
                      fillOpacity={isOn ? 0.18 : 1}
                      stroke={isOn ? meta.color : "#2A2A2A"}
                      strokeWidth="0.6"
                    />
                    <text
                      x="22"
                      y="10"
                      textAnchor="middle"
                      className="font-mono"
                      fontSize="8"
                      fontWeight="bold"
                      fill={isOn ? meta.color : "#444"}
                      letterSpacing="1"
                    >
                      {meta.name}
                    </text>
                  </g>
                )
              })}
            </g>
          </g>

          {/* Corner markers */}
          {[
            [10, 10],
            [CANVAS - 10, 10],
            [10, CANVAS - 10],
            [CANVAS - 10, CANVAS - 10],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="2" fill="#39FF14" />
              <line
                x1={x - 8}
                y1={y}
                x2={x + 8}
                y2={y}
                stroke="#39FF14"
                strokeOpacity="0.5"
                strokeWidth="0.5"
              />
              <line
                x1={x}
                y1={y - 8}
                x2={x}
                y2={y + 8}
                stroke="#39FF14"
                strokeOpacity="0.5"
                strokeWidth="0.5"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Footer legend */}
      <div className="flex h-10 shrink-0 items-center justify-between border-t border-[#1A1A1A] bg-[#0A0A0A] px-3">
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-[#666]">
            <Crosshair className="h-3 w-3 text-[#39FF14]" />
            origin · 0,0
          </span>
          <span className="text-[#222]">·</span>
          <span className="text-[#666]">
            pins <span className="text-white">{pinLayouts.length}</span>
          </span>
          <span className="text-[#222]">·</span>
          <span className="text-[#666]">
            active{" "}
            <span className="text-[#39FF14]">
              {pinLayouts.filter((pl) => isPinActive(pl.pin)).length}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider">
          {(["i2c", "spi", "uart", "can", "usb"] as BusId[]).map((bus) => {
            const isOn = activeBuses.has(bus)
            const meta = BUS_META[bus]
            return (
              <div
                key={bus}
                className="flex items-center gap-1"
                style={{ color: isOn ? meta.color : "#333" }}
              >
                <span
                  className="inline-block h-2 w-2"
                  style={{
                    backgroundColor: isOn ? meta.color : "#1A1A1A",
                    boxShadow: isOn ? `0 0 6px ${meta.color}` : "none",
                  }}
                />
                {meta.name}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
