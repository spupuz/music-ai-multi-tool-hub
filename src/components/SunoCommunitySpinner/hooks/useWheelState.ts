import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    ActivityDetail, WheelConfigData, SavedWheel, SpinResultState 
} from '../types';
import { 
    defaultActivitiesListEnglish, 
    DEFAULT_TOOL_BG_COLOR_DARK, DEFAULT_TOOL_TEXT_COLOR_DARK, 
    DEFAULT_WHEEL_BORDER_COLOR_DARK, DEFAULT_TOOL_BG_COLOR_LIGHT, 
    DEFAULT_TOOL_TEXT_COLOR_LIGHT, DEFAULT_WHEEL_BORDER_COLOR_LIGHT,
    DEFAULT_TOOL_ACCENT_COLOR, DEFAULT_WHEEL_TEXT_FONT, DEFAULT_SPIN_SOUND,
    LOCAL_STORAGE_CURRENT_PREFIX, LOCAL_STORAGE_SAVED_WHEELS_KEY, LOCAL_STORAGE_SPIN_SOUND_KEY
} from '../constants';
import { isValidHexColor, normalizeHexColor } from '../utils';

export function useWheelState(theme: string, trackLocalEvent: (category: string, action: string, label?: string, value?: number) => void) {
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

    const [savedWheels, setSavedWheels] = useState<SavedWheel[]>([]);

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

    // Initial load from localStorage
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

    // Sync to localStorage
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
    
    // Sync activities to weights and details
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

    return {
        activityWheelTitle, setActivityWheelTitle,
        userName, setUserName,
        activitiesString, setActivitiesString,
        activitiesArray,
        activityDetails, setActivityDetails,
        showAddEditDetails, setShowAddEditDetails,
        numberOfSegmentsOnWheel, setNumberOfSegmentsOnWheel,
        selectedActivitiesForWheel, setSelectedActivitiesForWheel,
        wheelActivityWeights, setWheelActivityWeights,
        wheelSegments, setWheelSegments,
        customTitle, setCustomTitle,
        customLogo, setCustomLogo,
        selectedLogoSize, setSelectedLogoSize,
        toolBackgroundColor, setToolBackgroundColor,
        toolAccentColor, setToolAccentColor,
        toolTextColor, setToolTextColor,
        wheelSegmentBorderColor, setWheelSegmentBorderColor,
        wheelTextFont, setWheelTextFont,
        toolBackgroundColorHexInput, setToolBackgroundColorHexInput,
        toolAccentColorHexInput, setToolAccentColorHexInput,
        toolTextColorHexInput, setToolTextColorHexInput,
        wheelSegmentBorderColorHexInput, setWheelSegmentBorderColorHexInput,
        selectedSpinSound, setSelectedSpinSound,
        isSpinning, setIsSpinning,
        spinResult, setSpinResult,
        currentAngle, setCurrentAngle,
        savedWheels, setSavedWheels,
        loadConfigData,
        generateWheelSegmentsFromSetup,
        currentSumOfWheelWeights,
        isSumMismatch,
        handleToolBgColorHexChange,
        handleToolAccentColorHexChange,
        handleToolTextColorHexChange,
        handleWheelSegmentBorderColorHexChange,
        handleActivityDetailChange,
        handleWheelActivityWeightChange,
    };
}
