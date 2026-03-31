
import React, { useEffect, useRef, useCallback } from 'react';
import { PlaybackStatus } from '@/types'; // Adjusted path for types

interface AudioVisualizerProps {
  analyserNodes: { left: AnalyserNode | null; right: AnalyserNode | null; };
  isPlaying: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyserNodes, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const { left: analyserLeft, right: analyserRight } = analyserNodes;
    if (!canvas || !analyserLeft || !analyserRight) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!isPlaying) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (animationFrameRef.current) {
             cancelAnimationFrame(animationFrameRef.current);
             animationFrameRef.current = null;
        }
        return;
    }

    if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    const bufferLength = analyserLeft.frequencyBinCount;
    const leftDataArray = new Uint8Array(bufferLength);
    const rightDataArray = new Uint8Array(bufferLength);
    analyserLeft.getByteFrequencyData(leftDataArray);
    analyserRight.getByteFrequencyData(rightDataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const numBars = 64; 
    const barWidthPercentage = 0.9;
    const barSlotWidth = canvas.width / numBars;
    const barWidth = barSlotWidth * barWidthPercentage;
    const centerY = canvas.height / 2;
    const maxBarHeight = centerY * 0.98;

    let x = barSlotWidth * (1 - barWidthPercentage) / 2;

    for (let i = 0; i < numBars; i++) {
      const dataIndex = Math.floor((i / numBars) * (bufferLength * 0.65));
      
      // Left channel (top half, green)
      let leftBarHeight = (leftDataArray[dataIndex] / 255.0) * maxBarHeight;
      leftBarHeight = Math.max(2, leftBarHeight);

      const leftGradient = ctx.createLinearGradient(x, centerY, x, centerY - leftBarHeight);
      leftGradient.addColorStop(0, '#065f46'); 
      leftGradient.addColorStop(0.7, '#059669');
      leftGradient.addColorStop(1, '#34d399'); 
      
      ctx.fillStyle = leftGradient;
      ctx.fillRect(x, centerY - leftBarHeight, barWidth, leftBarHeight);

      // Right channel (bottom half, blue)
      let rightBarHeight = (rightDataArray[dataIndex] / 255.0) * maxBarHeight;
      rightBarHeight = Math.max(2, rightBarHeight);

      const rightGradient = ctx.createLinearGradient(x, centerY, x, centerY + rightBarHeight);
      rightGradient.addColorStop(0, '#1e3a8a');
      rightGradient.addColorStop(0.7, '#2563eb'); 
      rightGradient.addColorStop(1, '#60a5fa'); 
      
      ctx.fillStyle = rightGradient;
      ctx.fillRect(x, centerY, barWidth, rightBarHeight);
      
      x += barSlotWidth;
    }

    animationFrameRef.current = requestAnimationFrame(draw);
  }, [isPlaying, analyserNodes]);

  useEffect(() => {
    if (isPlaying && analyserNodes.left && analyserNodes.right) {
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(draw);
      }
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, analyserNodes, draw]);

  return (
    <div className="mb-4 h-20 md:h-28 bg-slate-100/50 dark:bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden border-2 border-gray-200 dark:border-white/10 shadow-inner">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full" 
        aria-label="Stereo audio visualizer"
      ></canvas>
    </div>
  );
};

export default AudioVisualizer;
