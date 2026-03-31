import { useCallback, useRef, useEffect } from 'react';
import { wheelSegmentBaseColors } from '../constants';
import { getAdjustedTextColorForContrast } from '../utils';
import { SpinResultState } from '../types';

interface DrawingOptions {
    wheelSegments: string[];
    currentAngle: number;
    wheelTextFont: string;
    toolAccentColor: string;
    isSpinning: boolean;
    spinResult: SpinResultState | null;
    glowIntensity: number;
    wheelSegmentBorderColor: string;
}

export function useWheelDrawing({
    wheelSegments,
    currentAngle,
    wheelTextFont,
    toolAccentColor,
    isSpinning,
    spinResult,
    glowIntensity,
    wheelSegmentBorderColor
}: DrawingOptions) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    const drawWheel = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || wheelSegments.length === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const centerX = canvas.width / 2; 
        const centerY = canvas.height / 2;
        const outerRadius = Math.min(centerX, centerY) * 0.9;
        const innerRadius = outerRadius * 0.85; 
        const hubRadius = outerRadius * 0.2;
        const numDisplaySegments = wheelSegments.length;
        const anglePerSegment = (2 * Math.PI) / numDisplaySegments;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.beginPath(); ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI); ctx.fillStyle = '#2D3748'; ctx.fill();
        ctx.beginPath(); ctx.arc(centerX, centerY, outerRadius * 0.97, 0, 2 * Math.PI); ctx.fillStyle = '#4A5568'; ctx.fill();

        ctx.save(); ctx.translate(centerX, centerY); ctx.rotate(currentAngle); ctx.translate(-centerX, -centerY);

        for (let i = 0; i < numDisplaySegments; i++) {
            const segmentAngleStart = i * anglePerSegment; const segmentAngleEnd = (i + 1) * anglePerSegment;
            const segmentColor = wheelSegmentBaseColors[i % wheelSegmentBaseColors.length];
            const textColor = getAdjustedTextColorForContrast(segmentColor);
            ctx.save();
            if (!isSpinning && spinResult && spinResult.winningSegmentIndex === i) {
                ctx.shadowColor = '#FFD700'; 
                const baseBlur = 10; const maxPulseBlur = 20; 
                ctx.shadowBlur = baseBlur + (Math.sin(glowIntensity * Math.PI * 2) * 0.5 + 0.5) * maxPulseBlur;
            }
            ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.arc(centerX, centerY, innerRadius, segmentAngleStart, segmentAngleEnd);
            ctx.closePath(); ctx.fillStyle = segmentColor; ctx.fill(); ctx.restore(); 
            ctx.save(); ctx.translate(centerX, centerY); ctx.rotate(segmentAngleStart + anglePerSegment / 2);
            ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.fillStyle = textColor; 
            const fontSize = Math.max(10, Math.min(14, innerRadius * 0.09)); 
            ctx.font = `bold ${fontSize}px ${wheelTextFont}`; const activityText = wheelSegments[i];
            let displayText = activityText; const maxTextWidth = innerRadius * 0.65;
            if (ctx.measureText(displayText).width > maxTextWidth) { while(ctx.measureText(displayText + "...").width > maxTextWidth && displayText.length > 0) { displayText = displayText.slice(0, -1); } displayText += "..."; }
            ctx.fillText(displayText, innerRadius - (innerRadius * 0.1), 0); ctx.restore();
        }
        ctx.restore(); 

        for (let i = 0; i < numDisplaySegments; i++) { ctx.save(); ctx.translate(centerX, centerY); ctx.rotate(currentAngle + i * anglePerSegment); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(innerRadius, 0); ctx.strokeStyle = wheelSegmentBorderColor; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
        
        const numStuds = numDisplaySegments * 2; const studRadius = outerRadius * 0.02; const studOrbitRadius = outerRadius * 0.93;
        for (let i = 0; i < numStuds; i++) { const studAngle = (i / numStuds) * 2 * Math.PI; const studX = centerX + studOrbitRadius * Math.cos(studAngle); const studY = centerY + studOrbitRadius * Math.sin(studAngle); ctx.beginPath(); ctx.arc(studX, studY, studRadius, 0, 2 * Math.PI); ctx.fillStyle = 'gold'; ctx.fill(); }

        const hubGradient = ctx.createRadialGradient(centerX, centerY, hubRadius * 0.2, centerX, centerY, hubRadius);
        hubGradient.addColorStop(0, '#FFFDE4'); hubGradient.addColorStop(0.6, '#FFD700'); hubGradient.addColorStop(1, '#B8860B');
        ctx.beginPath(); ctx.arc(centerX, centerY, hubRadius, 0, 2 * Math.PI); ctx.fillStyle = hubGradient; ctx.fill();
        ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 2; ctx.stroke();
        
        const pointerBaseYOffset = 15; const pointerDepth = 30; const pointerOffsetFromWheel = 5;
        ctx.beginPath(); ctx.moveTo(centerX + innerRadius + pointerOffsetFromWheel, centerY); 
        ctx.lineTo(centerX + innerRadius + pointerOffsetFromWheel + pointerDepth, centerY - pointerBaseYOffset); 
        ctx.lineTo(centerX + innerRadius + pointerOffsetFromWheel + pointerDepth, centerY + pointerBaseYOffset); 
        ctx.closePath(); ctx.fillStyle = toolAccentColor; ctx.fill();

    }, [wheelSegments, currentAngle, wheelTextFont, toolAccentColor, isSpinning, spinResult, glowIntensity, wheelSegmentBorderColor]);

    useEffect(() => {
        const canvas = canvasRef.current; const container = canvasContainerRef.current; if (!canvas || !container) return;
        const resizeObserver = new ResizeObserver(entries => { for (let entry of entries) { const { width, height } = entry.contentRect; canvas.width = width; canvas.height = height; drawWheel(); } });
        resizeObserver.observe(container); canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; drawWheel();
        return () => resizeObserver.unobserve(container);
    }, [drawWheel]);

    return {
        canvasRef,
        canvasContainerRef,
        drawWheel
    };
}
