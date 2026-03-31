import React from 'react';
import InputField from '@/components/forms/InputField';
import SelectField from '@/components/forms/SelectField';
import ImageUpload from '@/components/ImageUpload';
import TextAreaField from '@/components/forms/TextAreaField';
import { 
    ConfigIcon, SaveIcon, LoadDeckIcon, ExportIcon, ImportIcon, DeleteIcon, TrashIcon 
} from '@/tools/SongDeckPicker/songDeckPicker.icons';
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

    return (
        <div className="my-4 p-3 md:p-4 rounded-lg shadow-lg border" style={{ borderColor: String(props.toolAccentColor), backgroundColor: String(lightenDarkenColor(props.toolBackgroundColor, props.theme === 'light' ? -5 : 10)) }}>
            <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <InputField id="customTitle" label="Tool Page Title" value={props.customTitle} onChange={props.setCustomTitle} labelTextColor={props.toolTextColor}/>
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3"><ImageUpload onImageUpload={props.setCustomLogo} label="Custom Page Logo (Optional)" /></div>
                    {props.customLogo && (<div className="flex items-end gap-2"><SelectField id="logoSize" label="Logo Size" value={props.selectedLogoSize} onChange={props.setSelectedLogoSize} options={logoSizeOptions} className="flex-grow mb-0" labelTextColor={props.toolTextColor}/><button onClick={() => props.setCustomLogo(null)} className="h-7 mb-0 text-[10px] py-0.5 px-1.5 bg-red-600 hover:bg-red-500 text-white rounded">Remove</button></div>)}
                </div>
                <details className="bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-300 dark:border-gray-700">
                    <summary className="cursor-pointer font-medium" style={{color: String(props.toolAccentColor)}}>Global & Standard Mode Settings</summary>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:String(props.toolTextColor)}}>Tool Background</label><div className="flex items-center gap-1"><input type="color" value={props.toolBackgroundColor} onChange={(e) => props.setCardBackgroundColor(e.target.value)} className="p-0 h-7 w-8 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"/><InputField id="toolBgColorHex" label="" value={props.toolBackgroundColorHexInput} onChange={props.handleToolBgColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:String(props.toolTextColor)}}>Tool Accent</label><div className="flex items-center gap-1"><input type="color" value={props.toolAccentColor} onChange={(e) => props.setCardBackgroundColor(e.target.value)} className="p-0 h-7 w-8 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"/><InputField id="toolAccentColorHex" label="" value={props.toolAccentColorHexInput} onChange={props.handleToolAccentColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:String(props.toolTextColor)}}>Tool Text</label><div className="flex items-center gap-1"><input type="color" value={props.toolTextColor} onChange={(e) => props.setCardBackgroundColor(e.target.value)} className="p-0 h-7 w-8 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"/><InputField id="toolTextColorHex" label="" value={props.toolTextColorHexInput} onChange={props.handleToolTextColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                        <SelectField id="cardTextFont" label="Card Text Font" value={props.cardTextFont} onChange={props.setCardTextFont} options={cardTextFontOptions} labelTextColor={props.toolTextColor} className="mb-0"/>
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:String(props.toolTextColor)}}>Card Background</label><div className="flex items-center gap-1"><input type="color" value={props.cardBackgroundColor} onChange={(e) => props.setCardBackgroundColor(e.target.value)} className="p-0 h-7 w-8 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"/><InputField id="cardBgColorHex" label="" value={props.cardBackgroundColorHexInput} onChange={props.handleCardBgColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:String(props.toolTextColor)}}>Card Border</label><div className="flex items-center gap-1"><input type="color" value={props.cardBorderColor} onChange={(e) => props.setCardBorderColor(e.target.value)} className="p-0 h-7 w-8 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"/><InputField id="cardBorderColorHex" label="" value={props.cardBorderColorHexInput} onChange={props.handleCardBorderColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                        <div><label className="block text-xs font-medium mb-0.5" style={{color:String(props.toolTextColor)}}>Card Text (Preferred)</label><div className="flex items-center gap-1"><input type="color" value={props.cardTextColor} onChange={(e) => props.setCardTextColor(e.target.value)} className="p-0 h-7 w-8 rounded border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700"/><InputField id="cardTextColorHex" label="" value={props.cardTextColorHexInput} onChange={props.handleCardTextColorHexChange} className="mb-0 flex-grow" type="text"/></div></div>
                        <InputField id="numberOfCardsToDraw" label="Cards in Random Pick Animation (Std, 2-10)" type="number" value={String(props.numberOfCardsToDraw)} onChange={(val) => props.setNumberOfCardsToDraw(Math.max(2, Math.min(10, parseInt(val) || DEFAULT_NUMBER_OF_CARDS_TO_DRAW)))} min={2} max={10} step={1} labelTextColor={props.toolTextColor} className="mb-0"/>
                    </div>
                </details>
                <details className="bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-300 dark:border-gray-700"> 
                    <summary className="cursor-pointer font-medium" style={{color: String(props.toolAccentColor)}}>Reveal Cards Mode Settings</summary>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <InputField id="revealPoolSizeX" label="Cards in Reveal Round (X)" type="number" value={String(props.revealPoolSizeX)} onChange={(val) => props.setRevealPoolSizeX(Math.max(1, Math.min(20, parseInt(val) || DEFAULT_REVEAL_POOL_SIZE_X)))} min={1} max={20} step={1} labelTextColor={props.toolTextColor} className="mb-0"/>
                        <InputField id="maxLoggedSongsN" label="Max Total Logged Songs (N)" type="number" value={String(props.maxLoggedSongsN)} onChange={(val) => props.setMaxLoggedSongsN(Math.max(1, parseInt(val) || DEFAULT_MAX_LOGGED_SONGS_N))} min={1} step={1} labelTextColor={props.toolTextColor} className="mb-0"/>
                        <InputField id="maxSongsPerGroup" label="Max Songs Per Group (Guideline)" type="number" value={String(props.maxSongsPerGroup)} onChange={(val) => props.setMaxSongsPerGroup(Math.max(1, parseInt(val) || DEFAULT_MAX_SONGS_PER_GROUP))} min={1} step={1} labelTextColor={props.toolTextColor} className="mb-0"/>
                        <div className="col-span-1 sm:col-span-2"><ImageUpload onImageUpload={props.setCustomCardBackBase64} label="Custom Card Back Image (Reveal Mode)" /></div>
                        {props.customCardBackBase64 && <button onClick={() => props.setCustomCardBackBase64(null)} className="text-xs py-1 px-2 bg-red-600 hover:bg-red-500 text-white rounded">Remove Card Back</button>}
                    </div>
                </details>
                <details className="bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-300 dark:border-gray-700">
                    <summary className="cursor-pointer font-medium" style={{color: String(props.toolAccentColor)}}>Ranking Reveal Mode Settings</summary>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <InputField id="rankingRevealTopX" label="Animate & Play Snippet for Top X Songs" type="number" value={String(props.rankingRevealTopX)} onChange={(val) => props.setRankingRevealTopX(Math.max(0, parseInt(val) || DEFAULT_RANKING_REVEAL_TOP_X))} min={0} step={1} labelTextColor={props.toolTextColor} className="mb-0"/>
                        <InputField id="rankingRevealSnippetDuration" label="Snippet Duration (sec)" type="number" value={String(props.rankingRevealSnippetDuration)} onChange={(val) => props.setRankingRevealSnippetDuration(Math.max(1, Math.min(60, parseInt(val) || DEFAULT_RANKING_REVEAL_SNIPPET_DURATION)))} min={1} max={60} step={1} labelTextColor={props.toolTextColor} className="mb-0"/>
                    </div>
                </details>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={() => {props.setNewThemeName(''); props.setShowSaveThemeModal(true);}} className="py-1.5 px-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center justify-center gap-1"><SaveIcon/>Save Current Theme</button>
                    <button onClick={() => props.setShowLoadThemeModal(true)} disabled={props.savedDeckThemes.length === 0} className="py-1.5 px-2 text-xs bg-teal-600 hover:bg-teal-500 text-white rounded flex items-center justify-center gap-1 disabled:opacity-50"><LoadDeckIcon/>Load Saved Theme ({props.savedDeckThemes.length})</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button onClick={props.handleExportConfig} className="py-1.5 px-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded flex items-center justify-center gap-1"><ExportIcon/>Export Current Config</button>
                    <button onClick={() => { props.setImportConfigError(''); props.setConfigToImportJson(''); props.setShowImportConfigModal(true);}} className="py-1.5 px-2 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center justify-center gap-1"><ImportIcon/>Import Config</button>
                </div>
            </div>
        </div>
    );
};
