"use client"

import { useMemo, useState, useEffect } from "react"
import { OmniSidebar, type SectionId } from "@/components/omni/sidebar"
import { YamlEditor } from "@/components/omni/yaml-editor"
import { McuViewport } from "@/components/omni/mcu-viewport"
import { OracleStats } from "@/components/omni/oracle-stats"
import { PeripheralTree } from "@/components/omni/peripheral-tree"
import { OracleChat } from "@/components/omni/oracle-chat"
import { useHardware } from "@/hooks/use-hardware"
// ← NUEVO: importar el DebugPanel
// Sin las llaves { }
// Probá con llaves si el componente fue exportado como función nombrada
import { DebugPanel } from "@/components/debug/DebugPanel"

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

# Components section (optional)
components:
  - name: lidar_0
    type: lidar
    pins: [PA5, PA6]
  # Try adding: - name: sensor_0, type: sensor, pins: [PB6]
`

export default function Page() {
  const [yaml, setYaml] = useState(DEFAULT_MANIFEST)
  const [section, setSection] = useState<SectionId>("hardware")
  const [pristine, setPristine] = useState(true)

 // Forzamos que siempre existan los campos, aunque sea vacíos
const [telemetry, setTelemetry] = useState({ 
  cpu_usage: "0%", 
  temp: "0°C" 
})
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/status")
        const data = await res.json()
        setTelemetry(data.telemetria)
      } catch {
        // backend no disponible — silencioso
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleYamlChange = (next: string) => {
    setYaml(next)
    if (pristine) setPristine(false)
  }

  const {
    config, mcu, activePinIds, activeBuses,
    effectiveClockMhz, effectiveFlashKb, effectiveSramKb,
    pinConflicts, busUtilization, components,
  } = useHardware(yaml)

  const oracleSnapshot = useMemo(
    () => ({
      mcuId: mcu.id,
      mcuFullName: mcu.fullName,
      mcuSramKb: mcu.sramKb,
      mcuFlashKb: mcu.flashKb,
      mcuClockMhz: mcu.defaultClockMhz,
      effectiveSramKb,
      effectiveFlashKb,
      effectiveClockMhz,
      activeBuses: Array.from(activeBuses),
      busUtilization,
      pinConflicts,
      components: components.map((c) => ({ name: c.name, type: c.type, bus: c.bus, pins: c.pins })),
      activePinCount: activePinIds.size,
    }),
    [mcu, effectiveSramKb, effectiveFlashKb, effectiveClockMhz,
      activeBuses, busUtilization, pinConflicts, components, activePinIds],
  )

  // ← NUEVO: el canvas central cambia según la sección activa
  const isDebugMode = section === "debug"

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#050505]">
      <OmniSidebar active={section} onSelect={setSection} />

      <div className="flex flex-1 min-w-0 flex-col">
        {/* Header — sin cambios */}
        <header className="flex h-9 shrink-0 items-center justify-between border-b border-[#1A1A1A] bg-[#0A0A0A] px-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white">
              OmniEdge Studio
            </span>
            <span className="text-[#1A1A1A]">/</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#666]">
              {section === "hardware" ? "Hardware-as-Code"
                : section === "debug" ? "Debug · Live Simulator"   // ← NUEVO label
                : section}
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

        {/* ── MODO DEBUG ──────────────────────────────────────────── */}
        {isDebugMode ? (
          // Canvas completo para el panel de debug
          // El DebugPanel ocupa todo el espacio disponible
          <div className="flex flex-1 min-h-0">
            {/* Panel debug a la izquierda — 320px, scrollable */}
            <div className="w-80 shrink-0 border-r border-[#1A1A1A] overflow-hidden">
              <DebugPanel />
            </div>

            {/* Centro — placeholder para el canvas 3D (Fase 3) */}
            <div className="flex-1 min-w-0 flex items-center justify-center">
              <div className="text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#333]">
                  3D Canvas — Fase 3
                </p>
                <p className="font-mono text-[9px] text-[#222] mt-2">
                  Three.js + Rapier physics
                </p>
                <p className="font-mono text-[9px] text-[#222] mt-1">
                  El PCB se renderizará aquí con overlays de temperatura
                </p>
              </div>
            </div>

            {/* Panel derecho — inspector contextual */}
            <div className="w-72 shrink-0 border-l border-[#1A1A1A] flex items-start p-3">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#333] mb-3">
                  Inspector
                </p>
                <p className="font-mono text-[9px] text-[#222]">
                  Seleccioná un componente en el canvas 3D para ver sus propiedades aquí.
                </p>
              </div>
            </div>
          </div>

        ) : (
          // ── MODO NORMAL (hardware, simulation, etc.) — sin cambios ──
          <div className="flex flex-1 min-h-0 flex-col">
            <div className="flex flex-1 min-h-0">
              {/* Left — YAML editor */}
              <div className="flex w-[420px] shrink-0 flex-col border-r border-[#1A1A1A]">
                <YamlEditor value={yaml} onChange={handleYamlChange} dirty={!pristine} />
              </div>

              {/* Center — MCU viewport */}
              <div className="flex-1 min-w-0">
                <McuViewport
                  mcu={mcu}
                  activePinIds={activePinIds}
                  activeBuses={activeBuses}
                  components={components}
                  pinConflicts={pinConflicts}
                />
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

            {/* Bottom — Peripheral Tree + Oracle Chat */}
            <div className="flex h-64 shrink-0 border-t border-[#1A1A1A]">
              <div className="flex-1 min-w-0 border-r border-[#1A1A1A]">
                <PeripheralTree
                  busUtilization={busUtilization}
                  pinConflicts={pinConflicts}
                  components={components}
                />
              </div>
              <div className="w-[440px] shrink-0">
                <OracleChat snapshot={oracleSnapshot} />
              </div>
            </div>
          </div>
        )}

        {/* Status bar — sin cambios */}
        <footer className="flex h-6 shrink-0 items-center justify-between border-t border-[#1A1A1A] bg-[#0A0A0A] px-3">
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-wider text-[#444]">
            <span>OmniEdge Studio v0.1-beta</span>
            <span className="text-[#222]">·</span>
            <span className="text-[#39FF14] animate-pulse">LIVE</span>
            <span className="text-[#222]">·</span>
            <span className="text-[#00E5FF]">CPU: {telemetry?.cpu_usage || "0%"}</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-wider text-[#444]">
            <span>
              TEMP:{" "}
              <span className={parseInt(telemetry?.temp || "0") > 70 ? "text-red-500" : "text-[#39FF14]"}>
  {telemetry?.temp || "0°C"}
</span>
            </span>
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