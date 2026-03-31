import { useCallback, useRef, useState } from 'react';

export function useSpinAudio() {
    const [soundError, setSoundError] = useState<string | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const activeSpinSoundSourceRef = useRef<{ stop: () => void } | number | null>(null);

    const initializeAudioContext = useCallback(async (): Promise<AudioContext | null> => {
        if (audioContextRef.current && audioContextRef.current.state === 'running') {
            return audioContextRef.current;
        }
        if (audioContextRef.current && audioContextRef.current.state === 'closed') {
            audioContextRef.current = null; 
        }

        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }
            if (audioContextRef.current.state === 'running') {
                setSoundError(null);
                return audioContextRef.current;
            } else {
                throw new Error(`AudioContext state is: ${audioContextRef.current.state}`);
            }
        } catch (e) {
            console.error("Failed to initialize AudioContext:", e);
            setSoundError("Audio system failed to initialize. Please interact with the page (click/tap) and try again.");
            return null;
        }
    }, []);

    const stopSelectedSpinSound = useCallback(() => {
        if (activeSpinSoundSourceRef.current) {
            if (typeof activeSpinSoundSourceRef.current === 'number') {
                clearInterval(activeSpinSoundSourceRef.current);
            } else if (activeSpinSoundSourceRef.current && typeof (activeSpinSoundSourceRef.current as any).stop === 'function') {
                (activeSpinSoundSourceRef.current as any).stop();
            }
            activeSpinSoundSourceRef.current = null;
        }
    }, []);

    const startSelectedSpinSound = useCallback((audioCtx: AudioContext, soundName: string) => {
        stopSelectedSpinSound();
        if (soundName === 'noSound' || !audioCtx || audioCtx.state !== 'running') return;
    
        let osc: OscillatorNode | null = null;
        let gainNode: GainNode | null = null;
        let noiseNode: AudioBufferSourceNode | null = null;
        let filterNode: BiquadFilterNode | null = null;
        let intervalId: number | null = null;
        let lfo: OscillatorNode | null = null;
        let lfoGain: GainNode | null = null;
    
        const playDiscreteSound = (freq: number, type: OscillatorType = 'square', duration: number = 0.04, attack: number = 0.005, decay: number = 0.035, vol: number = 0.05) => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = type;
            o.frequency.setValueAtTime(freq, audioCtx.currentTime);
            g.gain.setValueAtTime(0, audioCtx.currentTime);
            g.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + attack);
            g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
            o.connect(g);
            g.connect(audioCtx.destination);
            o.start(audioCtx.currentTime);
            o.stop(audioCtx.currentTime + duration + 0.01); 
        };
    
        switch (soundName) {
            case 'mechanicalClick': intervalId = window.setInterval(() => playDiscreteSound(600 + Math.random() * 600), 150 + Math.random() * 80); break;
            case 'smoothClicks': intervalId = window.setInterval(() => playDiscreteSound(800 + Math.random() * 400, 'sine', 0.05, 0.01, 0.04, 0.03), 180 + Math.random() * 70); break;
            case 'ratchetClack': intervalId = window.setInterval(() => { playDiscreteSound(300 + Math.random() * 200, 'sawtooth', 0.08, 0.005, 0.07, 0.06); playDiscreteSound(310 + Math.random() * 200, 'sawtooth', 0.08, 0.008, 0.07, 0.04); }, 250 + Math.random() * 100); break;
            case 'digitalPulses': intervalId = window.setInterval(() => playDiscreteSound(1200 + Math.random() * 800, 'sine', 0.03, 0.002, 0.025, 0.04), 120 + Math.random() * 50); break;
            case 'gentleWind': noiseNode = audioCtx.createBufferSource(); const bufferSize = audioCtx.sampleRate * 2; const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate); const output = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1; noiseNode.buffer = buffer; noiseNode.loop = true; gainNode = audioCtx.createGain(); gainNode.gain.setValueAtTime(0.005, audioCtx.currentTime); lfo = audioCtx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.5; lfoGain = audioCtx.createGain(); lfoGain.gain.value = 0.003; lfo.connect(lfoGain); lfoGain.connect(gainNode.gain); noiseNode.connect(gainNode); gainNode.connect(audioCtx.destination); noiseNode.start(); lfo.start(); break;
            case 'waterBubbles': intervalId = window.setInterval(() => { const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.type = 'sine'; const baseFreq = 400 + Math.random() * 400; o.frequency.setValueAtTime(baseFreq, audioCtx.currentTime); o.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, audioCtx.currentTime + 0.05); g.gain.setValueAtTime(0, audioCtx.currentTime); g.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08); o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + 0.1); }, 200 + Math.random() * 100); break;
            case 'sciFiScanner': osc = audioCtx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = 150; filterNode = audioCtx.createBiquadFilter(); filterNode.type = 'bandpass'; filterNode.Q.value = 10; filterNode.frequency.setValueAtTime(300, audioCtx.currentTime); filterNode.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.75); filterNode.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 1.5); gainNode = audioCtx.createGain(); gainNode.gain.value = 0.03; osc.connect(filterNode); filterNode.connect(gainNode); gainNode.connect(audioCtx.destination); osc.start(); intervalId = window.setInterval(() => { if (!filterNode) return; filterNode.frequency.setValueAtTime(300, audioCtx.currentTime); filterNode.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.75); filterNode.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 1.5); }, 1500); break;
            case 'crystalChimes': intervalId = window.setInterval(() => { for (let i = 0; i < 3; i++) playDiscreteSound(2000 + Math.random() * 1000 + i * 200, 'sine', 0.3, 0.01, 0.28, 0.015); }, 500 + Math.random() * 200); break;
            case 'waterBubblesContinuous': // Added for robustness or future use if needed
                break;
            case 'deepRumble': osc = audioCtx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = 40 + Math.random()*20; gainNode = audioCtx.createGain(); gainNode.gain.value = 0; lfo = audioCtx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.3 + Math.random()*0.4; lfoGain = audioCtx.createGain(); lfoGain.gain.value = 0.04; lfo.connect(lfoGain); lfoGain.connect(gainNode.gain); osc.connect(gainNode); gainNode.connect(audioCtx.destination); osc.start(); lfo.start(); break;
        }
    
        if (intervalId) {
            activeSpinSoundSourceRef.current = intervalId;
        } else if (osc || noiseNode) {
            activeSpinSoundSourceRef.current = { stop: () => { if (osc) osc.stop(); if (noiseNode) noiseNode.stop(); if (lfo) lfo.stop(); if (gainNode) gainNode.disconnect(); if (filterNode) filterNode.disconnect(); if (lfoGain) lfoGain.disconnect(); } };
        }
    }, [stopSelectedSpinSound]);

    return {
        soundError,
        setSoundError,
        audioContextRef,
        initializeAudioContext,
        startSelectedSpinSound,
        stopSelectedSpinSound
    };
}
