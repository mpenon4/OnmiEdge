"use client"

import { useState } from "react"
import { Camera, Cpu, Radio, Waves } from "lucide-react"
import { cn } from "@/lib/utils"

type Sensor = { id: string; label: string; unit: string; value: string; icon: React.ReactNode }

export function ViewPhysicsPanel() {
  const [temp, setTemp] = useState(24)
  const [vib, setVib] = useState(0.4)
  const [emi, setEmi] = useState(12)
  const [sensors, setSensors] = useState<Record<string, boolean>>({
    camera: true,
    lidar: true,
    imu: true,
  })

  // Live derived values driven by sliders
  const sensorReadout: Sensor[] = [
    {
      id: "camera",
      label: "OV2640",
      unit: "fps",
      value: (30 - emi * 0.15).toFixed(1),
      icon: <Camera className="size-3" strokeWidth={1.5} />,
    },
    {
      id: "lidar",
      label: "VL53L1X",
      unit: "mm",
      value: Math.round(2400 - vib * 120 + (Math.random() - 0.5) * 40).toString(),
      icon: <Radio className="size-3" strokeWidth={1.5} />,
    },
    {
      id: "imu",
      label: "MPU-6050",
      unit: "g",
      value: vib.toFixed(2),
      icon: <Waves className="size-3" strokeWidth={1.5} />,
    },
  ]

  return (
    <div className="grid grid-cols-[1fr_360px] gap-3 border-b border-border bg-card p-3">
      {/* Sliders */}
      <div className="grid grid-cols-3 gap-3">
        <Slider label="Temperature" unit="°C" min={-20} max={85} value={temp} onChange={setTemp}
                color="var(--warning)" />
        <Slider label="Vibration" unit="g" min={0} max={5} step={0.05} value={vib} onChange={setVib}
                color="var(--telemetry)" />
        <Slider label="EM interference" unit="dBm" min={0} max={80} value={emi} onChange={setEmi}
                color="var(--info)" />
      </div>

      {/* Sensors enabled */}
      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <Cpu className="size-3 text-muted-foreground" strokeWidth={1.5} />
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Sensors enabled
          </span>
        </div>
        <ul className="grid grid-cols-3 gap-2">
          {sensorReadout.map((s) => {
            const enabled = sensors[s.id]
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSensors((prev) => ({ ...prev, [s.id]: !prev[s.id] }))}
                  className={cn(
                    "flex w-full flex-col items-start gap-1 border px-2 py-1.5 text-left transition-colors",
                    enabled
                      ? "border-primary/50 bg-secondary"
                      : "border-border bg-background opacity-50 hover:opacity-80",
                  )}
                  aria-pressed={enabled}
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span className={enabled ? "text-primary" : "text-muted-foreground"}>{s.icon}</span>
                      {s.id}
                    </span>
                    <span className={cn("font-mono text-[9px]", enabled ? "text-primary" : "text-muted-foreground")}>
                      {enabled ? "ON" : "OFF"}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] text-foreground tabular-nums">
                    {enabled ? s.value : "—"}
                    <span className="ml-1 text-[10px] text-muted-foreground">{enabled ? s.unit : ""}</span>
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground">{s.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function Slider({
  label,
  unit,
  min,
  max,
  step = 1,
  value,
  onChange,
  color,
}: {
  label: string
  unit: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (v: number) => void
  color: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="border border-border bg-background px-3 py-2">
      <div className="flex items-baseline justify-between font-mono text-[10px]">
        <span className="tracking-[0.18em] text-muted-foreground uppercase">{label}</span>
        <span className="text-foreground tabular-nums">
          {value.toFixed(step < 1 ? 2 : 0)}
          <span className="ml-1 text-muted-foreground">{unit}</span>
        </span>
      </div>
      <div className="relative mt-2 h-1 w-full bg-secondary">
        <div
          className="absolute inset-y-0 left-0"
          style={{ width: `${pct}%`, backgroundColor: color }}
          aria-hidden="true"
        />
      </div>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1 w-full cursor-pointer appearance-none bg-transparent accent-primary"
      />
      <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground tabular-nums">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
