import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto'; // Import Chart from 'chart.js/auto'
import type { DailyCreationStat } from '@/types/sunoUserStatsTypes';
import { getBaseChartOptions } from '@/utils/chartUtils';

interface DailySongCreationChartProps {
  data: DailyCreationStat[];
  lineColor?: string;
  fontColor?: string;
  gridColor?: string;
}

const DailySongCreationChart: React.FC<DailySongCreationChartProps> = ({ 
  data, 
  lineColor = '#ff4444',
  fontColor = '#e5e7eb',
  gridColor = '#374151',
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

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const chartOptions = getBaseChartOptions(fontColor, gridColor, (context) => {
            const counts = context.chart.data.datasets[0].data as number[];
            if (!counts || counts.length === 0) return 5; // Default if no data
            const maxVal = Math.max(...counts);
            return Math.max(5, maxVal + Math.ceil(maxVal*0.1)); // Ensure y-axis is at least 5, or 10% padding
        }) as any;

        chartOptions.scales.x = {
          ...(chartOptions.scales?.x as object),
          type: 'time',
          time: {
            unit: screenWidth < 768 ? 'week' : 'day',
            tooltipFormat: 'MMM dd, yyyy',
            displayFormats: { day: 'MMM dd', week: 'MMM dd' }
          },
          ticks: {
            ...(chartOptions.scales?.x?.ticks as object),
            font: { ...((chartOptions.scales?.x?.ticks as any)?.font || {}), size: screenWidth < 768 ? 8 : 10 },
            maxRotation: screenWidth < 768 ? 60 : 25,
            minRotation: screenWidth < 768 ? 30 : 0,
          }
        };

        chartOptions.elements = {
          ...(chartOptions.elements || {}),
          point: {
            radius: screenWidth < 768 ? 2 : 3,
            hoverRadius: screenWidth < 768 ? 4 : 5,
          }
        };
        
        chartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            datasets: [{
              label: 'Songs Created',
              data: data.map(d => ({ 
                x: new Date(d.date).getTime() + new Date(d.date).getTimezoneOffset() * 60000, 
                y: d.count 
              })),
              borderColor: lineColor,
              backgroundColor: lineColor + '33', // semi-transparent fill
              tension: 0.1,
              fill: true,
              pointRadius: 3,
              pointHoverRadius: 5,
              pointBackgroundColor: lineColor,
            }]
          },
          options: chartOptions,
        });
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, lineColor, fontColor, gridColor, screenWidth]);

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 text-sm italic py-4">No daily song creation data for the last 30 days.</p>;
  }

  return <canvas ref={chartRef} aria-label="Daily Song Creation Chart"></canvas>;
};

export default DailySongCreationChart;