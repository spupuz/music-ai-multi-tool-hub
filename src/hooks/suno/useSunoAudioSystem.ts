import { useRef, useState, useCallback, useEffect } from 'react';
import { Howl, Howler } from 'howler';
import type { EqualizerBand, PlayerState } from '@/types';
import { DEFAULT_EQ_BANDS_CONFIG } from './constants';

export interface UseSunoAudioSystemProps {
  playerState: PlayerState;
  setErrorPlayer: (error: string | null) => void;
}

export const useSunoAudioSystem = ({ playerState, setErrorPlayer }: UseSunoAudioSystemProps) => {
  const [isAudioSystemReady, setIsAudioSystemReady] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodeLeftRef = useRef<AnalyserNode | null>(null);
  const analyserNodeRightRef = useRef<AnalyserNode | null>(null);
  const channelSplitterRef = useRef<ChannelSplitterNode | null>(null);
  const channelMergerRef = useRef<ChannelMergerNode | null>(null);
  const eqNodesRef = useRef<BiquadFilterNode[]>([]);
  const masterGainRef = useRef<GainNode | null>(null);
  const isAudioGraphConstructedRef = useRef(false);

  const playerStateRef = useRef(playerState);
  useEffect(() => {
    playerStateRef.current = playerState;
  }, [playerState]);

  const prepareAudioContext = useCallback(async (): Promise<AudioContext | null> => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      if (audioContextRef.current && audioContextRef.current.state === 'closed') {
        isAudioGraphConstructedRef.current = false;
        if (masterGainRef.current) try { masterGainRef.current.disconnect(); } catch (e) { }
        masterGainRef.current = null;
        if (analyserNodeLeftRef.current) try { analyserNodeLeftRef.current.disconnect(); } catch (e) { }
        analyserNodeLeftRef.current = null;
        if (analyserNodeRightRef.current) try { analyserNodeRightRef.current.disconnect(); } catch (e) { }
        analyserNodeRightRef.current = null;
        if (channelSplitterRef.current) try { channelSplitterRef.current.disconnect(); } catch (e) { }
        channelSplitterRef.current = null;
        if (channelMergerRef.current) try { channelMergerRef.current.disconnect(); } catch (e) { }
        channelMergerRef.current = null;
        eqNodesRef.current.forEach(node => { try { node.disconnect(); } catch (e) { } });
        eqNodesRef.current = [];
      }
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        setErrorPlayer("Web Audio API is not supported by your browser.");
        return null;
      }
    }
    const audioCtx = audioContextRef.current;
    if (audioCtx.state === 'suspended') {
      try {
        await audioCtx.resume();
      } catch (e) {
        setErrorPlayer("Failed to resume audio context. Please interact with the page (click/tap).");
        return null;
      }
    }
    return audioCtx.state === 'running' ? audioCtx : null;
  }, [setErrorPlayer]);

  const initializeAudioGraphAndHowler = useCallback((audioCtx: AudioContext) => {
    let initialMasterGainValue = playerStateRef.current.volume;
    if (!isAudioGraphConstructedRef.current) {
      if (masterGainRef.current) try { masterGainRef.current.disconnect(); } catch (e) { }
      if (analyserNodeLeftRef.current) try { analyserNodeLeftRef.current.disconnect(); } catch (e) { }
      if (analyserNodeRightRef.current) try { analyserNodeRightRef.current.disconnect(); } catch (e) { }
      eqNodesRef.current.forEach(node => { try { node.disconnect(); } catch (e) { } });

      masterGainRef.current = audioCtx.createGain();
      analyserNodeLeftRef.current = audioCtx.createAnalyser();
      analyserNodeLeftRef.current.fftSize = 256;
      analyserNodeRightRef.current = audioCtx.createAnalyser();
      analyserNodeRightRef.current.fftSize = 256;
      channelSplitterRef.current = audioCtx.createChannelSplitter(2);
      channelMergerRef.current = audioCtx.createChannelMerger(2);
      eqNodesRef.current = DEFAULT_EQ_BANDS_CONFIG.map(bandConfig => {
        const filterNode = audioCtx.createBiquadFilter();
        filterNode.type = bandConfig.type;
        filterNode.frequency.value = bandConfig.frequency;
        filterNode.gain.value = playerStateRef.current.eqBands.find(b => b.id === bandConfig.id)?.gain || 0;
        filterNode.Q.value = 1;
        return filterNode;
      });
      isAudioGraphConstructedRef.current = true;
    }

    if (!masterGainRef.current || eqNodesRef.current.length !== DEFAULT_EQ_BANDS_CONFIG.length || !analyserNodeLeftRef.current || !analyserNodeRightRef.current || !channelSplitterRef.current || !channelMergerRef.current) {
      isAudioGraphConstructedRef.current = false;
      return false;
    }

    try { masterGainRef.current.disconnect(); } catch (e) { }
    eqNodesRef.current.forEach(node => { try { node.disconnect(); } catch (e) { } });
    try { channelSplitterRef.current.disconnect(); } catch (e) { }
    try { channelMergerRef.current.disconnect(); } catch (e) { }

    let currentNode: AudioNode = masterGainRef.current;
    eqNodesRef.current.forEach(filterNode => {
      currentNode.connect(filterNode);
      currentNode = filterNode;
    });

    const splitter = channelSplitterRef.current;
    const merger = channelMergerRef.current;
    const analyserLeft = analyserNodeLeftRef.current;
    const analyserRight = analyserNodeRightRef.current;

    currentNode.connect(splitter);
    splitter.connect(analyserLeft, 0, 0);
    splitter.connect(analyserRight, 1, 0);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 1, 1);
    merger.connect(audioCtx.destination);

    if (masterGainRef.current.gain.value !== initialMasterGainValue) {
      masterGainRef.current.gain.setValueAtTime(initialMasterGainValue, audioCtx.currentTime);
    }

    playerStateRef.current.eqBands.forEach((bandConfig, index) => {
      const node = eqNodesRef.current[index];
      if (node && node.gain.value !== bandConfig.gain) {
        try { node.gain.setValueAtTime(bandConfig.gain, audioCtx.currentTime); } catch (e) {
          if (audioCtx.state === 'closed') setIsAudioSystemReady(false);
        }
      }
    });

    if (Howler.ctx !== audioCtx) Howler.ctx = audioCtx;
    if (Howler.masterGain !== masterGainRef.current) Howler.masterGain = masterGainRef.current;
    Howler.volume(playerStateRef.current.volume);
    return true;
  }, []);

  const ensureAudioSystemReady = useCallback(async (): Promise<boolean> => {
    if (isAudioSystemReady && audioContextRef.current && audioContextRef.current.state === 'running' && Howler.ctx === audioContextRef.current && Howler.masterGain === masterGainRef.current) {
      return true;
    }
    const audioCtx = await prepareAudioContext();
    if (!audioCtx || audioCtx.state !== 'running') {
      setErrorPlayer("Audio system setup failed. Context not running. Please interact and try again.");
      setIsAudioSystemReady(false);
      return false;
    }
    if (initializeAudioGraphAndHowler(audioCtx)) {
      setIsAudioSystemReady(true);
      return true;
    }
    setErrorPlayer("Audio system graph initialization failed. Please interact and try again.");
    setIsAudioSystemReady(false);
    return false;
  }, [isAudioSystemReady, prepareAudioContext, initializeAudioGraphAndHowler, setErrorPlayer]);

  const updateEqGains = useCallback((currentBands: EqualizerBand[]) => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx || !isAudioGraphConstructedRef.current || !isAudioSystemReady || eqNodesRef.current.length === 0 || audioCtx.state !== 'running') return;
    currentBands.forEach((bandConfig, index) => {
      const node = eqNodesRef.current[index];
      if (node && node.gain.value !== bandConfig.gain) {
        try { node.gain.setValueAtTime(bandConfig.gain, audioCtx.currentTime); } catch (e) {
          if (audioCtx.state === 'closed') setIsAudioSystemReady(false);
        }
      }
    });
  }, [isAudioSystemReady]);

  useEffect(() => {
    if (isAudioSystemReady && playerState.eqBands) {
      updateEqGains(playerState.eqBands);
    }
  }, [playerState.eqBands, isAudioSystemReady, updateEqGains]);

  useEffect(() => {
    const audioCtx = audioContextRef.current;
    if (isAudioSystemReady && masterGainRef.current && audioCtx && audioCtx.state === 'running') {
      if (masterGainRef.current.gain.value !== playerState.volume) {
        masterGainRef.current.gain.setValueAtTime(playerState.volume, audioCtx.currentTime);
      }
    }
  }, [playerState.volume, isAudioSystemReady]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.warn("[AudioPlayer] Error closing AudioContext on hook unmount:", e));
        audioContextRef.current = null;
      }
    };
  }, []);

  return {
    isAudioSystemReady,
    ensureAudioSystemReady,
    audioContext: audioContextRef.current,
    analyserNodes: {
      left: analyserNodeLeftRef.current,
      right: analyserNodeRightRef.current
    }
  };
};
