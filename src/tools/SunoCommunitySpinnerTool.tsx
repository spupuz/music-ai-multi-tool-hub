
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ToolProps } from '../../Layout';
import Spinner from '../../components/Spinner';
import ImageUpload from '../../components/ImageUpload'; // For custom logo
import { useTheme } from '../../context/ThemeContext';

const TOOL_CATEGORY = 'SunoCommunitySpinner';
const LOCAL_STORAGE_CURRENT_PREFIX = 'SCS_current_MagicSpinWheel_v3_';
const LOCAL_STORAGE_SAVED_WHEELS_KEY = 'SCS_savedWheelConfigs_MagicSpinWheel_v3';
const LOCAL_STORAGE_SPIN_SOUND_KEY = `${LOCAL_STORAGE_CURRENT_PREFIX}selectedSpinSound`;

const defaultActivitiesListEnglish: string[] = [
    "Chug 2.2L of water (stay hydrated!).",
    "Make a song about yourself.",
    "Make a song about someone else (friend, family, fictional character).",
    "Remix one of your existing Suno songs (try a different style or extend it).",
    "Sing a karaoke version of one of your Suno songs (or any song!).",
    "Do nothing for 5 minutes (just chill, you deserve it!).",
    "Listen to 3 new songs on the Suno Explore Page.",
    "Find a surprising Suno song and share it.",
    "Create a Suno prompt with 3 different genres.",
    "Comment on another user's Suno song.",
    "Find a new Suno user to follow.",
    "Generate a Suno song using only 2 keywords.",
    "Explore the Suno 'trending' page for 5 minutes.",
    "Search for a Suno song containing the word 'adventure'.",
    "Share a quick tip for using Suno in a forum or social media.",
    "Create a Suno song with an unusual theme (e.g., 'lactose-intolerant vibe', 'a song about a sentient stapler')."
];

interface ActivityDetail {
  detailText: string;
  weight: number; // Master weight
}

interface WheelConfigData {
  activityWheelTitle: string;
  userName: string;
  activitiesString: string;
  activityDetails: Record<string, ActivityDetail>; // Master details & master weights
  showAddEditDetails: boolean;
  numberOfSegmentsOnWheel: number;
  selectedActivitiesForWheel: Record<string, boolean>;
  wheelActivityWeights: Record<string, number>; // Specific weights for wheel segments
  customTitle?: string;
  customLogo?: string | null;
  selectedLogoSize?: string;
  toolBackgroundColor?: string;
  toolAccentColor?: string;
  toolTextColor?: string;
  wheelSegmentBorderColor?: string;
  wheelTextFont?: string;
  selectedSpinSound?: string;
}

interface SavedWheel {
  id: string;
  name: string;
  data: WheelConfigData;
}

interface SpinResultState {
    activity: string;
    detail?: string;
    personalizedMessage: string;
    winningSegmentIndex: number;
}

// Dark Mode Defaults
const DEFAULT_TOOL_BG_COLOR_DARK = '#111827'; 
const DEFAULT_TOOL_TEXT_COLOR_DARK = '#d1d5db'; 
const DEFAULT_WHEEL_BORDER_COLOR_DARK = '#374151'; 

// Light Mode Defaults
const DEFAULT_TOOL_BG_COLOR_LIGHT = '#ffffff'; 
const DEFAULT_TOOL_TEXT_COLOR_LIGHT = '#111827'; 
const DEFAULT_WHEEL_BORDER_COLOR_LIGHT = '#e5e7eb'; 

const DEFAULT_TOOL_ACCENT_COLOR = '#059669'; 
const DEFAULT_WHEEL_TEXT_FONT = "'Inter', sans-serif";
const DEFAULT_SPIN_SOUND = 'mechanicalClick';

const wheelSegmentBaseColors = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', 
  '#6366F1', '#A855F7', '#EC4899', '#10B981', '#F59E0B',
  '#84CC16', '#0EA5E9'
];

const logoSizeOptions = [
    { value: '48px', label: 'Tiny (48px)' }, { value: '64px', label: 'Small (64px)' },
    { value: '96px', label: 'Medium (96px)' }, { value: '128px', label: 'Large (128px)' },
    { value: '160px', label: 'X-Large (160px)' },
];

const cardTextFontOptions = [
    { value: "'Inter', sans-serif", label: "Default (Inter)" }, { value: "Arial, Helvetica, sans-serif", label: "Arial" },
    { value: "'Times New Roman', Times, serif", label: "Times New Roman" }, { value: "Georgia, serif", label: "Georgia" },
    { value: "'Courier New', Courier, monospace", label: "Courier New" }, { value: "Verdana, Geneva, sans-serif", label: "Verdana" },
    { value: "Tahoma, Geneva, sans-serif", label: "Tahoma" },
    { value: "'Trebuchet MS', Helvetica, sans-serif", label: "Trebuchet MS" },
    { value: "'Lucida Console', Monaco, monospace", label: "Lucida Console" },
    { value: "Impact, Charcoal, sans-serif", label: "Impact" }, { value: "'Comic Sans MS', cursive, sans-serif", label: "Comic Sans MS" },
];

const spinSoundPresets = [
  { value: 'mechanicalClick', label: 'Mechanical Click' },
  { value: 'smoothClicks', label: 'Smooth Clicks' },
  { value: 'ratchetClack', label: 'Ratchet Clack' },
  { value: 'digitalPulses', label: 'Digital Pulses' },
  { value: 'gentleWind', label: 'Gentle Wind (Continuous)' },
  { value: 'waterBubbles', label: 'Water Bubbles' },
  { value: 'sciFiScanner', label: 'Sci-Fi Scanner (Continuous)' },
  { value: 'crystalChimes', label: 'Crystal Chimes' },
  { value: 'deepRumble', label: 'Deep Rumble (Continuous)' },
  { value: 'noSound', label: 'No Sound' },
];

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
};
const getLuminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};
const getAdjustedTextColorForContrast = (backgroundColorHex: string): string => {
    const rgbBg = hexToRgb(backgroundColorHex);
    if (!rgbBg) return '#FFFFFF';
    const lumBg = getLuminance(rgbBg.r, rgbBg.g, rgbBg.b);
    const lumWhite = getLuminance(255, 255, 255);
    const lumBlack = getLuminance(0, 0, 0);
    const contrastWithWhite = (Math.max(lumBg, lumWhite) + 0.05) / (Math.min(lumBg, lumWhite) + 0.05);
    const contrastWithBlack = (Math.max(lumBg, lumBlack) + 0.05) / (Math.min(lumBg, lumBlack) + 0.05);
    return contrastWithWhite > contrastWithBlack ? '#FFFFFF' : '#000000';
};

const isValidHexColor = (color: string): boolean => /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
const normalizeHexColor = (color: string): string => {
  if (!color.startsWith('#')) color = '#' + color;
  if (color.length === 4) { color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`; }
  return color.toUpperCase();
};

const lightenDarkenColor = (hex: string, percent: number): string => {
    hex = hex.replace('#', '');
    const num = parseInt(hex, 16);
    let r = (num >> 16) + percent;
    if (r > 255) r = 255; else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + percent;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + percent;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    return `#${(g | (b << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
};

const InputField: React.FC<{
  id: string; label: string; value: string | number; onChange: (val: string) => void; placeholder?: string;
  type?: string; labelTextColor?: string; className?: string; min?: number; max?: number; step?: number;
}> = ({ id, label, value, onChange, placeholder, type = "text", labelTextColor, className, min, max, step }) => (
    <div className={className !== undefined ? className : "mb-4"}>
        <label htmlFor={id} className="block text-sm font-medium mb-1" style={{color: labelTextColor}}>{label}</label>
        <input type={type} id={id} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} min={min} max={max} step={step}
               className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-green-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm text-gray-900 dark:text-white" />
    </div>
);

