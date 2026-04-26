"use client"

import { useEffect, useState } from "react"
import { Activity, FileText, Sliders } from "lucide-react"
import { cn } from "@/lib/utils"
import { type Selection, useOmniStore } from "@/lib/store"

type InspectorTab = "properties" | "metrics" | "logs"

const TABS: { id: InspectorTab; label: string; icon: React.ReactNode }[] = [
  { id: "properties", label: "Properties", icon: <Sliders className="size-3" strokeWidth={1.5} /> },
  { id: "metrics", label: "Metrics", icon: <Activity className="size-3" strokeWidth={1.5} /> },
  { id: "logs", label: "Logs", icon: <FileText className="size-3" strokeWidth={1.5} /> },
]

export function RightPanel() {
  const [tab, setTab] = useState<InspectorTab>("properties")
  const selection = useOmniStore((s) => s.selection)

  return (
    <aside aria-label="Inspector" className="flex h-full flex-col border-l border-border bg-card">
      {/* Tabs */}
      <div className="flex h-9 shrink-0 items-stretch border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 border-r border-border font-mono text-[10px] tracking-[0.18em] uppercase transition-colors last:border-r-0",
              tab === t.id
                ? "bg-background text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
            aria-pressed={tab === t.id}
          >
            <span aria-hidden="true">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Selection breadcrumb */}
      <div className="flex h-7 shrink-0 items-center justify-between border-b border-border bg-secondary px-3 font-mono text-[10px] tracking-wider">
        <SelectionLabel selection={selection} />
        <span className="flex items-center gap-1.5 text-primary">
          <span className="block size-1.5 bg-primary signal-live" aria-hidden="true" />
          LIVE
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "properties" && <PropertiesTab selection={selection} />}
        {tab === "metrics" && <MetricsTab />}
        {tab === "logs" && <LogsTab />}
      </div>
    </aside>
  )
}

function SelectionLabel({ selection }: { selection: Selection }) {
  if (selection.kind === "file")
    return (
      <span className="text-muted-foreground">
        FILE · <span className="text-foreground">{selection.path}</span>
      </span>
    )
  if (selection.kind === "component")
    return (
      <span className="text-muted-foreground">
        PART · <span className="text-foreground">{selection.ref} {selection.part}</span>
      </span>
    )
  if (selection.kind === "model")
    return (
      <span className="text-muted-foreground">
        MODEL · <span className="text-foreground">{selection.name}</span>
      </span>
    )
  if (selection.kind === "register")
    return (
      <span className="text-muted-foreground">
        REGISTER · <span className="text-foreground">{selection.name}</span>
      </span>
    )
  return <span className="text-muted-foreground">no selection</span>
}

/* ========== PROPERTIES ========== */

function PropertiesTab({ selection }: { selection: Selection }) {
  if (selection.kind === "file") {
    return (
      <div className="divide-y divide-border">
        <Section title="File">
          <KV k="PATH" v={selection.path} />
          <KV k="LANG" v={selection.lang} />
          <KV k="SIZE" v={`${(selection.size / 1024).toFixed(2)} KB`} />
          <KV
            k="STATUS"
            v={selection.status.toUpperCase()}
            tone={
              selection.status === "compiled"
                ? "primary"
                : selection.status === "warning"
                  ? "warning"
                  : selection.status === "error"
                    ? "error"
                    : undefined
            }
          />
        </Section>
        <Section title="Compilation">
          <KV k="UNITS" v="14 / 14" tone="primary" />
          <KV k="WARN" v="1" tone="warning" />
          <KV k="ERR" v="0" />
          <KV k="LAST" v="14:22:03 UTC" />
        </Section>
      </div>
    )
  }

  if (selection.kind === "component") {
    return (
      <div className="divide-y divide-border">
        <Section title="Hardware">
          <KV k="REF" v={selection.ref} tone="primary" />
          <KV k="PART" v={selection.part} />
          <KV k="PACKAGE" v={selection.package} />
          <KV k="PINS" v={String(selection.pins)} />
        </Section>
        <Section title="Electrical">
          <KV k="VCC" v="3.3 V" />
          <KV k="IDD avg" v="78 mA" />
          <KV k="IDD peak" v="240 mA" />
          <KV k="TJ max" v="105 °C" />
        </Section>
      </div>
    )
  }

  if (selection.kind === "model") {
    return (
      <div className="divide-y divide-border">
        <Section title="Model">
          <KV k="NAME" v={selection.name} tone="primary" />
          <KV k="ARCH" v={selection.arch} />
          <KV k="QUANT" v={selection.quant} />
          <KV k="ARENA" v={`${selection.arena} KB`} />
        </Section>
      </div>
    )
  }

  if (selection.kind === "register") {
    return (
      <div className="divide-y divide-border">
        <Section title="Register">
          <KV k="NAME" v={selection.name} tone="primary" />
          <KV k="VALUE" v={`0x${selection.value}`} />
          <KV k="WIDTH" v={`${selection.width} bits`} />
          <KV k="ACCESS" v="RW" />
        </Section>
      </div>
    )
  }

  return (
    <div className="p-4 font-mono text-[11px] text-muted-foreground">
      Select a file, part, model or register to inspect its properties.
    </div>
  )
}

