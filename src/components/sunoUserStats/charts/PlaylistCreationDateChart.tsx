// components/sunoUserStats/charts/PlaylistCreationDateChart.tsx
import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js';
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
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const chartOptions = getBaseChartOptions(fontColor, gridColor, (context) => {
          const counts = context.chart.data.datasets[0].data as number[];
          const maxVal = Math.max(...counts);
          return Math.max(5, Math.ceil(maxVal * 1.1));
        }) as any;

        chartOptions.scales.x.title = { display: true, text: 'Creation Month', color: fontColor, font: { size: 10 } };
        chartOptions.scales.y.title = { display: true, text: 'Songs Created', color: fontColor, font: { size: 10 } };

        const labels = data.map(d => d.month);
        const datasetConfig = {
          label: 'Songs Created',
          data: data.map(d => d.count),
          backgroundColor: barColor,
          borderColor: barColor.replace(')', ', 0.7)').replace('rgb', 'rgba'),
          borderWidth: 1,
        };

        if (chartInstanceRef.current) {
          chartInstanceRef.current.data.labels = labels;
          chartInstanceRef.current.data.datasets[0] = datasetConfig;
          chartInstanceRef.current.options = chartOptions;
          chartInstanceRef.current.update('none');
        } else {
          chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: labels,
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
  }, [data, barColor, fontColor, gridColor]);

  // ⚡ Bolt: Clean up the chart only when the component is unmounted
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 text-sm italic py-4">No creation date data available for this playlist.</p>;
  }

  return <canvas ref={chartRef} aria-label="Playlist Song Creation Date Chart"></canvas>;
};

export default PlaylistCreationDateChart;
