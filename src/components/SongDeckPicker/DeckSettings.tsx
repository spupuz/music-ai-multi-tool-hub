import React from 'react';
import InputField from '@/components/forms/InputField';
import SelectField from '@/components/forms/SelectField';
import ImageUpload from '@/components/ImageUpload';
import TextAreaField from '@/components/forms/TextAreaField';
import Button from '@/components/common/Button';
import { 
    CogIcon, SaveIcon, LoadIcon, ExportIcon, ImportIcon, TrashIcon 
} from '@/components/Icons';
import { 
    logoSizeOptions, cardTextFontOptions, DEFAULT_CUSTOM_TITLE, DEFAULT_SELECTED_LOGO_SIZE,
    DEFAULT_CARD_TEXT_FONT, DEFAULT_NUMBER_OF_CARDS_TO_DRAW, DEFAULT_REVEAL_POOL_SIZE_X,
    DEFAULT_MAX_LOGGED_SONGS_N, DEFAULT_MAX_SONGS_PER_GROUP, DEFAULT_RANKING_REVEAL_TOP_X,
    DEFAULT_RANKING_REVEAL_SNIPPET_DURATION, DEFAULT_CUSTOM_CARD_BACK_BASE64
} from '@/tools/SongDeckPicker/songDeckPicker.constants';
import { lightenDarkenColor } from '@/utils/imageUtils';
import { PickerMode, DeckTheme } from '@/types';

interface DeckSettingsProps {
    showCustomization: boolean;
    toolBackgroundColor: string;
    toolAccentColor: string;
    toolTextColor: string;
    theme: string;
    customTitle: string;
    setCustomTitle: (val: string) => void;
    customLogo: string | null;
    setCustomLogo: (val: string | null) => void;
    selectedLogoSize: string;
    setSelectedLogoSize: (val: string) => void;
    handleToolBgColorHexChange: (val: string) => void;
    toolBackgroundColorHexInput: string;
    handleToolAccentColorHexChange: (val: string) => void;
    toolAccentColorHexInput: string;
    handleToolTextColorHexChange: (val: string) => void;
    toolTextColorHexInput: string;
    cardTextFont: string;
    setCardTextFont: (val: string) => void;
    cardBackgroundColor: string;
    setCardBackgroundColor: (val: string) => void;
    cardBackgroundColorHexInput: string;
    handleCardBgColorHexChange: (val: string) => void;
    cardBorderColor: string;
    setCardBorderColor: (val: string) => void;
    cardBorderColorHexInput: string;
    handleCardBorderColorHexChange: (val: string) => void;
    cardTextColor: string;
    setCardTextColor: (val: string) => void;
    cardTextColorHexInput: string;
    handleCardTextColorHexChange: (val: string) => void;
    numberOfCardsToDraw: number;
    setNumberOfCardsToDraw: (val: number) => void;
    revealPoolSizeX: number;
    setRevealPoolSizeX: (val: number) => void;
    maxLoggedSongsN: number;
    setMaxLoggedSongsN: (val: number) => void;
    maxSongsPerGroup: number;
    setMaxSongsPerGroup: (val: number) => void;
    customCardBackBase64: string | null;
    setCustomCardBackBase64: (val: string | null) => void;
    rankingRevealTopX: number;
    setRankingRevealTopX: (val: number) => void;
    rankingRevealSnippetDuration: number;
    setRankingRevealSnippetDuration: (val: number) => void;
    setShowSaveThemeModal: (val: boolean) => void;
    setShowLoadThemeModal: (val: boolean) => void;
    savedDeckThemes: DeckTheme[];
    handleExportConfig: () => void;
    setShowImportConfigModal: (val: boolean) => void;
    setImportConfigError: (val: string) => void;
    setConfigToImportJson: (val: string) => void;
    setNewThemeName: (val: string) => void;
}

