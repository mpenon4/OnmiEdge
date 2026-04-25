"use client"

export function PhysicsViewport() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-background bg-tech-grid">
      {/* Axis indicator */}
      <div className="absolute top-3 left-3 font-mono text-[10px] tracking-wider text-muted-foreground">
        <div>VIEWPORT · PERSPECTIVE</div>
        <div className="mt-0.5">SOLVER · RAPIER · 60Hz</div>
      </div>

      {/* Pseudo 3D wireframe board */}
      <svg
        viewBox="0 0 800 500"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-label="3D physics viewport placeholder"
      >
        <defs>
          <pattern id="floorGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Ground plane (perspective) */}
        <polygon points="80,420 720,420 880,500 -80,500" fill="url(#floorGrid)" stroke="#252525" strokeWidth="1" />

        {/* PCB outline (isometric-ish) */}
        <g stroke="#00d4a8" strokeWidth="1" fill="none">
          <polygon points="280,200 540,200 580,260 320,260" fill="#00d4a814" />
          <polygon points="540,200 540,220 580,280 580,260" fill="#00d4a826" />
          <polygon points="280,200 280,220 320,280 320,260" fill="#00d4a81a" />
          <polygon points="280,220 540,220 580,280 320,280" fill="none" />
        </g>

        {/* MCU chip */}
        <g stroke="#e5e5e5" strokeWidth="1" fill="#0a0a0a">
          <polygon points="380,212 460,212 478,242 398,242" />
        </g>
        <text x="404" y="232" fontFamily="monospace" fontSize="9" fill="#707070">
          ESP32-S3
        </text>

        {/* Components */}
        <rect x="320" y="226" width="20" height="10" stroke="#4a9eff" fill="none" />
        <rect x="500" y="226" width="20" height="10" stroke="#4a9eff" fill="none" />
        <circle cx="350" cy="248" r="4" stroke="#ff8c42" fill="none" />
        <circle cx="490" cy="248" r="4" stroke="#ff8c42" fill="none" />

        {/* Trajectory / vector */}
        <g stroke="#00d4a8" strokeWidth="1" strokeDasharray="2 3">
          <path d="M 420 220 Q 500 120 620 160" fill="none" />
          <circle cx="620" cy="160" r="3" fill="#00d4a8" stroke="none" />
        </g>

        {/* Axes (bottom-left) */}
        <g transform="translate(60,440)" fontFamily="monospace" fontSize="9">
          <line x1="0" y1="0" x2="40" y2="0" stroke="#ef4444" strokeWidth="1" />
          <text x="44" y="3" fill="#ef4444">
            x
          </text>
          <line x1="0" y1="0" x2="0" y2="-40" stroke="#00d4a8" strokeWidth="1" />
          <text x="4" y="-44" fill="#00d4a8">
            y
          </text>
          <line x1="0" y1="0" x2="-28" y2="20" stroke="#4a9eff" strokeWidth="1" />
          <text x="-40" y="26" fill="#4a9eff">
            z
          </text>
        </g>
      </svg>

      {/* HUD */}
      <div className="absolute right-3 bottom-3 grid grid-cols-2 gap-x-4 gap-y-0.5 border border-border bg-card px-3 py-2 font-mono text-[10px]">
        <span className="text-muted-foreground">FPS</span>
        <span className="text-right text-foreground">60.0</span>
        <span className="text-muted-foreground">BODIES</span>
        <span className="text-right text-foreground">14</span>
        <span className="text-muted-foreground">CONTACTS</span>
        <span className="text-right text-foreground">3</span>
        <span className="text-muted-foreground">STEP</span>
        <span className="text-right text-primary">16.6 ms</span>
      </div>
    </div>
  )
}
