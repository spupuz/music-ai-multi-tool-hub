import React, { useState, useRef, useEffect } from 'react';
import type { ToolProps } from '@/Layout';
import ImageUpload from '@/components/ImageUpload';
import { useTheme } from '@/context/ThemeContext';

// Extracted Modules
import { 
    TOOL_CATEGORY, logoSizeOptions, cardTextFontOptions, spinSoundPresets, DEFAULT_TOOL_ACCENT_COLOR, DEFAULT_WHEEL_TEXT_FONT, DEFAULT_SPIN_SOUND, defaultActivitiesListEnglish
} from '@/components/SunoCommunitySpinner/constants';
import { lightenDarkenColor, getAdjustedTextColorForContrast } from '@/components/SunoCommunitySpinner/utils';
import { CogIcon, EyeOpenIcon } from '@/components/SunoCommunitySpinner/Icons';
import { 
    InputField, TextAreaField, CheckboxField, SelectField, ConfirmationButton
} from '@/components/SunoCommunitySpinner/FormComponents';
import Button from '@/components/common/Button';
import { 
    SaveIcon, LoadIcon, ExportIcon, ImportIcon, TrashIcon, RefreshIcon, CommunitySpinnerIcon 
} from '@/components/Icons';
import { LoadModal, ExportModal, ImportModal } from '@/components/SunoCommunitySpinner/SpinnerModals';
import { useSpinAudio } from '@/components/SunoCommunitySpinner/hooks/useSpinAudio';
import { useWheelDrawing } from '@/components/SunoCommunitySpinner/hooks/useWheelDrawing';
import { useWheelState } from '@/components/SunoCommunitySpinner/hooks/useWheelState';
import { WheelConfigData } from '@/components/SunoCommunitySpinner/types';

const SunoCommunitySpinnerTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
    const { theme, uiMode } = useTheme();

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
        <div className={`w-full flex flex-col min-h-[calc(100vh-4rem)] overflow-x-hidden ${uiMode === 'classic' ? 'pb-20 px-4' : ''}`} style={{ backgroundColor: toolBackgroundColor, color: toolTextColor }}>
            {uiMode === 'classic' ? (
                <header className="mb-6 text-center pt-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
                        Community Spinner
                    </h1>
                    <p className="mt-2 text-[11px] font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-center">
                        Crowdsourced inspiration • Neural style randomization
                    </p>
                </header>
            ) : (
                <header className="mb-2 md:mb-12 text-center pt-0 md:pt-8 px-4 animate-fadeIn">
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic drop-shadow-2xl mb-1 md:mb-4">Community Spinner</h1>
                    <p className="mt-1 md:mt-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-lg mx-auto opacity-60">Crowdsourced inspiration • Neural style randomization</p>
                </header>
            )}
            
            {soundError && ( <div className="w-full max-w-md mx-auto p-2 mb-3 bg-red-700 text-white text-xs text-center rounded-md shadow"> {soundError} </div> )}
            
            <div className="w-full max-w-6xl mx-auto px-4">
                {isConfigPanelOpen && (
                    <div id="spinner-config-panel" className="glass-card p-6 md:p-8 border-white/10 shadow-2xl mb-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] pointer-events-none"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-h-[70vh] lg:max-h-none overflow-y-auto pr-2 scrollbar-thin">
                            {/* Column 1: Spinner Identity & Wheel Management */}
                            <div className="space-y-6">
                                <section> 
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 px-1">Signal Identity</h3> 
                                    <InputField id="activityWheelTitle" label="Stream Designation" value={activityWheelTitle} onChange={setActivityWheelTitle} className="mb-4"/> 
                                    <InputField id="userName" label="Operator Profile" value={userName} onChange={setUserName} className="mb-2"/> 
                                </section>
                                <section className="pt-6 border-t border-white/5">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 px-1">Vault Control</h3>
                                    <div className="flex flex-col sm:flex-row gap-3"> 
                                        <Button onClick={handleSaveConfiguration} variant="primary" size="xs" backgroundColor="#10b981" startIcon={<SaveIcon className="w-4 h-4" />} className="flex-1 font-black uppercase tracking-widest text-[9px] py-3 rounded-xl shadow-lg border-white/10">Commit</Button> 
                                        <Button onClick={() => setShowLoadModal(true)} disabled={savedWheels.length === 0} variant="ghost" size="xs" startIcon={<LoadIcon className="w-4 h-4" />} className="flex-1 font-black uppercase tracking-widest text-[9px] py-3 border-white/10 bg-white/5 rounded-xl">Archive ({savedWheels.length})</Button> 
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 mt-4"> 
                                        <Button onClick={handleExportSetup} variant="ghost" size="xs" startIcon={<ExportIcon className="w-4 h-4" />} className="flex-1 font-black uppercase tracking-widest text-[9px] py-3 border-white/10 bg-white/5 rounded-xl">Back Up</Button> 
                                        <Button onClick={() => { setImportError(''); setConfigToImportJson(''); setShowImportModal(true);}} variant="ghost" size="xs" startIcon={<ImportIcon className="w-4 h-4" />} className="flex-1 font-black uppercase tracking-widest text-[9px] py-3 border-white/10 bg-white/5 rounded-xl">Restore</Button> 
                                    </div>
                                    <div className="mt-6">
                                        <ConfirmationButton 
                                            onConfirm={handleClearCurrentWheel} 
                                            label="Wipe Data Grid" 
                                            confirmLabel="Confirm Hard Reset?" 
                                            icon={<TrashIcon className="w-4 h-4 ml-1" />} 
                                            className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-start px-6 transition-all shadow-none" 
                                        />
                                    </div>
                                </section>
                            </div>

                            {/* Column 2: Activities & Content Setup */}
                            <div className="space-y-6">
                                 <section> 
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 px-1">Data Packets</h3> 
                                    <TextAreaField id="activitiesList" label="Activities (1 per line)" value={activitiesString} onChange={setActivitiesString} rows={6} className="mb-4"/> 
                                    <div className="flex items-center justify-end mb-4">
                                        <ConfirmationButton onConfirm={handleResetToDefault} label="Reset to Default Stream" confirmLabel="Confirm?" className="text-[9px] font-black uppercase tracking-widest text-emerald-600/60 hover:text-emerald-500 underline underline-offset-4 transition-all" /> 
                                    </div>
                                    <CheckboxField id="showAddEditDetails" label="Advanced Neural Mapping" checked={showAddEditDetails} onChange={setShowAddEditDetails} className="mb-0"/>
                                    {showAddEditDetails && activitiesArray.length > 0 && ( 
                                        <div className="mt-6 p-4 bg-black/20 rounded-2xl border border-white/5 max-h-48 overflow-y-auto space-y-4 scrollbar-thin"> 
                                            {activitiesArray.map((act, idx) => ( 
                                                <div key={idx} className="grid grid-cols-4 gap-3 items-end"> 
                                                    <div className="col-span-3">
                                                        <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1 truncate" title={act}>{act}</label>
                                                        <input type="text" value={activityDetails[act]?.detailText || ''} onChange={(e) => handleActivityDetailChange(act, 'detailText', e.target.value)} className="w-full px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-xs font-bold outline-none focus:border-emerald-500/50 transition-all"/>
                                                    </div> 
                                                    <div>
                                                        <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Bias</label>
                                                        <input type="number" min="1" max="5" value={activityDetails[act]?.weight || 1} onChange={(e) => handleActivityDetailChange(act, 'weight', parseInt(e.target.value))} className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-center outline-none focus:border-emerald-500/50 transition-all"/>
                                                    </div>
                                                </div> 
                                            ))}
                                        </div> 
                                    )}
                                </section>
                            </div>

                            {/* Column 3: Wheel Content & Sounds */}
                            <div className="space-y-6">
                                <section className="p-5 bg-black/20 rounded-2xl border border-white/5">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 px-1">Wheel Matrix</h3>
                                    <InputField id="numberOfSegments" label="Grid Segments (2-12)" type="number" value={numberOfSegmentsOnWheel} onChange={(val) => setNumberOfSegmentsOnWheel(Math.max(2, Math.min(12, parseInt(val) || 12)))} min={2} max={12} className="mb-6" />
                                    
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3 px-1">Active Clusters</h4>
                                    <div className="max-h-40 overflow-y-auto pr-1 mb-6 space-y-2 scrollbar-thin"> 
                                        {activitiesArray.map((act, idx) => ( 
                                            <div key={`config-${idx}`} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"> 
                                                <CheckboxField id={`select-act-${idx}`} label={act.length > 25 ? act.substring(0,22)+'...' : act} title={act} checked={selectedActivitiesForWheel[act] || false} onChange={(checked) => setSelectedActivitiesForWheel(prev => ({...prev, [act]: checked}))} className="mb-0 flex-grow" /> 
                                                {selectedActivitiesForWheel[act] && ( 
                                                    <div className="w-16 ml-3">
                                                        <input type="number" min="1" max="12" value={wheelActivityWeights[act] || 1} onChange={(e) => handleWheelActivityWeightChange(act, e.target.value)} className="w-full px-2 py-1 bg-black/40 border border-white/10 rounded-lg text-center text-[10px] font-black outline-none focus:border-emerald-500/50 transition-all"/>
                                                    </div> 
                                                )} 
                                            </div> 
                                        ))} 
                                    </div>

                                    <div className={`p-4 rounded-2xl mb-6 border transition-all ${isSumMismatch ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}> 
                                        <div className="flex justify-between items-center mb-1 text-[9px] font-black uppercase tracking-widest">
                                            <span>Current Magnitude</span>
                                            <span className="text-sm">{currentSumOfWheelWeights}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                            <span>Target Matrix</span>
                                            <span className="text-sm">{numberOfSegmentsOnWheel}</span>
                                        </div>
                                        {isSumMismatch && <p className="mt-3 text-[8px] font-black uppercase tracking-[0.2em] text-center italic">Mismatch Detected</p>} 
                                    </div>
                                    
                                    <Button 
                                        onClick={generateWheelSegmentsFromSetup} 
                                        disabled={isSumMismatch} 
                                        variant="primary"
                                        size="lg"
                                        backgroundColor="#10b981"
                                        startIcon={<RefreshIcon className="w-5 h-5" />}
                                        className="w-full font-black uppercase tracking-[0.3em] text-[10px] py-4 h-auto shadow-emerald-500/20 shadow-xl" 
                                    >
                                        Reconstruct Wheel
                                    </Button>
                                </section>
                                <section className="p-5 bg-black/20 rounded-2xl border border-white/5">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-4 px-1">Audio Feedback</h3>
                                    <SelectField id="spinSound" label="Sonic Signature" value={selectedSpinSound} onChange={setSelectedSpinSound} options={spinSoundPresets} className="mb-0" />
                                </section>
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
                                                <select value={selectedLogoSize} onChange={e => setSelectedLogoSize(e.target.value)} className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-400/30 rounded text-sm focus:ring-1 focus:ring-emerald-400 text-gray-900">
                                                    {logoSizeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </select>
                                            </div>
                                            <Button onClick={() => setCustomLogo(null)} variant="ghost" size="sm" className="px-5 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-500/20 transition-all">Clear</Button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{color:toolTextColor}}>Typography</label>
                                    <select value={wheelTextFont} onChange={e => setWheelTextFont(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-400/30 rounded text-sm focus:ring-1 focus:ring-emerald-400 text-gray-900">
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
                        <div className="mt-10 pt-8 border-t border-white/5 text-center">
                            <Button onClick={() => setShowAppearancePanel(false)} variant="primary" size="lg" className="px-12 font-black uppercase tracking-[0.3em] text-xs h-14 shadow-lg active:scale-95">Commit Changes</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* MAIN WHEEL DISPLAY AREA - STABLE POSITIONING */}
            <main className="w-full glass-card p-2 sm:p-6 md:p-10 border-white/10 text-gray-900 dark:text-gray-200 transition-all duration-500 animate-fadeIn overflow-hidden">
                {wheelSegments.length > 0 && !isSumMismatch ? (
                    <div className="flex flex-col items-center transition-all duration-500 ease-in-out">
                        <div ref={canvasContainerRef} className="relative w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] rounded-full shadow-[0_0_60px_rgba(0,0,0,0.6)] border-4 border-gray-700/50 bg-gray-900/20">
                            <canvas ref={canvasRef} className="w-full h-full rounded-full cursor-pointer hover:scale-[1.01] transition-transform duration-300" onClick={handleSpin} />
                            
                            {/* Inner Spin Button / Center Piece - PERFECTLY CENTERED */}
                                <Button 
                                    onClick={handleSpin} 
                                    disabled={isSpinning} 
                                    variant="ghost"
                                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 !rounded-full z-10 flex items-center justify-center transition-all focus:outline-none bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 overflow-hidden ${isSpinning ? 'scale-90 opacity-40 cursor-not-allowed' : 'hover:scale-110 active:scale-95 animate-pulse-gentle'}`}
                                    style={{ boxShadow: `0 0 30px ${toolAccentColor}44, inset 0 0 15px rgba(255,255,255,0.1)` }}
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <CommunitySpinnerIcon className={`w-10 h-10 sm:w-14 sm:h-14 ${isSpinning ? 'animate-spin' : ''}`} style={{ color: toolAccentColor }} />
                                    </div>
                                </Button>
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
                    <div className="max-w-lg w-full mx-auto text-center p-12 bg-slate-50/50 dark:bg-black/10 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-500/20 flex flex-col items-center justify-center gap-6 shadow-sm animate-fadeIn">
                        <div className="mb-2">
                            <CogIcon className="w-20 h-20 opacity-20 animate-spin-slow transition-all duration-1000 group-hover:opacity-40" />
                        </div>
                        <div className="flex flex-col items-center">
                            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-3 opacity-70 italic text-emerald-500">Matrix Off-line</h2>
                            <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-40 leading-relaxed max-w-sm mx-auto">{placeholderMessage}</p>
                            <Button 
                                onClick={() => setIsConfigPanelOpen(true)} 
                                variant="primary" 
                                size="lg" 
                                className="mt-10 px-12 font-black uppercase text-[11px] tracking-[0.3em] shadow-xl active:scale-95 shadow-emerald-500/20 hover:shadow-emerald-500/40"
                                backgroundColor="#10b981"
                            >
                                Initialize Configuration
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            <footer className="w-full py-8 px-4 bg-transparent dark:bg-black/10 border-t border-gray-200 dark:border-white/5 mt-auto text-center">
                <p className="text-[10px] sm:text-xs text-slate-400 dark:text-gray-500 font-black uppercase tracking-[4px]">Suno Community Magic Spin Wheel • Stay Creative</p>
            </footer>

            {/* Modals */}
            <LoadModal isOpen={showLoadModal} onClose={() => setShowLoadModal(false)} savedWheels={savedWheels} onLoad={handleLoadConfiguration} onDelete={handleDeleteSavedConfiguration} />
            <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} configJson={configToExportJson} onDownload={handleDownloadConfig} />
            <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} configJson={configToImportJson} onJsonChange={setConfigToImportJson} onImport={handleImportConfig} importError={importError} importFileRef={importFileRef} onFileChange={handleImportFileChange} />
        </div>
    );
};

export default SunoCommunitySpinnerTool;
