
import React, { useEffect, useRef } from 'react';
import { Chart, ScatterController, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js/auto';
import type { SunoClip } from '../../../types';
import { getBaseChartOptions } from '../../../utils/chartUtils';

Chart.register(ScatterController, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PlaysUpvotesScatterPlotProps {
  songs: SunoClip[];
  averageUpvoteRateOverall: number; // As a percentage, e.g., 10 for 10%
  fontColor?: string;
  gridColor?: string;
  pointColor?: string;
  referenceLineColor?: string;
}

const PlaysUpvotesScatterPlot: React.FC<PlaysUpvotesScatterPlotProps> = ({
  songs,
  averageUpvoteRateOverall,
  fontColor = '#e5e7eb',
  gridColor = '#374151',
  pointColor = '#3B82F6', // Blue-500
  referenceLineColor = '#F59E0B', // Amber-500
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart<'scatter'> | null>(null);

  const chartData = songs.map(song => ({
    x: song.play_count || 0,
    y: song.upvote_count || 0,
    title: song.title,
    upvoteRate: song.play_count > 0 ? ((song.upvote_count || 0) / song.play_count) * 100 : 0,
  }));

  useEffect(() => {
    if (chartRef.current && chartData.length > 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const baseOptions = getBaseChartOptions(fontColor, gridColor);
        const scatterOptions: any = {
          ...baseOptions,
          scales: {
            x: {
              ...(baseOptions.scales?.x as object),
              type: 'linear',
              position: 'bottom',
              title: { display: true, text: 'Total Plays', color: fontColor },
            },
            y: {
              ...(baseOptions.scales?.y as object),
              type: 'linear',
              title: { display: true, text: 'Total Upvotes', color: fontColor },
            },
          },
          plugins: {
            ...baseOptions.plugins,
            tooltip: {
              ...baseOptions.plugins?.tooltip,
              callbacks: {
                label: function (context: any) {
                  const pointData = context.raw as any;
                  const datasetLabel = context.dataset.label || '';

                  if (datasetLabel === 'Songs' && pointData) {
                    const upvoteRateDisplay = typeof pointData.upvoteRate === 'number'
                      ? pointData.upvoteRate.toFixed(1) + '%'
                      : 'N/A';
                    return [
                      'Song: ' + (pointData.title || 'N/A'),
                      'Plays: ' + (pointData.x?.toLocaleString() ?? 'N/A'),
                      'Upvotes: ' + (pointData.y?.toLocaleString() ?? 'N/A'),
                      'Upvote Rate: ' + upvoteRateDisplay,
                    ];
                  } else if (datasetLabel.startsWith('Avg. Upvote Rate') && pointData) {
                    return datasetLabel + ': (Plays: ' + (pointData.x?.toLocaleString() ?? 'N/A') + 
                           ', Est. Upvotes: ' + (pointData.y?.toFixed(0).toLocaleString() ?? 'N/A') + ')';
                  }
                  return datasetLabel + ': ' + (pointData.y?.toLocaleString() ?? 'N/A');
                },
              },
            },
            legend: {
                 display: true, 
                 position: 'bottom',
                 labels: { color: fontColor }
            }
          },
        };
        
        const datasets: any[] = [{
          label: 'Songs',
          data: chartData,
          backgroundColor: pointColor,
          pointRadius: 5,
          pointHoverRadius: 7,
        }];

        const maxPlays = Math.max(...chartData.map(d => d.x), 0);
        if (maxPlays > 0 && averageUpvoteRateOverall !== undefined && averageUpvoteRateOverall !== null) { // Added null check for safety
            datasets.push({
                label: `Avg. Upvote Rate (${averageUpvoteRateOverall.toFixed(1)}%)`,
                data: [{x: 0, y: 0}, {x: maxPlays, y: maxPlays * (averageUpvoteRateOverall / 100)}],
                type: 'line',
                borderColor: referenceLineColor,
                borderWidth: 1.5,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                tension: 0,
            });
        }


        chartInstanceRef.current = new Chart(ctx, {
          type: 'scatter',
          data: {
            datasets: datasets
          },
          options: scatterOptions,
        });
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [chartData, averageUpvoteRateOverall, fontColor, gridColor, pointColor, referenceLineColor]);

  if (chartData.length === 0) {
    return <p className="text-center text-gray-500 text-sm italic py-4">No song data available for scatter plot.</p>;
  }

  return <canvas ref={chartRef} aria-label="Plays vs. Upvotes Scatter Plot"></canvas>;
};

export default PlaysUpvotesScatterPlot;
