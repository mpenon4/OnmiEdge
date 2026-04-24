"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cpu, Brain, Settings2 } from "lucide-react";
import type { HardwareId, AiModelId } from "@/lib/omni-types";

interface ConfigPanelProps {
  hardware: HardwareId;
  onHardwareChange: (value: HardwareId) => void;
  ai: AiModelId;
  onAiChange: (value: AiModelId) => void;
}

export function ConfigPanel({
  hardware,
  onHardwareChange,
  ai,
  onAiChange,
}: ConfigPanelProps) {
  return (
    <Card className="h-full rounded-none border-0 border-r border-border bg-card">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Settings2 className="w-4 h-4 text-muted-foreground" />
          Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Cpu className="w-3.5 h-3.5" />
            Target Hardware
          </Label>
          <Select value={hardware} onValueChange={(v) => onHardwareChange(v as HardwareId)}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stm32h7" className="text-sm">
                <div className="flex flex-col items-start">
                  <span>STM32H7</span>
                  <span className="text-xs text-muted-foreground">
                    Microcontroller — 2 MB RAM
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="jetson-orin-nano" className="text-sm">
                <div className="flex flex-col items-start">
                  <span>Nvidia Jetson Orin Nano</span>
                  <span className="text-xs text-muted-foreground">
                    Edge AI — 8 GB VRAM
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Brain className="w-3.5 h-3.5" />
            AI Model
          </Label>
          <Select value={ai} onValueChange={(v) => onAiChange(v as AiModelId)}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tiny-yolov8" className="text-sm">
                <div className="flex flex-col items-start">
                  <span>Tiny-YOLOv8</span>
                  <span className="text-xs text-muted-foreground">
                    Vision — 12 MB
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="llama-3-8b" className="text-sm">
                <div className="flex flex-col items-start">
                  <span>Llama-3-8B</span>
                  <span className="text-xs text-muted-foreground">
                    LLM — 4.5 GB
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Runtime
          </div>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Framework</dt>
              <dd className="font-mono">OmniEdge v0.1</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Toolchain</dt>
              <dd className="font-mono">LLVM + CUDA</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Branch</dt>
              <dd className="font-mono">main</dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}
