"use client"

export function SchematicView() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-background bg-tech-grid">
      <div className="absolute top-3 left-3 font-mono text-[10px] tracking-wider text-muted-foreground">
        <div>SHEET · main_board.sch</div>
        <div className="mt-0.5">NETS · 24 · DRC · CLEAN</div>
      </div>

      <svg viewBox="0 0 800 500" className="absolute inset-0 h-full w-full" aria-label="Schematic placeholder">
        {/* MCU block */}
        <g stroke="#e5e5e5" strokeWidth="1" fill="#0a0a0a">
          <rect x="320" y="160" width="160" height="180" />
        </g>
        <text x="332" y="180" fontFamily="monospace" fontSize="10" fill="#00d4a8">
          U1 · ESP32-S3
        </text>

        {/* Pins */}
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={`l${i}`}>
            <line x1="280" y1={200 + i * 18} x2="320" y2={200 + i * 18} stroke="#4a9eff" strokeWidth="1" />
            <text x="276" y={203 + i * 18} fontFamily="monospace" fontSize="8" fill="#707070" textAnchor="end">
              GPIO{i}
            </text>
          </g>
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={`r${i}`}>
            <line x1="480" y1={200 + i * 18} x2="520" y2={200 + i * 18} stroke="#4a9eff" strokeWidth="1" />
            <text x="524" y={203 + i * 18} fontFamily="monospace" fontSize="8" fill="#707070">
              GPIO{i + 8}
            </text>
          </g>
        ))}

        {/* Sensor BME280 */}
        <g stroke="#e5e5e5" strokeWidth="1" fill="#0a0a0a">
          <rect x="120" y="220" width="100" height="60" />
        </g>
        <text x="128" y="238" fontFamily="monospace" fontSize="9" fill="#00d4a8">
          U2 · BME280
        </text>
        <line x1="220" y1="240" x2="280" y2="218" stroke="#00d4a8" strokeWidth="1" />
        <line x1="220" y1="260" x2="280" y2="236" stroke="#00d4a8" strokeWidth="1" />
        <text x="240" y="216" fontFamily="monospace" fontSize="8" fill="#707070">
          SDA
        </text>
        <text x="240" y="262" fontFamily="monospace" fontSize="8" fill="#707070">
          SCL
        </text>

        {/* Power rail */}
        <g stroke="#ff8c42" strokeWidth="1.5" fill="none">
          <line x1="60" y1="100" x2="740" y2="100" />
          <line x1="400" y1="100" x2="400" y2="160" />
        </g>
        <text x="60" y="92" fontFamily="monospace" fontSize="9" fill="#ff8c42">
          +3V3
        </text>

        {/* Ground rail */}
        <g stroke="#707070" strokeWidth="1.5" fill="none">
          <line x1="60" y1="420" x2="740" y2="420" />
          <line x1="400" y1="340" x2="400" y2="420" />
        </g>
        <text x="60" y="436" fontFamily="monospace" fontSize="9" fill="#707070">
          GND
        </text>

        {/* Camera */}
        <g stroke="#e5e5e5" strokeWidth="1" fill="#0a0a0a">
          <rect x="580" y="220" width="100" height="60" />
        </g>
        <text x="588" y="238" fontFamily="monospace" fontSize="9" fill="#00d4a8">
          U3 · OV2640
        </text>
        <line x1="580" y1="240" x2="520" y2="218" stroke="#4a9eff" strokeWidth="1" />
        <line x1="580" y1="260" x2="520" y2="236" stroke="#4a9eff" strokeWidth="1" />
      </svg>

      <div className="absolute right-3 bottom-3 grid grid-cols-2 gap-x-4 gap-y-0.5 border border-border bg-card px-3 py-2 font-mono text-[10px]">
        <span className="text-muted-foreground">COMPONENTS</span>
        <span className="text-right text-foreground">12</span>
        <span className="text-muted-foreground">NETS</span>
        <span className="text-right text-foreground">24</span>
        <span className="text-muted-foreground">UNCONNECTED</span>
        <span className="text-right text-foreground">0</span>
        <span className="text-muted-foreground">DRC</span>
        <span className="text-right text-primary">PASS</span>
      </div>
    </div>
  )
}
