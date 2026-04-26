"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Cpu,
  File,
  FileCode,
  Folder,
  FolderOpen,
  Gauge,
  Library,
  Radio,
  Search,
  Thermometer,
  Wifi,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useOmniStore } from "@/lib/store"

type Tab = "explorer" | "library"

export function LeftPanel() {
  const [tab, setTab] = useState<Tab>("explorer")

  return (
    <aside
      aria-label="Project explorer and component library"
      className="flex h-full flex-col border-r border-border bg-card"
    >
      <div className="flex h-8 shrink-0 items-stretch border-b border-border">
        <PanelTab active={tab === "explorer"} onClick={() => setTab("explorer")} icon={<FileCode className="size-3" />}>
          Explorer
        </PanelTab>
        <PanelTab active={tab === "library"} onClick={() => setTab("library")} icon={<Library className="size-3" />}>
          Library
        </PanelTab>
      </div>

      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-border bg-background px-3">
        <Search className="size-3 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
        <input
          type="search"
          placeholder={tab === "explorer" ? "Filter files..." : "Filter components..."}
          className="flex-1 bg-transparent font-mono text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "explorer" ? <Explorer /> : <ComponentLibrary />}
      </div>
    </aside>
  )
}

function PanelTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 border-r border-border font-mono text-[10px] tracking-[0.18em] uppercase transition-colors last:border-r-0",
        active ? "bg-background text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <span aria-hidden="true">{icon}</span>
      {children}
    </button>
  )
}

/* ---------- Explorer ---------- */

type Node = {
  name: string
  type: "folder" | "file"
  children?: Node[]
  active?: boolean
  badge?: string
}

const TREE: Node[] = [
  {
    name: "esp32-edge-vision",
    type: "folder",
    children: [
      {
        name: "firmware",
        type: "folder",
        children: [
          { name: "main.cpp", type: "file", active: true },
          { name: "sensors.cpp", type: "file" },
          { name: "i2c_bus.cpp", type: "file" },
          { name: "wifi_stack.cpp", type: "file", badge: "M" },
        ],
      },
      {
        name: "models",
        type: "folder",
        children: [
          { name: "vision_v3.tflite", type: "file" },
          { name: "anomaly.onnx", type: "file" },
          { name: "training.ipynb", type: "file" },
        ],
      },
      {
        name: "schematic",
        type: "folder",
        children: [
          { name: "main_board.sch", type: "file" },
          { name: "power_rail.sch", type: "file" },
          { name: "antenna.sch", type: "file", badge: "!" },
        ],
      },
      {
        name: "simulation",
        type: "folder",
        children: [
          { name: "thermal.sim", type: "file" },
          { name: "rigid_body.sim", type: "file" },
        ],
      },
      { name: "platformio.ini", type: "file" },
      { name: "README.md", type: "file" },
    ],
  },
]

function Explorer() {
  return (
    <div className="py-1">
      {TREE.map((n) => (
        <TreeRow key={n.name} node={n} depth={0} initiallyOpen />
      ))}
    </div>
  )
}

function TreeRow({ node, depth, initiallyOpen = false }: { node: Node; depth: number; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen || depth < 2)
  const setSelection = useOmniStore((s) => s.setSelection)
  const isFolder = node.type === "folder"
  const Icon = isFolder ? (open ? FolderOpen : Folder) : File

  const langOf = (name: string) => {
    if (name.endsWith(".cpp") || name.endsWith(".h")) return "C++"
    if (name.endsWith(".tflite") || name.endsWith(".onnx")) return "Model"
    if (name.endsWith(".sch")) return "Schematic"
    if (name.endsWith(".sim")) return "Simulation"
    if (name.endsWith(".ipynb")) return "Notebook"
    if (name.endsWith(".ini")) return "Config"
    if (name.endsWith(".md")) return "Markdown"
    return "File"
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (isFolder) {
            setOpen((v) => !v)
          } else {
            setSelection({
              kind: "file",
              path: node.name,
              lang: langOf(node.name),
              size: 1024 + Math.floor(Math.random() * 8192),
              status: node.badge === "!" ? "error" : node.badge === "M" ? "modified" : "compiled",
            })
          }
        }}
        className={cn(
          "group flex h-6 w-full items-center gap-1.5 pr-2 font-mono text-[11px] transition-colors",
          node.active
            ? "bg-secondary text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        )}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        {isFolder ? (
          open ? (
            <ChevronDown className="size-3 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <ChevronRight className="size-3 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          )
        ) : (
          <span className="w-3 shrink-0" aria-hidden="true" />
        )}
        <Icon className="size-3 shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <span className="truncate text-left">{node.name}</span>
        {node.badge && (
          <span
            className={cn(
              "ml-auto px-1 text-[9px] tracking-wider",
              node.badge === "!" ? "text-destructive" : "text-primary",
            )}
          >
            {node.badge}
          </span>
        )}
      </button>
      {isFolder && open && node.children?.map((c) => <TreeRow key={c.name} node={c} depth={depth + 1} />)}
    </div>
  )
}

