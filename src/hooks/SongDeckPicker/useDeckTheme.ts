import { useState, useEffect } from 'react';
import { 
    DEFAULT_CUSTOM_TITLE, DEFAULT_SELECTED_LOGO_SIZE, DEFAULT_CARD_TEXT_FONT,
    DEFAULT_TOOL_BG_COLOR_DARK, DEFAULT_TOOL_TEXT_COLOR_DARK, DEFAULT_CARD_BG_COLOR_DARK, DEFAULT_CARD_BORDER_COLOR_DARK, DEFAULT_CARD_TEXT_COLOR_DARK,
    DEFAULT_TOOL_BG_COLOR_LIGHT, DEFAULT_TOOL_TEXT_COLOR_LIGHT, DEFAULT_CARD_BG_COLOR_LIGHT, DEFAULT_CARD_BORDER_COLOR_LIGHT, DEFAULT_CARD_TEXT_COLOR_LIGHT,
    DEFAULT_TOOL_ACCENT_COLOR, DEFAULT_NUMBER_OF_CARDS_TO_DRAW,
    DEFAULT_MAX_LOGGED_SONGS_N, DEFAULT_CUSTOM_CARD_BACK_BASE64
} from '@/tools/SongDeckPicker/songDeckPicker.constants';
import { normalizeHexColor } from '@/utils/imageUtils';

interface UseDeckThemeProps {
    theme: 'light' | 'dark' | string;
}

