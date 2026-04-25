"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { TopBar } from "@/components/top-bar"
import { YamlEditor } from "@/components/yaml-editor"
import { McuSchematic } from "@/components/mcu-schematic"
import { OracleChat, type OracleMessage } from "@/components/oracle-chat"
import { MCU_MODELS, type BusId } from "@/lib/mcu-data"
import { parseManifest } from "@/lib/yaml-parser"

const BACKEND_URL = "http://localhost:8000/api/oracle"

const DEFAULT_MANIFEST = `# omniedge :: hardware_manifest.yaml
# Live silicon configuration. Edit any value to reconfigure the chip.

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

components:
  - name: lidar_0
    type: lidar
    pins: [PA5, PA6]
  - name: imu_0
    type: imu
    pins: [PB6, PB7]
`

let _id = 0
const nextId = () => `m_${Date.now()}_${++_id}`

export default function Page() {
  const [yaml, setYaml] = useState(DEFAULT_MANIFEST)
  const [modelId, setModelId] = useState<string>("STM32H7")
  const [messages, setMessages] = useState<OracleMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  // Debounce timer for auto-syncing YAML changes to the backend.
  const yamlSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Parse manifest on every change.
  const parsed = useMemo(() => parseManifest(yaml), [yaml])

  // Resolve effective MCU: top-bar selector wins, but if YAML defines a known
  // mcu_id, the YAML value drives the selector.
  const effectiveModelId = useMemo(() => {
    if (parsed.mcuId && MCU_MODELS[parsed.mcuId]) return parsed.mcuId
    return modelId
  }, [parsed.mcuId, modelId])

  const mcu = MCU_MODELS[effectiveModelId] ?? MCU_MODELS.STM32H7

  // Active buses
  const activeBuses = useMemo<Set<BusId>>(() => {
    const s = new Set<BusId>()
    ;(Object.keys(parsed.buses) as BusId[]).forEach((k) => {
      if (parsed.buses[k]) s.add(k)
    })
    return s
  }, [parsed.buses])

  // Component-pin highlights
  const highlightedPinIds = useMemo(() => {
    const s = new Set<string>()
    parsed.components.forEach((c) => c.pins.forEach((p) => s.add(p)))
    return s
  }, [parsed.components])

  // ----- Oracle dispatch -----

  const callOracle = useCallback(
    async (
      question: string | null,
      options: { yamlSnapshot: string; trigger: "user" | "yaml-sync" } = {
        yamlSnapshot: yaml,
        trigger: "user",
      },
    ) => {
      // Abort any in-flight request
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl

      setLoading(true)
      setLastError(null)

      try {
        const res = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            yaml: options.yamlSnapshot,
            question,
            model: effectiveModelId,
            trigger: options.trigger,
          }),
          signal: ctrl.signal,
        })

        if (!res.ok) {
          throw new Error(`Backend responded ${res.status}`)
        }

        // Try to parse JSON; tolerate text fallbacks.
        const text = await res.text()
        let payload: { answer?: string; tokens_out?: number } = {}
        try {
          payload = JSON.parse(text)
        } catch {
          payload = { answer: text }
        }

        const answer =
          payload.answer ?? "[oracle returned an empty payload]"

        if (options.trigger === "user") {
          setMessages((prev) => [
            ...prev,
            {
              id: nextId(),
              role: "oracle",
              content: answer,
              timestamp: Date.now(),
              meta: { tokensOut: payload.tokens_out },
            },
          ])
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        const errMsg =
          err instanceof Error ? err.message : "Unknown error reaching oracle backend"
        setLastError(`POST ${BACKEND_URL} → ${errMsg}`)

        if (options.trigger === "user") {
          setMessages((prev) => [
            ...prev,
            {
              id: nextId(),
              role: "oracle",
              content: `[oracle unreachable] Failed to POST to ${BACKEND_URL}.\nReason: ${errMsg}\n\nMake sure the silicon-agent backend is running on :8000.`,
              timestamp: Date.now(),
              meta: { error: true },
            },
          ])
        }
      } finally {
        setLoading(false)
      }
    },
    [effectiveModelId, yaml],
  )

  // ----- Chat send handler -----

  const handleSend = useCallback(
    (text: string) => {
      const userMsg: OracleMessage = {
        id: nextId(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, userMsg])
      callOracle(text, { yamlSnapshot: yaml, trigger: "user" })
    },
    [callOracle, yaml],
  )

  // ----- YAML change handler with debounced auto-sync to backend -----

  const handleYamlChange = useCallback(
    (next: string) => {
      setYaml(next)
      if (yamlSyncTimer.current) clearTimeout(yamlSyncTimer.current)
      yamlSyncTimer.current = setTimeout(() => {
        callOracle(null, { yamlSnapshot: next, trigger: "yaml-sync" })
      }, 800)
    },
    [callOracle],
  )

  // Cleanup
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (yamlSyncTimer.current) clearTimeout(yamlSyncTimer.current)
    }
  }, [])

  // Top-bar model change → patch YAML
  const handleModelChange = useCallback((id: string) => {
    setModelId(id)
    setYaml((prev) => {
      // Replace existing mcu_id line; if absent, prepend.
      if (/^mcu_id\s*:.*$/m.test(prev)) {
        return prev.replace(/^mcu_id\s*:.*$/m, `mcu_id: ${id}`)
      }
      return `mcu_id: ${id}\n${prev}`
    })
  }, [])

  const status: "idle" | "loading" | "error" | "ready" = loading
    ? "loading"
    : lastError
      ? "error"
      : messages.length > 0
        ? "ready"
        : "idle"

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-[#050505]">
      <TopBar modelId={effectiveModelId} onModelChange={handleModelChange} status={status} />

      <div className="flex flex-1 min-h-0">
        {/* LEFT — YAML editor */}
        <div className="flex w-[420px] shrink-0 flex-col border-r border-[#1A1A1A]">
          <YamlEditor value={yaml} onChange={handleYamlChange} />
        </div>

        {/* CENTER — MCU schematic */}
        <div className="min-w-0 flex-1">
          <McuSchematic
            mcu={mcu}
            activeBuses={activeBuses}
            highlightedPinIds={highlightedPinIds}
          />
        </div>

        {/* RIGHT — Oracle chat */}
        <div className="flex w-[420px] shrink-0 flex-col border-l border-[#1A1A1A]">
          <OracleChat
            messages={messages}
            onSend={handleSend}
            loading={loading}
            modelId={effectiveModelId}
            backendUrl={BACKEND_URL}
            lastError={lastError}
          />
        </div>
      </div>

      {/* Bottom status bar */}
      <footer className="flex h-6 shrink-0 items-center justify-between border-t border-[#1A1A1A] bg-[#0A0A0A] px-3 font-mono text-[9px] uppercase tracking-wider text-[#444]">
        <div className="flex items-center gap-3">
          <span>OmniEdge Studio v0.1-beta</span>
          <span className="text-[#222]">·</span>
          <span>silicon-intelligence runtime</span>
          <span className="text-[#222]">·</span>
          <span className="text-[#00E5FF]">HAL · {mcu.vendor.split(" ")[0]}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{mcu.core}</span>
          <span className="text-[#222]">·</span>
          <span>{parsed.clockMhz ?? mcu.defaultClockMhz} MHz</span>
          <span className="text-[#222]">·</span>
          <span>flash {parsed.flashKb ?? mcu.flashKb}kb</span>
          <span className="text-[#222]">·</span>
          <span>sram {parsed.sramKb ?? mcu.sramKb}kb</span>
          <span className="text-[#222]">·</span>
          <span className="text-[#39FF14]">schema valid</span>
        </div>
      </footer>
    </main>
  )
}
