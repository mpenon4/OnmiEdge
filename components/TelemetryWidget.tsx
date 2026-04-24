'use client';

interface TelemetryWidgetProps {
  title: string;
  value: string | number;
  unit?: string;
  percentage?: number;
  status: 'normal' | 'warning' | 'critical';
  subtitle?: string;
}

export function TelemetryWidget({
  title,
  value,
  unit,
  percentage,
  status,
  subtitle,
}: TelemetryWidgetProps) {
  const statusColors = {
    normal: 'bg-[--accent-cyan]/20 border-[--accent-cyan]/30 text-[--accent-cyan]',
    warning: 'bg-[--accent-amber]/20 border-[--accent-amber]/30 text-[--accent-amber]',
    critical: 'bg-[--accent-red]/20 border-[--accent-red]/30 text-[--accent-red]',
  };

  const barColors = {
    normal: 'bg-[--accent-cyan]',
    warning: 'bg-[--accent-amber]',
    critical: 'bg-[--accent-red]',
  };

  return (
    <div className={`bg-[--bg-panel] border panel-border rounded p-4 ${statusColors[status]}`}>
      <div className="mb-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[--text-secondary] mb-1">
          {title}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-mono font-bold">{value}</span>
          {unit && <span className="text-sm text-[--text-tertiary]">{unit}</span>}
        </div>
        {subtitle && <p className="text-xs text-[--text-tertiary] mt-1">{subtitle}</p>}
      </div>

      {percentage !== undefined && (
        <div className="mt-4">
          <div className="h-2 bg-[#0a0a0a] rounded overflow-hidden border panel-border">
            <div
              className={`h-full ${barColors[status]} transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-xs text-[--text-secondary] mt-2 font-mono">
            {percentage.toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  );
}