export const useDeckTheme = ({ theme }: UseDeckThemeProps) => {
    const [customTitle, setCustomTitle] = useState<string>(DEFAULT_CUSTOM_TITLE);
    const [customLogo, setCustomLogo] = useState<string | null>(null);
    const [selectedLogoSize, setSelectedLogoSize] = useState<string>(DEFAULT_SELECTED_LOGO_SIZE);
    const [showCustomization, setShowCustomization] = useState(false);
    const [showInputs, setShowInputs] = useState(true);

    const [toolBackgroundColor, setToolBackgroundColor] = useState<string>(DEFAULT_TOOL_BG_COLOR_DARK);
    const [toolBackgroundColorHexInput, setToolBackgroundColorHexInput] = useState<string>(DEFAULT_TOOL_BG_COLOR_DARK);
    const [cardTextFont, setCardTextFont] = useState<string>(DEFAULT_CARD_TEXT_FONT);
    const [toolAccentColor, setToolAccentColor] = useState<string>(DEFAULT_TOOL_ACCENT_COLOR);
    const [toolAccentColorHexInput, setToolAccentColorHexInput] = useState<string>(DEFAULT_TOOL_ACCENT_COLOR);
    const [cardBackgroundColor, setCardBackgroundColor] = useState<string>(DEFAULT_CARD_BG_COLOR_DARK);
    const [cardBackgroundColorHexInput, setCardBackgroundColorHexInput] = useState<string>(DEFAULT_CARD_BG_COLOR_DARK);
    const [cardBorderColor, setCardBorderColor] = useState<string>(DEFAULT_CARD_BORDER_COLOR_DARK);
    const [cardBorderColorHexInput, setCardBorderColorHexInput] = useState<string>(DEFAULT_CARD_BORDER_COLOR_DARK);
    const [cardTextColor, setCardTextColor] = useState<string>(DEFAULT_CARD_TEXT_COLOR_DARK);
    const [cardTextColorHexInput, setCardTextColorHexInput] = useState<string>(DEFAULT_CARD_TEXT_COLOR_DARK);
    const [toolTextColor, setToolTextColor] = useState<string>(DEFAULT_TOOL_TEXT_COLOR_DARK);
    const [toolTextColorHexInput, setToolTextColorHexInput] = useState<string>(DEFAULT_TOOL_TEXT_COLOR_DARK);

    const [numberOfCardsToDraw, setNumberOfCardsToDraw] = useState<number>(DEFAULT_NUMBER_OF_CARDS_TO_DRAW);
    const [maxLoggedSongsN, setMaxLoggedSongsN] = useState<number>(DEFAULT_MAX_LOGGED_SONGS_N);
    const [customCardBackBase64, setCustomCardBackBase64] = useState<string | null>(DEFAULT_CUSTOM_CARD_BACK_BASE64);

    // Sync colors with theme change if they match defaults
    useEffect(() => {
        if (theme === 'light') {
            setToolBackgroundColor(prev => prev === DEFAULT_TOOL_BG_COLOR_DARK ? DEFAULT_TOOL_BG_COLOR_LIGHT : prev);
            setToolTextColor(prev => prev === DEFAULT_TOOL_TEXT_COLOR_DARK ? DEFAULT_TOOL_TEXT_COLOR_LIGHT : prev);
            setCardBackgroundColor(prev => prev === DEFAULT_CARD_BG_COLOR_DARK ? DEFAULT_CARD_BG_COLOR_LIGHT : prev);
            setCardBorderColor(prev => prev === DEFAULT_CARD_BORDER_COLOR_DARK ? DEFAULT_CARD_BORDER_COLOR_LIGHT : prev);
            setCardTextColor(prev => prev === DEFAULT_CARD_TEXT_COLOR_DARK ? DEFAULT_CARD_TEXT_COLOR_LIGHT : prev);
            
            setToolBackgroundColorHexInput(prev => prev === DEFAULT_TOOL_BG_COLOR_DARK ? DEFAULT_TOOL_BG_COLOR_LIGHT : prev);
            setToolTextColorHexInput(prev => prev === DEFAULT_TOOL_TEXT_COLOR_DARK ? DEFAULT_TOOL_TEXT_COLOR_LIGHT : prev);
            setCardBackgroundColorHexInput(prev => prev === DEFAULT_CARD_BG_COLOR_DARK ? DEFAULT_CARD_BG_COLOR_LIGHT : prev);
            setCardBorderColorHexInput(prev => prev === DEFAULT_CARD_BORDER_COLOR_DARK ? DEFAULT_CARD_BORDER_COLOR_LIGHT : prev);
            setCardTextColorHexInput(prev => prev === DEFAULT_CARD_TEXT_COLOR_DARK ? DEFAULT_CARD_TEXT_COLOR_LIGHT : prev);
        } else {
            setToolBackgroundColor(prev => prev === DEFAULT_TOOL_BG_COLOR_LIGHT ? DEFAULT_TOOL_BG_COLOR_DARK : prev);
            setToolTextColor(prev => prev === DEFAULT_TOOL_TEXT_COLOR_LIGHT ? DEFAULT_TOOL_TEXT_COLOR_DARK : prev);
            setCardBackgroundColor(prev => prev === DEFAULT_CARD_BG_COLOR_LIGHT ? DEFAULT_CARD_BG_COLOR_DARK : prev);
            setCardBorderColor(prev => prev === DEFAULT_CARD_BORDER_COLOR_LIGHT ? DEFAULT_CARD_BORDER_COLOR_DARK : prev);
            setCardTextColor(prev => prev === DEFAULT_CARD_TEXT_COLOR_LIGHT ? DEFAULT_CARD_TEXT_COLOR_DARK : prev);
            
            setToolBackgroundColorHexInput(prev => prev === DEFAULT_TOOL_BG_COLOR_LIGHT ? DEFAULT_TOOL_BG_COLOR_DARK : prev);
            setToolTextColorHexInput(prev => prev === DEFAULT_TOOL_TEXT_COLOR_LIGHT ? DEFAULT_TOOL_TEXT_COLOR_DARK : prev);
            setCardBackgroundColorHexInput(prev => prev === DEFAULT_CARD_BG_COLOR_LIGHT ? DEFAULT_CARD_BG_COLOR_DARK : prev);
            setCardBorderColorHexInput(prev => prev === DEFAULT_CARD_BORDER_COLOR_LIGHT ? DEFAULT_CARD_BORDER_COLOR_DARK : prev);
            setCardTextColorHexInput(prev => prev === DEFAULT_TOOL_TEXT_COLOR_LIGHT ? DEFAULT_CARD_TEXT_COLOR_DARK : prev);
        }
    }, [theme]);

    const handleToolBgColorHexChange = (val: string) => { setToolBackgroundColorHexInput(val); if (normalizeHexColor(val)) setToolBackgroundColor(normalizeHexColor(val)); };
    const handleToolAccentColorHexChange = (val: string) => { setToolAccentColorHexInput(val); if (normalizeHexColor(val)) setToolAccentColor(normalizeHexColor(val)); };
    const handleCardBgColorHexChange = (val: string) => { setCardBackgroundColorHexInput(val); if (normalizeHexColor(val)) setCardBackgroundColor(normalizeHexColor(val)); };
    const handleCardBorderColorHexChange = (val: string) => { setCardBorderColorHexInput(val); if (normalizeHexColor(val)) setCardBorderColor(normalizeHexColor(val)); };
    const handleCardTextColorHexChange = (val: string) => { setCardTextColorHexInput(val); if (normalizeHexColor(val)) setCardTextColor(normalizeHexColor(val)); };
    const handleToolTextColorHexChange = (val: string) => { setToolTextColorHexInput(val); if (normalizeHexColor(val)) setToolTextColor(normalizeHexColor(val)); };

    return {
        customTitle, setCustomTitle,
        customLogo, setCustomLogo,
        selectedLogoSize, setSelectedLogoSize,
        showCustomization, setShowCustomization,
        showInputs, setShowInputs,
        toolBackgroundColor, setToolBackgroundColor,
        toolBackgroundColorHexInput, setToolBackgroundColorHexInput,
        cardTextFont, setCardTextFont,
        toolAccentColor, setToolAccentColor,
        toolAccentColorHexInput, setToolAccentColorHexInput,
        cardBackgroundColor, setCardBackgroundColor,
        cardBackgroundColorHexInput, setCardBackgroundColorHexInput,
        cardBorderColor, setCardBorderColor,
        cardBorderColorHexInput, setCardBorderColorHexInput,
        cardTextColor, setCardTextColor,
        cardTextColorHexInput, setCardTextColorHexInput,
        toolTextColor, setToolTextColor,
        toolTextColorHexInput, setToolTextColorHexInput,
        handleToolBgColorHexChange,
        handleToolAccentColorHexChange,
        handleCardBgColorHexChange,
        handleCardBorderColorHexChange,
        handleCardTextColorHexChange,
        handleToolTextColorHexChange,
        numberOfCardsToDraw, setNumberOfCardsToDraw,
        maxLoggedSongsN, setMaxLoggedSongsN,
        customCardBackBase64, setCustomCardBackBase64
    };
};
