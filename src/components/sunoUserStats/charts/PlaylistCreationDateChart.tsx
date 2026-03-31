// components/sunoUserStats/charts/PlaylistCreationDateChart.tsx
import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { getBaseChartOptions } from '@/utils/chartUtils';

interface PlaylistCreationDateChartProps {
  data: Array<{ month: string; count: number }>;
  barColor?: string;
  fontColor?: string;
  gridColor?: string;
}

const PlaylistCreationDateChart: React.FC<PlaylistCreationDateChartProps> = ({
  data,
  barColor = '#8B5CF6', // Purple
  fontColor = '#e5e7eb',
  gridColor = '#374151',
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const chartOptions = getBaseChartOptions(fontColor, gridColor, (context) => {
          const counts = context.chart.data.datasets[0].data as number[];
          const maxVal = Math.max(...counts);
          return Math.max(5, Math.ceil(maxVal * 1.1));
        }) as any;

        chartOptions.scales.x.title = { display: true, text: 'Creation Month', color: fontColor, font: { size: 10 } };
        chartOptions.scales.y.title = { display: true, text: 'Songs Created', color: fontColor, font: { size: 10 } };

        chartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.map(d => d.month),
            datasets: [{
              label: 'Songs Created',
              data: data.map(d => d.count),
              backgroundColor: barColor,
              borderColor: barColor.replace(')', ', 0.7)').replace('rgb', 'rgba'),
              borderWidth: 1,
            }]
          },
          options: chartOptions,
        });
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, barColor, fontColor, gridColor]);

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 text-sm italic py-4">No creation date data available for this playlist.</p>;
  }

  return <canvas ref={chartRef} aria-label="Playlist Song Creation Date Chart"></canvas>;
};

export default PlaylistCreationDateChart;
