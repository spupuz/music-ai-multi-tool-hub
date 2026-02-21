import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import type { TagStat } from '../../../types/sunoUserStatsTypes';
import { getBaseChartOptions, generateColorShades } from '../../../utils/chartUtils';

interface TagUsageChartProps {
  data: TagStat[];
  barColorStart?: string;
  barColorEnd?: string;
  fontColor?: string;
  gridColor?: string;
  topN?: number;
  onSetFilter?: (filterType: string, filterValue: string) => void;
}

const TagUsageChart: React.FC<TagUsageChartProps> = ({ 
  data, 
  barColorStart = '#E8F5E9',
  barColorEnd = '#2E7D32',
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

  const processedData = data.sort((a, b) => b.count - a.count).slice(0, topN);

  useEffect(() => {
    if (chartRef.current && processedData.length > 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      
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
        
        chartOptions.scales.y.title = { display: true, text: 'Usage Count', color: fontColor, font: { size: 10 } };
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
        chartOptions.scales.y.suggestedMax = Math.max(...processedData.map(d => d.count)) + Math.ceil(Math.max(...processedData.map(d => d.count))*0.05);

        chartOptions.plugins.tooltip.callbacks = {
          title: function(tooltipItems: any) { 
            if (tooltipItems.length > 0) {
                const dataIndex = tooltipItems[0].dataIndex;
                return processedData[dataIndex]?.name || '';
            }
            return '';
          },
          label: function(context: any) {
            return ` Count: ${context.parsed.y.toLocaleString()}`; 
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

        chartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: processedData.map(d => d.name), 
            datasets: [{
              label: 'Tag Usage Count',
              data: processedData.map(d => d.count),
              backgroundColor: generateColorShades(barColorStart, barColorEnd, processedData.length),
              borderColor: generateColorShades(barColorStart, barColorEnd, processedData.length).map(c => c.replace(')', ', 0.7)').replace('rgb', 'rgba')),
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
  }, [processedData, barColorStart, barColorEnd, fontColor, gridColor, topN, onSetFilter, screenWidth]);

  if (!processedData || processedData.length === 0) {
    return <p className="text-center text-gray-500 text-sm italic py-4">No tag usage data available.</p>;
  }

  return <canvas ref={chartRef} aria-label="Tag Usage Chart"></canvas>;
};

export default TagUsageChart;