"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { type Selection, useOmniStore } from "@/lib/store"

/**
 * Inspector — Zone C (240px fixed).
 * No tabs. Stacked collapsible sections. Maximum 4 visible at once.
 * Sections vary per mode but use the same visual primitives.
 */
export function RightPanel() {
  const mode = useOmniStore((s) => s.mode)
  const selection = useOmniStore((s) => s.selection)

  return (
    <aside
      aria-label="Inspector"
      className="flex h-full min-h-0 flex-col bg-[var(--color-background-primary)]"
    >
      <header className="flex h-7 shrink-0 items-center px-3">
        <span className="font-sans text-[10px] tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">
          Inspector
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {(mode === "ide" || mode === "schematic" || mode === "3d" || mode === "deploy") && (
          <ContextSections selection={selection} mode={mode} />
        )}
        {mode === "physics" && <PhysicsInspector selection={selection} />}
        {mode === "debug" && <DebugInspector />}
        {mode === "ml" && <MlInspector />}
      </div>
    </aside>
  )
}

/* ============== Context (file/component/etc.) ============== */

function ContextSections({ selection, mode }: { selection: Selection; mode: string }) {
  if (selection.kind === "file") {
    return (
      <div>
        <Section title="File Info">
          <KV k="Archivo" v={selection.path} />
          <KV k="Tipo" v={selection.lang} />
          <KV k="Tamaño" v={`${(selection.size / 1024).toFixed(2)} KB`} />
          <KV
            k="Estado"
            v={selection.status.toUpperCase()}
            tone={
              selection.status === "compiled"
                ? "success"
                : selection.status === "warning" || selection.status === "modified"
                  ? "warning"
                  : selection.status === "error"
                    ? "danger"
                    : undefined
            }
          />
        </Section>
        <Section title="Estadísticas">
          <KV k="Líneas" v="128" />
          <KV k="Funciones" v="4" />
          <KV k="Includes" v="4" />
        </Section>
        <Section title="Memoria (est.)">
          <MemBar label="Flash" pct={13} value="276 KB" />
          <MemBar label="RAM" pct={71} value="724 KB" tone="warning" />
          <MemBar label="Stack" pct={3} value="1.2 KB" />
        </Section>
        <Section title="Análisis Oracle">
          <KV k="Sugerencias" v="2" tone="info" />
          <KV k="Advertencias" v="1" tone="warning" />
          <KV k="Errores" v="0" />
        </Section>
      </div>
    )
  }

  if (selection.kind === "component") {
    return (
      <div>
        <Section title="Hardware" pill={`${selection.ref} · LIVE`}>
          <KV k="REF" v={selection.ref} tone="info" />
          <KV k="PART" v={selection.part} />
          <KV k="PACKAGE" v={selection.package} />
          <KV k="PINS" v={String(selection.pins)} />
        </Section>
        <Section title="Electrical">
          <KV k="VCC" v="3.3 V" />
          <KV k="IDD avg" v="78 mA" />
          <KV k="IDD peak" v="240 mA" tone="warning" />
          <KV k="TJ max" v="105 °C" />
        </Section>
        {mode === "schematic" && (
          <Section title="Net List">
            <KV k="I2C0_SCL" v="PB6" />
            <KV k="I2C0_SDA" v="PB7" />
            <KV k="UART2_TX" v="PA9" />
            <KV k="UART2_RX" v="PA10" />
          </Section>
        )}
      </div>
    )
  }

  if (selection.kind === "model") {
    return (
      <div>
        <Section title="Model">
          <KV k="NAME" v={selection.name} tone="info" />
          <KV k="ARCH" v={selection.arch} />
          <KV k="QUANT" v={selection.quant} />
          <KV k="ARENA" v={`${selection.arena} KB`} />
        </Section>
      </div>
    )
  }

  if (selection.kind === "register") {
    return (
      <div>
        <Section title="Register">
          <KV k="NAME" v={selection.name} tone="info" />
          <KV k="VALUE" v={`0x${selection.value}`} />
          <KV k="WIDTH" v={`${selection.width} bits`} />
        </Section>
      </div>
    )
  }

  return (
    <div className="p-3 font-sans text-[11px] text-[var(--color-text-secondary)]">
      Select a file, part or model to inspect properties.
    </div>
  )
}

