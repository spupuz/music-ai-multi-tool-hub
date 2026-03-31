
// SongDeckPickerTool.tsx
import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import type { ToolProps } from '@/Layout';
import { useSongDeckPickerLogic } from '@/hooks/useSongDeckPickerLogic';
import Spinner from '@/components/Spinner';
import ImageUpload from '@/components/ImageUpload';
import InputField from '@/components/forms/InputField';
import TextAreaField from '@/components/forms/TextAreaField';
import SelectField from '@/components/forms/SelectField';
import { EyeOpenIcon, DiceFiveIcon, PlusCircleIcon, DownloadIcon, CopyIcon, ConfigIcon, SaveIcon, LoadDeckIcon, DeleteIcon, ExportIcon, ImportIcon, ArrowDownIcon, HandRaisedIcon, EyeSlashIcon, FolderPlusIcon, ListCheckIcon, ArrowUturnLeftIcon, TrashIcon } from './songDeckPicker.icons';
import { logoSizeOptions, cardTextFontOptions, DEFAULT_NUMBER_OF_CARDS_TO_DRAW, DEFAULT_REVEAL_POOL_SIZE_X, DEFAULT_MAX_LOGGED_SONGS_N, DEFAULT_PICKER_MODE, SONG_INFO_CACHE_CLEAR_CLICKS_NEEDED, DEFAULT_MAX_SONGS_PER_GROUP, TOOL_CATEGORY, LOGGED_SONGS_CLEAR_RETURN_CLICKS_NEEDED, GROUP_REMOVE_CLICKS_NEEDED, DEFAULT_RANKING_REVEAL_TOP_X, DEFAULT_RANKING_REVEAL_SNIPPET_DURATION } from './songDeckPicker.constants';
import { getAdjustedTextColor, lightenDarkenColor } from '@/utils/imageUtils';
import { SongCardInterface, PickerMode } from '@/types'; 
import { downloadSongGroupsAsCsv } from '@/services/csvExportService';
import { useTheme } from '@/context/ThemeContext';

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;


const PanelToggleIcon: React.FC<{ isOpen: boolean, className?: string }> = ({ isOpen, className = "w-5 h-5" }) => (
    isOpen ? 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    : 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);


const SongDeckPickerTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
    const { theme } = useTheme();
    const {
        rawSongInput, setRawSongInput,
        rawBonusArtistsInput, setRawBonusArtistsInput,
        fullDeck,
        selectedCardForLogging,
        loggedCards,
        showConfetti,
        isLoading,
        error,
        statusMessage,
        fetchProgressMessage,
        showInputs, setShowInputs,
        clipboardStatus,
        downloadStatus, setDownloadStatus,
        cardAnimationKey,
        customTitle, setCustomTitle,
        customLogo, setCustomLogo,
        selectedLogoSize, setSelectedLogoSize,
        showCustomization, setShowCustomization,
        toolBackgroundColor, setToolBackgroundColor,
        toolBackgroundColorHexInput, handleToolBgColorHexChange,
        cardTextFont, setCardTextFont,
        toolAccentColor, setToolAccentColor,
        toolAccentColorHexInput, handleToolAccentColorHexChange,
        cardBackgroundColor, setCardBackgroundColor,
        cardBackgroundColorHexInput, handleCardBgColorHexChange,
        cardBorderColor, setCardBorderColor,
        cardBorderColorHexInput, handleCardBorderColorHexChange,
        cardTextColor, setCardTextColor,
        cardTextColorHexInput, handleCardTextColorHexChange,
        toolTextColor, setToolTextColor,
        toolTextColorHexInput, handleToolTextColorHexChange,
        numberOfCardsToDraw, setNumberOfCardsToDraw, 
        savedDeckThemes,
        showSaveThemeModal, setShowSaveThemeModal,
        showLoadThemeModal, setShowLoadThemeModal,
        newThemeName, setNewThemeName,
        errorSaveTheme,
        showExportConfigModal, setShowExportConfigModal,
        showImportConfigModal, setShowImportConfigModal,
        configToExportJson,
        configToImportJson, setConfigToImportJson,
        importConfigError, 
        setImportConfigError,
        importConfigFileRef,
        drawnCardsForSelection,
        animatedSelectionStage,
        arrowPositionIndex,
        finallyChosenCardFromAnimation, 
        isPickingRandomCard,
        buildDeck,
        pickRandomCard,
        handleManualPick,
        logSelectedCard,
        handleClearLog,
        handleClearDeck,
        handleClearAllInputs,
        handleApplyBonuses,
        unloggedDeckForDisplay,
        exportDeck,
        copyDeckToClipboard,
        handleSaveTheme,
        handleLoadTheme,
        handleDeleteTheme,
        handleExportConfig,
        handleDownloadConfigJson,
        handleImportFileChange,
        handleImportConfigJson,
        pickerMode, setPickerMode,
        revealPoolSizeX, setRevealPoolSizeX,
        maxLoggedSongsN, setMaxLoggedSongsN,
        customCardBackBase64, setCustomCardBackBase64,
        currentRevealPool, revealedInPoolCount, isRevealRoundActive,
        handlePrepareRevealRound, handleRevealNextCard, handleLogRevealedCards,
        clearSongInfoCacheClickCount, clearSongInfoCacheStatus, handleClearSongInfoCache,
        songGroups, currentGroupNameInput, setCurrentGroupNameInput, handleMoveLoggedToGroup, 
        maxSongsPerGroup, setMaxSongsPerGroup,
        clearLoggedSongsClickCount, handleClearAndReturnLoggedSongs,
        groupToRemoveConfirm, handleRemoveGroupAndReturnSongs,
        getClearAndReturnLoggedSongsButtonText,
        nextRankToReveal, handleRankingRevealClick,
        rankingRevealTopX, setRankingRevealTopX,
        rankingRevealSnippetDuration, setRankingRevealSnippetDuration,
        revealedRankingCard, handleCloseRankingRevealModal,
    } = useSongDeckPickerLogic({ trackLocalEvent });
    
    const [isSnippetPlaying, setIsSnippetPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const snippetTimeoutRef = useRef<number | null>(null);

    const getAdjustedTextColorForContrast = useCallback((backgroundColorHex: string, preferredTextColorHex?: string): string => {
        return getAdjustedTextColor(backgroundColorHex, preferredTextColorHex || toolTextColor);
    }, [toolTextColor]);

    useEffect(() => {
        if (revealedRankingCard && revealedRankingCard.audioUrl && audioRef.current) {
            const audio = audioRef.current;
            
            const playSnippet = () => {
                if (audio.duration && isFinite(audio.duration)) {
                    const snippetDuration = rankingRevealSnippetDuration;
                    const maxStartTime = Math.max(0, audio.duration - snippetDuration);
                    const randomStartTime = Math.random() * maxStartTime;
                    
                    audio.currentTime = randomStartTime;
                    audio.play().catch(e => console.error("Audio playback failed:", e));
                    setIsSnippetPlaying(true);
                    
                    if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);
                    snippetTimeoutRef.current = window.setTimeout(() => {
                        if (audioRef.current) audioRef.current.pause();
                        setIsSnippetPlaying(false);
                    }, snippetDuration * 1000);
                } else {
                    // Fallback if duration is not available after load
                     setIsSnippetPlaying(false);
                }
            };

            const handleLoadedData = () => {
                playSnippet();
                audio.removeEventListener('loadeddata', handleLoadedData);
            };

            audio.addEventListener('loadeddata', handleLoadedData);
            audio.src = revealedRankingCard.audioUrl;
            audio.load();
            
            return () => {
                audio.removeEventListener('loadeddata', handleLoadedData);
                audio.pause();
                if(audioRef.current) audioRef.current.src = '';
                if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);
            };
        } else {
            setIsSnippetPlaying(false);
            if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);
        }
    }, [revealedRankingCard, rankingRevealSnippetDuration]);
    
    const effectiveCardTextColor = useMemo(() => {
        const bgToTest = selectedCardForLogging?.color || cardBackgroundColor;
        return getAdjustedTextColor(bgToTest, cardTextColor);
    }, [selectedCardForLogging, cardBackgroundColor, cardTextColor]);

    const getCardStyleForAnimation = (card: SongCardInterface, index: number): React.CSSProperties => {
        const isTheSelectedCardInRow = selectedCardForLogging && card.id === selectedCardForLogging.id;
        let cardStyle: React.CSSProperties = {
            backgroundColor: card.color || cardBackgroundColor,
            borderColor: String(cardBorderColor),
            transform: 'scale(1)',
            transition: 'transform 0.3s ease-out, border-color 0.3s ease-out, box-shadow 0.3s ease-out, opacity 0.3s ease-out',
            width: '100%', 
        };
        
        if (animatedSelectionStage === 'cardFocused') {
            if (isTheSelectedCardInRow) {
                cardStyle.borderColor = toolAccentColor;
                cardStyle.transform = 'scale(1.03)';
                cardStyle.boxShadow = `0 0 8px ${toolAccentColor}`;
            } else {
                cardStyle.opacity = 0.7;
            }
        } else if (arrowPositionIndex === index && animatedSelectionStage === 'animatingArrow') {
           cardStyle.borderColor = toolAccentColor;
           cardStyle.transform = 'scale(1.03)';
        } else if (finallyChosenCardFromAnimation?.id === card.id && animatedSelectionStage === 'arrowLanded') {
            cardStyle.transform = 'scale(1.05) translateY(-3px)';
            cardStyle.borderColor = toolAccentColor; 
            cardStyle.boxShadow = `0 0 12px ${toolAccentColor}`;
        }
        return cardStyle;
    };

    const cardBackDefaultStyle: React.CSSProperties = {
        backgroundColor: lightenDarkenColor(toolBackgroundColor, theme === 'light' ? -5 : -20), 
        border: `2px dashed ${lightenDarkenColor(toolAccentColor, 40)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.375rem', 
        minHeight: '18rem', 
        color: getAdjustedTextColor(lightenDarkenColor(toolBackgroundColor, theme === 'light' ? -5 : -20), toolTextColor),
        fontFamily: cardTextFont,
    };

    const getClearSongInfoCacheButtonText = () => {
        if (clearSongInfoCacheClickCount > 0) {
            return `Confirm Clear (${SONG_INFO_CACHE_CLEAR_CLICKS_NEEDED - clearSongInfoCacheClickCount} left)`;
        }
        return "Clear Song Info Cache";
    };
    
    const getRemoveGroupButtonText = (groupId: string) => {
        if (groupToRemoveConfirm.groupId === groupId && groupToRemoveConfirm.count > 0) {
            return `Confirm Ungroup...`;
        }
        return "Ungroup";
    };

    const handleDownloadGroupsCsv = () => {
        downloadSongGroupsAsCsv(songGroups);
        trackLocalEvent(TOOL_CATEGORY, 'groupsExportedToCsv', undefined, songGroups.reduce((sum, g) => sum + g.songs.length, 0));
        setDownloadStatus('Song groups exported to CSV!');
        setTimeout(() => setDownloadStatus(''), 3000);
    };

    return (
      <div className="w-full min-h-screen p-2 md:p-4 transition-colors duration-300" style={{ backgroundColor: toolBackgroundColor, color: toolTextColor }}>
        
        <div className="sticky top-0 z-10 p-2 mb-3 rounded-b-lg flex flex-wrap items-center justify-center sm:justify-between gap-2" style={{ backgroundColor: lightenDarkenColor(toolBackgroundColor, theme === 'light' ? -5 : 5), borderBottom: `1px solid ${toolAccentColor}`}}>
            <div className="flex items-center gap-2">
                <label htmlFor="pickerModeSelect" className="text-xs font-medium" style={{ color: toolTextColor }}>Picker Mode:</label>
                <SelectField
                    id="pickerModeSelect"
                    label=""
                    value={pickerMode}
                    onChange={(val) => setPickerMode(val as PickerMode)}
                    options={[
                        { value: PickerMode.Standard, label: 'Standard Mode' }, 
                        { value: PickerMode.Reveal, label: 'Reveal Cards Mode' },
                        { value: PickerMode.RankingReveal, label: 'Ranking Reveal Mode' }
                    ]}
                    className="w-auto text-xs mb-0"
                    labelTextColor={toolTextColor}
                />
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setShowInputs(!showInputs)} className="text-xs py-1 px-2.5 rounded-md flex items-center gap-1 font-medium" style={{backgroundColor: String(toolAccentColor), color: String(getAdjustedTextColorForContrast(toolAccentColor, toolTextColor))}}>
                    <EyeOpenIcon className="w-3.5 h-3.5"/> {showInputs ? 'Hide Inputs' : 'Show Inputs'}
                </button>
                <button onClick={() => setShowCustomization(!showCustomization)} className="text-xs py-1 px-2.5 rounded-md flex items-center gap-1 font-medium" style={{backgroundColor: String(toolAccentColor), color: String(getAdjustedTextColorForContrast(toolAccentColor, toolTextColor))}}>
                    <ConfigIcon className="w-3.5 h-3.5"/> {showCustomization ? 'Hide UI Config' : 'Show UI Config'}
                </button>
            </div>
        </div>
        
        <header className="mb-4 text-center">
             {customLogo && ( <img src={customLogo} alt="Custom Deck Picker Logo" className="mx-auto mb-2 rounded-md object-contain" style={{ maxHeight: selectedLogoSize, maxWidth: '80%' }} /> )}
            <h1 className="text-3xl md:text-4xl font-extrabold" style={{ color: toolAccentColor }}>{customTitle}</h1>
            <p className="mt-1 text-xs md:text-sm max-w-xl mx-auto">Build your song deck, apply bonuses, pick cards, and log your choices!</p>
        </header>
        
        {showInputs && (
            <div className="mb-4 p-3 md:p-4 rounded-lg shadow-lg border" style={{ borderColor: String(toolAccentColor), backgroundColor: String(lightenDarkenColor(toolBackgroundColor, theme === 'light' ? -5 : 10)) }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextAreaField id="rawSongInput" label="Song Entries (1 per line)" value={rawSongInput} onChange={setRawSongInput} placeholder="Suno/Riffusion/Producer.AI URL, Suno Playlist URL, or ArtistName: Artist | Title: Title | ..." labelTextColor={toolTextColor} />
                    <TextAreaField id="rawBonusArtistsInput" label="Bonus Artists (1 per line, case-insensitive)" value={rawBonusArtistsInput} onChange={setRawBonusArtistsInput} placeholder="Artist Name" labelTextColor={toolTextColor} />
                </div>
                <div className="mt-3 flex flex-col sm:flex-row gap-2 text-sm">
                    <button onClick={buildDeck} disabled={isLoading || isPickingRandomCard} className="flex-1 py-2 px-3 rounded-md font-semibold text-black flex items-center justify-center" style={{backgroundColor: String(toolAccentColor), color: String(getAdjustedTextColorForContrast(toolAccentColor, toolTextColor))}}> {isLoading ? <Spinner size="w-4 h-4 mr-2" color="text-black" /> : <PlusCircleIcon />} Build/Rebuild Deck </button>
                    <button onClick={handleApplyBonuses} disabled={isLoading || isPickingRandomCard || !rawBonusArtistsInput.trim()} className="flex-1 py-2 px-3 rounded-md font-semibold text-black flex items-center justify-center disabled:opacity-60" style={{backgroundColor: String(toolAccentColor), color: String(getAdjustedTextColorForContrast(toolAccentColor, toolTextColor))}}><PlusCircleIcon /> Apply Bonuses & Rebuild</button>
                </div>
                 <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <button onClick={handleClearDeck} className="flex-1 py-1 px-2 bg-red-700 hover:bg-red-600 text-white rounded">Clear Current Deck</button>
                    <button onClick={handleClearAllInputs} className="flex-1 py-1 px-2 bg-red-700 hover:bg-red-600 text-white rounded">Clear All Inputs</button>
                    <button 
                        onClick={handleClearSongInfoCache} 
                        className="flex-1 py-1 px-2 bg-orange-600 hover:bg-orange-500 text-white rounded"
                        aria-label={getClearSongInfoCacheButtonText()}
                        aria-live="polite"
                    >
                        {getClearSongInfoCacheButtonText()}
                    </button>
                </div>
                 {clearSongInfoCacheStatus && <p className="text-xs text-center mt-1" style={{color: String(toolTextColor)}}>{clearSongInfoCacheStatus}</p>}
                 {fetchProgressMessage && <p className="text-xs mt-2 text-center" style={{color: String(toolTextColor)}}>{fetchProgressMessage}</p>}
                 {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}
                 {statusMessage && animatedSelectionStage !== 'animatingArrow' && animatedSelectionStage !== 'arrowLanded' && ( 
                    <div className="text-lg font-semibold mt-2 text-center" style={{color: String(toolAccentColor)}}>
                        {statusMessage.split('\n').map((line, index) => (
                            <React.Fragment key={index}>
                                {line}
                                {index < statusMessage.split('\n').length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        )}
        
        {showCustomization && (
          <div className="my-4 p-3 md:p-4 rounded-lg shadow-lg border" style={{ borderColor: String(toolAccentColor), backgroundColor: String(lightenDarkenColor(toolBackgroundColor, theme === 'light' ? -5 : 10)) }}>
            <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <InputField id="customTitle" label="Tool Page Title" value={customTitle} onChange={setCustomTitle} labelTextColor={toolTextColor}/>
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3"><ImageUpload onImageUpload={setCustomLogo} label="Custom Page Logo (Optional)" /></div>
                    {customLogo && (<div className="flex items-end gap-2"><SelectField id="logoSize" label="Logo Size" value={selectedLogoSize} onChange={setSelectedLogoSize} options={logoSizeOptions} className="flex-grow mb-0" labelTextColor={toolTextColor}/><button onClick={() => setCustomLogo(null)} className="h-7 mb-0 text-[10px] py-0.5 px-1.5 bg-red-600 hover:bg-red-500 text-white rounded">Remove</button></div>)}
                </div>
                <details className="bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-300 dark:border-gray-700">
                    <summary className="cursor-pointer font-medium" style={{color: String(toolAccentColor)}}>Global & Standard Mode Settings</summary>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:String(toolTextColor)}}>Tool Background</label><div className="flex items-center gap-1"><input type="color" value={toolBackgroundColor} onChange={(e) => setToolBackgroundColor(e.target.value)} className="p-0 h-7 w-8 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"/><InputField id="toolBgColorHex" label="" value={toolBackgroundColorHexInput} onChange={handleToolBgColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:String(toolTextColor)}}>Tool Accent</label><div className="flex items-center gap-1"><input type="color" value={toolAccentColor} onChange={(e) => setToolAccentColor(e.target.value)} className="p-0 h-7 w-8 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"/><InputField id="toolAccentColorHex" label="" value={toolAccentColorHexInput} onChange={handleToolAccentColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:String(toolTextColor)}}>Tool Text</label><div className="flex items-center gap-1"><input type="color" value={toolTextColor} onChange={(e) => setToolTextColor(e.target.value)} className="p-0 h-7 w-8 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"/><InputField id="toolTextColorHex" label="" value={toolTextColorHexInput} onChange={handleToolTextColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                         <SelectField id="cardTextFont" label="Card Text Font" value={cardTextFont} onChange={setCardTextFont} options={cardTextFontOptions} labelTextColor={toolTextColor} className="mb-0"/>
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:String(toolTextColor)}}>Card Background</label><div className="flex items-center gap-1"><input type="color" value={cardBackgroundColor} onChange={(e) => setCardBackgroundColor(e.target.value)} className="p-0 h-7 w-8 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"/><InputField id="cardBgColorHex" label="" value={cardBackgroundColorHexInput} onChange={handleCardBgColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:String(toolTextColor)}}>Card Border</label><div className="flex items-center gap-1"><input type="color" value={cardBorderColor} onChange={(e) => setCardBorderColor(e.target.value)} className="p-0 h-7 w-8 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"/><InputField id="cardBorderColorHex" label="" value={cardBorderColorHexInput} onChange={handleCardBorderColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:String(toolTextColor)}}>Card Text (Preferred)</label><div className="flex items-center gap-1"><input type="color" value={cardTextColor} onChange={(e) => setCardTextColor(e.target.value)} className="p-0 h-7 w-8 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"/><InputField id="cardTextColorHex" label="" value={cardTextColorHexInput} onChange={handleCardTextColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                         <InputField id="numberOfCardsToDraw" label="Cards in Random Pick Animation (Std, 2-10)" type="number" value={String(numberOfCardsToDraw)} onChange={(val) => setNumberOfCardsToDraw(Math.max(2, Math.min(10, parseInt(val) || DEFAULT_NUMBER_OF_CARDS_TO_DRAW)))} min={2} max={10} step={1} labelTextColor={toolTextColor} className="mb-0"/>
                    </div>
                </details>
                 <details className="bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-300 dark:border-gray-700"> 
                    <summary className="cursor-pointer font-medium" style={{color: String(toolAccentColor)}}>Reveal Cards Mode Settings</summary>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <InputField id="revealPoolSizeX" label="Cards in Reveal Round (X)" type="number" value={String(revealPoolSizeX)} onChange={(val) => setRevealPoolSizeX(Math.max(1, Math.min(20, parseInt(val) || DEFAULT_REVEAL_POOL_SIZE_X)))} min={1} max={20} step={1} labelTextColor={toolTextColor} className="mb-0"/>
                        <InputField id="maxLoggedSongsN" label="Max Total Logged Songs (N)" type="number" value={String(maxLoggedSongsN)} onChange={(val) => setMaxLoggedSongsN(Math.max(1, parseInt(val) || DEFAULT_MAX_LOGGED_SONGS_N))} min={1} step={1} labelTextColor={toolTextColor} className="mb-0"/>
                        <InputField id="maxSongsPerGroup" label="Max Songs Per Group (Guideline)" type="number" value={String(maxSongsPerGroup)} onChange={(val) => setMaxSongsPerGroup(Math.max(1, parseInt(val) || DEFAULT_MAX_SONGS_PER_GROUP))} min={1} step={1} labelTextColor={toolTextColor} className="mb-0"/>
                        <div className="col-span-1 sm:col-span-2"><ImageUpload onImageUpload={setCustomCardBackBase64} label="Custom Card Back Image (Reveal Mode)" /></div>
                        {customCardBackBase64 && <button onClick={() => setCustomCardBackBase64(null)} className="text-xs py-1 px-2 bg-red-600 hover:bg-red-500 text-white rounded">Remove Card Back</button>}
                    </div>
                </details>
                <details className="bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-300 dark:border-gray-700">
                    <summary className="cursor-pointer font-medium" style={{color: String(toolAccentColor)}}>Ranking Reveal Mode Settings</summary>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <InputField id="rankingRevealTopX" label="Animate & Play Snippet for Top X Songs" type="number" value={String(rankingRevealTopX)} onChange={(val) => setRankingRevealTopX(Math.max(0, parseInt(val) || DEFAULT_RANKING_REVEAL_TOP_X))} min={0} step={1} labelTextColor={toolTextColor} className="mb-0"/>
                        <InputField id="rankingRevealSnippetDuration" label="Snippet Duration (sec)" type="number" value={String(rankingRevealSnippetDuration)} onChange={(val) => setRankingRevealSnippetDuration(Math.max(1, Math.min(60, parseInt(val) || DEFAULT_RANKING_REVEAL_SNIPPET_DURATION)))} min={1} max={60} step={1} labelTextColor={toolTextColor} className="mb-0"/>
                    </div>
                </details>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={() => {setNewThemeName(''); setShowSaveThemeModal(true);}} className="py-1.5 px-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center justify-center gap-1"><SaveIcon/>Save Current Theme</button>
                    <button onClick={() => setShowLoadThemeModal(true)} disabled={savedDeckThemes.length === 0} className="py-1.5 px-2 text-xs bg-teal-600 hover:bg-teal-500 text-white rounded flex items-center justify-center gap-1 disabled:opacity-50"><LoadDeckIcon/>Load Saved Theme ({savedDeckThemes.length})</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button onClick={handleExportConfig} className="py-1.5 px-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded flex items-center justify-center gap-1"><ExportIcon/>Export Current Config</button>
                    <button onClick={() => { setImportConfigError(''); setConfigToImportJson(''); setShowImportConfigModal(true);}} className="py-1.5 px-2 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center justify-center gap-1"><ImportIcon/>Import Config</button>
                </div>
            </div>
          </div>
        )}

        {pickerMode === PickerMode.Standard && (
            <div className="flex items-center justify-center my-4">
                <button onClick={pickRandomCard} disabled={isLoading || isPickingRandomCard || unloggedDeckForDisplay.length === 0} className="flex items-center justify-center py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg rounded-lg shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors transform hover:scale-105 active:scale-95">
                    {isPickingRandomCard && animatedSelectionStage !== 'idle' ? <Spinner size="w-5 h-5 mr-2" color="text-black"/> : <DiceFiveIcon className="mr-2 w-5 h-5"/>}
                    {isPickingRandomCard && animatedSelectionStage !== 'idle' ? 'PICKING...' : `PICK RANDOM CARD (${unloggedDeckForDisplay.length} left)`}
                </button>
            </div>
        )}

        {pickerMode === PickerMode.Standard && drawnCardsForSelection && drawnCardsForSelection.length > 0 && animatedSelectionStage !== 'idle' && (
            <div className="my-4 p-4 rounded-lg" style={{ backgroundColor: String(lightenDarkenColor(toolBackgroundColor, theme === 'light' ? -10 : 15)), border: `1px solid ${String(toolAccentColor)}`}}>
                <div className="flex flex-wrap justify-center items-start gap-2">
                    {drawnCardsForSelection.map((card, index) => (
                        <div key={`animated-card-wrapper-${card.id}`} className="flex flex-col items-center w-44 flex-shrink-0">
                            <div className="relative h-16 w-full flex justify-center items-center">
                                <ArrowDownIcon style={{ color: toolAccentColor, opacity: arrowPositionIndex === index ? 1 : 0 }} className={`w-12 h-12 ${arrowPositionIndex === index ? 'animate-flash' : ''}`} />
                            </div>
                            <div className="p-1.5 rounded text-xs flex flex-col justify-between min-h-72 border w-full" style={getCardStyleForAnimation(card, index)}>
                                <img src={card.imageUrl || FALLBACK_IMAGE_DATA_URI} alt="" className="w-full h-48 object-cover rounded-sm mb-1 border" style={{borderColor: cardBorderColor}} onError={(e) => {e.currentTarget.onerror = null; e.currentTarget.src=FALLBACK_IMAGE_DATA_URI;}} />
                                <div className={`flex-grow flex flex-col justify-end items-center p-0 w-full`}>
                                    <div className={`text-center w-full p-1 min-w-0 ${card.imageUrl ? 'bg-black bg-opacity-50 rounded-b-sm' : ''}`}>
                                        <p className="font-semibold break-words line-clamp-2" style={{ color: String(getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || cardBackgroundColor), cardTextColor)), fontFamily: cardTextFont, fontSize: '10px' }}>{card.title}</p>
                                        <p className="break-words line-clamp-1" style={{ color: lightenDarkenColor(getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || cardBackgroundColor), cardTextColor), getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || cardBackgroundColor), cardTextColor) === '#FFFFFF' ? -30 : 30), fontFamily: cardTextFont, fontSize: '9px' }}>{card.artistName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {statusMessage && (animatedSelectionStage === 'animatingArrow' || animatedSelectionStage === 'arrowLanded') && ( <p className="text-center mt-3 text-sm" style={{ color: String(toolAccentColor) }}>{statusMessage}</p> )}
            </div>
        )}
        
        {pickerMode === PickerMode.Standard && selectedCardForLogging && animatedSelectionStage === 'cardFocused' && (
            <div key={cardAnimationKey} className="my-4 p-4 rounded-lg shadow-xl animate-fadeIn" style={{ backgroundColor: selectedCardForLogging.color || cardBackgroundColor, border: `2px solid ${String(cardBorderColor)}` }}>
                 {showConfetti && <div className="absolute inset-0 pointer-events-none overflow-hidden z-50"><div className="confetti-piece" style={{animationDelay: '0s'}}></div><div className="confetti-piece" style={{animationDelay: '0.1s', left:'20%'}}></div><div className="confetti-piece" style={{animationDelay: '0.2s', left:'80%'}}></div> <div className="confetti-piece" style={{animationDelay: '0.3s', left:'40%'}}></div> <div className="confetti-piece" style={{animationDelay: '0.4s', left:'60%'}}></div> <div className="confetti-piece" style={{animationDelay: '0.05s', left:'10%'}}></div> <div className="confetti-piece" style={{animationDelay: '0.15s', left:'90%'}}></div> <div className="confetti-piece" style={{animationDelay: '0.25s', left:'30%'}}></div> <div className="confetti-piece" style={{animationDelay: '0.35s', left:'70%'}}></div> <div className="confetti-piece" style={{animationDelay: '0.45s', left:'50%'}}></div></div>}
                <h3 className="text-xl font-bold text-center mb-2 break-all" style={{ color: String(effectiveCardTextColor), fontFamily: cardTextFont }}>{selectedCardForLogging.title}</h3>
                <p className="text-md text-center mb-3 break-all" style={{ color: String(lightenDarkenColor(effectiveCardTextColor, effectiveCardTextColor === '#FFFFFF' ? -30 : 30)), fontFamily: cardTextFont }}>by {selectedCardForLogging.artistName}</p>
                <a href={selectedCardForLogging.webLink || '#'} target="_blank" rel="noopener noreferrer">
                    <img src={selectedCardForLogging.imageUrl || FALLBACK_IMAGE_DATA_URI} alt={`${selectedCardForLogging.title} cover`} className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-md mx-auto mb-3 shadow-lg border-2" style={{borderColor: String(cardBorderColor)}} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}/>
                </a>
                {selectedCardForLogging.comment && <p className="text-xs italic text-center mb-2 p-2 bg-black bg-opacity-20 rounded break-words" style={{ color: String(lightenDarkenColor(effectiveCardTextColor, effectiveCardTextColor === '#FFFFFF' ? -20 : 20)), fontFamily: cardTextFont }}>Comment: {selectedCardForLogging.comment}</p>}
                {selectedCardForLogging.webLink && ( <a href={selectedCardForLogging.webLink} target="_blank" rel="noopener noreferrer" className="block text-center text-xs underline hover:opacity-75" style={{ color: String(effectiveCardTextColor), fontFamily: cardTextFont }}>Listen/View Source</a> )}
                <button onClick={logSelectedCard} disabled={loggedCards.length >= maxLoggedSongsN} className="mt-3 w-full py-2 px-4 rounded-md font-medium text-sm shadow-sm transition-colors disabled:opacity-50" style={{ backgroundColor: String(toolAccentColor), color: String(getAdjustedTextColorForContrast(toolAccentColor, toolTextColor)) }}>Confirm & Log This Pick</button>
                 {loggedCards.length >= maxLoggedSongsN && <p className="text-xs text-red-400 text-center mt-1">Max logged songs ({maxLoggedSongsN}) reached.</p>}
            </div>
        )}

        {pickerMode === PickerMode.Reveal && (
            <div className="my-4">
                {!isRevealRoundActive && (
                    <button onClick={handlePrepareRevealRound} disabled={isLoading || isPickingRandomCard || unloggedDeckForDisplay.length === 0 || loggedCards.length >= maxLoggedSongsN} className="mx-auto flex items-center justify-center py-1 px-2.5 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors">
                        <EyeOpenIcon className="mr-2"/> Prepare Reveal Round ({revealPoolSizeX} cards)
                    </button>
                )}
                {isRevealRoundActive && (
                    <div className="space-y-3">
                        <button onClick={handleRevealNextCard} disabled={revealedInPoolCount >= currentRevealPool.length} className="mx-auto flex items-center justify-center py-0.5 px-1.5 text-[10px] leading-tight bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-md disabled:opacity-50">
                            <EyeOpenIcon className="mr-2"/> Reveal Next Card ({revealedInPoolCount}/{currentRevealPool.length})
                        </button>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-3 rounded-lg" style={{ backgroundColor: String(lightenDarkenColor(toolBackgroundColor, theme === 'light' ? -10 : 15)), border: `1px solid ${String(toolAccentColor)}`}}>
                            {currentRevealPool.map((card, index) => (
                                <div key={`reveal-${card.id}-${index}`} className={`card-container w-44 h-72 p-1.5 rounded border`} style={card.isRevealed ? {backgroundColor: card.color || cardBackgroundColor, borderColor: String(cardBorderColor)} : {}}>
                                    <div className="card-inner" style={card.isRevealed ? {} : {transform: 'rotateY(180deg)'}}>
                                        <div className="card-face card-front p-1.5 rounded text-xs flex flex-col justify-between min-h-72 border w-full" style={{backgroundColor: card.color || cardBackgroundColor, borderColor: String(cardBorderColor)}}>
                                            <img src={card.imageUrl || FALLBACK_IMAGE_DATA_URI} alt="" className="w-full h-48 object-cover rounded-sm mb-1 border" style={{borderColor: cardBorderColor}} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src=FALLBACK_IMAGE_DATA_URI; }} />
                                            <div className={`flex-grow flex flex-col justify-end items-center p-0 w-full`}> 
                                                <div className={`text-center w-full p-1 min-w-0 ${card.imageUrl ? 'bg-black bg-opacity-50' : ''}`}>
                                                    <p className="font-semibold line-clamp-2 break-words" style={{ color: String(getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || cardBackgroundColor), cardTextColor)), fontFamily: cardTextFont, fontSize: '10px' }}>{card.title}</p>
                                                    <p className="line-clamp-1 break-words" style={{ color: String(lightenDarkenColor(getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || cardBackgroundColor), cardTextColor), getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || cardBackgroundColor), cardTextColor) === '#FFFFFF' ? -30 : 30)), fontFamily: cardTextFont, fontSize: '9px' }}>{card.artistName}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-face card-back" style={{...cardBackDefaultStyle, backgroundImage: `url(${customCardBackBase64 || FALLBACK_IMAGE_DATA_URI})`, backgroundSize: customCardBackBase64 ? 'cover' : 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', border: `2px solid ${lightenDarkenColor(toolAccentColor, 40)}`}}>
                                            {/* Content is the background image */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {revealedInPoolCount === currentRevealPool.length && currentRevealPool.length > 0 && (
                            <button onClick={handleLogRevealedCards} disabled={loggedCards.length + currentRevealPool.length > maxLoggedSongsN} className="mx-auto flex items-center justify-center py-1 px-2.5 text-xs bg-green-500 hover:bg-green-600 text-black font-semibold rounded-md disabled:opacity-50">
                                <HandRaisedIcon className="mr-2"/> Log All {currentRevealPool.length} Revealed Cards
                            </button>
                        )}
                         {loggedCards.length + currentRevealPool.length > maxLoggedSongsN && revealedInPoolCount === currentRevealPool.length &&
                            <p className="text-xs text-red-400 text-center mt-1">Logging these cards would exceed max logged songs limit ({maxLoggedSongsN}).</p>}
                    </div>
                )}
                {loggedCards.length >= maxLoggedSongsN && !isRevealRoundActive && pickerMode === PickerMode.Reveal &&
                    <p className="text-center text-lg font-semibold mt-3 p-2 rounded" style={{color: toolAccentColor, backgroundColor: lightenDarkenColor(toolBackgroundColor, theme === 'light' ? -10 : 10)}}>
                        🎉 Max Logged Songs ({maxLoggedSongsN}) Reached! 🎉<br/> Time to create a group or export your selections.
                    </p>
                }
            </div>
        )}

        {pickerMode === PickerMode.RankingReveal && fullDeck.length > 0 && (
            <div className="my-4">
                <h3 className="text-xl font-bold text-center mb-4" style={{ color: toolAccentColor }}>
                    Ranking Reveal ({fullDeck.filter(c => c.isRevealed).length} / {fullDeck.length} Revealed)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-3 justify-items-center">
                    {fullDeck.map((card) => {
                        const isNextToReveal = card.rank === nextRankToReveal;
                        return (
                            <div key={`rank-reveal-${card.id}`} className="flex flex-col items-center">
                                <div
                                    onClick={() => handleRankingRevealClick(card)}
                                    className={`card-container w-44 h-72 p-1 rounded-lg border-2 transition-all duration-300 ${isNextToReveal ? 'animate-pulse-border' : ''}`}
                                    style={{
                                        borderColor: isNextToReveal ? '#FBBF24' : 'transparent',
                                        cursor: card.isRevealed ? 'default' : 'pointer',
                                    }}
                                >
                                    <div className="card-inner" style={card.isRevealed ? {} : { transform: 'rotateY(180deg)' }}>
                                        <div className="card-face card-front p-1.5 rounded text-xs flex flex-col justify-between h-full border" style={{ backgroundColor: card.color || cardBackgroundColor, borderColor: String(cardBorderColor) }}>
                                            <img src={card.imageUrl || FALLBACK_IMAGE_DATA_URI} alt="" className="w-full h-48 object-cover rounded-sm mb-1 border" style={{borderColor: cardBorderColor}} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src=FALLBACK_IMAGE_DATA_URI; }} />
                                            <div className={`flex-grow flex flex-col justify-end items-center p-0 w-full`}> 
                                                <div className={`text-center w-full p-1 min-w-0 ${card.imageUrl ? 'bg-black bg-opacity-50' : ''}`}>
                                                    <a href={card.webLink || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline" onClick={(e) => e.stopPropagation()}>
                                                        <p className="font-semibold line-clamp-2 break-words" style={{ color: String(getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || cardBackgroundColor), cardTextColor)), fontFamily: cardTextFont, fontSize: '10px' }}>{card.title}</p>
                                                    </a>
                                                    <p className="line-clamp-1 break-words" style={{ color: String(lightenDarkenColor(getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || cardBackgroundColor), cardTextColor), getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || cardBackgroundColor), cardTextColor) === '#FFFFFF' ? -30 : 30)), fontFamily: cardTextFont, fontSize: '9px' }}>{card.artistName}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-face card-back" style={{...cardBackDefaultStyle, backgroundImage: `url(${customCardBackBase64 || FALLBACK_IMAGE_DATA_URI})`, backgroundSize: customCardBackBase64 ? 'cover' : 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', border: `2px solid ${lightenDarkenColor(toolAccentColor, 40)}`}}>
                                            {/* BG Image is content */}
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-2 text-lg font-bold" style={{ color: toolAccentColor }}>
                                    #{card.rank}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
        
        {pickerMode !== PickerMode.RankingReveal && (
            <>
                <details className="mb-4" open={(pickerMode === PickerMode.Standard && unloggedDeckForDisplay.length > 0 && !isPickingRandomCard && animatedSelectionStage === 'idle') || (loggedCards.length === 0 && pickerMode === PickerMode.Reveal && unloggedDeckForDisplay.length > 0)}>
                    <summary className="text-lg font-semibold cursor-pointer py-2 hover:opacity-80" style={{ color: String(toolAccentColor) }}>Unlogged Songs ({unloggedDeckForDisplay.length} cards)</summary>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 text-xs">
                        {unloggedDeckForDisplay.map(card => {
                            const titleColorForOverlay = getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || cardBackgroundColor), cardTextColor);
                            const artistColorForOverlay = lightenDarkenColor(titleColorForOverlay, titleColorForOverlay === '#FFFFFF' ? -30 : 30);
                            return (
                                <div 
                                  key={card.id} 
                                  onClick={() => pickerMode === PickerMode.Standard ? handleManualPick(card) : null} 
                                  className={`p-2 rounded-md ${pickerMode === PickerMode.Standard ? 'cursor-pointer' : 'cursor-default'} transition-all transform hover:scale-105 focus:outline-none focus:ring-2 min-h-72 flex flex-col justify-between border w-44 flex-shrink-0`}
                                  style={{backgroundColor: card.color || cardBackgroundColor, borderColor: String(cardBorderColor)}}
                                >
                                    <img src={card.imageUrl || FALLBACK_IMAGE_DATA_URI} alt="" className="w-full h-48 object-cover rounded-sm mb-1 border" style={{borderColor: cardBorderColor}} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}/>
                                    <div className={`flex-grow flex flex-col justify-end items-center p-0 w-full`}> 
                                        <div className={`text-center w-full p-1 min-w-0 ${card.imageUrl ? 'bg-black bg-opacity-50' : ''}`}>
                                            <p className="font-semibold line-clamp-2 break-words" style={{ color: String(titleColorForOverlay), fontFamily: cardTextFont, fontSize: '10px' }}>{card.title}</p>
                                            <p className="line-clamp-1 break-words" style={{ color: String(artistColorForOverlay), fontFamily: cardTextFont, fontSize: '9px' }}>{card.artistName}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </details>

                <details className="mb-4" open={(loggedCards.length > 0 && !isPickingRandomCard && animatedSelectionStage === 'idle') || (loggedCards.length >= maxLoggedSongsN)}>
                    <summary className="text-lg font-semibold cursor-pointer py-2 hover:opacity-80" style={{ color: String(toolAccentColor) }}>Logged Songs ({loggedCards.length})</summary>
                    {loggedCards.length > 0 && (
                        <div className="mt-2 space-y-2 max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                            {pickerMode === PickerMode.Reveal && (
                                <div className="my-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600">
                                    <InputField id="groupNameInput" label="Group Name (Optional)" value={currentGroupNameInput} onChange={setCurrentGroupNameInput} placeholder="e.g., My Awesome Picks" labelTextColor={toolTextColor} className="mb-2" />
                                    <button onClick={handleMoveLoggedToGroup} disabled={loggedCards.length === 0} className="w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-md text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1.5">
                                        <FolderPlusIcon className="w-4 h-4"/> Move Logged Songs to New Group
                                    </button>
                                </div>
                            )}
                             <button onClick={handleClearAndReturnLoggedSongs} className="w-full py-1.5 px-3 mb-2 bg-orange-600 hover:bg-orange-500 text-white rounded-md text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1.5">
                                <ArrowUturnLeftIcon className="w-4 h-4"/> {getClearAndReturnLoggedSongsButtonText()}
                            </button>
                            {loggedCards.map((log, index) => (
                                <div 
                                  key={log.timestamp + index} 
                                  className="p-3 rounded-md text-xs flex items-start gap-3"
                                  style={{ backgroundColor: log.color || cardBackgroundColor, border: `1px solid ${String(cardBorderColor)}` }}
                                >
                                    <img src={log.imageUrl || FALLBACK_IMAGE_DATA_URI} alt={`${log.title} cover`} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border border-gray-500 flex-shrink-0" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}/>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm break-words" style={{ color: String(getAdjustedTextColor(log.color || cardBackgroundColor, cardTextColor)), fontFamily: cardTextFont }}>{log.title} - {log.artistName}</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs" style={{ color: String(lightenDarkenColor(getAdjustedTextColor(log.color || cardBackgroundColor, cardTextColor), getAdjustedTextColor(log.color || cardBackgroundColor, cardTextColor) === '#FFFFFF' ? -40 : 40)), fontFamily: cardTextFont }}>Logged: {new Date(log.timestamp).toLocaleString()}</p>
                                        {log.comment && <p className="italic text-gray-600 dark:text-gray-400 text-xs mt-1 break-words" style={{ color: String(lightenDarkenColor(getAdjustedTextColor(log.color || cardBackgroundColor, cardTextColor), getAdjustedTextColor(log.color || cardBackgroundColor, cardTextColor) === '#FFFFFF' ? -20 : 20)), fontFamily: cardTextFont }}>Comment: {log.comment}</p>}
                                        {log.webLink && <a href={log.webLink} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-75 text-xs mt-1 inline-block break-all" style={{ color: String(getAdjustedTextColor(log.color || cardBackgroundColor, cardTextColor)), fontFamily: cardTextFont }}>Source Link</a>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </details>
            </>
        )}
        
        {pickerMode === PickerMode.Reveal && songGroups.length > 0 && (
            <details className="mb-4" open>
                <summary className="text-lg font-semibold cursor-pointer py-2 hover:opacity-80" style={{color: String(toolAccentColor)}}>Created Song Groups ({songGroups.length})</summary>
                <div className="mt-2 space-y-3">
                    {songGroups.map(group => (
                        <div key={group.id} className="p-3 rounded-lg border" style={{backgroundColor: lightenDarkenColor(toolBackgroundColor, theme === 'light' ? -10 : 15), borderColor: String(toolAccentColor)}}>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-md font-semibold" style={{color: toolTextColor}}>{group.name} <span className="text-xs font-normal">({group.songs.length} / {maxSongsPerGroup} songs)</span></h4>
                                <button
                                    onClick={() => handleRemoveGroupAndReturnSongs(group.id)}
                                    className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md text-xs flex items-center gap-1"
                                    aria-label={`Ungroup songs from ${group.name}`}
                                    title="Move songs from this group back to the Logged Songs list."
                                >
                                    <TrashIcon className="w-3 h-3"/> {getRemoveGroupButtonText(group.id)}
                                </button>
                            </div>
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                                {group.songs.map((log, index) => (
                                    <div key={log.timestamp + index + group.id} className="p-2 rounded-md text-xs flex items-start gap-2" style={{ backgroundColor: log.color || cardBackgroundColor, border: `1px solid ${String(cardBorderColor)}` }}>
                                        <img src={log.imageUrl || FALLBACK_IMAGE_DATA_URI} alt={`${log.title} cover`} className="w-12 h-12 object-cover rounded border border-gray-500 flex-shrink-0" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}/>
                                        <div className="flex-grow min-w-0">
                                            <p className="font-semibold text-xs break-words truncate" style={{ color: String(getAdjustedTextColor(log.color || cardBackgroundColor, cardTextColor)), fontFamily: cardTextFont }} title={`${log.title} - ${log.artistName}`}>{log.title} - {log.artistName}</p>
                                            <p className="text-gray-500 dark:text-gray-400 text-[10px]" style={{ color: String(lightenDarkenColor(getAdjustedTextColor(log.color || cardBackgroundColor, cardTextColor), getAdjustedTextColor(log.color || cardBackgroundColor, cardTextColor) === '#FFFFFF' ? -40 : 40)), fontFamily: cardTextFont }}>Logged: {new Date(log.timestamp).toLocaleDateString()}</p>
                                            {log.webLink && <a href={log.webLink} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-75 text-[10px] mt-0.5 inline-block break-all" style={{ color: String(getAdjustedTextColor(log.color || cardBackgroundColor, cardTextColor)), fontFamily: cardTextFont }}>Source</a>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </details>
        )}
        
        {pickerMode !== PickerMode.RankingReveal && (
            <>
                <div className="mt-4 pt-3 border-t flex flex-col sm:flex-row gap-2 text-xs" style={{borderColor: String(toolAccentColor)}}>
                    <button onClick={() => exportDeck('unlogged')} disabled={unloggedDeckForDisplay.length === 0} className="flex-1 py-1.5 px-2 bg-gray-600 hover:bg-gray-500 text-white rounded disabled:opacity-50"><DownloadIcon className="inline-block w-3.5 h-3.5 mr-1"/> Export Unlogged Songs (TXT)</button>
                    <button onClick={() => copyDeckToClipboard('unlogged')} disabled={unloggedDeckForDisplay.length === 0} className="flex-1 py-1.5 px-2 bg-gray-600 hover:bg-gray-500 text-white rounded disabled:opacity-50"><CopyIcon className="inline-block w-3.5 h-3.5 mr-1"/> Copy Unlogged Songs</button>
                </div>
                <div className="mt-2 flex flex-col sm:flex-row gap-2 text-xs">
                    <button onClick={() => exportDeck('logged')} disabled={loggedCards.length === 0 && pickerMode === PickerMode.Standard} className="flex-1 py-1.5 px-2 bg-gray-600 hover:bg-gray-500 text-white rounded disabled:opacity-50"><DownloadIcon className="inline-block w-3.5 h-3.5 mr-1"/> Export Logged Songs (CSV)</button>
                    <button onClick={() => copyDeckToClipboard('logged')} disabled={loggedCards.length === 0 && pickerMode === PickerMode.Standard} className="flex-1 py-1.5 px-2 bg-gray-600 hover:bg-gray-500 text-white rounded disabled:opacity-50"><CopyIcon className="inline-block w-3.5 h-3.5 mr-1"/> Copy Logged Songs</button>
                    <button onClick={handleClearLog} disabled={loggedCards.length === 0} className="flex-1 py-1.5 px-2 bg-red-700 hover:bg-red-600 text-white rounded disabled:opacity-50">Clear Log</button>
                </div>
                 {pickerMode === PickerMode.Reveal && songGroups.length > 0 && (
                    <div className="mt-3 flex justify-center">
                        <button onClick={handleDownloadGroupsCsv} className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-medium flex items-center justify-center gap-1.5">
                            <ListCheckIcon className="w-4 h-4"/> Save All Groups to CSV
                        </button>
                    </div>
                )}
                {(clipboardStatus || downloadStatus) && <p className="text-xs mt-2 text-center" style={{color: String(toolAccentColor)}}>{clipboardStatus || downloadStatus}</p>}
            </>
        )}
      
        {showSaveThemeModal && ( <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-green-500"><h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Save Current Deck Theme</h3><InputField id="newThemeName" label="Theme Name" value={newThemeName} onChange={setNewThemeName} placeholder="e.g., My Awesome Deck Style" className="mb-4" labelTextColor={toolTextColor}/>{errorSaveTheme && <p className="text-red-400 text-xs mb-3">{errorSaveTheme}</p>}<div className="flex justify-end gap-3"><button onClick={() => { setShowSaveThemeModal(false);}} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Cancel</button><button onClick={handleSaveTheme} className="py-2 px-4 bg-green-600 hover:bg-green-500 text-black rounded">Save Theme</button></div></div></div> )}
        {showLoadThemeModal && ( <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-green-500 max-h-[80vh] flex flex-col"><h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-2 z-10">Load Saved Deck Theme</h3>{savedDeckThemes.length > 0 ? (<ul className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 flex-grow space-y-2">{savedDeckThemes.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(theme => (<li key={theme.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer border border-gray-300 dark:border-gray-600 transition-all hover:border-green-400 flex justify-between items-center"><div><p className="font-semibold text-green-700 dark:text-green-200">{theme.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">Saved: {new Date(theme.createdAt).toLocaleDateString()}</p></div><div className="flex-shrink-0 space-x-2"><button onClick={() => handleLoadTheme(theme.id)} className="text-xs py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded">Load</button><button onClick={() => handleDeleteTheme(theme.id)} className="text-xs py-1 px-2 bg-red-600 hover:bg-red-500 text-white rounded flex items-center"><DeleteIcon className="w-3 h-3 mr-1"/>Del</button></div></li>))}</ul>) : <p className="text-gray-500 dark:text-gray-400 text-center py-4">No themes saved yet.</p>}<div className="mt-4 sticky bottom-0 bg-white dark:bg-gray-800 pt-2 z-10"><button onClick={() => setShowLoadThemeModal(false)} className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Close</button></div></div></div> )}
        {showExportConfigModal && ( <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-green-500"><h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Export Current Configuration</h3><TextAreaField id="exportConfigJson" label="Configuration JSON" value={configToExportJson} onChange={() => {}} readOnly rows={8} labelTextColor={toolTextColor}/><div className="flex justify-end gap-3 mt-4"><button onClick={handleDownloadConfigJson} className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded">Download .json</button><button onClick={() => setShowExportConfigModal(false)} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Close</button></div></div></div> )}
        {showImportConfigModal && ( <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-green-500"><h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Import Wheel Configuration</h3><TextAreaField id="importConfigJson" label="Paste Configuration JSON here" value={configToImportJson} onChange={setConfigToImportJson} rows={6} labelTextColor={toolTextColor}/><div className="my-2 text-center text-gray-500 dark:text-gray-400 text-sm">OR</div><input type="file" ref={importConfigFileRef} accept=".json" onChange={handleImportFileChange} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-black hover:file:bg-green-500 mb-4"/>{importConfigError && <p className="text-red-500 dark:text-red-400 text-xs mt-1 mb-2">{importConfigError}</p>}<div className="flex justify-end gap-3 mt-4"><button onClick={handleImportConfigJson} className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded">Import</button><button onClick={() => setShowImportConfigModal(false)} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Cancel</button></div></div></div> )}
        
        {revealedRankingCard && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4 animate-fadeIn"
                 onClick={() => { if (!isSnippetPlaying) { handleCloseRankingRevealModal(revealedRankingCard); } }}>
                <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <div 
                        className="p-2 rounded-lg shadow-xl animate-fadeIn border-2 flex flex-col aspect-[11/18] w-full"
                        style={{ 
                            backgroundColor: revealedRankingCard.color || cardBackgroundColor, 
                            borderColor: toolAccentColor,
                        }}
                    >
                        <div className="h-2/3 w-full">
                            <img 
                                src={revealedRankingCard.imageUrl || FALLBACK_IMAGE_DATA_URI} 
                                alt={`${revealedRankingCard.title} cover`} 
                                className="w-full h-full object-cover rounded-sm border" 
                                style={{borderColor: cardBorderColor}} 
                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}
                            />
                        </div>
                        <div className="h-1/3 flex flex-col justify-center items-center p-1 w-full">
                            <div className={`text-center w-full p-2 min-w-0`}>
                                <a href={revealedRankingCard.webLink || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    <h3 className="text-2xl font-bold break-words line-clamp-2" style={{ color: String(getAdjustedTextColorForContrast(revealedRankingCard.color || cardBackgroundColor, cardTextColor)), fontFamily: cardTextFont }}>
                                        {revealedRankingCard.title}
                                    </h3>
                                </a>
                                <p className="text-lg break-words line-clamp-1" style={{ color: String(lightenDarkenColor(getAdjustedTextColorForContrast(revealedRankingCard.color || cardBackgroundColor, cardTextColor), getAdjustedTextColorForContrast(revealedRankingCard.color || cardBackgroundColor, cardTextColor) === '#FFFFFF' ? -30 : 30)), fontFamily: cardTextFont }}>
                                    by {revealedRankingCard.artistName}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        {isSnippetPlaying && <p className="text-sm animate-pulse" style={{color: toolTextColor}}>Playing {rankingRevealSnippetDuration}s snippet...</p>}
                        {!isSnippetPlaying && <p className="text-sm" style={{color: toolTextColor}}>Click outside to close</p>}
                    </div>
                    <audio ref={audioRef} onEnded={() => setIsSnippetPlaying(false)} onPause={() => setIsSnippetPlaying(false)} className="hidden" />
                </div>
            </div>
        )}
      
      <style>{`
        .card-container { perspective: 1000px; }
        .card-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d; }
        .card-face { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 0.375rem; /* rounded-md */ }
        .card-front { /* transform: rotateY(0deg); DOM order now controls visibility */ } 
        .card-back { transform: rotateY(180deg); /* Initially hidden by rotation */ }

        .animate-fadeIn { animation: fadeIn 0.5s ease-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0px); } }
        .confetti-piece { position: absolute; width: 8px; height: 16px; background-color: #facc15; opacity: 0; animation: fall 3s ease-out forwards; }
        .confetti-piece:nth-child(2n) { background-color: #4ade80; } .confetti-piece:nth-child(3n) { background-color: #60a5fa; } .confetti-piece:nth-child(4n) { background-color: #f472b6; }
        @keyframes fall { 0% { transform: translateY(-10vh) rotateZ(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotateZ(720deg); opacity: 0; } }
        @keyframes flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } } .animate-flash { animation: flash 1.5s infinite ease-in-out; }
        @keyframes pulse-border-yellow { 0%, 100% { box-shadow: 0 0 0 0 rgba(253, 224, 71, 0.7); border-color: rgba(253, 224, 71, 1); } 50% { box-shadow: 0 0 0 4px rgba(253, 224, 71, 0); border-color: rgba(253, 224, 71, 0.5); } } .animate-pulse-border { animation: pulse-border-yellow 2s infinite; }
      `}</style>
      </div>
    );
};
export default SongDeckPickerTool;
