import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import type { HistoricalDataPoint } from '../../../types/sunoUserStatsTypes';
import { getBaseChartOptions } from '../../../utils/chartUtils';

interface CommentsTrendChartProps {
  data: HistoricalDataPoint[];
  lineColor?: string;
  fontColor?: string;
  gridColor?: string;
}

const CommentsTrendChart: React.FC<CommentsTrendChartProps> = ({ 
  data, 
  lineColor = '#FFCA28', // Yellowish color for comments
  fontColor = '#e5e7eb',
  gridColor = '#374151',
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => { if (typeof window !== 'undefined') setScreenWidth(window.innerWidth); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (chartRef.current && data && data.length > 0) { 
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const values = data.map(d => d.value);
        let yMinCalculated: number | undefined = undefined;
        let yMaxCalculated: number | undefined = undefined;

        if (values.length > 0) {
          const minVal = Math.min(...values);
          const maxVal = Math.max(...values);

          if (values.length === 1) {
            const padding = Math.max(2, Math.abs(minVal * 0.1) || 5);
            yMinCalculated = Math.max(0, minVal - padding);
            yMaxCalculated = maxVal + padding;
            if (yMinCalculated >= yMaxCalculated) yMaxCalculated = yMinCalculated + 10;
          } else {
            const range = maxVal - minVal;
            if (range === 0) {
              const padding = Math.max(2, Math.abs(minVal * 0.05) || 5);
              yMinCalculated = Math.max(0, minVal - padding);
              yMaxCalculated = maxVal + padding;
            } else {
              const padding = Math.max(range * 0.1, 1);
              yMinCalculated = Math.max(0, minVal - padding);
              yMaxCalculated = maxVal + padding;
            }
          }
        }
        
        const baseOptions = getBaseChartOptions(fontColor, gridColor);

        const chartOptions = {
          ...baseOptions,
          elements: {
            ...(baseOptions.elements || {}),
            point: {
              radius: screenWidth < 768 ? 2 : 3,
              hoverRadius: screenWidth < 768 ? 4 : 5,
            },
          },
          scales: {
            ...baseOptions.scales,
            x: {
              ...(baseOptions.scales?.x as object),
              type: 'time',
              time: {
                unit: data.length > 15 && screenWidth < 768 ? 'week' : 'day',
                tooltipFormat: 'MMM dd, yyyy HH:mm',
                displayFormats: { day: 'MMM dd', week: 'MMM dd', month: 'MMM yyyy' },
              },
              ticks: {
                ...(baseOptions.scales?.x?.ticks as object),
                maxRotation: screenWidth < 768 ? 90 : 45,
                minRotation: screenWidth < 420 ? 90 : 30,
                font: {
                  ...((baseOptions.scales?.x?.ticks as any)?.font || {}),
                  size: screenWidth < 768 ? 8 : 10,
                },
              },
            },
            y: {
              ...(baseOptions.scales?.y as object),
              min: yMinCalculated,
              max: yMaxCalculated,
              title: {
                ...(baseOptions.scales?.y?.title as object),
                display: true,
                text: 'Total Comments',
              },
            },
          },
        };
        
        chartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.map(d => d.timestamp), 
            datasets: [{
              label: 'Total Comments',
              data: values,
              borderColor: lineColor,
              backgroundColor: lineColor + '33',
              tension: data.length > 2 ? 0.1 : 0,
              fill: data.length > 1,
              pointRadius: data.length === 1 ? 5 : 3,
              pointHoverRadius: data.length === 1 ? 7 : 5,
              pointBackgroundColor: lineColor,
            }]
          },
          options: chartOptions as any,
        });
      }
    } else if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, lineColor, fontColor, gridColor, screenWidth]);

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 text-sm italic py-4">No data available for comments trend.</p>;
  }
  
  return <canvas ref={chartRef} aria-label="Comments Trend Chart"></canvas>;
};

export default CommentsTrendChart;