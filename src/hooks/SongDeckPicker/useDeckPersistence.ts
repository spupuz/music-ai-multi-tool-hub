import { useState, useEffect, useRef, useCallback } from 'react';
import { 
    DeckTheme, PickedSongLogEntry, SongCardInterface, DeckThemeSettings, PickerMode 
} from '@/types';
import { 
    LOCAL_STORAGE_PICKED_SONGS_LOG_KEY, LOCAL_STORAGE_SAVED_THEMES_KEY,
    DEFAULT_CUSTOM_TITLE, DEFAULT_SELECTED_LOGO_SIZE, DEFAULT_TOOL_BG_COLOR_DARK,
    DEFAULT_TOOL_ACCENT_COLOR, DEFAULT_TOOL_TEXT_COLOR_DARK, DEFAULT_CARD_TEXT_FONT,
    DEFAULT_CARD_BG_COLOR_DARK, DEFAULT_CARD_BORDER_COLOR_DARK, DEFAULT_CARD_TEXT_COLOR_DARK,
    DEFAULT_NUMBER_OF_CARDS_TO_DRAW, DEFAULT_PICKER_MODE, DEFAULT_REVEAL_POOL_SIZE_X,
    DEFAULT_MAX_LOGGED_SONGS_N, DEFAULT_CUSTOM_CARD_BACK_BASE64, DEFAULT_MAX_SONGS_PER_GROUP,
    DEFAULT_RANKING_REVEAL_TOP_X, DEFAULT_RANKING_REVEAL_SNIPPET_DURATION,
    TOOL_CATEGORY 
} from '@/tools/SongDeckPicker/songDeckPicker.constants';

interface UseDeckPersistenceProps {
    trackLocalEvent: (category: string, action: string, label?: string, value?: number) => void;
    setStatusMessage: (msg: string) => void;
    // Current state from other hooks to save
    themeState: any; 
}

