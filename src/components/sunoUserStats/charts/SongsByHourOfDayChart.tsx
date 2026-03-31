import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { getBaseChartOptions } from '@/utils/chartUtils';

interface SongsByHourOfDayChartProps {
  data: Record<string, number>; // { '0': count, '1': count, ... '23': count }
  barColor?: string;
  fontColor?: string;
  gridColor?: string;
  onSetFilter?: (filterType: string, filterValue: string) => void;
}

const SongsByHourOfDayChart: React.FC<SongsByHourOfDayChartProps> = ({
  data,
  barColor = '#EC4899', // Default Pink
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


  const hoursOfDay = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
  const chartData = hoursOfDay.map((_, index) => data[index.toString()] || 0);

  useEffect(() => {
    if (chartRef.current && chartData.some(count => count > 0)) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const chartOptions = getBaseChartOptions(fontColor, gridColor, (context) => {
          const counts = context.chart.data.datasets[0].data as number[];
          const maxVal = Math.max(...counts);
          return Math.max(5, maxVal + Math.ceil(maxVal * 0.1));
        }) as any;

        chartOptions.scales.x.title = { display: true, text: "Hour of Day (User's Local Time)", color: fontColor, font: { size: 10 } };
        
        let labelSkipInterval = 1;
        let tickFontSize = 10;
        if (screenWidth < 420) {
          labelSkipInterval = 4; // Show every 4th hour
          tickFontSize = 7;
        } else if (screenWidth < 640) {
          labelSkipInterval = 2; // Show every 2nd hour
          tickFontSize = 8;
        } else if (screenWidth < 768) {
          labelSkipInterval = 1;
          tickFontSize = 9;
        }

        chartOptions.scales.x.ticks = {
            ...chartOptions.scales.x.ticks,
            font: { ...chartOptions.scales.x.ticks.font, size: tickFontSize },
            maxRotation: 90, // Ensure enough rotation
            minRotation: screenWidth < 640 ? 90 : 45, // Force 90 for smaller if needed
            callback: function(value: any, index: number) {
                if (index % labelSkipInterval === 0) {
                    return this.getLabelForValue(value);
                }
                return null; // Hide other labels
            }
        };
        
        chartOptions.scales.y.title = { display: true, text: 'Songs Created', color: fontColor, font: { size: 10 } };
        
        const datasetOptions = {
            barPercentage: screenWidth < 420 ? 0.9 : (screenWidth < 768 ? 0.8 : 0.7),
            categoryPercentage: screenWidth < 420 ? 0.9 : 0.85,
        };

        if (onSetFilter) {
          chartOptions.onClick = (_event: any, elements: any[]) => {
            if (elements.length > 0) {
              const chartElement = elements[0];
              const index = chartElement.index; // Index corresponds to hour (0-23)
              onSetFilter('hourOfDay', String(index));
            }
          };
        }
        
        chartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: hoursOfDay,
            datasets: [{
              label: 'Songs Created',
              data: chartData,
              backgroundColor: barColor,
              borderColor: barColor.replace(')', ', 0.7)').replace('rgb', 'rgba'),
              borderWidth: 1,
              ...datasetOptions,
            }]
          },
          options: chartOptions,
        });
      }
    } else if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
    }
    // It's important to clean up the chart instance when the component unmounts or dependencies change.
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [chartData, barColor, fontColor, gridColor, screenWidth, onSetFilter]);

  if (!chartData.some(count => count > 0)) {
    return <p className="text-center text-gray-500 text-sm italic py-4">No song creation data by hour of day.</p>;
  }

  return <canvas ref={chartRef} aria-label="Songs Created by Hour of Day Chart"></canvas>;
};

export default SongsByHourOfDayChart;