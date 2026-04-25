"use client"

import { useMemo } from "react"
import type { BusType, McuSpec, PinDef } from "@/lib/hardware-db"
import type { ComponentDef, PinConflict } from "@/hooks/use-hardware"
import { cn } from "@/lib/utils"

interface McuViewportProps {
  mcu: McuSpec
  activePinIds: Set<string>
  activeBuses: Set<BusType>
  components: ComponentDef[]
  pinConflicts: PinConflict[]
}

const BUS_COLORS: Record<BusType, string> = {
  i2c: "#00E5FF",
  spi: "#39FF14",
  uart: "#FFAA00",
  can: "#FF8C00",
  usb: "#FF3D00",
  gpio: "#3A3A3A",
}

// Visual constants. The viewBox is square so the chip sits in the centre.
const VIEW = 640
const CENTER = VIEW / 2
const CHIP_SIZE = 280
const CHIP_X = CENTER - CHIP_SIZE / 2
const CHIP_Y = CENTER - CHIP_SIZE / 2
const PIN_LEN = 32
const PIN_W = 7

interface PositionedPin extends PinDef {
  /** Pin rectangle */
  rx: number
  ry: number
  rw: number
  rh: number
  /** Endpoint outside the chip body, used for label placement */
  ex: number
  ey: number
  /** Where to anchor a label */
  labelX: number
  labelY: number
  labelAnchor: "start" | "middle" | "end"
}

function positionPin(pin: PinDef, mcu: McuSpec): PositionedPin {
  const ppS = mcu.pinsPerSide
  const step = CHIP_SIZE / ppS
  const offset = step / 2

  const positions = {
    top: () => ({
      rx: CHIP_X + offset + pin.index * step - PIN_W / 2,
      ry: CHIP_Y - PIN_LEN,
      rw: PIN_W,
      rh: PIN_LEN,
      ex: CHIP_X + offset + pin.index * step,
      ey: CHIP_Y - PIN_LEN,
      labelX: CHIP_X + offset + pin.index * step,
      labelY: CHIP_Y - PIN_LEN - 8,
      labelAnchor: "middle" as const,
    }),
    bottom: () => ({
      rx: CHIP_X + offset + pin.index * step - PIN_W / 2,
      ry: CHIP_Y + CHIP_SIZE,
      rw: PIN_W,
      rh: PIN_LEN,
      ex: CHIP_X + offset + pin.index * step,
      ey: CHIP_Y + CHIP_SIZE + PIN_LEN,
      labelX: CHIP_X + offset + pin.index * step,
      labelY: CHIP_Y + CHIP_SIZE + PIN_LEN + 14,
      labelAnchor: "middle" as const,
    }),
    left: () => ({
      rx: CHIP_X - PIN_LEN,
      ry: CHIP_Y + offset + pin.index * step - PIN_W / 2,
      rw: PIN_LEN,
      rh: PIN_W,
      ex: CHIP_X - PIN_LEN,
      ey: CHIP_Y + offset + pin.index * step,
      labelX: CHIP_X - PIN_LEN - 6,
      labelY: CHIP_Y + offset + pin.index * step + 3,
      labelAnchor: "end" as const,
    }),
    right: () => ({
      rx: CHIP_X + CHIP_SIZE,
      ry: CHIP_Y + offset + pin.index * step - PIN_W / 2,
      rw: PIN_LEN,
      rh: PIN_W,
      ex: CHIP_X + CHIP_SIZE + PIN_LEN,
      ey: CHIP_Y + offset + pin.index * step,
      labelX: CHIP_X + CHIP_SIZE + PIN_LEN + 6,
      labelY: CHIP_Y + offset + pin.index * step + 3,
      labelAnchor: "start" as const,
    }),
  } as const

  return { ...pin, ...positions[pin.side]() }
}