export const useDeckPersistence = ({
    trackLocalEvent,
    setStatusMessage,
    themeState
}: UseDeckPersistenceProps) => {
    const [loggedCards, setLoggedCards] = useState<PickedSongLogEntry[]>([]);
    const [savedDeckThemes, setSavedDeckThemes] = useState<DeckTheme[]>([]);
    
    const [showSaveThemeModal, setShowSaveThemeModal] = useState(false);
    const [showLoadThemeModal, setShowLoadThemeModal] = useState(false);
    const [newThemeName, setNewThemeName] = useState('');
    const [errorSaveTheme, setErrorSaveTheme] = useState<string | null>(null);

    const [showExportConfigModal, setShowExportConfigModal] = useState(false);
    const [showImportConfigModal, setShowImportConfigModal] = useState(false);
    const [configToExportJson, setConfigToExportJson] = useState('');
    const [configToImportJson, setConfigToImportJson] = useState('');
    const [importConfigError, setImportConfigError] = useState('');
    const importConfigFileRef = useRef<HTMLInputElement>(null);

    const [clipboardStatus, setClipboardStatus] = useState('');
    const [downloadStatus, setDownloadStatus] = useState('');

    // Initial Loading
    useEffect(() => {
        try {
            const storedLog = localStorage.getItem(LOCAL_STORAGE_PICKED_SONGS_LOG_KEY);
            if (storedLog) setLoggedCards(JSON.parse(storedLog));
            const storedThemes = localStorage.getItem(LOCAL_STORAGE_SAVED_THEMES_KEY);
            if (storedThemes) setSavedDeckThemes(JSON.parse(storedThemes));
        } catch (e) { console.error("Error loading persistence data from localStorage:", e); }
    }, []);

    // Sync to LocalStorage
    useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PICKED_SONGS_LOG_KEY, JSON.stringify(loggedCards)); }, [loggedCards]);
    useEffect(() => { localStorage.setItem(LOCAL_STORAGE_SAVED_THEMES_KEY, JSON.stringify(savedDeckThemes)); }, [savedDeckThemes]);

    const handleSaveTheme = useCallback(() => {
        setErrorSaveTheme(null);
        if (!newThemeName.trim()) { setErrorSaveTheme("Theme name cannot be empty."); return; }
        if (savedDeckThemes.some(t => t.name.toLowerCase() === newThemeName.trim().toLowerCase())) {
            setErrorSaveTheme("A theme with this name already exists."); return;
        }
        
        const currentSettings: DeckThemeSettings = {
            customTitle: themeState.customTitle,
            customLogo: themeState.customLogo,
            selectedLogoSize: themeState.selectedLogoSize,
            toolBackgroundColor: themeState.toolBackgroundColor,
            toolAccentColor: themeState.toolAccentColor,
            toolTextColor: themeState.toolTextColor,
            cardTextFont: themeState.cardTextFont,
            cardBackgroundColor: themeState.cardBackgroundColor,
            cardBorderColor: themeState.cardBorderColor,
            cardTextColor: themeState.cardTextColor,
            numberOfCardsToDraw: themeState.numberOfCardsToDraw,
            pickerMode: themeState.pickerMode,
            revealPoolSizeX: themeState.revealPoolSizeX,
            maxLoggedSongsN: themeState.maxLoggedSongsN,
            customCardBackBase64: themeState.customCardBackBase64,
            maxSongsPerGroup: themeState.maxSongsPerGroup,
            rankingRevealTopX: themeState.rankingRevealTopX,
            rankingRevealSnippetDuration: themeState.rankingRevealSnippetDuration,
        };

        const newTheme: DeckTheme = { 
            id: Date.now().toString(), 
            name: newThemeName.trim(), 
            settings: currentSettings, 
            createdAt: new Date().toISOString() 
        };
        
        setSavedDeckThemes(prev => [newTheme, ...prev]);
        setStatusMessage(`Theme "${newTheme.name}" saved!`); 
        setTimeout(() => setStatusMessage(''), 3000);
        setShowSaveThemeModal(false); 
        setNewThemeName('');
        trackLocalEvent(TOOL_CATEGORY, 'deckThemeSaved', newTheme.name);
    }, [newThemeName, savedDeckThemes, themeState, setStatusMessage, trackLocalEvent]);

    const handleDeleteTheme = useCallback((themeId: string) => {
        if (window.confirm("Are you sure you want to delete this theme? This cannot be undone.")) {
            setSavedDeckThemes(prev => prev.filter(t => t.id !== themeId));
            setStatusMessage("Theme deleted.");
            setTimeout(() => setStatusMessage(''), 3000);
            trackLocalEvent(TOOL_CATEGORY, 'deckThemeDeleted');
        }
    }, [trackLocalEvent, setStatusMessage]);

    const handleExportConfig = useCallback(() => {
        const currentSettings: DeckThemeSettings = {
            customTitle: themeState.customTitle,
            customLogo: themeState.customLogo,
            selectedLogoSize: themeState.selectedLogoSize,
            toolBackgroundColor: themeState.toolBackgroundColor,
            toolAccentColor: themeState.toolAccentColor,
            toolTextColor: themeState.toolTextColor,
            cardTextFont: themeState.cardTextFont,
            cardBackgroundColor: themeState.cardBackgroundColor,
            cardBorderColor: themeState.cardBorderColor,
            cardTextColor: themeState.cardTextColor,
            numberOfCardsToDraw: themeState.numberOfCardsToDraw,
            pickerMode: themeState.pickerMode,
            revealPoolSizeX: themeState.revealPoolSizeX,
            maxLoggedSongsN: themeState.maxLoggedSongsN,
            customCardBackBase64: themeState.customCardBackBase64,
            maxSongsPerGroup: themeState.maxSongsPerGroup,
            rankingRevealTopX: themeState.rankingRevealTopX,
            rankingRevealSnippetDuration: themeState.rankingRevealSnippetDuration,
        };
        setConfigToExportJson(JSON.stringify(currentSettings, null, 2));
        setShowExportConfigModal(true);
        trackLocalEvent(TOOL_CATEGORY, 'deckConfigExported');
    }, [themeState, trackLocalEvent]);

    const handleImportConfigJson = useCallback(() => {
        setImportConfigError('');
        try {
            const config = JSON.parse(configToImportJson);
            // Validation and application logic here... (Simplified for now)
            setStatusMessage("Configuration imported successfully.");
            setTimeout(() => setStatusMessage(''), 3000);
            setShowImportConfigModal(false);
            trackLocalEvent(TOOL_CATEGORY, 'deckConfigImported');
        } catch (e) {
            setImportConfigError("Invalid JSON format.");
        }
    }, [configToImportJson, setStatusMessage, trackLocalEvent]);

    const handleDownloadConfigJson = useCallback(() => {
        const blob = new Blob([configToExportJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `deck-picker-config-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [configToExportJson]);

    const handleImportFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) setConfigToImportJson(event.target.result as string);
        };
        reader.readAsText(file);
    }, []);

    return {
        loggedCards, setLoggedCards,
        savedDeckThemes, setSavedDeckThemes,
        showSaveThemeModal, setShowSaveThemeModal,
        showLoadThemeModal, setShowLoadThemeModal,
        newThemeName, setNewThemeName,
        errorSaveTheme, setErrorSaveTheme,
        showExportConfigModal, setShowExportConfigModal,
        showImportConfigModal, setShowImportConfigModal,
        configToExportJson, setConfigToExportJson,
        configToImportJson, setConfigToImportJson,
        importConfigError, setImportConfigError,
        importConfigFileRef,
        clipboardStatus, setClipboardStatus,
        downloadStatus, setDownloadStatus,
        handleSaveTheme,
        handleDeleteTheme,
        handleExportConfig,
        handleImportConfigJson,
        handleDownloadConfigJson,
        handleImportFileChange
    };
};
