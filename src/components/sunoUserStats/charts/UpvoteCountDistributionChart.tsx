import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { getBaseChartOptions } from '@/utils/chartUtils';

interface UpvoteCountDistributionChartProps {
  data: Record<string, number>; // Key: "0-5", Value: count
  barColor?: string;
  fontColor?: string;
  gridColor?: string;
}

const UpvoteCountDistributionChart: React.FC<UpvoteCountDistributionChartProps> = ({
  data,
  barColor = '#A78BFA', // Violet
  fontColor = '#e5e7eb',
  gridColor = '#374151',
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const chartLabels = Object.keys(data);
  const chartDataValues = Object.values(data) as number[];

  useEffect(() => {
    if (chartRef.current && chartLabels.length > 0 && chartDataValues.some((v: number) => v > 0)) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const chartOptions = getBaseChartOptions(fontColor, gridColor, (context) => {
            const values = context.chart.data.datasets[0].data as number[];
            if (!values || values.length === 0) return 5;
            const maxVal = Math.max(...values);
            return Math.max(5, maxVal + Math.ceil(maxVal * 0.1));
        }) as any;
        
        chartOptions.scales.x.title = { display: true, text: 'Upvote Count Buckets', color: fontColor, font: { size: 10 } };
        chartOptions.scales.y.title = { display: true, text: 'Number of Songs', color: fontColor, font: { size: 10 } };

        chartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: chartLabels,
            datasets: [{
              label: 'Songs in Upvote Bracket',
              data: chartDataValues,
              backgroundColor: barColor,
              borderColor: barColor.replace(')', ', 0.7)').replace('rgb', 'rgba'),
              borderWidth: 1,
              barPercentage: 0.7,
              categoryPercentage: 0.8,
            }]
          },
          options: chartOptions,
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
  }, [chartLabels, chartDataValues, barColor, fontColor, gridColor]);

  if (!chartDataValues.some(v => v > 0)) {
    return <p className="text-center text-gray-500 text-sm italic py-4">No upvote count distribution data available.</p>;
  }

  return <canvas ref={chartRef} aria-label="Upvote Count Distribution Chart"></canvas>;
};

export default UpvoteCountDistributionChart;
