"use client"

import { FileCode2, Save, AlertCircle } from "lucide-react"
import { useMemo, useRef } from "react"

type Props = {
  value: string
  onChange: (next: string) => void
  errors?: string[]
}

// Token-based syntax highlighting for YAML.
function highlightLine(line: string): React.ReactNode {
  // Comment line
  const commentIdx = line.indexOf("#")
  let codePart = line
  let commentPart = ""
  if (commentIdx >= 0) {
    codePart = line.slice(0, commentIdx)
    commentPart = line.slice(commentIdx)
  }

  // List item
  const listMatch = codePart.match(/^(\s*)(-\s*)(.*)$/)
  if (listMatch) {
    const [, indent, dash, rest] = listMatch
    return (
      <>
        <span>{indent}</span>
        <span className="text-[#FF3D00]">{dash}</span>
        {renderKeyValue(rest)}
        {commentPart && <span className="text-[#444]">{commentPart}</span>}
      </>
    )
  }

  return (
    <>
      {renderKeyValue(codePart)}
      {commentPart && <span className="text-[#444]">{commentPart}</span>}
    </>
  )
}

function renderKeyValue(text: string): React.ReactNode {
  const m = text.match(/^(\s*)([a-z0-9_]+)(\s*:)(.*)$/i)
  if (!m) {
    return <span className="text-[#888]">{text}</span>
  }
  const [, indent, key, colon, value] = m
  return (
    <>
      <span>{indent}</span>
      <span className="text-[#00E5FF]">{key}</span>
      <span className="text-[#555]">{colon}</span>
      {renderValue(value)}
    </>
  )
}

function renderValue(value: string): React.ReactNode {
  if (!value.trim()) return <span>{value}</span>

  // Array
  if (/^\s*\[.+\]\s*$/.test(value)) {
    return <span className="text-[#39FF14]">{value}</span>
  }

  // Number
  if (/^\s*\d+\s*$/.test(value)) {
    return <span className="text-[#FFAA00]">{value}</span>
  }

  // Bool-like (enabled/disabled/true/false)
  if (/^\s*(enabled|disabled|true|false|on|off)\s*$/i.test(value)) {
    const v = value.trim().toLowerCase()
    const positive = v === "enabled" || v === "true" || v === "on"
    return <span className={positive ? "text-[#39FF14]" : "text-[#FF3D00]"}>{value}</span>
  }

  // String
  return <span className="text-white">{value}</span>
}

export function YamlEditor({ value, onChange, errors = [] }: Props) {
  const lines = useMemo(() => value.split("\n"), [value])
  const preRef = useRef<HTMLPreElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  // Keep the highlighted backdrop's scroll position in sync with the textarea.
  const onScroll = () => {
    if (preRef.current && taRef.current) {
      preRef.current.scrollTop = taRef.current.scrollTop
      preRef.current.scrollLeft = taRef.current.scrollLeft
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#0A0A0A]">
      {/* Header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-[#1A1A1A] bg-[#0A0A0A] px-3">
        <div className="flex items-center gap-2">
          <FileCode2 className="h-3.5 w-3.5 text-[#39FF14]" strokeWidth={2} />
          <span className="font-mono text-[11px] font-bold tracking-wide text-white">
            hardware_manifest
          </span>
          <span className="font-mono text-[10px] text-[#444]">.yaml</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-[#39FF14]">
            <span className="h-1.5 w-1.5 bg-[#39FF14] shadow-[0_0_6px_rgba(57,255,20,0.8)]" />
            live
          </span>
          <button className="flex items-center gap-1 border border-[#1A1A1A] bg-[#111] px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-[#888] hover:border-[#39FF14]/40 hover:text-[#39FF14]">
            <Save className="h-2.5 w-2.5" />
            commit
          </button>
        </div>
      </div>

      {/* Path breadcrumb */}
      <div className="flex h-6 shrink-0 items-center border-b border-[#1A1A1A] bg-[#080808] px-3">
        <span className="font-mono text-[9px] uppercase tracking-wider text-[#444]">
          /workspace/manifests/<span className="text-[#666]">hardware_manifest.yaml</span>
        </span>
      </div>

      {/* Editor */}
      <div className="relative flex-1 overflow-hidden">
        {/* Line numbers + highlighted backdrop */}
        <pre
          ref={preRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre p-0 font-mono text-[12px] leading-[20px]"
        >
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="sticky left-0 inline-block w-10 select-none border-r border-[#1A1A1A] bg-[#080808] py-0 pr-2 text-right text-[#333]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="block min-w-0 px-3">
                {highlightLine(line) || <span> </span>}
              </span>
            </div>
          ))}
        </pre>

        {/* Transparent textarea on top */}
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={onScroll}
          spellCheck={false}
          className="absolute inset-0 m-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent py-0 pr-3 font-mono text-[12px] leading-[20px] text-transparent caret-[#39FF14] outline-none selection:bg-[#39FF14]/30"
          style={{
            // Indent each line so the caret aligns with the highlighted backdrop.
            paddingLeft: "calc(2.5rem + 0.75rem)",
          }}
        />
      </div>

      {/* Footer / errors */}
      <div className="shrink-0 border-t border-[#1A1A1A] bg-[#080808]">
        {errors.length > 0 && (
          <div className="border-b border-[#1A1A1A] px-3 py-1.5">
            {errors.map((err, i) => (
              <div
                key={i}
                className="flex items-start gap-1.5 font-mono text-[10px] text-[#FFAA00]"
              >
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex h-6 items-center justify-between px-3 font-mono text-[9px] uppercase tracking-wider">
          <div className="flex items-center gap-3 text-[#444]">
            <span>YAML</span>
            <span className="text-[#222]">·</span>
            <span>UTF-8</span>
            <span className="text-[#222]">·</span>
            <span>{lines.length} lines</span>
          </div>
          <span className="text-[#39FF14]">schema valid</span>
        </div>
      </div>
    </div>
  )
}
