"use client"

import type { BusType, McuSpec } from "@/lib/hardware-db"
import type { HardwareConfig } from "@/hooks/use-hardware"
import { cn } from "@/lib/utils"

interface OracleStatsProps {
  mcu: McuSpec
  config: HardwareConfig
  effectiveClockMhz: number
  effectiveFlashKb: number
  effectiveSramKb: number
  activeBuses: Set<BusType>
  activeBusPinCount: number
}

interface SpecRowProps {
  label: string
  value: React.ReactNode
  hint?: string
  emphasised?: boolean
}

function SpecRow({ label, value, hint, emphasised }: SpecRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[#141414] py-1.5 last:border-b-0">
      <span className="font-mono text-[10px] uppercase tracking-wider text-[#555]">{label}</span>
      <div className="flex items-baseline gap-2 text-right">
        <span
          className={cn(
            "font-mono text-[11px] tabular-nums",
            emphasised ? "text-[#00E5FF]" : "text-white",
          )}
        >
          {value}
        </span>
        {hint && <span className="font-mono text-[9px] text-[#444]">{hint}</span>}
      </div>
    </div>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
  trailing?: React.ReactNode
}

function Section({ title, children, trailing }: SectionProps) {
  return (
    <section className="border-b border-[#1A1A1A]">
      <header className="flex h-7 items-center justify-between bg-[#0A0A0A] px-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#666]">{title}</span>
        {trailing}
      </header>
      <div className="px-3 py-2">{children}</div>
    </section>
  )
}

const BUS_LABELS: Record<BusType, string> = {
  i2c: "I²C",
  spi: "SPI",
  uart: "UART",
  can: "CAN",
  usb: "USB",
  gpio: "GPIO",
}

const BUS_COLORS: Record<BusType, string> = {
  i2c: "#00E5FF",
  spi: "#39FF14",
  uart: "#FFAA00",
  can: "#FF8C00",
  usb: "#FF3D00",
  gpio: "#3A3A3A",
}

function formatKb(kb: number): string {
  if (kb === 0) return "External"
  if (kb >= 1024) return `${(kb / 1024).toFixed(kb % 1024 === 0 ? 0 : 2)} MB`
  return `${kb} KB`
}

export function OracleStats({
  mcu,
  config,
  effectiveClockMhz,
  effectiveFlashKb,
  effectiveSramKb,
  activeBuses,
  activeBusPinCount,
}: OracleStatsProps) {
  const overrideClock = config.clockMhz != null && config.clockMhz !== mcu.defaultClockMhz
  const overrideFlash = config.flashKb != null && config.flashKb !== mcu.flashKb
  const overrideSram = config.sramKb != null && config.sramKb !== mcu.sramKb

  return (
    <aside
      aria-label="MCU specification sheet"
      className="flex h-full min-h-0 w-full flex-col border-l border-[#1A1A1A] bg-[#050505]"
    >
      {/* Title */}
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-[#1A1A1A] bg-[#0A0A0A] px-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-[#00E5FF]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white">Oracle</span>
          <span className="font-mono text-[9px] text-[#444]">// specs</span>
        </div>
        <span className="font-mono text-[8px] uppercase tracking-wider text-[#444]">resolved</span>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Identity */}
        <Section title="Identity">
          <div className="space-y-1">
            <div className="font-mono text-[15px] font-semibold leading-tight text-white">{mcu.id}</div>
            <div className="font-mono text-[10px] text-[#666]">{mcu.fullName}</div>
            <div className="font-mono text-[10px] text-[#888]">{mcu.vendor}</div>
          </div>
        </Section>

        {/* Architecture */}
        <Section title="Architecture">
          <SpecRow label="Core" value={mcu.core} />
          <SpecRow label="ISA" value={mcu.arch} />
          <SpecRow label="FPU" value={mcu.fpu ? "Hardware" : "None"} />
          <SpecRow label="DSP" value={mcu.dsp ? "Yes" : "No"} />
        </Section>

        {/* Clock */}
        <Section title="Clock">
          <SpecRow
            label="Clock"
            value={`${effectiveClockMhz} MHz`}
            hint={overrideClock ? "override" : "default"}
            emphasised={overrideClock}
          />
          <SpecRow label="Max" value={`${mcu.maxClockMhz} MHz`} />
          <SpecRow label="Voltage" value={mcu.voltage} />
        </Section>

        {/* Memory */}
        <Section title="Memory">
          <SpecRow
            label="Flash"
            value={formatKb(effectiveFlashKb)}
            hint={overrideFlash ? "override" : undefined}
            emphasised={overrideFlash}
          />
          <SpecRow
            label="SRAM"
            value={formatKb(effectiveSramKb)}
            hint={overrideSram ? "override" : undefined}
            emphasised={overrideSram}
          />
          <SpecRow label="Package" value={mcu.package} />
          <SpecRow label="GPIO" value={`${mcu.gpioCount} pins`} />
        </Section>

        {/* Routing */}
        <Section
          title="Routing"
          trailing={
            <span className="font-mono text-[9px] text-[#444]">
              {activeBusPinCount} <span className="text-[#222]">/</span> {mcu.pins.filter((p) => p.bus).length}
            </span>
          }
        >
          {(Object.keys(BUS_LABELS) as BusType[])
            .filter((b) => b !== "gpio")
            .map((bus) => {
              const enabled = activeBuses.has(bus)
              return (
                <div
                  key={bus}
                  className="flex items-center justify-between border-b border-[#141414] py-1.5 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn("h-1.5 w-1.5 transition-opacity", enabled ? "opacity-100" : "opacity-20")}
                      style={{
                        backgroundColor: BUS_COLORS[bus],
                        boxShadow: enabled ? `0 0 6px ${BUS_COLORS[bus]}` : undefined,
                      }}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#888]">
                      {BUS_LABELS[bus]}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "font-mono text-[9px] uppercase tracking-wider",
                      enabled ? "text-[#39FF14]" : "text-[#333]",
                    )}
                  >
                    {enabled ? "Routed" : "Disabled"}
                  </span>
                </div>
              )
            })}
        </Section>

        {/* Warnings (if any) */}
        {config.warnings.length > 0 && (
          <Section title="Diagnostics">
            <ul className="space-y-1">
              {config.warnings.map((w, i) => (
                <li
                  key={i}
                  className="border-l-2 border-[#FFAA00] bg-[#FFAA00]/5 px-2 py-1 font-mono text-[10px] text-[#FFAA00]"
                >
                  {w}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {/* Footer */}
      <footer className="flex h-6 shrink-0 items-center justify-between border-t border-[#1A1A1A] bg-[#0A0A0A] px-3">
        <span className="font-mono text-[8px] uppercase tracking-wider text-[#444]">SDK · OmniEdge HAL</span>
        <span className="font-mono text-[8px] uppercase tracking-wider text-[#39FF14]">Resolved</span>
      </footer>
    </aside>
  )
}
