
import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import type { SongTrendData } from '@/types/sunoUserStatsTypes';
import { getBaseChartOptions } from '@/utils/chartUtils';

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;

interface SongTrendChartProps {
  data: SongTrendData[];
  valueLabel: string; 
  barColor?: string;   
  fontColor?: string;
  gridColor?: string;
  topNValue?: number; 
}

const SongTrendChart: React.FC<SongTrendChartProps> = ({ 
  data, 
  valueLabel,
  barColor = '#4A90E2', 
  fontColor = '#e5e7eb',
  gridColor = '#374151',
  topNValue = 10, 
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Filter for valid items and sort, then slice
  const validData = data.filter(item => item && item.song);
  const processedData = validData.sort((a, b) => b.increase - a.increase).slice(0, topNValue);

  useEffect(() => {
    if (chartRef.current && processedData.length > 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const chartOptions = getBaseChartOptions(fontColor, gridColor) as any;
        
        chartOptions.scales.x.ticks.font = { 
            ...chartOptions.scales.x.ticks.font, 
            size: topNValue <= 5 ? 7 : 8 
        };
        chartOptions.scales.x.ticks.maxRotation = 60;
        chartOptions.scales.x.ticks.minRotation = 30;
        
        chartOptions.scales.y.title = { display: true, text: valueLabel, color: fontColor, font: {size: 10} };
        chartOptions.scales.y.suggestedMax = Math.max(...processedData.map(d => d.increase)) + Math.ceil(Math.max(...processedData.map(d => d.increase))*0.05);
        
        chartOptions.plugins.tooltip.callbacks = {
            title: function(tooltipItems: any[]) { // Typed tooltipItems
                if (tooltipItems.length > 0) {
                     const dataIndex = tooltipItems[0].dataIndex;
                     // Use processedData which is already filtered
                     return processedData[dataIndex]?.song?.title || '';
                }
                return '';
            },
            label: function(context: any) {
                return ` ${valueLabel}: ${context.parsed.y.toLocaleString()}`;
            }
        };
        
        chartOptions.scales.x.ticks.callback = function(value: any) {
            // Use processedData which is already filtered
            const label = processedData[value]?.song?.title || '';
            return label.length > (topNValue <= 3 ? 7 : (topNValue <= 5 ? 10 : 15)) 
                   ? label.substring(0, (topNValue <= 3 ? 5 : (topNValue <= 5 ? 7 : 12))) + '...' 
                   : label;
        };

        const datasetOptions = {
            barPercentage: topNValue <= 3 ? 0.5 : (topNValue <= 5 ? 0.6 : 0.7),
            categoryPercentage: topNValue <= 3 ? 0.6 : (topNValue <= 5 ? 0.7 : 0.8),
        };

        chartOptions.layout = {
            padding: {
                left: topNValue <= 3 ? 0 : 5,
                right: topNValue <= 3 ? 0 : 5,
                top: 5,
                bottom: 0
            }
        };

        chartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: processedData.map(d => d.song.title), 
            datasets: [{
              label: valueLabel,
              data: processedData.map(d => d.increase),
              backgroundColor: barColor,
              borderColor: barColor.replace(')', ', 0.7)').replace('rgb', 'rgba'), 
              borderWidth: 1,
              ...datasetOptions
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
  }, [processedData, valueLabel, barColor, fontColor, gridColor, topNValue]);

  if (!processedData || processedData.length === 0) {
    return <p className="text-center text-gray-500 text-sm italic py-4">No song trend data available for this period.</p>;
  }

  return (
    <div className="flex flex-col items-center"> {/* Removed h-full */}
      <div className="flex-grow w-full relative min-h-0"> 
        <canvas ref={chartRef} aria-label={`${valueLabel} Trend Chart`}></canvas>
      </div>
      <div className="flex-shrink-0 flex flex-wrap justify-center items-end gap-x-1 gap-y-1 mt-2 px-1 w-full overflow-x-auto">
        {processedData.map((item) => (
          <a 
            key={item.song.id} 
            href={item.song.suno_song_url || `https://suno.com/song/${item.song.id}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            title={`View ${item.song.title} on Suno`}
            className="flex flex-col items-center group transform transition-transform hover:scale-105"
            style={{ minWidth: '40px', maxWidth: '50px' }} 
          >
            <img
              src={item.song.image_url || FALLBACK_IMAGE_DATA_URI}
              alt={item.song.title}
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-cover rounded border border-gray-600 group-hover:border-emerald-500 group-hover:shadow-lg transition-all"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export default SongTrendChart;
