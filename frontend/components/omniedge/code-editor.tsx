"use client"

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
    if (comment) out.push(<span key={m.index} className="text-muted-foreground/70 italic">{match}</span>)
    else if (kw) out.push(<span key={m.index} className="text-primary">{match}</span>)
    else if (builtin) out.push(<span key={m.index} className="text-[#4a9eff]">{match}</span>)
    else if (str) out.push(<span key={m.index} className="text-[#ff8c42]">{match}</span>)
    else if (num) out.push(<span key={m.index} className="text-[#ff8c42]">{match}</span>)
    else if (fn) out.push(<span key={m.index} className="text-foreground">{match}</span>)
    last = m.index + match.length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

export function CodeEditor() {
  const lines = SOURCE.split("\n")
  return (
    <div className="grid h-full grid-rows-[1fr_auto] bg-background">
      <div className="overflow-auto">
        <div className="flex min-h-full">
          <div
            aria-hidden="true"
            className="sticky left-0 shrink-0 border-r border-border bg-card py-3 pr-2 pl-3 text-right select-none"
          >
            {lines.map((_, i) => (
              <div key={i} className="font-mono text-[11px] leading-5 text-muted-foreground/60">
                {String(i + 1).padStart(3, "0")}
              </div>
            ))}
          </div>
          <pre className="flex-1 py-3 pr-3 pl-3 font-mono text-[12px] leading-5">
            {lines.map((line, i) => (
              <div key={i} className="whitespace-pre">
                {line ? highlight(line) : "\u00A0"}
              </div>
            ))}
          </pre>
        </div>
      </div>
      <footer className="flex h-6 shrink-0 items-center justify-between border-t border-border bg-card px-3 font-mono text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>C++17</span>
          <span>UTF-8</span>
          <span>LF</span>
          <span>spaces: 2</span>
        </div>
        <div className="flex items-center gap-3">
          <span>
            <span className="text-foreground">38</span> lines · <span className="text-foreground">1.2 KB</span>
          </span>
          <span>
            Ln <span className="text-foreground">14</span> · Col <span className="text-foreground">22</span>
          </span>
        </div>
      </footer>
    </div>
  )
}
