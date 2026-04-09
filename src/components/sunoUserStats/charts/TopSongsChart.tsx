
import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import type { SunoClip } from '@/types';
import { getBaseChartOptions } from '@/utils/chartUtils';

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;

interface TopSongsChartProps {
  songs: SunoClip[];
  metric: 'play_count' | 'upvote_count';
  valueLabel: string; 
  barColor?: string;
  fontColor?: string;
  gridColor?: string;
  topN?: number; 
}

const TopSongsChart: React.FC<TopSongsChartProps> = ({
  songs,
  metric,
  valueLabel,
  barColor = '#60A5FA', 
  fontColor = '#e5e7eb',
  gridColor = '#374151',
  topN = 10, 
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [screenWidth, setScreenWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => { if (typeof window !== 'undefined') setScreenWidth(window.innerWidth); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter for valid song objects before processing
  const validSongs = songs.filter(song => song && typeof song === 'object');
  const processedSongs = validSongs.sort((a,b) => (b[metric] || 0) - (a[metric] || 0)).slice(0, topN);


  useEffect(() => {
    if (chartRef.current && processedSongs.length > 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const chartDataValues = processedSongs.map(song => song[metric] || 0);
        const chartOptions = getBaseChartOptions(fontColor, gridColor, (context) => {
            const values = context.chart.data.datasets[0].data as number[];
            if (!values || values.length === 0) return 5;
            const maxVal = Math.max(...values);
            return Math.max(5, maxVal + Math.ceil(maxVal * 0.05));
        }) as any;
        
        chartOptions.indexAxis = 'x'; 
        chartOptions.scales.x.title = { display: screenWidth > 640, text: 'Song Title', color: fontColor, font: { size: 10 } };
        chartOptions.scales.x.ticks = {
            ...chartOptions.scales.x.ticks,
            color: fontColor,
            font: { 
                family: "'Inter', sans-serif", 
                size: topN <= 5 ? 7 : 8 
            }, 
            maxRotation: screenWidth < 480 ? 45 : 60, 
            minRotation: screenWidth < 480 ? 45 : 30,
            padding: screenWidth < 640 ? 4 : 0,
            callback: function(value: any) { 
                const label = processedSongs[value]?.title || '';
                return label.length > (topN <= 3 ? 7 : (topN <= 5 ? 10 : 15)) 
                   ? label.substring(0, (topN <= 3 ? 5 : (topN <= 5 ? 7 : 12))) + '...' 
                   : label;
            }
        };
        chartOptions.scales.y.title = { display: screenWidth > 640, text: valueLabel, color: fontColor, font: { size: 10 } };
        chartOptions.plugins.tooltip.callbacks = {
            title: function(tooltipItems: any[]) { // Typed tooltipItems
                 if (tooltipItems.length > 0) {
                    const dataIndex = tooltipItems[0].dataIndex;
                    return processedSongs[dataIndex]?.title || '';
                 }
                 return '';
            },
            label: function(context: any) {
                return ` ${valueLabel}: ${context.parsed.y.toLocaleString()}`; 
            }
        };

        const datasetOptions = {
            barPercentage: topN <= 3 ? 0.5 : (topN <= 5 ? 0.6 : 0.7),
            categoryPercentage: topN <= 3 ? 0.6 : (topN <= 5 ? 0.7 : 0.8),
        };

        chartOptions.layout = {
            padding: {
                left: screenWidth < 640 ? 2 : (topN <= 3 ? 0 : 5),
                right: screenWidth < 640 ? 2 : (topN <= 3 ? 0 : 5),
                top: 5,
                bottom: screenWidth < 640 ? 45 : 0 
            }
        };
        chartOptions.scales.y.ticks = {
            ...chartOptions.scales.y.ticks,
            font: { size: screenWidth < 480 ? 8 : 10 },
            padding: screenWidth < 640 ? 2 : 4
        };

        chartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: processedSongs.map(song => song.title), 
            datasets: [{
              label: valueLabel,
              data: chartDataValues,
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
  }, [processedSongs, metric, valueLabel, barColor, fontColor, gridColor, topN, screenWidth]);

  if (!processedSongs || processedSongs.length === 0) {
    return <p className="text-center text-gray-500 text-sm italic py-4">No song data available for this chart.</p>;
  }

  return (
     <div className="flex flex-col items-center"> {/* Removed h-full */}
      <div className="flex-grow w-full relative min-h-0">
        <canvas ref={chartRef} aria-label={`Top Songs by ${valueLabel} Chart`}></canvas>
      </div>
      <div className="flex-shrink-0 flex flex-wrap justify-center items-end gap-x-1 gap-y-1 mt-2 px-1 w-full overflow-x-auto">
        {processedSongs.map((song) => (
          <a 
            key={`cover-${song.id}`} 
            href={song.suno_song_url || `https://suno.com/song/${song.id}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            title={`View ${song.title} on Suno`}
            className="flex flex-col items-center group transform transition-transform hover:scale-105"
            style={{ minWidth: '40px', maxWidth: '50px' }} 
          >
            <img
              src={song.image_url || FALLBACK_IMAGE_DATA_URI}
              alt={song.title}
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-cover rounded border border-gray-600 group-hover:border-emerald-500 group-hover:shadow-lg transition-all"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export default TopSongsChart;
