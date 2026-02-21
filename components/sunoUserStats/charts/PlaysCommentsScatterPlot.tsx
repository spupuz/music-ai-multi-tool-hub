
import React, { useEffect, useRef } from 'react';
import { Chart, ScatterController, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js/auto';
import type { SunoClip } from '../../../types';
import { getBaseChartOptions } from '../../../utils/chartUtils';

Chart.register(ScatterController, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PlaysCommentsScatterPlotProps {
  songs: SunoClip[];
  averageCommentRateOverall: number | null; // As a percentage, e.g., 1 for 1%
  fontColor?: string;
  gridColor?: string;
  pointColor?: string;
  referenceLineColor?: string;
}

const PlaysCommentsScatterPlot: React.FC<PlaysCommentsScatterPlotProps> = ({
  songs,
  averageCommentRateOverall,
  fontColor = '#e5e7eb',
  gridColor = '#374151',
  pointColor = '#FBBF24', // Amber-400 for comments
  referenceLineColor = '#8B5CF6', // Violet-500 for comments reference
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart<'scatter'> | null>(null);

  const chartData = songs.map(song => ({
    x: song.play_count || 0,
    y: song.comment_count || 0,
    title: song.title,
    commentRate: song.play_count > 0 ? ((song.comment_count || 0) / song.play_count) * 100 : 0,
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
              title: { display: true, text: 'Total Comments', color: fontColor },
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
                    const commentRateDisplay = typeof pointData.commentRate === 'number'
                      ? pointData.commentRate.toFixed(2) + '%'
                      : 'N/A';
                    return [
                      'Song: ' + (pointData.title || 'N/A'),
                      'Plays: ' + (pointData.x?.toLocaleString() ?? 'N/A'),
                      'Comments: ' + (pointData.y?.toLocaleString() ?? 'N/A'),
                      'Comment Rate: ' + commentRateDisplay,
                    ];
                  } else if (datasetLabel.startsWith('Avg. Comment Rate') && pointData) {
                     return datasetLabel + ': (Plays: ' + (pointData.x?.toLocaleString() ?? 'N/A') + 
                           ', Est. Comments: ' + (pointData.y?.toFixed(0).toLocaleString() ?? 'N/A') + ')';
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
        if (maxPlays > 0 && averageCommentRateOverall !== null && averageCommentRateOverall !== undefined) {
            datasets.push({
                label: `Avg. Comment Rate (${averageCommentRateOverall.toFixed(1)}%)`,
                data: [{x: 0, y: 0}, {x: maxPlays, y: maxPlays * (averageCommentRateOverall / 100)}],
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
          data: { datasets },
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
  }, [chartData, averageCommentRateOverall, fontColor, gridColor, pointColor, referenceLineColor]);

  if (chartData.length === 0) {
    return <p className="text-center text-gray-500 text-sm italic py-4">No song data available for scatter plot.</p>;
  }

  return <canvas ref={chartRef} aria-label="Plays vs. Comments Scatter Plot"></canvas>;
};

export default PlaysCommentsScatterPlot;
