import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Chart } from 'chart.js';
import { getBaseChartOptions, generateColorShades } from '@/utils/chartUtils';

interface SongsByDayOfWeekChartProps {
  data: Record<string, number>; // { '0': count, '1': count, ... } (Sunday to Saturday)
  barColor?: string;
  fontColor?: string;
  gridColor?: string;
  onSetFilter?: (filterType: string, filterValue: string) => void;
}

const SongsByDayOfWeekChart: React.FC<SongsByDayOfWeekChartProps> = ({
  data,
  barColor = '#8B5CF6', // Default Purple
  fontColor = '#e5e7eb',
  gridColor = '#374151',
  onSetFilter,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setScreenWidth(window.innerWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ⚡ Bolt: Memoize static array to prevent recreation on every render
  const daysOfWeek = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);

  // ⚡ Bolt: Memoize mapped data to prevent unnecessary re-calculations
  const chartData = useMemo(() => daysOfWeek.map((day, index) => data[index.toString()] || 0), [data, daysOfWeek]);

  useEffect(() => {
    if (chartRef.current && chartData.some(count => count > 0)) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const chartOptions = getBaseChartOptions(fontColor, gridColor, (context) => {
          const counts = context.chart.data.datasets[0].data as number[];
          if (!counts || counts.length === 0) return 5;
          const maxVal = Math.max(...counts);
          return Math.max(5, maxVal + Math.ceil(maxVal * 0.1));
        }) as any;
        
        chartOptions.scales.x.title = { display: true, text: 'Day of Week', color: fontColor, font: { size: 10 } };
        chartOptions.scales.x.ticks.font = { 
          ...chartOptions.scales.x.ticks.font, 
          size: screenWidth < 420 ? 8 : 10 
        };
        chartOptions.scales.x.ticks.maxRotation = screenWidth < 420 ? 45 : 0;
        
        chartOptions.scales.y.title = { display: true, text: 'Songs Created', color: fontColor, font: { size: 10 } };

        const datasetOptions = {
          barPercentage: screenWidth < 420 ? 0.8 : 0.6,
          categoryPercentage: screenWidth < 420 ? 0.9 : 0.7,
        };

        if (onSetFilter) {
          chartOptions.onClick = (_event: any, elements: any[]) => {
            if (elements.length > 0) {
              const chartElement = elements[0];
              const index = chartElement.index; // Index corresponds to day (0=Sun, 1=Mon, etc.)
              onSetFilter('dayOfWeek', String(index));
            }
          };
        }

        const datasetConfig = {
          label: 'Songs Created',
          data: chartData,
          backgroundColor: barColor,
          borderColor: barColor.replace(')', ', 0.7)').replace('rgb', 'rgba'), // Assuming barColor might be rgb
          borderWidth: 1,
          ...datasetOptions,
        };

        // ⚡ Bolt: Mutate existing instance and call update('none') for O(1) rendering updates,
        // rather than O(n) destroying and rebuilding the entire Chart canvas on every prop/window resize.
        // Impact: Eliminates significant UI lag and canvas flashing when resizing the window.
        if (chartInstanceRef.current) {
          chartInstanceRef.current.data.labels = daysOfWeek;
          chartInstanceRef.current.data.datasets[0] = datasetConfig;
          chartInstanceRef.current.options = chartOptions;
          chartInstanceRef.current.update('none');
        } else {
          chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: daysOfWeek,
              datasets: [datasetConfig]
            },
            options: chartOptions,
          });
        }
      }
    } else if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
    }
  }, [chartData, barColor, fontColor, gridColor, onSetFilter, screenWidth, daysOfWeek]);

  // ⚡ Bolt: Separate cleanup to run strictly on unmount to prevent repeated setup/teardown
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  if (!chartData.some(count => count > 0)) {
    return <p className="text-center text-gray-500 text-sm italic py-4">No song creation data by day of week.</p>;
  }

  return <canvas ref={chartRef} aria-label="Songs Created by Day of Week Chart"></canvas>;
};

export default SongsByDayOfWeekChart;