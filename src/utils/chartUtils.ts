import { ChartOptions, TooltipItem } from 'chart.js';

export const getBaseChartOptions = (
  fontColor: string, 
  gridColor: string,
  suggestedMaxY?: (context: any) => number 
): ChartOptions<any> => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    color: fontColor,
    plugins: {
      legend: {
        display: false, // Usually set per chart if needed
        labels: {
          color: fontColor,
          font: { family: "'Inter', sans-serif", size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: gridColor,
        borderWidth: 1,
        padding: 10,
        callbacks: {
            label: function(context: TooltipItem<any>) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += context.parsed.y.toLocaleString();
                }
                return label;
            }
        }
      },
    },
    scales: {
      x: {
        ticks: { 
          color: fontColor, 
          font: { family: "'Inter', sans-serif", size: 10 },
          maxRotation: 90, // More aggressive rotation
          minRotation: 45, // Encourage vertical display
          autoSkip: true,
          maxTicksLimit: 20, // Helps prevent overcrowding by default
        },
        grid: { color: gridColor, drawOnChartArea: false },
        border: { color: gridColor },
      },
      y: {
        ticks: { 
          color: fontColor, 
          font: { family: "'Inter', sans-serif", size: 10 },
          precision: 0, 
          callback: function(value) {
            if (Number(value) >= 1000) {
                return (Number(value) / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
            }
            return value;
          }
        },
        grid: { color: gridColor },
        border: { color: gridColor },
        beginAtZero: true,
        suggestedMax: suggestedMaxY,
      },
    },
    elements: {
      bar: {
        borderRadius: 3,
      },
      line: {
        tension: 0.1,
      }
    },
  };
};

// Helper to generate shades for bar charts
export function generateColorShades(startColorHex: string, endColorHex: string, steps: number): string[] {
  const startRGB = hexToRgb(startColorHex);
  const endRGB = hexToRgb(endColorHex);
  const shades: string[] = [];

  if (!startRGB || !endRGB) return Array(steps).fill(startColorHex); // Fallback

  for (let i = 0; i < steps; i++) {
    const ratio = steps === 1 ? 0 : i / (steps - 1);
    const r = Math.round(startRGB.r + (endRGB.r - startRGB.r) * ratio);
    const g = Math.round(startRGB.g + (endRGB.g - startRGB.g) * ratio);
    const b = Math.round(startRGB.b + (endRGB.b - startRGB.b) * ratio);
    shades.push(`rgb(${r},${g},${b})`);
  }
  return shades.length > 0 ? shades : [startColorHex];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
