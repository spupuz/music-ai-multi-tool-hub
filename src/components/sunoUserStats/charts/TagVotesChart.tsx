import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Chart } from 'chart.js';
import type { TagStat } from '@/types/sunoUserStatsTypes';
import { getBaseChartOptions, generateColorShades } from '@/utils/chartUtils';

interface TagVotesChartProps {
  data: TagStat[];
  barColorStart?: string;
  barColorEnd?: string;
  fontColor?: string;
  gridColor?: string;
  topN?: number;
  onSetFilter?: (filterType: string, filterValue: string) => void;
}

const TagVotesChart: React.FC<TagVotesChartProps> = ({ 
  data, 
  barColorStart = '#F3E5F5',
  barColorEnd = '#7B1FA2',
  fontColor = '#e5e7eb',
  gridColor = '#374151',
  topN = 10, 
  onSetFilter,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => { if (typeof window !== 'undefined') setScreenWidth(window.innerWidth); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const processedData = useMemo(() => [...data].filter(d => d.totalUpvotes > 0).sort((a, b) => b.totalUpvotes - a.totalUpvotes).slice(0, topN), [data, topN]);

  // ⚡ Bolt: Memoize chart data transformations to prevent O(n) re-calculations on every render
  const chartConfig = useMemo(() => {
    if (!processedData || processedData.length === 0) return null;

    const labels = processedData.map(d => d.name);
    const counts = processedData.map(d => d.totalUpvotes);
    const maxCount = Math.max(...counts, 0);
    const suggestedMax = maxCount + Math.ceil(maxCount * 0.05);

    const bgColors = generateColorShades(barColorStart, barColorEnd, processedData.length);
    const borderColors = bgColors.map(c => c.replace(')', ', 0.7)').replace('rgb', 'rgba'));

    return { labels, counts, suggestedMax, bgColors, borderColors };
  }, [processedData, barColorStart, barColorEnd]);


  useEffect(() => {
    if (chartRef.current && processedData.length > 0 && chartConfig) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const chartOptions = getBaseChartOptions(fontColor, gridColor) as any;
        chartOptions.indexAxis = 'x'; 
        
        chartOptions.scales.x.title = { display: true, text: 'Tag', color: fontColor, font: { size: 10 } };
        chartOptions.scales.x.ticks = {
            ...chartOptions.scales.x.ticks,
            color: fontColor,
            font: { 
                family: "'Inter', sans-serif", 
                size: screenWidth < 420 ? 7 : (screenWidth < 768 ? 8 : 9)
            },
            maxRotation: screenWidth < 768 ? 90 : 45,
            minRotation: screenWidth < 420 ? 90 : 30,
            callback: function(value: any) { 
                const label = this.getLabelForValue(value);
                const maxLength = screenWidth < 420 ? 8 : (screenWidth < 768 ? 12 : 15);
                return label.length > maxLength 
                   ? label.substring(0, maxLength - 2) + '...' 
                   : label;
            }
        };
        
        chartOptions.scales.y.title = { display: true, text: 'Total Upvotes', color: fontColor, font: { size: 10 } };
        chartOptions.scales.y.ticks = { 
            ...chartOptions.scales.y.ticks,
            color: fontColor,
            font: { family: "'Inter', sans-serif", size: 10 },
            precision: 0,
            callback: function(value: any) {
                if (Number(value) >= 1000) return (Number(value) / 1000) + 'k';
                return Number(value).toLocaleString();
            }
        };
        chartOptions.scales.y.suggestedMax = chartConfig.suggestedMax;
        
        chartOptions.plugins.tooltip.callbacks = {
          title: function(tooltipItems: any) { 
            if (tooltipItems.length > 0) {
                const dataIndex = tooltipItems[0].dataIndex;
                return processedData[dataIndex]?.name || '';
            }
            return '';
          },
          label: function(context: any) {
            return ` Upvotes: ${context.parsed.y.toLocaleString()}`; 
          }
        };

        const datasetOptions = {
            barPercentage: screenWidth < 768 ? 0.7 : 0.8,
            categoryPercentage: screenWidth < 768 ? 0.8 : 0.9,
        };

        chartOptions.layout = {
            padding: {
                left: 5,
                right: 5,
                top: 5,
                bottom: 0
            }
        };
        
        if (onSetFilter) {
          chartOptions.onClick = (_event: any, elements: any[]) => {
            if (elements.length > 0) {
              const chartElement = elements[0];
              const index = chartElement.index;
              const tagName = processedData[index]?.name;
              if (tagName) {
                onSetFilter('tag', tagName);
              }
            }
          };
        }
        
        const datasetConfig = {
          label: 'Total Upvotes on Tag',
          data: chartConfig.counts,
          backgroundColor: chartConfig.bgColors,
          borderColor: chartConfig.borderColors,
          borderWidth: 1,
          ...datasetOptions
        };

        // ⚡ Bolt: Mutate data and update without animation instead of destroying and rebuilding the chart on every render/resize
        if (chartInstanceRef.current) {
          chartInstanceRef.current.data.labels = chartConfig.labels;
          chartInstanceRef.current.data.datasets[0] = datasetConfig;
          chartInstanceRef.current.options = chartOptions;
          chartInstanceRef.current.update('none');
        } else {
          chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: chartConfig.labels,
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
  }, [processedData, chartConfig, fontColor, gridColor, topN, onSetFilter, screenWidth]);

  // ⚡ Bolt: Clean up the chart only when the component is unmounted
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  if (!processedData || processedData.length === 0) {
    return <p className="text-center text-gray-500 text-sm italic py-4">No tag vote data available.</p>;
  }

  return <canvas ref={chartRef} aria-label="Tag Votes Chart"></canvas>;
};

export default TagVotesChart;