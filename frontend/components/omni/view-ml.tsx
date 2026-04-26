"use client"

import { useEffect, useState } from "react"
import { useOmniStore } from "@/lib/store"

const HISTORY_LEN = 80

export function ViewML() {
  const setSelection = useOmniStore((s) => s.setSelection)
  const isSimulating = useOmniStore((s) => s.isSimulating)
  const [history, setHistory] = useState<number[]>(() =>
    Array.from({ length: HISTORY_LEN }, () => 11 + Math.random() * 3),
  )
  const [latest, setLatest] = useState({ lat: 12.4, ram: 286, flash: 1840, acc: 93.2 })

  useEffect(() => {
    const id = setInterval(
      () => {
        setLatest((prev) => {
          const next = {
            lat: Math.max(8, Math.min(22, prev.lat + (Math.random() - 0.5) * 1.6)),
            ram: Math.round(280 + Math.random() * 12),
            flash: 1840,
            acc: 92.5 + Math.random() * 1.4,
          }
          setHistory((h) => [...h.slice(1), next.lat])
          return next
        })
      },
      isSimulating ? 350 : 900,
    )
    return () => clearInterval(id)
  }, [isSimulating])

  return (
    <div className="grid h-full min-h-0" style={{ gridTemplateRows: "32px 1fr 28px" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3">
        <span className="font-sans text-[10px] tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">
          ML Inference Console
        </span>
        <button
          type="button"
          onClick={() =>
            setSelection({
              kind: "model",
              name: "anomaly.tflite",
              arch: "TCN · 5 layers",
              quant: "INT8",
              arena: 256,
            })
          }
          className="font-mono text-[11px] text-[var(--color-text-primary)] hover:text-[var(--color-text-info)]"
        >
          anomaly.tflite
        </button>
        <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
          TCN · INT8 · arena 256 KB
        </span>
        <span className="ml-auto font-mono text-[10px] text-[var(--color-text-secondary)]">
          target esp32-s3 @240MHz · cpu only
        </span>
      </div>

      {/* Body */}
      <div className="grid min-h-0 bg-[var(--color-background-canvas)]" style={{ gridTemplateColumns: "260px 1fr" }}>
        <aside className="overflow-y-auto border-r border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]">
          <MetricRow label="Latency" value={latest.lat.toFixed(1)} unit="ms" tone="info" />
          <MetricRow label="RAM" value={`${latest.ram}`} unit="KB" />
          <MetricRow label="Flash" value={`${latest.flash}`} unit="KB" />
          <MetricRow label="Accuracy" value={latest.acc.toFixed(1)} unit="%" tone="success" />
          <MetricRow label="OPs" value="14.2" unit="MMACs" />
          <MetricRow label="Power" value="178" unit="mW" />
          <div className="border-t border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-3 py-1.5 font-sans text-[10px] tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">
            Layer breakdown
          </div>
          {[
            ["conv1d_1", 2.1],
            ["conv1d_2", 3.4],
            ["dense_3", 4.2],
            ["softmax", 0.6],
          ].map(([name, ms]) => (
            <div
              key={String(name)}
              className="flex items-baseline justify-between border-b border-[var(--color-border-tertiary)] px-3 py-1 font-mono text-[11px]"
            >
              <span className="text-[var(--color-text-secondary)]">{name}</span>
              <span className="text-[var(--color-text-primary)] tabular-nums">{(ms as number).toFixed(2)} ms</span>
            </div>
          ))}
        </aside>

        <div className="grid min-h-0" style={{ gridTemplateRows: "1fr auto" }}>
          <LatencyChart data={history} latest={latest.lat} />
          <div className="border-t border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3 py-2 font-sans text-[11px] text-[var(--color-text-secondary)]">
            <span className="font-mono text-[var(--color-text-primary)]">analyze:</span> dense_3 dominates inference
            (33% of total). INT8 → INT4 quantization estimated to reduce arena to{" "}
            <span className="text-[var(--color-text-success)]">192 KB</span> and latency to{" "}
            <span className="text-[var(--color-text-success)]">~9.2 ms</span> at the cost of ~0.6% accuracy.
          </div>
        </div>
      </div>

      {/* Status 28px */}
      <div className="flex items-center justify-between border-t border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3 font-mono text-[10px] text-[var(--color-text-secondary)]">
        <span>WINDOW · {HISTORY_LEN} samples</span>
        <span>
          THRESHOLD <span className="text-[var(--color-text-warning)]">15 ms</span>
        </span>
      </div>
    </div>
  )
}

function MetricRow({
  label,
  value,
  unit,
  tone,
}: {
  label: string
  value: string
  unit: string
  tone?: "info" | "success" | "warning"
}) {
  const cls =
    tone === "info"
      ? "text-[var(--color-text-info)]"
      : tone === "success"
        ? "text-[var(--color-text-success)]"
        : tone === "warning"
          ? "text-[var(--color-text-warning)]"
          : "text-[var(--color-text-primary)]"
  return (
    <div className="flex items-baseline justify-between border-b border-[var(--color-border-tertiary)] px-3 py-2 font-mono text-[11px]">
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <span>
        <span className={cls}>{value}</span>
        <span className="ml-1 text-[10px] text-[var(--color-text-secondary)]">{unit}</span>
      </span>
    </div>
  )
}

function LatencyChart({ data, latest }: { data: number[]; latest: number }) {
  const min = 6
  const max = 24
  const w = 100
  const h = 100
  const stepX = w / (data.length - 1)
  const points = data.map((v, i) => `${(i * stepX).toFixed(2)},${(h - ((v - min) / (max - min)) * h).toFixed(2)}`)

  return (
    <div className="relative bg-[var(--color-background-canvas)]">
      <div className="pointer-events-none absolute left-3 top-3 z-10 font-mono text-[10px] tracking-wider text-[var(--color-text-secondary)]">
        <div>LATENCY · ms over time</div>
        <div className="mt-0.5">
          last <span className="text-[var(--color-text-info)] tabular-nums">{latest.toFixed(1)} ms</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {[0.25, 0.5, 0.75].map((p) => (
          <line key={p} x1={0} x2={w} y1={p * h} y2={p * h} stroke="#1c2228" strokeWidth="0.3" />
        ))}
        <line
          x1={0}
          x2={w}
          y1={h - ((15 - min) / (max - min)) * h}
          y2={h - ((15 - min) / (max - min)) * h}
          stroke="#ea7916"
          strokeWidth="0.4"
          strokeDasharray="1.5 1.5"
        />
        <polygon points={`0,${h} ${points.join(" ")} ${w},${h}`} fill="#378add" fillOpacity="0.10" />
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#378add"
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={(data.length - 1) * stepX}
          cy={h - ((latest - min) / (max - min)) * h}
          r="0.8"
          fill="#378add"
        />
      </svg>

      <div className="pointer-events-none absolute inset-y-0 right-2 flex flex-col justify-between py-3 font-mono text-[9px] text-[var(--color-text-secondary)] tabular-nums">
        <span>{max} ms</span>
        <span>{((max + min) / 2).toFixed(0)} ms</span>
        <span>{min} ms</span>
      </div>
    </div>
  )
}
