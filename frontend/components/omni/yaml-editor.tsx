"use client"

import type React from "react"
import { useMemo, useRef } from "react"
import { FileCode2, Save, Circle } from "lucide-react"

interface YamlEditorProps {
  value: string
  onChange: (next: string) => void
  fileName?: string
  dirty?: boolean
}

const KEYWORD_VALUES = new Set(["enabled", "disabled", "true", "false", "on", "off"])

/**
 * Highlight a single YAML line. Returns an array of spans for rendering.
 * The line layout (indentation, characters) is preserved 1:1 so the highlight
 * div can sit underneath a transparent textarea without misalignment.
 */
function highlightLine(line: string, key: number): React.ReactNode {
  // Comment-only line
  if (/^\s*#/.test(line)) {
    return (
      <span key={key} className="text-[#444]">
        {line}
      </span>
    )
  }

  // Match: leading-indent  key  :  value  comment?
  const m = line.match(/^(\s*)([A-Za-z0-9_.-]+)(\s*:\s*)(.*)$/)
  if (!m) {
    return (
      <span key={key} className="text-[#888]">
        {line}
      </span>
    )
  }

  const [, indent, k, sep, rest] = m

  // Split inline comment out of the value portion
  const commentIdx = rest.indexOf("#")
  const valueText = commentIdx >= 0 ? rest.slice(0, commentIdx) : rest
  const commentText = commentIdx >= 0 ? rest.slice(commentIdx) : ""

  const trimmedValue = valueText.trim()
  let valueClass = "text-[#888]"
  if (trimmedValue === "") valueClass = "text-[#888]"
  else if (KEYWORD_VALUES.has(trimmedValue.toLowerCase())) {
    valueClass =
      trimmedValue.toLowerCase() === "enabled" || trimmedValue.toLowerCase() === "true" || trimmedValue.toLowerCase() === "on"
        ? "text-[#39FF14]"
        : "text-[#FF3D00]"
  } else if (/^-?\d+(\.\d+)?$/.test(trimmedValue)) {
    valueClass = "text-[#FFAA00]"
  } else if (/^["'].*["']$/.test(trimmedValue) || /^[A-Za-z][\w-]*$/.test(trimmedValue)) {
    valueClass = "text-[#E5E5E5]"
  }

  return (
    <span key={key}>
      <span>{indent}</span>
      <span className="text-[#00E5FF]">{k}</span>
      <span className="text-[#666]">{sep}</span>
      <span className={valueClass}>{valueText}</span>
      {commentText && <span className="text-[#444]">{commentText}</span>}
    </span>
  )
}

export function YamlEditor({ value, onChange, fileName = "hardware_manifest.yaml", dirty = false }: YamlEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const lines = useMemo(() => value.split("\n"), [value])

  // Sync scroll between textarea and the highlight overlay
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const overlay = document.getElementById("yaml-overlay")
    const gutter = document.getElementById("yaml-gutter")
    const target = e.currentTarget
    if (overlay) {
      overlay.scrollTop = target.scrollTop
      overlay.scrollLeft = target.scrollLeft
    }
    if (gutter) {
      gutter.scrollTop = target.scrollTop
    }
  }

  return (
    <section
      aria-label="Hardware manifest editor"
      className="flex h-full min-h-0 flex-col bg-[#050505]"
    >
      {/* Tab bar */}
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-[#1A1A1A] bg-[#0A0A0A] pl-2 pr-3">
        <div className="flex h-full items-stretch">
          <div className="flex h-full items-center gap-2 border-r border-[#1A1A1A] bg-[#050505] px-3">
            <FileCode2 className="h-3 w-3 text-[#00E5FF]" />
            <span className="font-mono text-[11px] text-white">{fileName}</span>
            {dirty && <Circle className="h-1.5 w-1.5 fill-[#FFAA00] text-[#FFAA00]" />}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#555]">YAML</span>
          <button
            type="button"
            className="flex items-center gap-1.5 border border-[#1A1A1A] bg-[#0A0A0A] px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-[#888] transition-colors hover:border-[#00E5FF]/30 hover:text-[#00E5FF]"
          >
            <Save className="h-2.5 w-2.5" />
            Sync
          </button>
        </div>
      </header>

      {/* Editor body */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Gutter */}
        <div
          id="yaml-gutter"
          className="shrink-0 select-none overflow-hidden border-r border-[#1A1A1A] bg-[#050505] py-3 text-right"
          style={{ width: 44 }}
          aria-hidden
        >
          <div className="font-mono text-[12px] leading-5">
            {lines.map((_, i) => (
              <div key={i} className="px-2 text-[#333]">
                {String(i + 1).padStart(2, "0")}
              </div>
            ))}
          </div>
        </div>

        {/* Code area */}
        <div className="relative flex-1">
          {/* Highlight overlay */}
          <pre
            id="yaml-overlay"
            aria-hidden
            className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre p-3 font-mono text-[12px] leading-5"
          >
            {lines.map((line, i) => (
              <div key={i} className="min-h-5">
                {highlightLine(line, i)}
                {/* Trailing space for empty lines so the line height holds */}
                {line.length === 0 && <span>&nbsp;</span>}
              </div>
            ))}
          </pre>

          {/* Transparent textarea on top */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            spellCheck={false}
            className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent p-3 font-mono text-[12px] leading-5 text-transparent caret-[#00E5FF] outline-none [tab-size:2]"
            aria-label="Hardware manifest YAML"
          />
        </div>
      </div>

      {/* Status bar */}
      <footer className="flex h-6 shrink-0 items-center justify-between border-t border-[#1A1A1A] bg-[#0A0A0A] px-3">
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-wider text-[#555]">
          <span>Ln {lines.length}</span>
          <span className="text-[#222]">·</span>
          <span>UTF-8</span>
          <span className="text-[#222]">·</span>
          <span>LF</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider">
          <span className="h-1.5 w-1.5 bg-[#39FF14]" />
          <span className="text-[#39FF14]">Schema · valid</span>
        </div>
      </footer>
    </section>
  )
}