export function McuViewport({
  mcu,
  activePinIds,
  activeBuses,
  components,
  pinConflicts,
}: McuViewportProps) {
  const positionedPins = useMemo(() => mcu.pins.map((p) => positionPin(p, mcu)), [mcu])
  const labelledPins = useMemo(() => positionedPins.filter((p) => p.bus), [positionedPins])
  const activeLabelledPins = useMemo(
    () => labelledPins.filter((p) => p.bus && activeBuses.has(p.bus)),
    [labelledPins, activeBuses],
  )

  // Build a map of conflicted pins for fast lookup
  const conflictedPins = useMemo(() => {
    const map = new Set<string>()
    for (const { pinId } of pinConflicts) {
      map.add(pinId)
    }
    return map
  }, [pinConflicts])

  return (
    <section
      aria-label="MCU schematic viewport"
      className="relative flex h-full min-h-0 flex-col bg-[#050505]"
    >
      {/* Header */}
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-[#1A1A1A] bg-[#0A0A0A] px-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#555]">Hardware View</span>
          <span className="text-[#1A1A1A]">/</span>
          <span className="font-mono text-[11px] text-white">{mcu.fullName}</span>
          <span className="border border-[#1A1A1A] bg-[#0A0A0A] px-1.5 py-0.5 font-mono text-[9px] text-[#888]">
            {mcu.package}
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-wider">
          <span className="text-[#555]">
            Active <span className="text-[#00E5FF]">{activePinIds.size}</span> /{" "}
            <span className="text-[#888]">{labelledPins.length}</span> bus pins
          </span>
        </div>
      </header>

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden grid-bg">
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${mcu.fullName} pin diagram`}
        >
          <defs>
            <linearGradient id="chipGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#161616" />
              <stop offset="50%" stopColor="#0E0E0E" />
              <stop offset="100%" stopColor="#080808" />
            </linearGradient>
            <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="pinGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="conflictGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor="#FFAA00" floodOpacity="0.4" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id="chipMicroGrid" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M 6 0 L 0 0 0 6" fill="none" stroke="#1A1A1A" strokeWidth="0.5" opacity="0.5" />
            </pattern>
          </defs>

          {/* Pins (draw before chip body so the body covers the inner edge) */}
          {positionedPins.map((pin) => {
            const isActive = activePinIds.has(pin.id)
            const isBusPin = !!pin.bus
            const isConflicted = conflictedPins.has(pin.id)
            const stroke = isConflicted ? "#FFAA00" : isActive ? BUS_COLORS[pin.bus!] : "#222"
            const fill = isConflicted
              ? "#332200"
              : isActive
                ? BUS_COLORS[pin.bus!]
                : isBusPin
                  ? "#2A2A2A"
                  : "#1A1A1A"
            return (
              <g key={`${pin.side}-${pin.index}`}>
                <rect
                  x={pin.rx}
                  y={pin.ry}
                  width={pin.rw}
                  height={pin.rh}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isConflicted ? 1.5 : isActive ? 1 : 0.5}
                  filter={isConflicted ? "url(#conflictGlow)" : isActive ? "url(#pinGlow)" : undefined}
                />
              </g>
            )
          })}

          {/* Chip body */}
          <rect
            x={CHIP_X}
            y={CHIP_Y}
            width={CHIP_SIZE}
            height={CHIP_SIZE}
            fill="url(#chipGradient)"
            stroke="#1A1A1A"
            strokeWidth={1}
          />
          <rect
            x={CHIP_X}
            y={CHIP_Y}
            width={CHIP_SIZE}
            height={CHIP_SIZE}
            fill="url(#chipMicroGrid)"
          />

          {/* Pin-1 indicator (notch in the corner) */}
          <circle cx={CHIP_X + 12} cy={CHIP_Y + 12} r={3} fill="none" stroke="#00E5FF" strokeWidth={0.8} opacity={0.6} />
          <circle cx={CHIP_X + 12} cy={CHIP_Y + 12} r={1.2} fill="#00E5FF" opacity={0.7} />

          {/* Chip text */}
          <text
            x={CENTER}
            y={CENTER - 18}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={11}
            fill="#555"
            letterSpacing="2"
          >
            {mcu.vendor.toUpperCase()}
          </text>
          <text
            x={CENTER}
            y={CENTER + 4}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={20}
            fontWeight={600}
            fill="#FFFFFF"
            letterSpacing="1.5"
          >
            {mcu.id}
          </text>
          <text
            x={CENTER}
            y={CENTER + 24}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={9}
            fill="#444"
            letterSpacing="1.5"
          >
            {mcu.core.toUpperCase()}
          </text>
          <text
            x={CENTER}
            y={CENTER + 42}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={9}
            fill="#444"
          >
            {`@ ${mcu.defaultClockMhz} MHz`}
          </text>

          {/* Bus pin labels (only for active or labelled pins) */}
          {labelledPins.map((pin) => {
            const isActive = activePinIds.has(pin.id)
            const color = isActive ? BUS_COLORS[pin.bus!] : "#3A3A3A"
            return (
              <text
                key={`label-${pin.id}`}
                x={pin.labelX}
                y={pin.labelY}
                textAnchor={pin.labelAnchor}
                fontFamily="var(--font-mono)"
                fontSize={8}
                fill={color}
                opacity={isActive ? 1 : 0.6}
              >
                {pin.id}
              </text>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="pointer-events-none absolute bottom-3 left-3 border border-[#1A1A1A] bg-[#0A0A0A]/85 px-3 py-2 backdrop-blur">
          <div className="mb-1 font-mono text-[8px] uppercase tracking-wider text-[#555]">Bus Routing</div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
            {(["i2c", "spi", "uart", "can", "usb"] as BusType[]).map((bus) => {
              const isActive = activeBuses.has(bus)
              return (
                <li key={bus} className="flex items-center gap-2 font-mono text-[9px]">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 transition-opacity",
                      isActive ? "opacity-100" : "opacity-25",
                    )}
                    style={{
                      backgroundColor: BUS_COLORS[bus],
                      boxShadow: isActive ? `0 0 6px ${BUS_COLORS[bus]}` : undefined,
                    }}
                  />
                  <span className={isActive ? "text-white" : "text-[#444]"}>
                    {bus.toUpperCase()}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Active pin readout */}
        <div className="pointer-events-none absolute right-3 top-3 max-w-[220px] border border-[#1A1A1A] bg-[#0A0A0A]/85 px-3 py-2 backdrop-blur">
          <div className="mb-1 font-mono text-[8px] uppercase tracking-wider text-[#555]">Routed pins</div>
          {activeLabelledPins.length === 0 ? (
            <div className="font-mono text-[10px] text-[#444]">— no buses enabled</div>
          ) : (
            <ul className="space-y-0.5">
              {activeLabelledPins.map((pin) => (
                <li key={`r-${pin.id}`} className="flex items-baseline justify-between gap-3 font-mono text-[10px]">
                  <span style={{ color: BUS_COLORS[pin.bus!] }}>{pin.id}</span>
                  <span className="text-[#666]">{pin.role}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