/* ========== METRICS (live telemetry) ========== */

function MetricsTab() {
  const [t, setT] = useState({ temp: 24.6, hum: 41.2, accel: 0.98, lat: 12.4 })
  useEffect(() => {
    const id = setInterval(() => {
      setT({
        temp: 24 + Math.random() * 1.4,
        hum: 40 + Math.random() * 3,
        accel: 0.9 + Math.random() * 0.2,
        lat: 10 + Math.random() * 4,
      })
    }, 1100)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="divide-y divide-border">
      <Section title="Device · ESP32-S3 / 0xA4C1">
        <KV k="UPTIME" v="04:23:17" />
        <KV k="MODE" v="INFERENCE" tone="primary" />
        <KV k="CHANNEL" v="6 (2.437 GHz)" />
        <KV k="RSSI" v="-58 dBm" />
      </Section>

      <Section title="Telemetry · 1Hz">
        <Metric k="TEMP" v={t.temp.toFixed(2)} unit="°C" />
        <Metric k="HUM" v={t.hum.toFixed(1)} unit="%" />
        <Metric k="ACCEL" v={t.accel.toFixed(3)} unit="g" />
        <Metric k="INFER" v={t.lat.toFixed(1)} unit="ms" highlight />
      </Section>

      <Section title="TinyML · vision_v3.tflite">
        <KV k="ARCH" v="MobileNet-v2 · INT8" />
        <KV k="ACCURACY" v="93.2%" tone="primary" />
        <KV k="ARENA" v="256 KB" />
        <KV k="OPS" v="14.2 MMACs / frame" />
        <KV k="LATENCY" v="12.4 ms (CPU @240MHz)" />
        <KV k="POWER" v="178 mW (avg)" />
        <div className="mt-2">
          <div className="mb-1 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Confusion (top 4)
          </div>
          <ConfusionRow label="person" pct={94} />
          <ConfusionRow label="vehicle" pct={88} />
          <ConfusionRow label="signage" pct={71} />
          <ConfusionRow label="other" pct={62} />
        </div>
      </Section>

      <Section title="Memory map">
        <MemBar label="DRAM" used={134} total={512} unit="KB" />
        <MemBar label="IRAM" used={86} total={128} unit="KB" />
        <MemBar label="FLASH" used={1840} total={4096} unit="KB" />
        <MemBar label="PSRAM" used={2100} total={8192} unit="KB" />
      </Section>

      <Section title="Sensor bus · I²C @ 400kHz">
        <KV k="0x76 BME280" v="OK" />
        <KV k="0x68 MPU6050" v="OK" />
        <KV k="0x29 VL53L1X" v="OK" />
        <KV k="0x3C SSD1306" v="—" tone="muted" />
      </Section>
    </div>
  )
}

/* ========== LOGS (filtered subset) ========== */

function LogsTab() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1500)
    return () => clearInterval(id)
  }, [])

  const lines = [
    { ts: "14:22:01", lvl: "info", src: "build", msg: "platformio · linking firmware.elf (1.84 MB)" },
    { ts: "14:22:03", lvl: "ok", src: "build", msg: "OK · firmware ready · 38% RAM · 45% Flash" },
    { ts: "14:22:08", lvl: "info", src: "device", msg: "esp32-s3@A4C1 connected · COM7 · 921600" },
    { ts: "14:22:09", lvl: "ok", src: "ota", msg: "flash complete · verified · reset issued" },
    { ts: "14:22:14", lvl: "warn", src: "tinyml", msg: "model arena utilization at 87% — quantize dense_3" },
    { ts: "14:22:18", lvl: "info", src: "mesh", msg: "esp-now joined · channel 6 · 4 peers" },
    { ts: "14:22:24", lvl: "info", src: "i2c", msg: "BME280 ok · 24.6 °C · 41.2 %" },
    {
      ts: "14:22:30",
      lvl: tick % 3 === 0 ? "warn" : "info",
      src: "rssi",
      msg: tick % 3 === 0 ? "RSSI -72 dBm — degraded" : "RSSI -58 dBm — nominal",
    },
  ]

  const colorOf: Record<string, string> = {
    info: "text-muted-foreground",
    ok: "text-primary",
    warn: "text-[var(--warning)]",
    error: "text-destructive",
  }

  return (
    <div className="px-3 py-2 font-mono text-[11px] leading-5">
      {lines.map((l, i) => (
        <div key={i} className="grid grid-cols-[60px_60px_1fr] gap-2">
          <span className="text-muted-foreground/60 tabular-nums">[{l.ts}]</span>
          <span className={cn("uppercase tracking-wider text-[10px]", colorOf[l.lvl])}>{l.src}</span>
          <span className="text-foreground/90">{l.msg}</span>
        </div>
      ))}
    </div>
  )
}

