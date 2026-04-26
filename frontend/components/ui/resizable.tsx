'use client'

import * as React from 'react'
import { GripVerticalIcon } from 'lucide-react'
import * as ResizablePrimitive from 'react-resizable-panels'

import { cn } from '@/lib/utils'

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        // Hairline 1px divider that grows a 4px hit area via ::after.
        // Hover/active state lights up with the signal cyan to reinforce the engineering aesthetic.
        'group relative flex w-px items-center justify-center bg-[var(--color-border-default)] transition-colors',
        'hover:bg-[var(--color-accent-cyan)] data-[resize-handle-state=drag]:bg-[var(--color-accent-cyan)]',
        'after:absolute after:inset-y-0 after:left-1/2 after:w-1.5 after:-translate-x-1/2 after:content-[""]',
        'focus-visible:ring-1 focus-visible:ring-[var(--color-accent-cyan)] focus-visible:outline-hidden',
        'data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full',
        'data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1.5 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2',
        '[&[data-panel-group-direction=vertical]>div]:rotate-90',
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center border border-[var(--color-border-default)] bg-[var(--color-background-panel)] group-hover:border-[var(--color-accent-cyan)]">
          <GripVerticalIcon className="size-2.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-cyan)]" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