export const DeckSettings: React.FC<DeckSettingsProps> = (props) => {
    if (!props.showCustomization) return null;

    const containerBg = String(lightenDarkenColor(props.toolBackgroundColor, props.theme === 'light' ? -5 : 10));

    return (
        <div 
            className="my-6 p-4 md:p-6 rounded-2xl shadow-xl border backdrop-blur-sm bg-opacity-90 transition-all duration-300" 
            style={{ 
                borderColor: `${props.toolAccentColor}44`, 
                backgroundColor: containerBg,
                boxShadow: `0 10px 25px -5px ${props.toolAccentColor}22`
            }}
        >
            <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InputField id="customTitle" label="Tool Page Title" value={props.customTitle} onChange={props.setCustomTitle} labelTextColor={props.toolTextColor}/>
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3"><ImageUpload onImageUpload={props.setCustomLogo} label="Custom Page Logo (Optional)" /></div>
                    {props.customLogo && (
                        <div className="flex items-end gap-2">
                            <SelectField id="logoSize" label="Logo Size" value={props.selectedLogoSize} onChange={props.setSelectedLogoSize} options={logoSizeOptions} className="flex-grow mb-0" labelTextColor={props.toolTextColor}/>
                            <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => props.setCustomLogo(null)} 
                                className="h-9 mb-0"
                            >
                                Remove
                            </Button>
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <details className="bg-white/5 dark:bg-black/20 p-3 rounded-xl border border-white/10 dark:border-black/20 shadow-inner group transition-all">
                        <summary className="cursor-pointer font-bold text-sm flex items-center gap-2" style={{color: props.toolAccentColor}}>
                            <CogIcon className="w-4 h-4 group-open:rotate-90 transition-transform"/>
                            Global & Standard Mode Settings
                        </summary>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
                            <div><label className="block text-xs font-bold mb-1 opacity-80" style={{color:props.toolTextColor}}>Tool Background</label><div className="flex items-center gap-1"><input type="color" value={props.toolBackgroundColor} onChange={(e) => props.setCardBackgroundColor(e.target.value)} className="p-0 h-9 w-10 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700 shadow-sm"/><InputField id="toolBgColorHex" label="" value={props.toolBackgroundColorHexInput} onChange={props.handleToolBgColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                            <div><label className="block text-xs font-bold mb-1 opacity-80" style={{color:props.toolTextColor}}>Tool Accent</label><div className="flex items-center gap-1"><input type="color" value={props.toolAccentColor} onChange={(e) => props.setCardBackgroundColor(e.target.value)} className="p-0 h-9 w-10 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700 shadow-sm"/><InputField id="toolAccentColorHex" label="" value={props.toolAccentColorHexInput} onChange={props.handleToolAccentColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                            <div><label className="block text-xs font-bold mb-1 opacity-80" style={{color:props.toolTextColor}}>Tool Text</label><div className="flex items-center gap-1"><input type="color" value={props.toolTextColor} onChange={(e) => props.setCardBackgroundColor(e.target.value)} className="p-0 h-9 w-10 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700 shadow-sm"/><InputField id="toolTextColorHex" label="" value={props.toolTextColorHexInput} onChange={props.handleToolTextColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                            <SelectField id="cardTextFont" label="Card Text Font" value={props.cardTextFont} onChange={props.setCardTextFont} options={cardTextFontOptions} labelTextColor={props.toolTextColor} className="mb-0"/>
                            <div><label className="block text-xs font-bold mb-1 opacity-80" style={{color:props.toolTextColor}}>Card Background</label><div className="flex items-center gap-1"><input type="color" value={props.cardBackgroundColor} onChange={(e) => props.setCardBackgroundColor(e.target.value)} className="p-0 h-9 w-10 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700 shadow-sm"/><InputField id="cardBgColorHex" label="" value={props.cardBackgroundColorHexInput} onChange={props.handleCardBgColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                            <div><label className="block text-xs font-bold mb-1 opacity-80" style={{color:props.toolTextColor}}>Card Border</label><div className="flex items-center gap-1"><input type="color" value={props.cardBorderColor} onChange={(e) => props.setCardBorderColor(e.target.value)} className="p-0 h-9 w-10 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700 shadow-sm"/><InputField id="cardBorderColorHex" label="" value={props.cardBorderColorHexInput} onChange={props.handleCardBorderColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                            <div><label className="block text-xs font-bold mb-1 opacity-80" style={{color:props.toolTextColor}}>Card Text (Preferred)</label><div className="flex items-center gap-1"><input type="color" value={props.cardTextColor} onChange={(e) => props.setCardTextColor(e.target.value)} className="p-0 h-9 w-10 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700 shadow-sm"/><InputField id="cardTextColorHex" label="" value={props.cardTextColorHexInput} onChange={props.handleCardTextColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                            <InputField id="numberOfCardsToDraw" label="Cards in Random Pick Animation (Std, 2-10)" type="number" value={String(props.numberOfCardsToDraw)} onChange={(val) => props.setNumberOfCardsToDraw(Math.max(2, Math.min(10, parseInt(val) || DEFAULT_NUMBER_OF_CARDS_TO_DRAW)))} min={2} max={10} step={1} labelTextColor={props.toolTextColor} className="mb-0"/>
                        </div>
                    </details>
                    <details className="bg-white/5 dark:bg-black/20 p-3 rounded-xl border border-white/10 dark:border-black/20 shadow-inner group transition-all"> 
                        <summary className="cursor-pointer font-bold text-sm flex items-center gap-2" style={{color: props.toolAccentColor}}>
                            <ImportIcon className="w-4 h-4 group-open:rotate-12 transition-transform"/>
                            Reveal Cards Mode Settings
                        </summary>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
                            <InputField id="revealPoolSizeX" label="Cards in Reveal Round (X)" type="number" value={String(props.revealPoolSizeX)} onChange={(val) => props.setRevealPoolSizeX(Math.max(1, Math.min(20, parseInt(val) || DEFAULT_REVEAL_POOL_SIZE_X)))} min={1} max={20} step={1} labelTextColor={props.toolTextColor} className="mb-0"/>
                            <InputField id="maxLoggedSongsN" label="Max Total Logged Songs (N)" type="number" value={String(props.maxLoggedSongsN)} onChange={(val) => props.setMaxLoggedSongsN(Math.max(1, parseInt(val) || DEFAULT_MAX_LOGGED_SONGS_N))} min={1} step={1} labelTextColor={props.toolTextColor} className="mb-0"/>
                            <InputField id="maxSongsPerGroup" label="Max Songs Per Group (Guideline)" type="number" value={String(props.maxSongsPerGroup)} onChange={(val) => props.setMaxSongsPerGroup(Math.max(1, parseInt(val) || DEFAULT_MAX_SONGS_PER_GROUP))} min={1} step={1} labelTextColor={props.toolTextColor} className="mb-0"/>
                            <div className="col-span-1 sm:col-span-2"><ImageUpload onImageUpload={props.setCustomCardBackBase64} label="Custom Card Back Image (Reveal Mode)" /></div>
                            {props.customCardBackBase64 && (
                                <div className="col-span-1 sm:col-span-2 flex justify-center">
                                    <Button 
                                        variant="danger" 
                                        size="sm" 
                                        onClick={() => props.setCustomCardBackBase64(null)}
                                        className="min-w-[180px]"
                                    >
                                        Remove Card Back
                                    </Button>
                                </div>
                            )}
                        </div>
                    </details>
                    <details className="bg-white/5 dark:bg-black/20 p-3 rounded-xl border border-white/10 dark:border-black/20 shadow-inner group transition-all">
                        <summary className="cursor-pointer font-bold text-sm flex items-center gap-2" style={{color: props.toolAccentColor}}>
                            <CogIcon className="w-4 h-4 group-open:-rotate-90 transition-transform"/>
                            Ranking Reveal Mode Settings
                        </summary>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
                            <InputField id="rankingRevealTopX" label="Animate & Play Snippet for Top X Songs" type="number" value={String(props.rankingRevealTopX)} onChange={(val) => props.setRankingRevealTopX(Math.max(0, parseInt(val) || DEFAULT_RANKING_REVEAL_TOP_X))} min={0} step={1} labelTextColor={props.toolTextColor} className="mb-0"/>
                            <InputField id="rankingRevealSnippetDuration" label="Snippet Duration (sec)" type="number" value={String(props.rankingRevealSnippetDuration)} onChange={(val) => props.setRankingRevealSnippetDuration(Math.max(1, Math.min(60, parseInt(val) || DEFAULT_RANKING_REVEAL_SNIPPET_DURATION)))} min={1} max={60} step={1} labelTextColor={props.toolTextColor} className="mb-0"/>
                        </div>
                    </details>
                </div>
                <div className="pt-4 border-t border-white/10 dark:border-black/20 space-y-3">
                    <div className="flex flex-wrap justify-center gap-3">
                        <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => {props.setNewThemeName(''); props.setShowSaveThemeModal(true);}} 
                            startIcon={<SaveIcon />}
                            className="min-w-[180px]"
                        >
                            Save Theme
                        </Button>
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => props.setShowLoadThemeModal(true)} 
                            disabled={props.savedDeckThemes.length === 0}
                            startIcon={<LoadIcon />}
                            className="min-w-[180px]"
                        >
                            Load Theme ({props.savedDeckThemes.length})
                        </Button>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={props.handleExportConfig} 
                            startIcon={<ExportIcon />}
                            className="min-w-[180px]"
                        >
                            Export Config
                        </Button>
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => { props.setImportConfigError(''); props.setConfigToImportJson(''); props.setShowImportConfigModal(true);}} 
                            startIcon={<ImportIcon />}
                            className="min-w-[180px]"
                        >
                            Import Config
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
