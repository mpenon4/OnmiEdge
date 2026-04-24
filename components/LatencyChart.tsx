'use client';

import { useEffect, useState } from 'react';

interface LatencyChartProps {
  currentLatency: number;
  isRunning: boolean;
}

export function LatencyChart({ currentLatency, isRunning }: LatencyChartProps) {
  const [dataPoints, setDataPoints] = useState<number[]>([]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setDataPoints((prev) => {
        const newPoint = currentLatency + (Math.random() - 0.5) * 500;
        const updated = [...prev, Math.max(0, newPoint)];
        return updated.slice(-30);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, currentLatency]);

  const maxValue = Math.max(5000, ...dataPoints);
  const minValue = 0;
  const range = maxValue - minValue;

  const getColor = (value: number) => {
    if (value > 4000) return '#FF3D00';
    if (value > 2000) return '#FFB300';
    return '#00E5FF';
  };

  return (
    <div className="bg-[--bg-panel] border panel-border rounded p-4">
      <h3 className="text-xs font-mono uppercase tracking-wider text-[--text-secondary] mb-4">
        Inference Latency (ms)
      </h3>

      <div className="relative h-48 bg-[#0a0a0a] rounded border panel-border p-4">
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${dataPoints.length * 10} 100`}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <g opacity="0.1">
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={`grid-${y}`}
                x1="0"
                y1={y}
                x2={dataPoints.length * 10}
                y2={y}
                stroke="#666666"
                strokeWidth="0.5"
              />
            ))}
          </g>

          {/* Data line */}
          {dataPoints.length > 1 && (
            <polyline
              points={dataPoints
                .map(
                  (value, index) =>
                    `${index * 10},${100 - ((value - minValue) / range) * 100}`
                )
                .join(' ')}
              fill="none"
              stroke={currentLatency > 4000 ? '#FF3D00' : currentLatency > 2000 ? '#FFB300' : '#00E5FF'}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {/* Data points */}
          {dataPoints.map((value, index) => (
            <circle
              key={`point-${index}`}
              cx={index * 10}
              cy={100 - ((value - minValue) / range) * 100}
              r="2"
              fill={getColor(value)}
            />
          ))}
        </svg>

        {/* Current value overlay */}
        <div className="absolute top-4 right-4 bg-[--bg-primary] border panel-border rounded px-3 py-2">
          <p className="text-xs text-[--text-secondary] font-mono">Current Latency</p>
          <p
            className="text-xl font-mono font-bold"
            style={{
              color: currentLatency > 4000 ? '#FF3D00' : currentLatency > 2000 ? '#FFB300' : '#00E5FF',
            }}
          >
            {currentLatency.toFixed(0)} ms
          </p>
        </div>
      </div>

      <div className="mt-3 flex justify-between text-xs font-mono text-[--text-tertiary]">
        <span>0 ms</span>
        <span>{maxValue.toFixed(0)} ms</span>
      </div>
    </div>
  );
}
