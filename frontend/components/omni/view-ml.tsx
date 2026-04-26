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
    const id = setInterval(() => {
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
    }, isSimulating ? 350 : 900)
    return () => clearInterval(id)
  }, [isSimulating])

  return (
    <div className="grid h-full grid-rows-[auto_1fr] bg-background">
      {/* Header / model context */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-card px-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            ML Inference Console
          </span>
          <span className="h-4 w-px bg-border" aria-hidden="true" />
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
            className="font-mono text-[11px] text-foreground hover:text-primary"
          >
            anomaly.tflite
          </button>
          <span className="font-mono text-[10px] text-muted-foreground">
            TCN · 5 layers · INT8 · arena 256 KB
          </span>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">
          target esp32-s3 @240MHz · cpu only
        </div>
      </div>

      {/* Body: metrics + chart */}
      <div className="grid min-h-0 grid-cols-[280px_1fr]">
        {/* Metrics */}
        <aside className="border-r border-border bg-card">
          <MetricRow label="Latency" value={latest.lat.toFixed(1)} unit="ms" emphasis />
          <MetricRow label="RAM" value={`${latest.ram}`} unit="KB" />
          <MetricRow label="Flash" value={`${latest.flash}`} unit="KB" />
          <MetricRow label="Accuracy" value={latest.acc.toFixed(1)} unit="%" emphasis />
          <MetricRow label="OPs" value="14.2" unit="MMACs" />
          <MetricRow label="Power" value="178" unit="mW" />
          <div className="border-t border-border bg-secondary px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Layer breakdown
          </div>
          {[
            ["conv1d_1", 2.1],
            ["conv1d_2", 3.4],
            ["dense_3", 4.2],
            ["softmax", 0.6],
          ].map(([name, ms]) => (
            <div key={String(name)} className="flex items-baseline justify-between border-b border-border px-3 py-1 font-mono text-[11px]">
              <span className="text-muted-foreground">{name}</span>
              <span className="text-foreground tabular-nums">{(ms as number).toFixed(2)} ms</span>
            </div>
          ))}
        </aside>

        {/* Latency chart */}
        <div className="grid grid-rows-[1fr_auto]">
          <LatencyChart data={history} latest={latest.lat} />
          <div className="border-t border-border bg-card px-3 py-2 font-mono text-[10px] text-muted-foreground">
            <span className="text-foreground">analyze:</span> dense_3 dominates inference (33% of total).
            INT8 → INT4 quantization estimated to reduce arena to <span className="text-primary">192 KB</span>{" "}
            and latency to <span className="text-primary">~9.2 ms</span> at the cost of ~0.6% accuracy.
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricRow({
  label,
  value,
  unit,
  emphasis,
}: {
  label: string
  value: string
  unit: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-border px-3 py-2 font-mono text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span>
        <span className={emphasis ? "text-primary" : "text-foreground"}>{value}</span>
        <span className="ml-1 text-[10px] text-muted-foreground">{unit}</span>
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
  const points = data.map((v, i) => {
    const x = i * stepX
    const y = h - ((v - min) / (max - min)) * h
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })

  return (
    <div className="relative bg-background">
      <div className="absolute left-3 top-3 font-mono text-[10px] tracking-wider text-muted-foreground">
        <div>LATENCY · ms over time</div>
        <div className="mt-0.5">
          last <span className="text-primary tabular-nums">{latest.toFixed(1)} ms</span> · window {data.length} samples
        </div>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-label="Inference latency chart"
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((p) => (
          <line key={p} x1={0} x2={w} y1={p * h} y2={p * h} stroke="#1c2228" strokeWidth="0.3" />
        ))}
        {/* Threshold (15 ms) */}
        <line
          x1={0}
          x2={w}
          y1={h - ((15 - min) / (max - min)) * h}
          y2={h - ((15 - min) / (max - min)) * h}
          stroke="#ff8c42"
          strokeWidth="0.4"
          strokeDasharray="1.5 1.5"
        />
        {/* Area under */}
        <polygon
          points={`0,${h} ${points.join(" ")} ${w},${h}`}
          fill="#00d4a8"
          fillOpacity="0.10"
        />
        {/* Line */}
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#00d4a8"
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
        />
        {/* Last dot */}
        <circle
          cx={(data.length - 1) * stepX}
          cy={h - ((latest - min) / (max - min)) * h}
          r="0.8"
          fill="#00d4a8"
        />
      </svg>

      {/* Y axis labels */}
      <div className="pointer-events-none absolute inset-y-0 right-2 flex flex-col justify-between py-3 font-mono text-[9px] text-muted-foreground tabular-nums">
        <span>{max} ms</span>
        <span>{((max + min) / 2).toFixed(0)} ms</span>
        <span>{min} ms</span>
      </div>
    </div>
  )
}