/* ========== Reusable cells ========== */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <header className="flex h-7 items-center bg-secondary px-3">
        <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">{title}</span>
      </header>
      <div className="px-3 py-2">{children}</div>
    </section>
  )
}

type Tone = "primary" | "warning" | "error" | "muted"

function KV({ k, v, tone }: { k: string; v: string; tone?: Tone }) {
  const cls =
    tone === "primary"
      ? "text-primary"
      : tone === "warning"
        ? "text-[var(--warning)]"
        : tone === "error"
          ? "text-destructive"
          : tone === "muted"
            ? "text-muted-foreground/60"
            : "text-foreground"
  return (
    <div className="flex items-baseline justify-between py-0.5 font-mono text-[11px]">
      <span className="text-muted-foreground">{k}</span>
      <span className={cls}>{v}</span>
    </div>
  )
}

function Metric({ k, v, unit, highlight }: { k: string; v: string; unit: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-0.5 font-mono text-[11px] tabular-nums">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right">
        <span className={highlight ? "text-primary" : "text-foreground"}>{v}</span>
        <span className="ml-1 text-[10px] text-muted-foreground">{unit}</span>
      </span>
    </div>
  )
}

function MemBar({ label, used, total, unit }: { label: string; used: number; total: number; unit: string }) {
  const pct = Math.min(100, (used / total) * 100)
  return (
    <div className="py-1">
      <div className="flex items-baseline justify-between font-mono text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground">
          {used}
          <span className="text-muted-foreground">
            {" / "}
            {total} {unit}
          </span>
        </span>
      </div>
      <div className="mt-1 h-1 w-full bg-background" role="progressbar" aria-valuenow={used} aria-valuemax={total}>
        <div className={pct > 80 ? "h-full bg-destructive" : "h-full bg-primary"} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function ConfusionRow({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2 py-0.5 font-mono text-[10px]">
      <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
      <div className="h-1 flex-1 bg-background">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-foreground tabular-nums">{pct}%</span>
    </div>
  )
}
