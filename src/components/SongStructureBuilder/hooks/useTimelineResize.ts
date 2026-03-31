import { useState, useRef, useEffect, useCallback } from 'react';
import {
    LOCAL_STORAGE_TIMELINE_HEIGHT_KEY,
    DEFAULT_TIMELINE_HEIGHT_PX,
    MIN_TIMELINE_HEIGHT_PX,
    MAX_TIMELINE_HEIGHT_PX
} from '../constants';

export function useTimelineResize() {
    const [timelineHeight, setTimelineHeight] = useState<string>(`${DEFAULT_TIMELINE_HEIGHT_PX}px`);
    const [isResizing, setIsResizing] = useState<boolean>(false);
    const timelineContainerRef = useRef<HTMLDivElement>(null);
    const initialDragDataRef = useRef<{ startY: number; initialHeight: number } | null>(null);

    useEffect(() => {
        const savedHeight = localStorage.getItem(LOCAL_STORAGE_TIMELINE_HEIGHT_KEY);
        if (savedHeight) {
          const numericHeight = parseInt(savedHeight, 10);
          const currentMaxHeight = typeof window !== 'undefined' ? Math.max(300, window.innerHeight * 0.8) : MAX_TIMELINE_HEIGHT_PX;
          if (!isNaN(numericHeight) && numericHeight >= MIN_TIMELINE_HEIGHT_PX && numericHeight <= currentMaxHeight) {
            setTimelineHeight(savedHeight);
          } else if (!isNaN(numericHeight) && numericHeight > currentMaxHeight) {
            setTimelineHeight(`${currentMaxHeight}px`); 
          }
        }
    }, []);

    const handleMouseDownResize = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (timelineContainerRef.current) {
            initialDragDataRef.current = {
                startY: e.clientY,
                initialHeight: timelineContainerRef.current.offsetHeight,
            };
            setIsResizing(true);
        }
    }, []);

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (!timelineContainerRef.current || !initialDragDataRef.current) return;
    
            const deltaY = e.clientY - initialDragDataRef.current.startY;
            let newHeight = initialDragDataRef.current.initialHeight + deltaY;
            newHeight = Math.max(MIN_TIMELINE_HEIGHT_PX, Math.min(newHeight, MAX_TIMELINE_HEIGHT_PX));
            setTimelineHeight(`${newHeight}px`);
        };
    
        const handleUp = () => {
            setIsResizing(false); 
            if (timelineContainerRef.current) {
                localStorage.setItem(LOCAL_STORAGE_TIMELINE_HEIGHT_KEY, timelineContainerRef.current.style.height);
            }
        };
    
        if (isResizing) {
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleUp);
            window.addEventListener('blur', handleUp); 
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'ns-resize';
        }
    
        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            window.removeEventListener('blur', handleUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [isResizing]);

    return {
        timelineHeight,
        timelineContainerRef,
        handleMouseDownResize
    };
}
