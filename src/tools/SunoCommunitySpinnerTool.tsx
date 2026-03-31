import React, { useState, useRef, useEffect } from 'react';
import type { ToolProps } from '../../Layout';
import ImageUpload from '../../components/ImageUpload';
import { useTheme } from '../../context/ThemeContext';

// Extracted Modules
import { 
    TOOL_CATEGORY, logoSizeOptions, cardTextFontOptions, spinSoundPresets, DEFAULT_TOOL_ACCENT_COLOR, DEFAULT_WHEEL_TEXT_FONT, DEFAULT_SPIN_SOUND, defaultActivitiesListEnglish
} from '../components/SunoCommunitySpinner/constants';
import { lightenDarkenColor, getAdjustedTextColorForContrast } from '../components/SunoCommunitySpinner/utils';
import { CogIcon, EyeOpenIcon } from '../components/SunoCommunitySpinner/Icons';
import { 
    InputField, TextAreaField, CheckboxField, SelectField, ConfirmationButton
} from '../components/SunoCommunitySpinner/FormComponents';
import { LoadModal, ExportModal, ImportModal } from '../components/SunoCommunitySpinner/SpinnerModals';
import { useSpinAudio } from '../components/SunoCommunitySpinner/hooks/useSpinAudio';
import { useWheelDrawing } from '../components/SunoCommunitySpinner/hooks/useWheelDrawing';
import { useWheelState } from '../components/SunoCommunitySpinner/hooks/useWheelState';
import { WheelConfigData } from '../components/SunoCommunitySpinner/types';

const SunoCommunitySpinnerTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
    const { theme } = useTheme();

    // -- HOOKS --
    const {
        activityWheelTitle, setActivityWheelTitle,
        userName, setUserName,
        activitiesString, setActivitiesString,
        activitiesArray,
        activityDetails,
        showAddEditDetails, setShowAddEditDetails,
        numberOfSegmentsOnWheel, setNumberOfSegmentsOnWheel,
        selectedActivitiesForWheel, setSelectedActivitiesForWheel,
        wheelActivityWeights,
        wheelSegments,
        customTitle, setCustomTitle,
        customLogo, setCustomLogo,
        selectedLogoSize, setSelectedLogoSize,
        toolBackgroundColor, setToolBackgroundColor,
        toolAccentColor, setToolAccentColor,
        toolTextColor, setToolTextColor,
        wheelSegmentBorderColor, setWheelSegmentBorderColor,
        wheelTextFont, setWheelTextFont,
        toolBackgroundColorHexInput,
        toolAccentColorHexInput,
        toolTextColorHexInput,
        wheelSegmentBorderColorHexInput,
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
    } = useWheelState(theme, trackLocalEvent);

    const {
        soundError, setSoundError,
        initializeAudioContext,
        startSelectedSpinSound,
        stopSelectedSpinSound
    } = useSpinAudio();

    const [glowIntensity, setGlowIntensity] = useState(0);
    const glowAnimationRef = useRef<number | null>(null);

    const { canvasRef, canvasContainerRef, drawWheel } = useWheelDrawing({
        wheelSegments,
        currentAngle,
        wheelTextFont,
        toolAccentColor,
        isSpinning,
        spinResult,
        glowIntensity,
        wheelSegmentBorderColor
    });

    // -- LOCAL UI STATE --
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState<boolean>(true);
    const [showAppearancePanel, setShowAppearancePanel] = useState(false); 

    const [configToExportJson, setConfigToExportJson] = useState('');
    const [configToImportJson, setConfigToImportJson] = useState('');
    const [importError, setImportError] = useState('');
    const importFileRef = useRef<HTMLInputElement>(null);

    const animationFrameIdRef = useRef<number | null>(null);

    // -- EFFECTS --
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

    useEffect(() => { drawWheel(); }, [drawWheel, glowIntensity]); 

    useEffect(() => { 
        return () => { 
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current); 
            stopSelectedSpinSound(); 
        }; 
    }, [stopSelectedSpinSound]);

    // -- HANDLERS --
    const handleSpin = async () => {
        if (wheelSegments.length === 0 || isSumMismatch) { 
            alert("Please ensure your wheel is configured correctly: activities selected, and sum of wheel weights matches the number of segments on the wheel."); 
            return; 
        }
        if (isSpinning) return;
        
        const audioCtx = await initializeAudioContext();
        if (!audioCtx || (audioCtx.state !== 'running' && selectedSpinSound !== 'noSound')) {
            setSoundError("Could not start audio for effects. Please click/tap the page to enable audio and try again.");
        }

        setIsSpinning(true); 
        setSpinResult(null); 
        if (glowAnimationRef.current) cancelAnimationFrame(glowAnimationRef.current); 
        setGlowIntensity(0);
        
        trackLocalEvent(TOOL_CATEGORY, 'wheelSpun', activityWheelTitle, wheelSegments.length);
        
        if (audioCtx && audioCtx.state === 'running' && selectedSpinSound !== 'noSound') {
            startSelectedSpinSound(audioCtx, selectedSpinSound);
        }

        const initialAngleAtSpinStart = currentAngle; 
        const totalRotations = Math.floor(Math.random() * 4) + 8; 
        const winningSegmentIndex = Math.floor(Math.random() * wheelSegments.length);
        const anglePerSegment = (2 * Math.PI) / wheelSegments.length;
        const targetAngleForWinningSegment = -(winningSegmentIndex * anglePerSegment + anglePerSegment / 2); 
        const spinDistance = (totalRotations * 2 * Math.PI) + (targetAngleForWinningSegment - (initialAngleAtSpinStart % (2 * Math.PI)) );
        const spinAnimationDuration = Math.random() * 2000 + 5000; 
        
        let startTime: number | null = null;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp; 
            const elapsedTime = timestamp - startTime; 
            let newAngle;
            if (elapsedTime < spinAnimationDuration) { 
                const progress = elapsedTime / spinAnimationDuration; 
                const easedProgress = 1 - Math.pow(1 - progress, 4); 
                newAngle = initialAngleAtSpinStart + spinDistance * easedProgress; 
                setCurrentAngle(newAngle); 
                animationFrameIdRef.current = requestAnimationFrame(animate); 
            } else { 
                newAngle = initialAngleAtSpinStart + spinDistance; 
                setCurrentAngle(newAngle); 
                setIsSpinning(false); 
                stopSelectedSpinSound(); 
                
                const selectedActivity = wheelSegments[winningSegmentIndex]; 
                const detail = activityDetails[selectedActivity]?.detailText; 
                const personalizedMsg = `What's the plan for today, ${userName.trim() || 'Suno Explorer'}? Your "${activityWheelTitle.trim() || 'Magic Spin Wheel'}" has chosen:`; 
                
                setSpinResult({ 
                    activity: selectedActivity, 
                    detail, 
                    personalizedMessage: personalizedMsg, 
                    winningSegmentIndex 
                }); 
                
                trackLocalEvent(TOOL_CATEGORY, 'activitySelected', selectedActivity); 
                animationFrameIdRef.current = null; 
            }
        };
        animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    const handleResetToDefault = () => { 
        setActivitiesString(defaultActivitiesListEnglish.join('\n'));
        trackLocalEvent(TOOL_CATEGORY, 'activitiesResetToDefault'); 
    };
    
    const handleSaveConfiguration = () => {
        const name = prompt("Enter a name for this wheel configuration:", activityWheelTitle);
        if (name && name.trim()) { 
            const currentConfigData: WheelConfigData = { 
                activityWheelTitle, userName, activitiesString, activityDetails, 
                showAddEditDetails, numberOfSegmentsOnWheel, selectedActivitiesForWheel, 
                wheelActivityWeights, customTitle, customLogo, selectedLogoSize, 
                toolBackgroundColor, toolAccentColor, toolTextColor, wheelSegmentBorderColor, 
                wheelTextFont, selectedSpinSound 
            }; 
            const newSavedWheel = { id: Date.now().toString(), name: name.trim(), data: currentConfigData }; 
            setSavedWheels(prev => [newSavedWheel, ...prev.filter(sw => sw.name.toLowerCase() !== name.trim().toLowerCase())]); 
            trackLocalEvent(TOOL_CATEGORY, 'wheelConfigSaved', name.trim()); 
            alert(`Configuration "${name.trim()}" saved!`); 
        }
    };

    const handleLoadConfiguration = (configId: string) => { 
        const configToLoad = savedWheels.find(sw => sw.id === configId); 
        if (configToLoad) { 
            loadConfigData(configToLoad.data as Partial<WheelConfigData>, true); 
            setShowLoadModal(false); 
            trackLocalEvent(TOOL_CATEGORY, 'wheelConfigLoaded', configToLoad.name); 
        } 
    };

    const handleDeleteSavedConfiguration = (configId: string) => { 
        setSavedWheels(prev => prev.filter(sw => sw.id !== configId)); 
        trackLocalEvent(TOOL_CATEGORY, 'wheelConfigDeleted'); 
    };
    
    const handleClearCurrentWheel = () => { 
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
            toolAccentColor: DEFAULT_TOOL_ACCENT_COLOR, 
            wheelTextFont: DEFAULT_WHEEL_TEXT_FONT, 
            selectedSpinSound: DEFAULT_SPIN_SOUND, 
        }, true); 
        trackLocalEvent(TOOL_CATEGORY, 'currentWheelCleared'); 
    };
    
    const handleExportSetup = () => { 
        const currentConfig: WheelConfigData = { 
            activityWheelTitle, userName, activitiesString, activityDetails, 
            showAddEditDetails, numberOfSegmentsOnWheel, selectedActivitiesForWheel, 
            wheelActivityWeights, customTitle, customLogo, selectedLogoSize, 
            toolBackgroundColor, toolAccentColor, toolTextColor, wheelSegmentBorderColor, 
            wheelTextFont, selectedSpinSound 
        }; 
        setConfigToExportJson(JSON.stringify(currentConfig, null, 2)); 
        setShowExportModal(true); 
        trackLocalEvent(TOOL_CATEGORY, 'exportSetupOpened'); 
    };

    const handleDownloadConfig = () => { 
        const blob = new Blob([configToExportJson], { type: 'application/json' }); 
        const url = URL.createObjectURL(blob); 
        const link = document.createElement('a'); 
        link.href = url; 
        link.download = 'magic_spin_wheel_config.json'; 
        document.body.appendChild(link); 
        link.click(); 
        document.body.removeChild(link); 
        URL.revokeObjectURL(url); 
        trackLocalEvent(TOOL_CATEGORY, 'configDownloaded'); 
    };

    const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { 
        const file = event.target.files?.[0]; 
        if (file) { 
            const reader = new FileReader(); 
            reader.onload = (e) => { 
                try { 
                    const text = e.target?.result as string; 
                    setConfigToImportJson(text); 
                    setImportError(''); 
                } catch (err) { 
                    setImportError('Failed to read file.'); 
                    console.error(err); 
                } 
            }; 
            reader.readAsText(file); 
        } 
    };

    const handleImportConfig = () => { 
        if (!configToImportJson.trim()) { 
            setImportError('No configuration data to import.'); 
            return; 
        } 
        try { 
            const importedData = JSON.parse(configToImportJson) as Partial<WheelConfigData>; 
            loadConfigData(importedData, true); 
            setShowImportModal(false); 
            setConfigToImportJson(''); 
            setImportError(''); 
            alert('Configuration imported! Review settings, especially segment counts and weights, then rebuild wheel if needed.'); 
            trackLocalEvent(TOOL_CATEGORY, 'configImported'); 
        } catch (err) { 
            setImportError(err instanceof Error ? err.message : 'Invalid JSON format or structure.'); 
            console.error(err); 
        } 
    };

    // -- RENDER --
    const placeholderMessage = wheelSegments.length === 0 ? "Configure activities and weights to activate the wheel!" : "Wheel configuration error. Ensure sum of selected activity weights matches the number of segments on the wheel.";

    return (
        <div className="w-full flex flex-col min-h-[calc(100vh-4rem)] overflow-x-hidden" style={{ backgroundColor: toolBackgroundColor, color: toolTextColor }}>
            {/* Top Control Bar */}
            <div className="sticky top-0 z-20 p-2 mb-3 rounded-b-lg flex flex-wrap items-center justify-center sm:justify-between gap-2" style={{ backgroundColor: lightenDarkenColor(toolBackgroundColor, 5), borderBottom: `1px solid ${toolAccentColor}`}}>
                <button onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} className="text-xs py-1 px-2.5 rounded-md flex items-center gap-1 font-medium transition-opacity hover:opacity-80" style={{backgroundColor: toolAccentColor, color: getAdjustedTextColorForContrast(toolAccentColor)}} aria-expanded={isConfigPanelOpen}>
                    <EyeOpenIcon className="w-3.5 h-3.5"/> {isConfigPanelOpen ? 'Hide Config' : 'Show Config'}
                </button>
                <button onClick={() => setShowAppearancePanel(!showAppearancePanel)} className="text-xs py-1 px-2.5 rounded-md flex items-center gap-1 font-medium transition-opacity hover:opacity-80" style={{backgroundColor: toolAccentColor, color: getAdjustedTextColorForContrast(toolAccentColor)}} aria-expanded={showAppearancePanel}>
                    <CogIcon className="w-3.5 h-3.5"/> {showAppearancePanel ? 'Hide Appearance' : 'Show Appearance'}
                </button>
            </div>

            <header className="mb-4 text-center pt-4 px-2">
                 {customLogo && ( <img src={customLogo} alt="Custom Spinner Logo" className="mx-auto mb-2 rounded-md object-contain" style={{ maxHeight: selectedLogoSize, maxWidth: '80%' }} /> )}
                <h1 className="text-3xl md:text-4xl font-extrabold" style={{ color: toolAccentColor }}>{customTitle}</h1>
                <p className="mt-1 text-xs md:text-sm max-w-xl mx-auto opacity-80"> Your Daily Fun & Interaction Wheel! Spin for a random activity. </p>
            </header>
            
            {soundError && ( <div className="w-full max-w-md mx-auto p-2 mb-3 bg-red-700 text-white text-xs text-center rounded-md shadow"> {soundError} </div> )}
            
            <div className="w-full max-w-6xl mx-auto px-4">
                {isConfigPanelOpen && (
                    <div id="spinner-config-panel" className={`p-3 md:p-4 rounded-lg shadow-lg border mb-6 transition-all`} style={{borderColor: toolAccentColor, backgroundColor: lightenDarkenColor(toolBackgroundColor, 10)}}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] lg:max-h-none overflow-y-auto pr-1">
                            {/* Column 1: Spinner Identity & Wheel Management */}
                            <div className="space-y-4">
                                <div> 
                                    <h3 className="text-lg font-semibold mb-3" style={{color: toolAccentColor}}>Spinner Identity</h3> 
                                    <InputField id="activityWheelTitle" label="Wheel Title" value={activityWheelTitle} onChange={setActivityWheelTitle} labelTextColor={toolTextColor} className="mb-3"/> 
                                    <InputField id="userName" label="Your Name" value={userName} onChange={setUserName} labelTextColor={toolTextColor} className="mb-2"/> 
                                </div>
                                <div className="pt-2 border-t border-gray-400/20">
                                    <h3 className="text-lg font-semibold mb-3" style={{color: toolAccentColor}}>Wheel Management</h3>
                                    <div className="flex flex-col sm:flex-row gap-2 text-sm mb-2"> 
                                        <button onClick={handleSaveConfiguration} className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">Save Setup</button> 
                                        <button onClick={() => setShowLoadModal(true)} disabled={savedWheels.length === 0} className="flex-1 py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded disabled:opacity-50 transition-colors">Load ({savedWheels.length})</button> 
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 text-sm mb-3"> 
                                        <button onClick={handleExportSetup} className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors">Export</button> 
                                        <button onClick={() => { setImportError(''); setConfigToImportJson(''); setShowImportModal(true);}} className="flex-1 py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors">Import</button> 
                                    </div>
                                    <ConfirmationButton onConfirm={handleClearCurrentWheel} label="Clear Wheel & Styles" confirmLabel="Confirm Clear?" className="w-full py-2 px-3 bg-red-700 hover:bg-red-600 text-white rounded text-sm transition-colors font-medium" />
                                </div>
                            </div>

                            {/* Column 2: Activities & Content Setup */}
                            <div className="space-y-4">
                                 <div> 
                                    <h3 className="text-lg font-semibold mb-3" style={{color: toolAccentColor}}>Activities</h3> 
                                    <TextAreaField id="activitiesList" label="List (1 per line)" value={activitiesString} onChange={setActivitiesString} labelTextColor={toolTextColor} rows={3}/> 
                                    <div className="flex items-center justify-between mb-3">
                                        <ConfirmationButton onConfirm={handleResetToDefault} label="Reset List" confirmLabel="Reset?" className="text-xs py-1 px-3 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors" /> 
                                    </div>
                                    <CheckboxField id="showAddEditDetails" label="Edit Details & Master Weights" checked={showAddEditDetails} onChange={setShowAddEditDetails} labelTextColor={toolTextColor} className="mb-0"/>
                                    {showAddEditDetails && activitiesArray.length > 0 && ( 
                                        <div className="mt-3 p-3 bg-black/5 dark:bg-black/20 rounded-md border border-gray-400/20 max-h-32 overflow-y-auto text-xs space-y-3"> 
                                            {activitiesArray.map((act, idx) => ( 
                                                <div key={idx} className="grid grid-cols-3 gap-2 items-end"> 
                                                    <div className="col-span-2">
                                                        <label className="block text-[10px] opacity-70 mb-1 truncate" title={act}>{act}</label>
                                                        <input type="text" value={activityDetails[act]?.detailText || ''} onChange={(e) => handleActivityDetailChange(act, 'detailText', e.target.value)} className="w-full px-2 py-1 bg-white/50 dark:bg-black/50 border border-gray-400/30 rounded text-sm focus:ring-1 focus:ring-green-400 outline-none"/>
                                                    </div> 
                                                    <div>
                                                        <label className="block text-[10px] opacity-70 mb-1">Weight</label>
                                                        <input type="number" min="1" max="5" value={activityDetails[act]?.weight || 1} onChange={(e) => handleActivityDetailChange(act, 'weight', parseInt(e.target.value))} className="w-full px-2 py-1 bg-white/50 dark:bg-black/50 border border-gray-400/30 rounded text-sm focus:ring-1 focus:ring-green-400 outline-none"/>
                                                    </div>
                                                </div> 
                                            ))}
                                        </div> 
                                    )}
                                </div>
                            </div>

                            {/* Column 3: Wheel Content & Sounds */}
                            <div className="space-y-4">
                                <div className="p-3 bg-black/5 dark:bg-black/20 rounded-md border border-gray-400/20">
                                    <h3 className="text-lg font-semibold mb-3" style={{color: toolAccentColor}}>Wheel Setup</h3>
                                    <InputField id="numberOfSegments" label="Segments on Wheel (2-12)" type="number" value={numberOfSegmentsOnWheel} onChange={(val) => setNumberOfSegmentsOnWheel(Math.max(2, Math.min(12, parseInt(val) || 12)))} min={2} max={12} labelTextColor={toolTextColor} className="mb-4" />
                                    
                                    <h4 className="text-sm font-semibold mb-2 opacity-80">Wheel Segments:</h4>
                                    <div className="max-h-40 overflow-y-auto text-xs pr-1 mb-4 space-y-1"> 
                                        {activitiesArray.map((act, idx) => ( 
                                            <div key={`config-${idx}`} className="flex items-center justify-between p-2 bg-white/30 dark:bg-black/30 rounded border border-gray-400/10"> 
                                                <CheckboxField id={`select-act-${idx}`} label={act.length > 25 ? act.substring(0,22)+'...' : act} title={act} checked={selectedActivitiesForWheel[act] || false} onChange={(checked) => setSelectedActivitiesForWheel(prev => ({...prev, [act]: checked}))} className="mb-0 flex-grow" labelTextColor={toolTextColor}/> 
                                                {selectedActivitiesForWheel[act] && ( 
                                                    <div className="w-16 ml-2">
                                                        <input type="number" min="1" max="12" value={wheelActivityWeights[act] || 1} onChange={(e) => handleWheelActivityWeightChange(act, e.target.value)} className="w-full px-1.5 py-0.5 bg-white/50 dark:bg-black/50 border border-gray-400/30 rounded text-center focus:ring-1 focus:ring-green-400 outline-none" title="Wheel weight"/>
                                                    </div> 
                                                )} 
                                            </div> 
                                        ))} 
                                    </div>

                                    <div className={`text-xs p-3 rounded-md mb-3 ${isSumMismatch ? 'bg-red-500/20 text-red-700 dark:text-red-300' : 'bg-green-500/20 text-green-700 dark:text-green-300'}`}> 
                                        <div className="flex justify-between items-center mb-1">
                                            <span>Current Total Weight:</span>
                                            <span className="font-bold">{currentSumOfWheelWeights}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Required Segments:</span>
                                            <span className="font-bold">{numberOfSegmentsOnWheel}</span>
                                        </div>
                                        {isSumMismatch && <p className="mt-2 font-semibold">Total must match segments!</p>} 
                                    </div>
                                    
                                    <button onClick={generateWheelSegmentsFromSetup} disabled={isSumMismatch} className="w-full py-2 px-3 text-sm font-bold rounded-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-md" style={{backgroundColor: toolAccentColor, color: getAdjustedTextColorForContrast(toolAccentColor)}}>Rebuild Wheel</button>
                                </div>
                                <div className="p-3 bg-black/5 dark:bg-black/20 rounded-md border border-gray-400/20">
                                    <h3 className="text-sm font-semibold mb-2 opacity-80">Sound Settings</h3>
                                    <SelectField id="spinSound" label="Spinning Effect" value={selectedSpinSound} onChange={setSelectedSpinSound} options={spinSoundPresets} labelTextColor={toolTextColor} className="mb-0" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showAppearancePanel && (
                    <div id="spinner-appearance-panel" className={`p-4 md:p-6 rounded-lg shadow-xl border mb-6 max-w-3xl mx-auto transition-all`} style={{borderColor: toolAccentColor, backgroundColor: lightenDarkenColor(toolBackgroundColor, 5)}}>
                        <h3 className="text-xl font-bold mb-4" style={{color: toolAccentColor}}>UI Customization</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <InputField id="spinnerToolTitleAppearance" label="Custom Title" value={customTitle} onChange={setCustomTitle} labelTextColor={toolTextColor} className="mb-0"/>
                                <div className="pt-2">
                                    <label className="block text-sm font-medium mb-2" style={{color:toolTextColor}}>Custom Logo</label>
                                    <ImageUpload onImageUpload={setCustomLogo} label="" />
                                    {customLogo && (
                                        <div className="mt-3 flex items-end gap-3 p-3 bg-black/10 rounded-md">
                                            <div className="flex-grow">
                                                <label className="block text-xs font-semibold mb-1" style={{color:toolTextColor}}>Size</label>
                                                <select value={selectedLogoSize} onChange={e => setSelectedLogoSize(e.target.value)} className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-400/30 rounded text-sm focus:ring-1 focus:ring-green-400">
                                                    {logoSizeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </select>
                                            </div>
                                            <button onClick={() => setCustomLogo(null)} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition-colors">Clear</button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{color:toolTextColor}}>Typography</label>
                                    <select value={wheelTextFont} onChange={e => setWheelTextFont(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-400/30 rounded text-sm focus:ring-1 focus:ring-green-400">
                                        {cardTextFontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{color:toolTextColor}}>Background Color</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={toolBackgroundColor} onChange={(e) => setToolBackgroundColor(e.target.value)} className="h-10 w-12 rounded cursor-pointer bg-transparent border-none"/>
                                        <input type="text" value={toolBackgroundColorHexInput} onChange={(e) => handleToolBgColorHexChange(e.target.value)} className="flex-grow px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-400/30 rounded text-sm uppercase"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{color:toolTextColor}}>Accent Color</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={toolAccentColor} onChange={(e) => setToolAccentColor(e.target.value)} className="h-10 w-12 rounded cursor-pointer bg-transparent border-none"/>
                                        <input type="text" value={toolAccentColorHexInput} onChange={(e) => handleToolAccentColorHexChange(e.target.value)} className="flex-grow px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-400/30 rounded text-sm uppercase"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{color:toolTextColor}}>Text Color</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={toolTextColor} onChange={(e) => setToolTextColor(e.target.value)} className="h-10 w-12 rounded cursor-pointer bg-transparent border-none"/>
                                        <input type="text" value={toolTextColorHexInput} onChange={(e) => handleToolTextColorHexChange(e.target.value)} className="flex-grow px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-400/30 rounded text-sm uppercase"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{color:toolTextColor}}>Wheel Border</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={wheelSegmentBorderColor} onChange={(e) => setWheelSegmentBorderColor(e.target.value)} className="h-10 w-12 rounded cursor-pointer bg-transparent border-none"/>
                                        <input type="text" value={wheelSegmentBorderColorHexInput} onChange={(e) => handleWheelSegmentBorderColorHexChange(e.target.value)} className="flex-grow px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-400/30 rounded text-sm uppercase"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-400/20 text-center">
                            <button onClick={() => setShowAppearancePanel(false)} className="px-8 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-bold transition-colors shadow-md">Close Panel</button>
                        </div>
                    </div>
                )}
            </div>

            {/* MAIN WHEEL DISPLAY AREA - STABLE POSITIONING */}
            <main className="flex-grow flex flex-col items-center justify-start py-8 px-4 md:py-12 min-h-[650px] relative">
                {wheelSegments.length > 0 && !isSumMismatch ? (
                    <div className="flex flex-col items-center transition-all duration-500 ease-in-out">
                        <div ref={canvasContainerRef} className="relative w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] rounded-full shadow-[0_0_60px_rgba(0,0,0,0.6)] border-4 border-gray-700/50 bg-gray-900/20">
                            <canvas ref={canvasRef} className="w-full h-full rounded-full cursor-pointer hover:scale-[1.01] transition-transform duration-300" onClick={handleSpin} />
                            
                            {/* Inner Spin Button / Center Piece - PERFECTLY CENTERED */}
                            <button 
                                onClick={handleSpin} 
                                disabled={isSpinning} 
                                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full z-10 flex flex-col items-center justify-center shadow-2xl transition-all ${isSpinning ? 'scale-90 opacity-40 cursor-not-allowed' : 'hover:scale-110 active:scale-95 animate-pulse'}`} 
                                style={{ backgroundColor: toolAccentColor, color: getAdjustedTextColorForContrast(toolAccentColor), border: `4px solid ${lightenDarkenColor(toolAccentColor, -25)}` }}
                            >
                                <span className="text-lg sm:text-xl font-black uppercase tracking-tighter leading-none">{isSpinning ? '...' : 'SPIN'}</span>
                                <span className="text-[8px] sm:text-[10px] font-bold opacity-80 mt-1">CLICK ME</span>
                            </button>
                        </div>

                        {/* Result Presentation - Flow-Optimized to prevent jump */}
                        <div className="mt-8 min-h-[120px] w-full flex flex-col items-center justify-start">
                            {spinResult && !isSpinning && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-center p-1 w-full max-w-2xl bg-black/10 rounded-2xl backdrop-blur-sm border border-white/10 shadow-2xl">
                                    <p className="text-sm font-bold uppercase tracking-widest opacity-70 mb-3 px-4">{spinResult.personalizedMessage}</p>
                                    <div className="inline-block px-8 py-5 rounded-xl shadow-lg border-2 w-full sm:w-auto" style={{ backgroundColor: toolAccentColor, borderColor: lightenDarkenColor(toolAccentColor, 30) }}>
                                        <h2 className="text-xl sm:text-3xl font-black leading-tight" style={{ color: getAdjustedTextColorForContrast(toolAccentColor) }}>{spinResult.activity}</h2>
                                        {spinResult.detail && <p className="mt-2 text-sm sm:text-base font-medium italic opacity-95" style={{ color: getAdjustedTextColorForContrast(toolAccentColor) }}>{spinResult.detail}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-md text-center p-12 bg-black/10 rounded-3xl border-4 border-dashed border-gray-500/30 flex flex-col items-center justify-center">
                        <CogIcon className="w-20 h-20 opacity-20 mb-6 animate-spin-slow" />
                        <h2 className="text-2xl font-bold mb-4 opacity-70">Wheel Not Ready</h2>
                        <p className="text-sm opacity-60 leading-relaxed">{placeholderMessage}</p>
                        <button onClick={() => setIsConfigPanelOpen(true)} className="mt-8 px-6 py-3 rounded-full font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg active:scale-95">Open Configuration</button>
                    </div>
                )}
            </main>

            <footer className="w-full py-8 px-4 bg-black/25 mt-auto text-center border-t border-white/5">
                <p className="text-[10px] sm:text-xs opacity-40 hover:opacity-100 transition-opacity uppercase tracking-[4px]">Suno Community Magic Spin Wheel • Stay Creative</p>
            </footer>

            {/* Modals */}
            <LoadModal isOpen={showLoadModal} onClose={() => setShowLoadModal(false)} savedWheels={savedWheels} onLoad={handleLoadConfiguration} onDelete={handleDeleteSavedConfiguration} />
            <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} configJson={configToExportJson} onDownload={handleDownloadConfig} />
            <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} configJson={configToImportJson} onJsonChange={setConfigToImportJson} onImport={handleImportConfig} importError={importError} importFileRef={importFileRef} onFileChange={handleImportFileChange} />
        </div>
    );
};

export default SunoCommunitySpinnerTool;
