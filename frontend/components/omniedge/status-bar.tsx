"use client"

import { useEffect, useState } from "react"

export function StatusBar() {
  const [time, setTime] = useState<string>("")
  useEffect(() => {
    const update = () => setTime(new Date().toUTCString().split(" ")[4] + " UTC")
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <footer className="flex h-6 shrink-0 items-center justify-between border-t border-border bg-card px-3 font-mono text-[10px] text-muted-foreground">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="block size-1.5 bg-primary signal-live" aria-hidden="true" />
          <span className="text-foreground">CONNECTED</span>
        </span>
        <span>esp32-s3 · 0xA4C1</span>
        <span>921600 baud</span>
        <span>RSSI -58 dBm</span>
      </div>
      <div className="flex items-center gap-3">
        <span>build · 1.84 MB</span>
        <span>RAM 38% · FLASH 45%</span>
        <span>UTF-8</span>
        <span className="tabular-nums">{time}</span>
      </div>
    </footer>
  )
}