/* ============== Physics Inspector ============== */

function PhysicsInspector({ selection }: { selection: Selection }) {
  const [sensors, setSensors] = useState<Record<string, boolean>>({
    camera: true,
    lidar: true,
    imu: true,
  })

  return (
    <div>
      <Section title="Sensors Enabled" pill={`${Object.values(sensors).filter(Boolean).length} activos`}>
        <SensorRow id="camera" label="CAMERA" part="OV2640" value="28.2 fps" enabled={sensors.camera} onToggle={(v) => setSensors((s) => ({ ...s, camera: v }))} />
        <SensorRow id="lidar" label="LIDAR" part="VL53L1X" value="2361 mm" enabled={sensors.lidar} onToggle={(v) => setSensors((s) => ({ ...s, lidar: v }))} />
        <SensorRow id="imu" label="IMU" part="MPU-6050" value="0.40 g" enabled={sensors.imu} onToggle={(v) => setSensors((s) => ({ ...s, imu: v }))} />
      </Section>

      <Section
        title="Properties"
        pill={selection.kind === "component" ? `${selection.ref} · LIVE` : "scene"}
      >
        {selection.kind === "component" ? (
          <>
            <KV k="REF" v={selection.ref} tone="info" />
            <KV k="PART" v={selection.part} />
            <KV k="PACKAGE" v={selection.package} />
            <KV k="PINS" v={String(selection.pins) || "—"} />
          </>
        ) : (
          <span className="block py-1 font-sans text-[11px] text-[var(--color-text-secondary)]">
            Click sobre un componente del viewport para inspeccionarlo.
          </span>
        )}
      </Section>

      <Section title="Electrical">
        <KV k="VCC" v="3.3 V" />
        <KV k="IDD avg" v="78 mA" />
        <KV k="IDD peak" v="240 mA" tone="warning" />
        <KV k="TJ max" v="105 °C" />
      </Section>

      <Section title="Solver Metrics">
        <SolverMetrics />
      </Section>
    </div>
  )
}

function SensorRow({
  id,
  label,
  part,
  value,
  enabled,
  onToggle,
}: {
  id: string
  label: string
  part: string
  value: string
  enabled: boolean
  onToggle: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!enabled)}
      aria-pressed={enabled}
      className={cn(
        "flex w-full items-baseline justify-between py-1 font-mono text-[11px] transition-colors",
        enabled
          ? "text-[var(--color-text-primary)]"
          : "text-[var(--color-text-secondary)] opacity-60 hover:opacity-100",
      )}
    >
      <span className="flex items-baseline gap-2">
        <span className="tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">{label}</span>
        <span
          className={cn(
            "text-[9px] tracking-wider uppercase",
            enabled ? "text-[var(--color-text-success)]" : "text-[var(--color-text-secondary)]",
          )}
        >
          {enabled ? "ON" : "OFF"}
        </span>
      </span>
      <span className="text-right">
        <span>{enabled ? value : "—"}</span>
        <span className="ml-2 text-[9px] text-[var(--color-text-secondary)]">{part}</span>
      </span>
    </button>
  )
}

function SolverMetrics() {
  const [m, setM] = useState({ fps: 59.8, bodies: 12, contacts: 5, step: 16.57 })
  useEffect(() => {
    const id = setInterval(() => {
      setM({
        fps: 58 + Math.random() * 4,
        bodies: 12,
        contacts: 4 + Math.floor(Math.random() * 3),
        step: 16 + Math.random() * 1.4,
      })
    }, 700)
    return () => clearInterval(id)
  }, [])
  return (
    <>
      <KV k="FPS" v={m.fps.toFixed(1)} />
      <KV k="Bodies" v={String(m.bodies)} />
      <KV k="Contacts" v={String(m.contacts)} />
      <KV k="Step" v={`${m.step.toFixed(2)} ms`} />
    </>
  )
}

/* ============== Debug Inspector ============== */

