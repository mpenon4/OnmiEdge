'use client';

import { useState, useEffect } from 'react';
import { TopNavigation } from '@/components/TopNavigation';
import { LeftSidebar } from '@/components/LeftSidebar';
import { TelemetryWidget } from '@/components/TelemetryWidget';
import { LatencyChart } from '@/components/LatencyChart';
import { Terminal } from '@/components/Terminal';

export default function Home() {
  const [isRunning, setIsRunning] = useState(false);
  const [memoryUsage, setMemoryUsage] = useState(45);
  const [cpuLoad, setCpuLoad] = useState(20);
  const [thermalEstimate, setThermalEstimate] = useState(28);
  const [latency, setLatency] = useState(250);

  useEffect(() => {
    if (!isRunning) {
      setMemoryUsage(45);
      setCpuLoad(20);
      setThermalEstimate(28);
      setLatency(250);
      return;
    }

    const interval = setInterval(() => {
      setMemoryUsage((prev) => {
        const change = (Math.random() - 0.3) * 5;
        return Math.min(100, Math.max(50, prev + change));
      });

      setCpuLoad((prev) => {
        const change = (Math.random() - 0.2) * 8;
        return Math.min(100, Math.max(60, prev + change));
      });

      setThermalEstimate((prev) => {
        const change = (Math.random() - 0.3) * 3;
        return Math.min(95, Math.max(75, prev + change));
      });

      setLatency((prev) => {
        const change = (Math.random() - 0.4) * 400;
        return Math.max(1000, prev + change);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleRunSimulation = () => {
    setIsRunning(true);
  };

  const getMemoryStatus = () => {
    if (memoryUsage > 95) return 'critical';
    if (memoryUsage > 85) return 'warning';
    return 'normal';
  };

  const getCpuStatus = () => {
    if (cpuLoad > 95) return 'critical';
    if (cpuLoad > 80) return 'warning';
    return 'normal';
  };

  const getThermalStatus = () => {
    if (thermalEstimate > 85) return 'critical';
    if (thermalEstimate > 75) return 'warning';
    return 'normal';
  };

  const getLatencyStatus = () => {
    if (latency > 4000) return 'critical';
    if (latency > 2000) return 'warning';
    return 'normal';
  };

  return (
    <div className="h-screen bg-[--bg-primary] flex flex-col overflow-hidden">
      <TopNavigation />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar onRunSimulation={handleRunSimulation} isRunning={isRunning} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main Canvas */}
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Memory Allocation Widget */}
              <TelemetryWidget
                title="Memory Allocation (SRAM)"
                value={memoryUsage.toFixed(1)}
                unit="MB / 2.00 MB"
                percentage={memoryUsage}
                status={getMemoryStatus()}
                subtitle={`${(memoryUsage * 2 / 100).toFixed(2)} MB allocated`}
              />

              {/* CPU Load Widget */}
              <TelemetryWidget
                title="CPU Load"
                value={cpuLoad.toFixed(0)}
                unit="%"
                percentage={cpuLoad}
                status={getCpuStatus()}
                subtitle="Cortex-M7 utilization"
              />

              {/* Thermal Estimate Widget */}
              <TelemetryWidget
                title="Thermal Estimate"
                value={thermalEstimate.toFixed(0)}
                unit="°C"
                percentage={(thermalEstimate / 100) * 100}
                status={getThermalStatus()}
                subtitle={thermalEstimate > 80 ? 'THROTTLING ACTIVE' : 'Normal operation'}
              />
            </div>

            {/* Latency Chart */}
            <div className="h-64">
              <LatencyChart currentLatency={latency} isRunning={isRunning} />
            </div>
          </div>

          {/* Terminal Section */}
          <div className="h-1/3 border-t panel-border overflow-hidden">
            <Terminal isRunning={isRunning} />
          </div>
        </div>
      </div>
    </div>
  );
}
