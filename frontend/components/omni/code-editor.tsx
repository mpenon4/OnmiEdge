"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"

const SOURCE = `// main.cpp — esp32-edge-vision
// On-device inference loop · TinyML quantized model
#include <Arduino.h>
#include <esp_camera.h>
#include "tflite_micro/model_runner.h"
#include "drivers/bme280.h"
#include "comms/esp_now_mesh.h"

static ModelRunner runner("vision_v3.tflite");
static BME280 env;
static MeshNode mesh(/* channel */ 6);

void setup() {
  Serial.begin(921600);
  env.begin(I2C_BUS_0);
  runner.load(/* arena_kb */ 256);
  mesh.join("omniedge.fleet");
}

void loop() {
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) return;

  auto inference = runner.infer(fb->buf, fb->len);
  if (inference.confidence > 0.82f) {
    mesh.broadcast({
      .label = inference.label,
      .conf  = inference.confidence,
      .temp  = env.read_temperature(),
      .ts    = micros(),
    });
  }
  esp_camera_fb_return(fb);
  vTaskDelay(pdMS_TO_TICKS(33)); // ~30 fps
}
`

const TOKEN_REGEX =
  /(\/\/[^\n]*)|(\b(?:include|static|void|return|auto|if|while|for|true|false|nullptr)\b)|(\b(?:Arduino|Serial|esp_camera|TaskHandle|esp_camera_fb_get|esp_camera_fb_return|micros|vTaskDelay|pdMS_TO_TICKS|I2C_BUS_0)\b)|("[^"]*"|'[^']*')|(\b\d+(?:\.\d+)?f?\b)|([A-Za-z_]\w*(?=\())/g

function highlight(line: string) {
  const out: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  TOKEN_REGEX.lastIndex = 0
  while ((m = TOKEN_REGEX.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index))
    const [match, comment, kw, builtin, str, num, fn] = m
    if (comment) out.push(<span key={m.index} className="italic text-[var(--color-text-secondary)]">{match}</span>)
    else if (kw) out.push(<span key={m.index} className="text-[var(--color-text-info)]">{match}</span>)
    else if (builtin) out.push(<span key={m.index} className="text-[var(--color-text-info)]">{match}</span>)
    else if (str) out.push(<span key={m.index} className="text-[var(--color-text-warning)]">{match}</span>)
    else if (num) out.push(<span key={m.index} className="text-[var(--color-text-warning)]">{match}</span>)
    else if (fn) out.push(<span key={m.index} className="text-[var(--color-text-success)]">{match}</span>)
    last = m.index + match.length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

const TABS = [
  { id: "main", name: "main.cpp", active: true },
  { id: "sensors", name: "sensors.cpp", active: false },
  { id: "model", name: "ml_model.h", active: false },
]

export function CodeEditor() {
  const [activeId] = useState("main")
  const lines = SOURCE.split("\n")

  return (
    <div className="grid h-full min-h-0" style={{ gridTemplateRows: "28px 1fr 20px" }}>
      {/* Tabs of open files (28px) */}
      <div className="flex items-stretch border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={cn(
              "relative flex items-center gap-2 border-r border-[var(--color-border-tertiary)] px-3 font-mono text-[10px] tracking-wider uppercase transition-colors",
              t.id === activeId
                ? "bg-[var(--color-background-canvas)] text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
            )}
          >
            {t.name}
            {t.id === activeId && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[2px] bg-[var(--color-text-info)]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="overflow-auto bg-[var(--color-background-canvas)]">
        <div className="flex min-h-full">
          <div
            aria-hidden="true"
            className="sticky left-0 shrink-0 select-none border-r border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] py-3 pl-3 pr-2 text-right"
          >
            {lines.map((_, i) => (
              <div key={i} className="font-mono text-[11px] leading-5 text-[var(--color-text-secondary)]">
                {String(i + 1).padStart(3, "0")}
              </div>
            ))}
          </div>
          <pre className="flex-1 px-3 py-3 font-mono text-[12px] leading-5 text-[var(--color-text-primary)]">
            {lines.map((line, i) => (
              <div key={i} className="whitespace-pre">
                {line ? highlight(line) : "\u00A0"}
              </div>
            ))}
          </pre>
        </div>
      </div>

      {/* Statusline (20px) */}
      <footer className="flex items-center justify-between border-t border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-3 font-mono text-[10px] text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-3">
          <span>C++17</span>
          <span>UTF-8</span>
          <span>LF</span>
        </div>
        <div className="flex items-center gap-3">
          <span>
            Ln <span className="text-[var(--color-text-primary)]">14</span> · Col{" "}
            <span className="text-[var(--color-text-primary)]">22</span>
          </span>
          <span>
            <span className="text-[var(--color-text-primary)]">38</span> lines ·{" "}
            <span className="text-[var(--color-text-primary)]">1.2 KB</span>
          </span>
        </div>
      </footer>
    </div>
  )
}