/* ---------- Component Library ---------- */

type Category = {
  name: string
  items: { id: string; name: string; spec: string; icon: React.ReactNode }[]
}

const CATEGORIES: Category[] = [
  {
    name: "MCU",
    items: [
      { id: "esp32-s3", name: "ESP32-S3", spec: "240MHz · 512KB SRAM", icon: <Cpu className="size-3.5" /> },
      { id: "rp2040", name: "RP2040", spec: "133MHz · 264KB SRAM", icon: <Cpu className="size-3.5" /> },
      { id: "stm32-h7", name: "STM32H743", spec: "480MHz · 1MB SRAM", icon: <Cpu className="size-3.5" /> },
      { id: "nrf52840", name: "nRF52840", spec: "64MHz · 256KB SRAM", icon: <Cpu className="size-3.5" /> },
    ],
  },
  {
    name: "Sensors",
    items: [
      { id: "bme280", name: "BME280", spec: "Temp · Hum · Press", icon: <Thermometer className="size-3.5" /> },
      { id: "mpu6050", name: "MPU-6050", spec: "6-DoF IMU · I²C", icon: <Gauge className="size-3.5" /> },
      { id: "ov2640", name: "OV2640", spec: "2MP CMOS · DVP", icon: <Radio className="size-3.5" /> },
      { id: "vl53l1x", name: "VL53L1X", spec: "ToF · 4m range", icon: <Radio className="size-3.5" /> },
    ],
  },
  {
    name: "Actuators",
    items: [
      { id: "drv8833", name: "DRV8833", spec: "Dual H-Bridge · 1.5A", icon: <Zap className="size-3.5" /> },
      { id: "sg90", name: "SG90", spec: "Servo · PWM", icon: <Zap className="size-3.5" /> },
      { id: "tmc2209", name: "TMC2209", spec: "Stepper · UART", icon: <Zap className="size-3.5" /> },
    ],
  },
  {
    name: "Comms",
    items: [
      { id: "esp-now", name: "ESP-NOW", spec: "2.4GHz · Mesh", icon: <Wifi className="size-3.5" /> },
      { id: "lora-sx1276", name: "SX1276", spec: "LoRa · 868MHz", icon: <Wifi className="size-3.5" /> },
      { id: "nrf24", name: "nRF24L01+", spec: "2.4GHz · SPI", icon: <Wifi className="size-3.5" /> },
    ],
  },
]

function ComponentLibrary() {
  return (
    <div className="py-1">
      {CATEGORIES.map((cat) => (
        <Category key={cat.name} category={cat} />
      ))}
    </div>
  )
}

function Category({ category }: { category: Category }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-full items-center gap-1.5 bg-secondary px-2 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase hover:text-foreground"
      >
        {open ? (
          <ChevronDown className="size-3" strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <ChevronRight className="size-3" strokeWidth={1.5} aria-hidden="true" />
        )}
        <span>{category.name}</span>
        <span className="ml-auto text-muted-foreground/60">{category.items.length}</span>
      </button>

      {open && (
        <ul className="py-0.5">
          {category.items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                draggable
                className="flex w-full items-center gap-2 px-2 py-1.5 text-left transition-colors hover:bg-secondary"
              >
                <span className="text-primary" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="flex-1 font-mono text-[11px] text-foreground">{item.name}</span>
                <span className="font-mono text-[9px] tracking-wider text-muted-foreground">{item.spec}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