function DebugInspector() {
  return (
    <div>
      <Section title="CPU State" pill="cortex-m4">
        <KV k="MODE" v="THUMB" />
        <KV k="PRIO" v="0" />
        <KV k="IRQ" v="enabled" tone="success" />
      </Section>
      <Section title="Breakpoints" pill="2">
        <KV k="main.cpp:42" v="hit · 1" tone="info" />
        <KV k="sensor.c:128" v="hit · 0" />
      </Section>
      <Section title="Call Stack">
        <KV k="0" v="loop()" tone="info" />
        <KV k="1" v="ml_model_infer" />
        <KV k="2" v="sensor_read" />
        <KV k="3" v="i2c_read" />
      </Section>
    </div>
  )
}

/* ============== ML Inspector ============== */

function MlInspector() {
  return (
    <div>
      <Section title="Model" pill="anomaly.tflite">
        <KV k="ARCH" v="TCN · 5 layers" />
        <KV k="QUANT" v="INT8" tone="info" />
        <KV k="ARENA" v="256 KB" />
      </Section>
      <Section title="Constraints">
        <KV k="Max RAM" v="128 KB" />
        <KV k="Max Flash" v="512 KB" />
        <KV k="Max Latency" v="50 ms" />
        <KV k="Min Accuracy" v="90 %" />
      </Section>
      <Section title="Recomendaciones IA">
        <Bullet text="Reducir 1 capa Conv2D para bajar 8KB de RAM" />
        <Bullet text="Intentar Int4 quantization" />
        <Bullet text="Considerar pruning" />
      </Section>
    </div>
  )
}

function Bullet({ text }: { text: string }) {
  return (
    <div className="flex gap-2 py-1 font-sans text-[11px] text-[var(--color-text-primary)]">
      <span className="text-[var(--color-text-info)]">·</span>
      <span>{text}</span>
    </div>
  )
}

/* ============== Primitives ============== */

function Section({
  title,
  pill,
  children,
}: {
  title: string
  pill?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <section className="border-b border-[var(--color-border-tertiary)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-full items-center justify-between px-3 text-left"
      >
        <span className="flex items-center gap-1.5">
          {open ? (
            <ChevronDown className="size-3 text-[var(--color-text-secondary)]" strokeWidth={1.5} />
          ) : (
            <ChevronRight className="size-3 text-[var(--color-text-secondary)]" strokeWidth={1.5} />
          )}
          <span className="font-sans text-[10px] tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">
            {title}
          </span>
        </span>
        {pill && (
          <span className="font-mono text-[9px] tracking-wider text-[var(--color-text-secondary)] uppercase">
            {pill}
          </span>
        )}
      </button>
      {open && <div className="px-3 pb-2">{children}</div>}
    </section>
  )
}

type Tone = "info" | "success" | "warning" | "danger" | "muted"

function KV({ k, v, tone }: { k: string; v: string; tone?: Tone }) {
  const cls =
    tone === "info"
      ? "text-[var(--color-text-info)]"
      : tone === "success"
        ? "text-[var(--color-text-success)]"
        : tone === "warning"
          ? "text-[var(--color-text-warning)]"
          : tone === "danger"
            ? "text-[var(--color-text-danger)]"
            : tone === "muted"
              ? "text-[var(--color-text-secondary)]"
              : "text-[var(--color-text-primary)]"
  return (
    <div className="flex items-baseline justify-between gap-2 py-[3px] font-mono text-[11px]">
      <span className="shrink-0 text-[var(--color-text-secondary)]">{k}</span>
      <span className={cn("min-w-0 truncate text-right", cls)}>{v}</span>
    </div>
  )
}

function MemBar({
  label,
  pct,
  value,
  tone,
}: {
  label: string
  pct: number
  value: string
  tone?: "warning" | "danger"
}) {
  const color =
    tone === "danger" || pct > 90
      ? "var(--color-text-danger)"
      : tone === "warning" || pct > 70
        ? "var(--color-text-warning)"
        : "var(--color-text-info)"
  return (
    <div className="py-1">
      <div className="flex items-baseline justify-between font-mono text-[10px] tabular-nums">
        <span className="text-[var(--color-text-secondary)]">{label}</span>
        <span className="text-[var(--color-text-primary)]">{value}</span>
      </div>
      <div className="mt-1 h-[3px] w-full bg-[var(--color-background-canvas)]">
        <div className="h-full" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