const TextAreaField: React.FC<{ id: string; label: string; value: string; onChange: (val: string) => void; placeholder?: string; rows?: number; labelTextColor?: string; readOnly?: boolean; }> =
    ({ id, label, value, onChange, placeholder, rows = 6, labelTextColor, readOnly = false }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium mb-1" style={{color: labelTextColor}}>{label}</label>
        <textarea id={id} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} readOnly={readOnly}
                  className={`mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-green-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm text-gray-900 dark:text-white resize-y ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`} />
    </div>
);

const CheckboxField: React.FC<{ id: string; label: string; checked: boolean; onChange: (checked: boolean) => void; description?: string; labelTextColor?: string; className?: string; title?: string; }> = 
  ({ id, label, checked, onChange, description, labelTextColor, className = "mb-4", title }) => (
    <div className={`flex items-start ${className}`}>
        <div className="flex items-center h-5">
            <input 
                id={id} 
                type="checkbox" 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)} 
                className="h-4 w-4 text-green-600 dark:text-green-500 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-gray-700 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800" 
                title={title}
                aria-describedby={description ? `${id}-description` : undefined}
            />
        </div>
        <div className="ml-3 text-sm">
            <label htmlFor={id} className="font-medium" style={{color: labelTextColor}} title={title}>{label}</label>
            {description && <p id={`${id}-description`} className="text-gray-500 text-xs">{description}</p>}
        </div>
    </div>
);

const CogIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.223.893c.05.199.121.39.209.572.088.182.202.35.34.501.138.15.297.281.47.392.173.112.364.204.568.276l.672.224c.543.181.94.692.94 1.27v1.154c0 .579-.397 1.09-.94 1.27l-.672.224c-.204.072-.395.164-.568.276-.173.111-.332.242-.47.392-.138.151-.252.319-.34.501-.088.182-.159.373-.209.572l-.223.893c-.09.542-.56.94-1.11-.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.223-.893a6.002 6.002 0 01-.209-.572c-.088-.182-.202.35-.34-.501s-.297-.281-.47-.392c-.173-.112-.364-.204-.568-.276l-.672-.224c-.543-.181-.94-.692-.94-1.27V9.409c0-.579.397-1.09.94-1.11l.672-.224c.204-.072.395-.164-.568-.276.173-.111.332.242.47.392.138-.151.252.319.34.501.088.182.159.373.209.572l.223-.893z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOpenIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const SelectField: React.FC<{ id: string; label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; labelTextColor?: string; className?: string; }> = 
  ({ id, label, value, onChange, options, labelTextColor, className = "mb-2" }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-xs font-medium mb-0.5" style={{color: labelTextColor}}>{label}</label>
        <select id={id} value={value} onChange={e => onChange(e.target.value)} className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-green-400">
            <option disabled value="">Select...</option>
            {options.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
        </select>
    </div>
);

const SunoCommunitySpinnerTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
    const { theme } = useTheme();

    const [activityWheelTitle, setActivityWheelTitle] = useState<string>('Magic Spin Wheel');
    const [userName, setUserName] = useState<string>('');
    const [activitiesString, setActivitiesString] = useState<string>(defaultActivitiesListEnglish.join('\n'));
    const [activityDetails, setActivityDetails] = useState<Record<string, ActivityDetail>>({});
    const [showAddEditDetails, setShowAddEditDetails] = useState<boolean>(false);

    const [numberOfSegmentsOnWheel, setNumberOfSegmentsOnWheel] = useState<number>(12);
    const [selectedActivitiesForWheel, setSelectedActivitiesForWheel] = useState<Record<string, boolean>>({});
    const [wheelActivityWeights, setWheelActivityWeights] = useState<Record<string, number>>({}); 

    const [wheelSegments, setWheelSegments] = useState<string[]>([]);

    const [customTitle, setCustomTitle] = useState<string>('Magic Spin Wheel');
    const [customLogo, setCustomLogo] = useState<string | null>(null);
    const [selectedLogoSize, setSelectedLogoSize] = useState<string>('96px');
    const [showAppearancePanel, setShowAppearancePanel] = useState(false); 
    const [toolBackgroundColor, setToolBackgroundColor] = useState<string>(DEFAULT_TOOL_BG_COLOR_DARK);
    const [toolAccentColor, setToolAccentColor] = useState<string>(DEFAULT_TOOL_ACCENT_COLOR);
    const [toolTextColor, setToolTextColor] = useState<string>(DEFAULT_TOOL_TEXT_COLOR_DARK);
    const [wheelSegmentBorderColor, setWheelSegmentBorderColor] = useState<string>(DEFAULT_WHEEL_BORDER_COLOR_DARK);
    const [wheelTextFont, setWheelTextFont] = useState<string>(DEFAULT_WHEEL_TEXT_FONT);
    const [toolBackgroundColorHexInput, setToolBackgroundColorHexInput] = useState<string>(DEFAULT_TOOL_BG_COLOR_DARK);
    const [toolAccentColorHexInput, setToolAccentColorHexInput] = useState<string>(DEFAULT_TOOL_ACCENT_COLOR);
    const [toolTextColorHexInput, setToolTextColorHexInput] = useState<string>(DEFAULT_TOOL_TEXT_COLOR_DARK);
    const [wheelSegmentBorderColorHexInput, setWheelSegmentBorderColorHexInput] = useState<string>(DEFAULT_WHEEL_BORDER_COLOR_DARK);

    const [selectedSpinSound, setSelectedSpinSound] = useState<string>(DEFAULT_SPIN_SOUND);

    const [isSpinning, setIsSpinning] = useState<boolean>(false);
    const [spinResult, setSpinResult] = useState<SpinResultState | null>(null); 
    const [currentAngle, setCurrentAngle] = useState(0);
    const animationFrameIdRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null); 

    const [savedWheels, setSavedWheels] = useState<SavedWheel[]>([]);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState<boolean>(true);
    
    const [glowIntensity, setGlowIntensity] = useState(0);
    const glowAnimationRef = useRef<number | null>(null);

    const [showExportModal, setShowExportModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [configToExportJson, setConfigToExportJson] = useState('');
    const [configToImportJson, setConfigToImportJson] = useState('');
    const [importError, setImportError] = useState('');
    const importFileRef = useRef<HTMLInputElement>(null);

    const [soundError, setSoundError] = useState<string | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const activeSpinSoundSourceRef = useRef<{ stop: () => void } | number | null>(null);

    const activitiesArray = useMemo(() => activitiesString.split('\n').map(a => a.trim()).filter(a => a), [activitiesString]);
    
    // Automatically switch default colors when theme changes, unless user has customized them
    useEffect(() => {
        if (theme === 'light') {
            setToolBackgroundColor(prev => prev === DEFAULT_TOOL_BG_COLOR_DARK ? DEFAULT_TOOL_BG_COLOR_LIGHT : prev);
            setToolTextColor(prev => prev === DEFAULT_TOOL_TEXT_COLOR_DARK ? DEFAULT_TOOL_TEXT_COLOR_LIGHT : prev);
            setWheelSegmentBorderColor(prev => prev === DEFAULT_WHEEL_BORDER_COLOR_DARK ? DEFAULT_WHEEL_BORDER_COLOR_LIGHT : prev);
        } else {
            setToolBackgroundColor(prev => prev === DEFAULT_TOOL_BG_COLOR_LIGHT ? DEFAULT_TOOL_BG_COLOR_DARK : prev);
            setToolTextColor(prev => prev === DEFAULT_TOOL_TEXT_COLOR_LIGHT ? DEFAULT_TOOL_TEXT_COLOR_DARK : prev);
            setWheelSegmentBorderColor(prev => prev === DEFAULT_WHEEL_BORDER_COLOR_LIGHT ? DEFAULT_WHEEL_BORDER_COLOR_DARK : prev);
        }
    }, [theme]);

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
            } else if (typeof activeSpinSoundSourceRef.current.stop === 'function') {
                activeSpinSoundSourceRef.current.stop();
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
            case 'deepRumble': osc = audioCtx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = 40 + Math.random()*20; gainNode = audioCtx.createGain(); gainNode.gain.value = 0; lfo = audioCtx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.3 + Math.random()*0.4; lfoGain = audioCtx.createGain(); lfoGain.gain.value = 0.04; lfo.connect(lfoGain); lfoGain.connect(gainNode.gain); osc.connect(gainNode); gainNode.connect(audioCtx.destination); osc.start(); lfo.start(); break;
        }
    
        if (intervalId) {
            activeSpinSoundSourceRef.current = intervalId;
        } else if (osc || noiseNode) {
            activeSpinSoundSourceRef.current = { stop: () => { if (osc) osc.stop(); if (noiseNode) noiseNode.stop(); if (lfo) lfo.stop(); if (gainNode) gainNode.disconnect(); if (filterNode) filterNode.disconnect(); if (lfoGain) lfoGain.disconnect(); } };
        }
    }, [stopSelectedSpinSound]);
    
    const loadConfigData = useCallback((data: Partial<WheelConfigData>, isImporting = false) => {
        setActivityWheelTitle(data.activityWheelTitle || 'Magic Spin Wheel');
        setUserName(data.userName || '');
        const importedActivitiesStr = data.activitiesString || defaultActivitiesListEnglish.join('\n');
        setActivitiesString(importedActivitiesStr);
        setShowAddEditDetails(data.showAddEditDetails === true);
        setNumberOfSegmentsOnWheel(data.numberOfSegmentsOnWheel || 12);

        const currentActivitiesForSetup = importedActivitiesStr.split('\n').map(a => a.trim()).filter(Boolean);
        
        const loadedMasterDetails = data.activityDetails || {};
        const validatedMasterDetails: Record<string, ActivityDetail> = {};
        currentActivitiesForSetup.forEach(actKey => {
            const detailEntry = (loadedMasterDetails as any)[actKey];
            if (typeof detailEntry === 'string') { 
                validatedMasterDetails[actKey] = { detailText: detailEntry, weight: 1 };
            } else if (typeof detailEntry === 'object' && detailEntry !== null && 'detailText' in detailEntry) {
                validatedMasterDetails[actKey] = { 
                    detailText: detailEntry.detailText || '', 
                    weight: Math.max(1, Math.min(5, (typeof detailEntry.weight === 'number' && !isNaN(detailEntry.weight)) ? detailEntry.weight : 1))
                };
            } else {
                 validatedMasterDetails[actKey] = { detailText: '', weight: 1 };
            }
        });
        setActivityDetails(validatedMasterDetails);

        const loadedSelectedForWheel = data.selectedActivitiesForWheel || {};
        const newSelected: Record<string, boolean> = {};
        currentActivitiesForSetup.forEach(act => { newSelected[act] = loadedSelectedForWheel[act] !== undefined ? loadedSelectedForWheel[act] : true; });
        setSelectedActivitiesForWheel(newSelected);

        const loadedWheelWeights = data.wheelActivityWeights || {};
        const newWheelWeights: Record<string, number> = {};
        currentActivitiesForSetup.forEach(act => { newWheelWeights[act] = Math.max(1, Math.min(12, loadedWheelWeights[act] || 1)); });
        setWheelActivityWeights(newWheelWeights);
        
        if (isImporting || data.customTitle !== undefined) setCustomTitle(data.customTitle || 'Magic Spin Wheel');
        if (isImporting || data.customLogo !== undefined) setCustomLogo(data.customLogo === undefined ? null : data.customLogo);
        if (isImporting || data.selectedLogoSize !== undefined) setSelectedLogoSize(data.selectedLogoSize || '96px');
        if (isImporting || data.toolBackgroundColor !== undefined) setToolBackgroundColor(data.toolBackgroundColor || DEFAULT_TOOL_BG_COLOR_DARK);
        if (isImporting || data.toolAccentColor !== undefined) setToolAccentColor(data.toolAccentColor || DEFAULT_TOOL_ACCENT_COLOR);
        if (isImporting || data.toolTextColor !== undefined) setToolTextColor(data.toolTextColor || DEFAULT_TOOL_TEXT_COLOR_DARK);
        if (isImporting || data.wheelSegmentBorderColor !== undefined) setWheelSegmentBorderColor(data.wheelSegmentBorderColor || DEFAULT_WHEEL_BORDER_COLOR_DARK);
        if (isImporting || data.wheelTextFont !== undefined) setWheelTextFont(data.wheelTextFont || DEFAULT_WHEEL_TEXT_FONT);
        if (isImporting || data.selectedSpinSound !== undefined) setSelectedSpinSound(data.selectedSpinSound || DEFAULT_SPIN_SOUND);

        setSpinResult(null);
    }, []);

    useEffect(() => { 
        const currentConfig: Partial<WheelConfigData> = {
            activityWheelTitle: localStorage.getItem(`${LOCAL_STORAGE_CURRENT_PREFIX}activityWheelTitle`) || undefined,
            userName: localStorage.getItem(`${LOCAL_STORAGE_CURRENT_PREFIX}userName`) || undefined,
            activitiesString: localStorage.getItem(`${LOCAL_STORAGE_CURRENT_PREFIX}activitiesString`) || undefined,
            activityDetails: JSON.parse(localStorage.getItem(`${LOCAL_STORAGE_CURRENT_PREFIX}activityDetails`) || '{}'),
            showAddEditDetails: localStorage.getItem(`${LOCAL_STORAGE_CURRENT_PREFIX}showAddEditDetails`) === 'true',
            numberOfSegmentsOnWheel: parseInt(localStorage.getItem(`${LOCAL_STORAGE_CURRENT_PREFIX}numberOfSegmentsOnWheel`) || '12', 10),
            selectedActivitiesForWheel: JSON.parse(localStorage.getItem(`${LOCAL_STORAGE_CURRENT_PREFIX}selectedActivitiesForWheel`) || '{}'),
            wheelActivityWeights: JSON.parse(localStorage.getItem(`${LOCAL_STORAGE_CURRENT_PREFIX}wheelActivityWeights`) || '{}'),
            customTitle: localStorage.getItem(`${LOCAL_STORAGE_CURRENT_PREFIX}customTitle`) || undefined,
            customLogo: localStorage.getItem(`${LOCAL_STORAGE_CURRENT_PREFIX}customLogo`),
            selectedLogoSize: localStorage.getItem(`${LOCAL_STORAGE_CURRENT_PREFIX}selectedLogoSize`) || undefined,
            toolBackgroundColor: localStorage.getItem(`${LOCAL_STORAGE_CURRENT_PREFIX}toolBackgroundColor`) || undefined,
            toolAccentColor: localStorage.getItem(`${LOCAL_STORAGE_CURRENT_PREFIX}toolAccentColor`) || undefined,
            toolTextColor: localStorage.getItem(`${LOCAL_STORAGE_CURRENT_PREFIX}toolTextColor`) || undefined,
            wheelSegmentBorderColor: localStorage.getItem(`${LOCAL_STORAGE_CURRENT_PREFIX}wheelSegmentBorderColor`) || undefined,
            wheelTextFont: localStorage.getItem(`${LOCAL_STORAGE_CURRENT_PREFIX}wheelTextFont`) || undefined,
            selectedSpinSound: localStorage.getItem(LOCAL_STORAGE_SPIN_SOUND_KEY) || undefined,
        };
        loadConfigData(currentConfig, false);

        const storedSavedWheels = localStorage.getItem(LOCAL_STORAGE_SAVED_WHEELS_KEY);
        if (storedSavedWheels) try { setSavedWheels(JSON.parse(storedSavedWheels)); } catch (e) { setSavedWheels([]); }
        else setSavedWheels([]);
    }, [loadConfigData]); 

    useEffect(() => { 
        localStorage.setItem(`${LOCAL_STORAGE_CURRENT_PREFIX}activityWheelTitle`, activityWheelTitle);
        localStorage.setItem(`${LOCAL_STORAGE_CURRENT_PREFIX}userName`, userName);
        localStorage.setItem(`${LOCAL_STORAGE_CURRENT_PREFIX}activitiesString`, activitiesString);
        localStorage.setItem(`${LOCAL_STORAGE_CURRENT_PREFIX}activityDetails`, JSON.stringify(activityDetails));
        localStorage.setItem(`${LOCAL_STORAGE_CURRENT_PREFIX}showAddEditDetails`, String(showAddEditDetails));
        localStorage.setItem(`${LOCAL_STORAGE_CURRENT_PREFIX}numberOfSegmentsOnWheel`, String(numberOfSegmentsOnWheel));
        localStorage.setItem(`${LOCAL_STORAGE_CURRENT_PREFIX}selectedActivitiesForWheel`, JSON.stringify(selectedActivitiesForWheel));
        localStorage.setItem(`${LOCAL_STORAGE_CURRENT_PREFIX}wheelActivityWeights`, JSON.stringify(wheelActivityWeights));
        localStorage.setItem(`${LOCAL_STORAGE_CURRENT_PREFIX}customTitle`, customTitle);
        if (customLogo) localStorage.setItem(`${LOCAL_STORAGE_CURRENT_PREFIX}customLogo`, customLogo); else localStorage.removeItem(`${LOCAL_STORAGE_CURRENT_PREFIX}customLogo`);
        localStorage.setItem(`${LOCAL_STORAGE_CURRENT_PREFIX}selectedLogoSize`, selectedLogoSize);
        localStorage.setItem(`${LOCAL_STORAGE_CURRENT_PREFIX}toolBackgroundColor`, toolBackgroundColor);
        localStorage.setItem(`${LOCAL_STORAGE_CURRENT_PREFIX}toolAccentColor`, toolAccentColor);
        localStorage.setItem(`${LOCAL_STORAGE_CURRENT_PREFIX}toolTextColor`, toolTextColor);
        localStorage.setItem(`${LOCAL_STORAGE_CURRENT_PREFIX}wheelSegmentBorderColor`, wheelSegmentBorderColor);
        localStorage.setItem(`${LOCAL_STORAGE_CURRENT_PREFIX}wheelTextFont`, wheelTextFont);
        localStorage.setItem(LOCAL_STORAGE_SPIN_SOUND_KEY, selectedSpinSound);
    }, [activityWheelTitle, userName, activitiesString, activityDetails, showAddEditDetails, 
        numberOfSegmentsOnWheel, selectedActivitiesForWheel, wheelActivityWeights,
        customTitle, customLogo, selectedLogoSize, toolBackgroundColor, toolAccentColor, toolTextColor, wheelSegmentBorderColor, wheelTextFont,
        selectedSpinSound]);
    
    useEffect(() => { localStorage.setItem(LOCAL_STORAGE_SAVED_WHEELS_KEY, JSON.stringify(savedWheels)); }, [savedWheels]);
    
    useEffect(() => {
        const newSelected: Record<string, boolean> = {};
        const newWheelWeights: Record<string, number> = {};
        const newMasterDetails: Record<string, ActivityDetail> = {};

        activitiesArray.forEach(act => {
            newSelected[act] = selectedActivitiesForWheel[act] !== undefined ? selectedActivitiesForWheel[act] : true; 
            newWheelWeights[act] = wheelActivityWeights[act] !== undefined ? wheelActivityWeights[act] : 1;
            newMasterDetails[act] = activityDetails[act] || { detailText: '', weight: 1 };
        });
        if (Object.keys(newSelected).length !== Object.keys(selectedActivitiesForWheel).length || 
            !Object.keys(newSelected).every(k => newSelected[k] === selectedActivitiesForWheel[k])) {
            setSelectedActivitiesForWheel(newSelected);
        }
        if (Object.keys(newWheelWeights).length !== Object.keys(wheelActivityWeights).length ||
            !Object.keys(newWheelWeights).every(k => newWheelWeights[k] === wheelActivityWeights[k])) {
            setWheelActivityWeights(newWheelWeights);
        }
        if (JSON.stringify(newMasterDetails) !== JSON.stringify(activityDetails)) {
            setActivityDetails(newMasterDetails);
        }
    }, [activitiesArray, selectedActivitiesForWheel, wheelActivityWeights, activityDetails]); 

    const generateWheelSegmentsFromSetup = useCallback(() => {
        let expandedPool: string[] = [];
        let currentSum = 0;
        activitiesArray.forEach(activity => {
            if (selectedActivitiesForWheel[activity]) {
                const weight = wheelActivityWeights[activity] || 1;
                currentSum += weight;
                for (let i = 0; i < weight; i++) {
                    expandedPool.push(activity);
                }
            }
        });
    
        if (currentSum !== numberOfSegmentsOnWheel && expandedPool.length > 0 && Object.values(selectedActivitiesForWheel).some(v => v === true)) {
            setWheelSegments([]); 
            return;
        }
        if (expandedPool.length === 0 && activitiesArray.length > 0) {
            setWheelSegments([]);
            return;
        }
        if (expandedPool.length === 0 && activitiesArray.length === 0) {
            setWheelSegments([]);
            return;
        }
    
        for (let i = expandedPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [expandedPool[i], expandedPool[j]] = [expandedPool[j], expandedPool[i]];
        }
        setWheelSegments(expandedPool);
    }, [activitiesArray, selectedActivitiesForWheel, wheelActivityWeights, numberOfSegmentsOnWheel]);
    
    useEffect(() => { generateWheelSegmentsFromSetup(); }, [generateWheelSegmentsFromSetup]);

    const currentSumOfWheelWeights = useMemo(() => {
        return activitiesArray.reduce((sum, activity) => {
            if (selectedActivitiesForWheel[activity]) {
                return sum + (wheelActivityWeights[activity] || 1);
            }
            return sum;
        }, 0);
    }, [activitiesArray, selectedActivitiesForWheel, wheelActivityWeights]);
    
    const isSumMismatch = currentSumOfWheelWeights !== numberOfSegmentsOnWheel && 
                          activitiesArray.length > 0 && 
                          Object.values(selectedActivitiesForWheel).some(v => v === true);

    useEffect(() => { setToolBackgroundColorHexInput(toolBackgroundColor); }, [toolBackgroundColor]);
    useEffect(() => { setToolAccentColorHexInput(toolAccentColor); }, [toolAccentColor]);
    useEffect(() => { setToolTextColorHexInput(toolTextColor); }, [toolTextColor]);
    useEffect(() => { setWheelSegmentBorderColorHexInput(wheelSegmentBorderColor); }, [wheelSegmentBorderColor]);
    const handleToolBgColorHexChange = (val: string) => { setToolBackgroundColorHexInput(val); if (isValidHexColor(val)) setToolBackgroundColor(normalizeHexColor(val)); };
    const handleToolAccentColorHexChange = (val: string) => { setToolAccentColorHexInput(val); if (isValidHexColor(val)) setToolAccentColor(normalizeHexColor(val)); };
    const handleToolTextColorHexChange = (val: string) => { setToolTextColorHexInput(val); if (isValidHexColor(val)) setToolTextColor(normalizeHexColor(val)); };
    const handleWheelSegmentBorderColorHexChange = (val: string) => { setWheelSegmentBorderColorHexInput(val); if (isValidHexColor(val)) setWheelSegmentBorderColor(normalizeHexColor(val)); };
    
    const handleActivityDetailChange = (activityText: string, field: 'detailText' | 'weight', value: string | number) => {
      setActivityDetails(prev => ({
        ...prev,
        [activityText]: {
          detailText: field === 'detailText' ? String(value) : (prev[activityText]?.detailText || ''),
          weight: field === 'weight' ? Math.max(1, Math.min(5, Number(value) || 1)) : (prev[activityText]?.weight || 1),
        }
      }));
    };

    const handleWheelActivityWeightChange = (activityText: string, value: string) => {
        const weightNum = parseInt(value, 10);
        setWheelActivityWeights(prev => ({
            ...prev,
            [activityText]: Math.max(1, Math.min(12, isNaN(weightNum) ? 1 : weightNum))
        }));
    };

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

    }, [wheelSegments, currentAngle, wheelTextFont, toolAccentColor, isSpinning, spinResult, glowIntensity, wheelSegmentBaseColors, wheelSegmentBorderColor]);

    useEffect(() => {
        let startTime: number | null = null;
        const animateGlow = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsedTime = timestamp - startTime;
            setGlowIntensity((elapsedTime / 2000) % 1); 
            glowAnimationRef.current = requestAnimationFrame(animateGlow);
        };
        if (spinResult && !isSpinning) { glowAnimationRef.current = requestAnimationFrame(animateGlow); } 
        else { if (glowAnimationRef.current) cancelAnimationFrame(glowAnimationRef.current); setGlowIntensity(0); }
        return () => { if (glowAnimationRef.current) cancelAnimationFrame(glowAnimationRef.current); };
    }, [spinResult, isSpinning]);
    
    useEffect(() => {
        const canvas = canvasRef.current; const container = canvasContainerRef.current; if (!canvas || !container) return;
        const resizeObserver = new ResizeObserver(entries => { for (let entry of entries) { const { width, height } = entry.contentRect; canvas.width = width; canvas.height = height; drawWheel(); } });
        resizeObserver.observe(container); canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; drawWheel();
        return () => resizeObserver.unobserve(container);
    }, [drawWheel]);

    useEffect(() => { drawWheel(); }, [drawWheel, glowIntensity]); 
    
    useEffect(() => { return () => { if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current); stopSelectedSpinSound(); if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close().catch(e => console.warn("Error closing AudioContext on unmount:", e)); }; }, [stopSelectedSpinSound]);

    const handleSpin = async () => {
        if (wheelSegments.length === 0 || isSumMismatch) { alert("Please ensure your wheel is configured correctly: activities selected, and sum of wheel weights matches the number of segments on the wheel."); return; }
        if (isSpinning) return;
        const audioCtx = await initializeAudioContext();
        if (!audioCtx || audioCtx.state !== 'running' && (selectedSpinSound !== 'noSound')) setSoundError("Could not start audio for effects. Please click/tap the page (e.g., the spin button again after this message) to enable audio and try again.");
        setIsSpinning(true); setSpinResult(null); 
        if (glowAnimationRef.current) cancelAnimationFrame(glowAnimationRef.current); setGlowIntensity(0);
        trackLocalEvent(TOOL_CATEGORY, 'wheelSpun', activityWheelTitle, wheelSegments.length);
        if (audioCtx && audioCtx.state === 'running' && selectedSpinSound !== 'noSound') startSelectedSpinSound(audioCtx, selectedSpinSound);
        const initialAngleAtSpinStart = currentAngle; const totalRotations = Math.floor(Math.random() * 4) + 8; 
        const winningSegmentIndex = Math.floor(Math.random() * wheelSegments.length);
        const anglePerSegment = (2 * Math.PI) / wheelSegments.length;
        const targetAngleForWinningSegment = -(winningSegmentIndex * anglePerSegment + anglePerSegment / 2); 
        const spinDistance = (totalRotations * 2 * Math.PI) + (targetAngleForWinningSegment - (initialAngleAtSpinStart % (2 * Math.PI)) );
        const spinAnimationDuration = Math.random() * 2000 + 5000; let startTime: number | null = null;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp; const elapsedTime = timestamp - startTime; let newAngle;
            if (elapsedTime < spinAnimationDuration) { const progress = elapsedTime / spinAnimationDuration; const easedProgress = 1 - Math.pow(1 - progress, 4); newAngle = initialAngleAtSpinStart + spinDistance * easedProgress; setCurrentAngle(newAngle); animationFrameIdRef.current = requestAnimationFrame(animate); } 
            else { newAngle = initialAngleAtSpinStart + spinDistance; setCurrentAngle(newAngle); setIsSpinning(false); stopSelectedSpinSound(); const selectedActivity = wheelSegments[winningSegmentIndex]; const detail = activityDetails[selectedActivity]?.detailText; const personalizedMsg = `What's the plan for today, ${userName.trim() || 'Suno Explorer'}? Your "${activityWheelTitle.trim() || 'Magic Spin Wheel'}" has chosen:`; setSpinResult({ activity: selectedActivity, detail, personalizedMessage: personalizedMsg, winningSegmentIndex }); trackLocalEvent(TOOL_CATEGORY, 'activitySelected', selectedActivity); animationFrameIdRef.current = null; }
        };
        animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    const handleResetToDefault = () => { if (window.confirm("Reset activities to default? This will also reset all weights and details.")) { setActivitiesString(defaultActivitiesListEnglish.join('\n')); setActivityDetails({}); setSelectedActivitiesForWheel({}); setWheelActivityWeights({}); trackLocalEvent(TOOL_CATEGORY, 'activitiesResetToDefault'); } };
    
    const handleSaveConfiguration = () => {
        const name = prompt("Enter a name for this wheel configuration:", activityWheelTitle);
        if (name && name.trim()) { const currentConfigData: WheelConfigData = { activityWheelTitle, userName, activitiesString, activityDetails, showAddEditDetails, numberOfSegmentsOnWheel, selectedActivitiesForWheel, wheelActivityWeights, customTitle, customLogo, selectedLogoSize, toolBackgroundColor, toolAccentColor, toolTextColor, wheelSegmentBorderColor, wheelTextFont, selectedSpinSound }; const newSavedWheel: SavedWheel = { id: Date.now().toString(), name: name.trim(), data: currentConfigData }; setSavedWheels(prev => [newSavedWheel, ...prev.filter(sw => sw.name.toLowerCase() !== name.trim().toLowerCase())]); trackLocalEvent(TOOL_CATEGORY, 'wheelConfigSaved', name.trim()); alert(`Configuration "${name.trim()}" saved!`); }
    };

    const handleLoadConfiguration = (configId: string) => { const configToLoad = savedWheels.find(sw => sw.id === configId); if (configToLoad) { loadConfigData(configToLoad.data, true); setShowLoadModal(false); trackLocalEvent(TOOL_CATEGORY, 'wheelConfigLoaded', configToLoad.name); } };
    const handleDeleteSavedConfiguration = (configId: string) => { if (window.confirm("Delete saved wheel?")) { setSavedWheels(prev => prev.filter(sw => sw.id !== configId)); trackLocalEvent(TOOL_CATEGORY, 'wheelConfigDeleted'); } };
    
    const handleClearCurrentWheel = () => { 
        if (window.confirm("Clear current inputs? This will reset all fields including master & wheel configurations, and appearance.")) { 
            loadConfigData({ 
                activityWheelTitle: 'Magic Spin Wheel', 
                userName: '', 
                activitiesString: defaultActivitiesListEnglish.join('\n'), 
                activityDetails: {}, 
                showAddEditDetails: false, 
                numberOfSegmentsOnWheel: 12, 
                selectedActivitiesForWheel: {}, 
                wheelActivityWeights: {}, 
                customTitle: 'Magic Spin Wheel', 
                customLogo: null, 
                selectedLogoSize: '96px', 
                toolBackgroundColor: theme === 'light' ? DEFAULT_TOOL_BG_COLOR_LIGHT : DEFAULT_TOOL_BG_COLOR_DARK, 
                toolAccentColor: DEFAULT_TOOL_ACCENT_COLOR, 
                toolTextColor: theme === 'light' ? DEFAULT_TOOL_TEXT_COLOR_LIGHT : DEFAULT_TOOL_TEXT_COLOR_DARK, 
                wheelSegmentBorderColor: theme === 'light' ? DEFAULT_WHEEL_BORDER_COLOR_LIGHT : DEFAULT_WHEEL_BORDER_COLOR_DARK, 
                wheelTextFont: DEFAULT_WHEEL_TEXT_FONT, 
                selectedSpinSound: DEFAULT_SPIN_SOUND, 
            }, true); 
            trackLocalEvent(TOOL_CATEGORY, 'currentWheelCleared'); 
        } 
    };
    
    const handleExportSetup = () => { const currentConfig: WheelConfigData = { activityWheelTitle, userName, activitiesString, activityDetails, showAddEditDetails, numberOfSegmentsOnWheel, selectedActivitiesForWheel, wheelActivityWeights, customTitle, customLogo, selectedLogoSize, toolBackgroundColor, toolAccentColor, toolTextColor, wheelSegmentBorderColor, wheelTextFont, selectedSpinSound }; setConfigToExportJson(JSON.stringify(currentConfig, null, 2)); setShowExportModal(true); trackLocalEvent(TOOL_CATEGORY, 'exportSetupOpened'); };
    const handleDownloadConfig = () => { const blob = new Blob([configToExportJson], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'magic_spin_wheel_config.json'; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); trackLocalEvent(TOOL_CATEGORY, 'configDownloaded'); };
    const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (e) => { try { const text = e.target?.result as string; setConfigToImportJson(text); setImportError(''); } catch (err) { setImportError('Failed to read file.'); console.error(err); } }; reader.readAsText(file); } };
    const handleImportConfig = () => { if (!configToImportJson.trim()) { setImportError('No configuration data to import.'); return; } try { const importedData = JSON.parse(configToImportJson) as Partial<WheelConfigData>; loadConfigData(importedData, true); setShowImportModal(false); setConfigToImportJson(''); setImportError(''); alert('Configuration imported! Review settings, especially segment counts and weights, then rebuild wheel if needed.'); trackLocalEvent(TOOL_CATEGORY, 'configImported'); } catch (err) { setImportError(err instanceof Error ? err.message : 'Invalid JSON format or structure.'); console.error(err); } };

    const placeholderMessage = wheelSegments.length === 0 ? "Configure activities and weights to activate the wheel!" : "Wheel configuration error. Ensure sum of selected activity weights matches the number of segments on the wheel.";

    return (
    <div className="w-full flex flex-col min-h-[calc(100vh-4rem)]" style={{ backgroundColor: toolBackgroundColor !== (theme === 'light' ? DEFAULT_TOOL_BG_COLOR_LIGHT : DEFAULT_TOOL_BG_COLOR_DARK) ? toolBackgroundColor : undefined, color: toolTextColor !== (theme === 'light' ? DEFAULT_TOOL_TEXT_COLOR_LIGHT : DEFAULT_TOOL_TEXT_COLOR_DARK) ? toolTextColor : undefined }}>
        {/* Top Control Bar - NEW */}
        <div className="sticky top-0 z-20 p-2 mb-3 rounded-b-lg flex flex-wrap items-center justify-center sm:justify-between gap-2" style={{ backgroundColor: lightenDarkenColor(toolBackgroundColor, 5), borderBottom: `1px solid ${toolAccentColor}`}}>
            <button onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} className="text-xs py-1 px-2.5 rounded-md flex items-center gap-1 font-medium" style={{backgroundColor: String(toolAccentColor), color: String(getAdjustedTextColorForContrast(toolAccentColor))}} aria-expanded={isConfigPanelOpen} aria-controls="spinner-config-panel">
                <EyeOpenIcon className="w-3.5 h-3.5"/> {isConfigPanelOpen ? 'Hide Config' : 'Show Config'}
            </button>
            <button onClick={() => setShowAppearancePanel(!showAppearancePanel)} className="text-xs py-1 px-2.5 rounded-md flex items-center gap-1 font-medium" style={{backgroundColor: String(toolAccentColor), color: String(getAdjustedTextColorForContrast(toolAccentColor))}} aria-expanded={showAppearancePanel} aria-controls="spinner-appearance-panel">
                <CogIcon className="w-3.5 h-3.5"/> {showAppearancePanel ? 'Hide Appearance' : 'Show Appearance'}
            </button>
        </div>

        <header className="mb-4 text-center pt-4 px-2">
             {customLogo && ( <img src={customLogo} alt="Custom Spinner Logo" className="mx-auto mb-2 rounded-md object-contain" style={{ maxHeight: selectedLogoSize, maxWidth: '80%' }} /> )}
            <h1 className="text-3xl md:text-4xl font-extrabold" style={{ color: toolAccentColor }}>{customTitle}</h1>
            <p className="mt-1 text-xs md:text-sm max-w-xl mx-auto" style={{ color: toolTextColor }}> Your Daily Fun & Interaction Wheel! Spin for a random activity. </p>
        </header>
        
        {soundError && ( <div className="w-full max-w-md mx-auto p-2 mb-3 bg-red-700 text-white text-xs text-center rounded-md shadow"> {soundError} </div> )}
        
        <div className="w-full max-w-6xl mx-auto">
            {isConfigPanelOpen && (
                <div id="spinner-config-panel" className={`p-3 md:p-4 rounded-lg shadow-lg border mb-4`} style={{borderColor: toolAccentColor, backgroundColor: lightenDarkenColor(toolBackgroundColor, 5)}}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[65vh] lg:max-h-none overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                        {/* Column 1: Spinner Identity & Wheel Management */}
                        <div className="space-y-4">
                             <div> <h3 className="text-lg font-semibold mb-2" style={{color: toolAccentColor}}>Spinner Identity</h3> <InputField id="activityWheelTitle" label="Wheel Title" value={activityWheelTitle} onChange={setActivityWheelTitle} labelTextColor={toolTextColor} className="mb-2"/> <InputField id="userName" label="Your Name" value={userName} onChange={setUserName} labelTextColor={toolTextColor} className="mb-2"/> </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2" style={{color: toolAccentColor}}>Wheel Management</h3>
                                <div className="flex flex-col sm:flex-row gap-2 text-sm mb-2"> <button onClick={handleSaveConfiguration} className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded">Save Current Setup</button> <button onClick={() => setShowLoadModal(true)} disabled={savedWheels.length === 0} className="flex-1 py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded disabled:opacity-50">Load Setup ({savedWheels.length})</button> </div>
                                <div className="flex flex-col sm:flex-row gap-2 text-sm mb-2"> <button onClick={handleExportSetup} className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded">Export Setup</button> <button onClick={() => { setImportError(''); setConfigToImportJson(''); setShowImportModal(true);}} className="flex-1 py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded">Import Setup</button> </div>
                                <button onClick={handleClearCurrentWheel} className="w-full py-1.5 px-3 bg-red-700 hover:bg-red-600 text-white rounded text-sm">Clear Current Wheel & Appearance</button>
                            </div>
                        </div>
                        {/* Column 2: Activities & Content Setup */}
                        <div className="space-y-4">
                             <div> <h3 className="text-lg font-semibold mb-2" style={{color: toolAccentColor}}>Master Activities List</h3> <TextAreaField id="activitiesList" label="Activities (1 per line)" value={activitiesString} onChange={setActivitiesString} labelTextColor={toolTextColor} rows={3}/> <button onClick={handleResetToDefault} className="text-xs py-1 px-2 bg-red-600 hover:bg-red-500 text-white rounded-md">Reset List</button> <CheckboxField id="showAddEditDetails" label="Edit Activity Details & Master Weights" checked={showAddEditDetails} onChange={setShowAddEditDetails} labelTextColor={toolTextColor} />
                                {showAddEditDetails && activitiesArray.length > 0 && ( <div className="mt-1 p-2 bg-white dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-700 max-h-28 overflow-y-auto text-xs"> {activitiesArray.map((act, idx) => ( <div key={idx} className="mb-1.5 grid grid-cols-3 gap-1 items-center"> <div className="col-span-2"><label htmlFor={`detail-${idx}`} className="block text-gray-500 dark:text-gray-400 truncate text-[10px]" title={act}>{act}</label><input type="text" id={`detail-${idx}`} value={activityDetails[act]?.detailText || ''} onChange={(e) => handleActivityDetailChange(act, 'detailText', e.target.value)} className="w-full px-1.5 py-0.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:ring-1 focus:ring-green-400"/></div> <div><label htmlFor={`weight-${idx}`} className="block text-gray-500 dark:text-gray-400 text-[10px]">Master Wt.</label><input type="number" id={`weight-${idx}`} min="1" max="5" step="1" value={activityDetails[act]?.weight || 1} onChange={(e) => handleActivityDetailChange(act, 'weight', parseInt(e.target.value))} className="w-full px-1.5 py-0.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-green-400"/></div></div> ))}</div> )}
                            </div>
                            <div className="p-2 bg-white dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-700">
                                <h3 className="text-lg font-semibold mb-2" style={{color: toolAccentColor}}>Wheel Content Setup</h3>
                                <InputField id="numberOfSegments" label="Number of Segments on Wheel" type="number" value={numberOfSegmentsOnWheel} onChange={(val) => setNumberOfSegmentsOnWheel(Math.max(2, Math.min(12, parseInt(val) || 12)))} min={2} max={12} step={1} labelTextColor={toolTextColor} className="mb-2" />
                                <h4 className="text-md font-medium mb-1" style={{color:toolTextColor}}>Configure Activities for the Wheel:</h4>
                                <div className="max-h-40 overflow-y-auto text-xs pr-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-700 mb-2"> {activitiesArray.map((act, idx) => ( <div key={`config-${idx}`} className="grid grid-cols-3 gap-2 items-center mb-1.5 p-1.5 bg-gray-100 dark:bg-gray-800 rounded"> <CheckboxField id={`select-act-${idx}`} label={act.length > 20 ? act.substring(0,18)+'...' : act} title={act} checked={selectedActivitiesForWheel[act] || false} onChange={(checked) => setSelectedActivitiesForWheel(prev => ({...prev, [act]: checked}))} className="col-span-2 mb-0" labelTextColor={toolTextColor}/> {selectedActivitiesForWheel[act] && ( <div><label htmlFor={`wheel-weight-${idx}`} className="block text-[10px] text-gray-500 dark:text-gray-400">Wheel Wt.</label><input type="number" id={`wheel-weight-${idx}`} min="1" max="12" step="1" value={wheelActivityWeights[act] || 1} onChange={(e) => handleWheelActivityWeightChange(act, e.target.value)} className="w-full px-1.5 py-0.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-green-400"/></div> )} </div> ))} </div>
                                <div className={`text-xs p-1 rounded ${isSumMismatch ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'}`}> Current sum of wheel weights: <span className="font-bold">{currentSumOfWheelWeights}</span><br/> Target sum (must equal segments): <span className="font-bold">{numberOfSegmentsOnWheel}</span> {isSumMismatch && <p className="font-semibold mt-0.5">Adjust weights or segment count to match.</p>} </div>
                                <button onClick={generateWheelSegmentsFromSetup} disabled={isSumMismatch} className="w-full py-1.5 px-3 text-sm rounded-md mt-2 disabled:opacity-50 disabled:cursor-not-allowed" style={{backgroundColor: toolAccentColor, color: getAdjustedTextColorForContrast(toolAccentColor)}}>Rebuild Wheel from Setup</button>
                            </div>
                        </div>
                        {/* Column 3: Appearance (now only sound) */}
                        <div className="space-y-2">
                             <fieldset className="p-2 bg-white dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-700 space-y-2 text-xs">
                                <legend className="text-lg font-semibold mb-1 px-1" style={{color: toolAccentColor}}>Sound Effects</legend>
                                <SelectField id="spinSound" label="Spinning Sound Effect" value={selectedSpinSound} onChange={setSelectedSpinSound} options={spinSoundPresets} labelTextColor={toolTextColor} />
                             </fieldset>
                        </div>
                    </div>
                </div>
            )}
             {showAppearancePanel && (
                <div id="spinner-appearance-panel" className={`p-3 md:p-4 rounded-lg shadow-lg border mb-4 max-w-6xl mx-auto`} style={{borderColor: toolAccentColor, backgroundColor: lightenDarkenColor(toolBackgroundColor, 5)}}>
                    <fieldset className="space-y-2 text-xs">
                        <legend className="text-lg font-semibold mb-1 px-1" style={{color: toolAccentColor}}>UI Appearance</legend>
                        <InputField id="spinnerToolTitleAppearance" label="Tool Page Title" value={customTitle} onChange={setCustomTitle} labelTextColor={toolTextColor} className="mb-2"/>
                        <ImageUpload onImageUpload={setCustomLogo} label="Custom Logo (Optional)" />
                        {customLogo && (<div className="flex items-end gap-2"><div className="flex-grow"><label htmlFor="customLogoSize" className="block text-sm font-medium mb-1" style={{color:toolTextColor}}>Logo Size</label><select id="customLogoSize" value={selectedLogoSize} onChange={e => setSelectedLogoSize(e.target.value)} className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-xs"><option disabled>Select</option>{logoSizeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div><button onClick={() => setCustomLogo(null)} className="h-7 mb-0 text-[10px] py-0.5 px-1.5 bg-red-600 hover:bg-red-500 text-white rounded">Remove</button></div>)}
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:toolTextColor}}>Tool Background</label><div className="flex items-center gap-1"><input type="color" value={toolBackgroundColor} onChange={(e) => setToolBackgroundColor(e.target.value)} className="p-0 h-7 w-8 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"/><InputField id="toolBgColorHex" label="" value={toolBackgroundColorHexInput} onChange={handleToolBgColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:toolTextColor}}>Tool Accent</label><div className="flex items-center gap-1"><input type="color" value={toolAccentColor} onChange={(e) => setToolAccentColor(e.target.value)} className="p-0 h-7 w-8 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"/><InputField id="toolAccentColorHex" label="" value={toolAccentColorHexInput} onChange={handleToolAccentColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:toolTextColor}}>Tool Text</label><div className="flex items-center gap-1"><input type="color" value={toolTextColor} onChange={(e) => setToolTextColor(e.target.value)} className="p-0 h-7 w-8 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"/><InputField id="toolTextColorHex" label="" value={toolTextColorHexInput} onChange={handleToolTextColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:toolTextColor}}>Wheel Seg. Border</label><div className="flex items-center gap-1"><input type="color" value={wheelSegmentBorderColor} onChange={(e) => setWheelSegmentBorderColor(e.target.value)} className="p-0 h-7 w-8 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"/><InputField id="wheelBorderColorHex" label="" value={wheelSegmentBorderColorHexInput} onChange={handleWheelSegmentBorderColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:toolTextColor}}>Wheel Text Font</label><select value={wheelTextFont} onChange={e => setWheelTextFont(e.target.value)} className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-xs"><option disabled>Select</option>{cardTextFontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
                    </fieldset>
                </div>
            )}
        </div>

        <div className="flex-grow flex flex-col items-center justify-center p-2 md:p-4">
             <div ref={canvasContainerRef} className="w-full aspect-square mx-auto mb-4 relative" style={{ maxWidth: isConfigPanelOpen || showAppearancePanel ? '400px' : '800px' }}>
                <canvas ref={canvasRef} aria-label="Activity spinning wheel" className="w-full h-full"></canvas>
                {isSpinning && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full"><Spinner size="w-20 h-20" color="text-yellow-300" /></div>}
                {!isSpinning && !spinResult && (wheelSegments.length === 0 || isSumMismatch) && ( <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4"> <svg viewBox="0 0 100 100" className="w-full h-auto max-w-[200px] mx-auto text-gray-400 opacity-60" fill="currentColor"> <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="3" strokeDasharray="6 3" /> <circle cx="50" cy="50" r="8" fill="currentColor" /> <line x1="35" y1="35" x2="65" y2="65" stroke="currentColor" strokeWidth="2.5" /> <line x1="35" y1="65" x2="65" y2="35" stroke="currentColor" strokeWidth="2.5" /> </svg> <p className="mt-3 text-md" style={{color: toolTextColor}}> {isSumMismatch ? "Wheel configuration error. Sum of selected activity weights must equal the 'Number of Segments on Wheel'. Please adjust your setup." : "Configure activities and weights to activate the wheel!"} </p> </div> )}
            </div>
            {!isSpinning && spinResult && ( <div className="animate-fadeIn text-center mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border max-w-md mx-auto" style={{borderColor: toolAccentColor}}> <p className="text-md mb-1" style={{color: toolTextColor}}>{spinResult.personalizedMessage}</p> <p className="text-3xl font-bold mb-2 break-words" style={{color: toolAccentColor}}>{spinResult.activity}</p> {spinResult.detail && <p className="text-sm italic text-yellow-600 dark:text-yellow-300 bg-gray-200 dark:bg-gray-700 p-2 rounded-md">{spinResult.detail}</p>} </div> )}
            {!isSpinning && !spinResult && wheelSegments.length > 0 && !isSumMismatch && <p className="text-xl text-center mb-4" style={{color: toolTextColor}}>Ready to spin?</p>}
            <button onClick={handleSpin} disabled={isSpinning || wheelSegments.length === 0 || isSumMismatch} className="w-full max-w-xs py-3 px-6 font-bold text-xl rounded-lg shadow-lg disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors transform hover:scale-105 active:scale-100" style={{backgroundColor: toolAccentColor, color: getAdjustedTextColorForContrast(toolAccentColor)}}> SPIN THE WHEEL! </button>
        </div>

        {showLoadModal && ( <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-green-500 max-h-[80vh] flex flex-col"><h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-2 z-10">Load Saved Wheel</h3>{savedWheels.length > 0 ? (<ul className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 flex-grow space-y-2">{savedWheels.map(wheel => (<li key={wheel.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer border border-gray-300 dark:border-gray-600 transition-all hover:border-green-400 flex justify-between items-center"><div><p className="font-semibold text-green-700 dark:text-green-200">{wheel.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">Title: {wheel.data.activityWheelTitle}, User: {wheel.data.userName || 'N/A'}</p></div><div className="flex-shrink-0 space-x-2"><button onClick={() => handleLoadConfiguration(wheel.id)} className="text-xs py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded">Load</button><button onClick={() => handleDeleteSavedConfiguration(wheel.id)} className="text-xs py-1 px-2 bg-red-600 hover:bg-red-500 text-white rounded">Delete</button></div></li>))}</ul>) : <p className="text-gray-500 dark:text-gray-400 text-center py-4">No saved wheels found.</p>}<div className="mt-4 sticky bottom-0 bg-white dark:bg-gray-800 pt-2 z-10"><button onClick={() => setShowLoadModal(false)} className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Close</button></div></div></div>)}
        {showExportModal && ( <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-green-500"><h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Export Wheel Configuration</h3><TextAreaField id="exportJson" label="Configuration JSON" value={configToExportJson} onChange={() => {}} readOnly rows={8} labelTextColor={toolTextColor}/><div className="flex justify-end gap-3 mt-4"><button onClick={handleDownloadConfig} className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded">Download .json</button><button onClick={() => setShowExportModal(false)} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Close</button></div></div></div>)}
        {showImportModal && ( <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-green-500"><h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Import Wheel Configuration</h3><TextAreaField id="importJson" label="Paste Configuration JSON here" value={configToImportJson} onChange={setConfigToImportJson} rows={6} labelTextColor={toolTextColor}/><div className="my-2 text-center text-gray-500 dark:text-gray-400 text-sm">OR</div><input type="file" ref={importFileRef} accept=".json" onChange={handleImportFileChange} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-black hover:file:bg-green-500 mb-4"/>{importError && <p className="text-red-500 dark:text-red-400 text-xs mt-1 mb-2">{importError}</p>}<div className="flex justify-end gap-3 mt-4"><button onClick={handleImportConfig} className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded">Import</button><button onClick={() => setShowImportModal(false)} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Cancel</button></div></div></div>)}
        <style>{`.animate-fadeIn { animation: fadeIn 0.5s ease-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0px); } }`}</style>
    </div>
    );
};
export default SunoCommunitySpinnerTool;
