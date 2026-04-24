"use client"

import { useState } from "react"
import { OmniSidebar, type SectionId } from "@/components/omni/sidebar"
import { YamlEditor } from "@/components/omni/yaml-editor"
import { McuViewport } from "@/components/omni/mcu-viewport"
import { OracleStats } from "@/components/omni/oracle-stats"
import { useHardware } from "@/hooks/use-hardware"

const DEFAULT_MANIFEST = `# OmniEdge Studio · Hardware Manifest
# Edit values to reconfigure the silicon.

mcu_id: STM32H7
clock_mhz: 480

memory:
  flash_kb: 2048
  sram_kb: 1024

peripherals:
  i2c_bus: enabled    # routes I2C1 (SCL/SDA)
  spi_bus: enabled    # routes SPI1 (SCK/MISO/MOSI)
  uart: disabled
  can_bus: disabled
  usb: enabled        # routes OTG_FS (DM/DP)

# Try changing mcu_id to: ESP32-S3 · RP2040 · NRF52840
`

export default function Page() {
  const [yaml, setYaml] = useState(DEFAULT_MANIFEST)
  const [section, setSection] = useState<SectionId>("hardware")
  const [pristine, setPristine] = useState(true)

  const handleYamlChange = (next: string) => {
    setYaml(next)
    if (pristine) setPristine(false)
  }

  const { config, mcu, activePinIds, activeBuses, effectiveClockMhz, effectiveFlashKb, effectiveSramKb } =
    useHardware(yaml)

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#050505]">
      <OmniSidebar active={section} onSelect={setSection} />

      <div className="flex flex-1 min-w-0 flex-col">
        {/* Workspace header */}
        <header className="flex h-9 shrink-0 items-center justify-between border-b border-[#1A1A1A] bg-[#0A0A0A] px-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white">
              OmniEdge Studio
            </span>
            <span className="text-[#1A1A1A]">/</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#666]">
              {section === "hardware" ? "Hardware-as-Code" : section}
            </span>
            <span className="text-[#1A1A1A]">/</span>
            <span className="font-mono text-[10px] text-[#444]">stage 1</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-[#666]">
              <span className="h-1.5 w-1.5 bg-[#39FF14] shadow-[0_0_6px_rgba(57,255,20,0.8)]" />
              Manifest synced
            </span>
            <span className="text-[#222]">·</span>
            <span className="text-[#666]">
              MCU <span className="text-[#00E5FF]">{mcu.id}</span>
            </span>
            <span className="text-[#222]">·</span>
            <span className="text-[#666]">
              Buses <span className="text-white">{activeBuses.size}</span>/5
            </span>
          </div>
        </header>

        {/* 3-pane workspace */}
        <div className="flex flex-1 min-h-0">
          {/* Left — YAML editor */}
          <div className="flex w-[420px] shrink-0 flex-col border-r border-[#1A1A1A]">
            <YamlEditor value={yaml} onChange={handleYamlChange} dirty={!pristine} />
          </div>

          {/* Center — MCU viewport */}
          <div className="flex-1 min-w-0">
            <McuViewport mcu={mcu} activePinIds={activePinIds} activeBuses={activeBuses} />
          </div>

          {/* Right — Oracle stats */}
          <div className="w-[300px] shrink-0">
            <OracleStats
              mcu={mcu}
              config={config}
              effectiveClockMhz={effectiveClockMhz}
              effectiveFlashKb={effectiveFlashKb}
              effectiveSramKb={effectiveSramKb}
              activeBuses={activeBuses}
              activeBusPinCount={activePinIds.size}
            />
          </div>
        </div>

        {/* Status bar */}
        <footer className="flex h-6 shrink-0 items-center justify-between border-t border-[#1A1A1A] bg-[#0A0A0A] px-3">
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-wider text-[#444]">
            <span>OmniEdge Studio v0.1-beta</span>
            <span className="text-[#222]">·</span>
            <span>Hardware-as-Code Runtime</span>
            <span className="text-[#222]">·</span>
            <span className="text-[#00E5FF]">HAL · {mcu.vendor.split(" ")[0]}</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-wider text-[#444]">
            <span>{mcu.core}</span>
            <span className="text-[#222]">·</span>
            <span>{effectiveClockMhz} MHz</span>
            <span className="text-[#222]">·</span>
            <span className="text-[#39FF14]">Schema valid</span>
          </div>
        </footer>
      </div>
    </main>
  )
}
