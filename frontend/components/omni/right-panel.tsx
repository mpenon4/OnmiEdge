"use client"

import { useEffect, useState } from "react"

export function RightPanel() {
  return (
    <aside
      aria-label="Telemetry inspector"
      className="flex h-full flex-col border-l border-border bg-card"
    >
      <div className="flex h-8 shrink-0 items-center border-b border-border px-3">
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Inspector</span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-primary">
          <span className="block size-1.5 bg-primary signal-live" aria-hidden="true" />
          LIVE
        </span>
      </div>

      <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
        <Section title="Device · ESP32-S3 / 0xA4C1">
          <KV k="UPTIME" v="04:23:17" />
          <KV k="MODE" v="INFERENCE" highlight />
          <KV k="CHANNEL" v="6 (2.437 GHz)" />
          <KV k="RSSI" v="-58 dBm" />
        </Section>

        <TelemetrySection />

        <TinyMLSection />

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
          <KV k="0x3C SSD1306" v="—" muted />
        </Section>
      </div>
    </aside>
  )
}

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

function KV({ k, v, highlight, muted }: { k: string; v: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-0.5 font-mono text-[11px]">
      <span className="text-muted-foreground">{k}</span>
      <span
        className={
          highlight ? "text-primary" : muted ? "text-muted-foreground/60" : "text-foreground"
        }
      >
        {v}
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
        <div
          className={pct > 80 ? "h-full bg-destructive" : "h-full bg-primary"}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/* ---------- Telemetry (live) ---------- */

function TelemetrySection() {
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
    <Section title="Telemetry · 1Hz">
      <Metric k="TEMP" v={t.temp.toFixed(2)} unit="°C" />
      <Metric k="HUM" v={t.hum.toFixed(1)} unit="%" />
      <Metric k="ACCEL" v={t.accel.toFixed(3)} unit="g" />
      <Metric k="INFER" v={t.lat.toFixed(1)} unit="ms" highlight />
    </Section>
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

/* ---------- TinyML ---------- */

function TinyMLSection() {
  return (
    <Section title="TinyML · vision_v3.tflite">
      <KV k="ARCH" v="MobileNet-v2 · INT8" />
      <KV k="ACCURACY" v="93.2%" highlight />
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
