import React from 'react';
import { predefinedBlockTypes, arrangementTemplates } from './constants';
import { getContrastingTextColor } from './utils';
// using local Template derived from arrangementTemplates
type Template = typeof arrangementTemplates[0];

export interface StructurePaletteProps {
    blockTypeColors: Record<string, string>;
    onDragStart: (e: React.DragEvent, source: 'palette', data: { type: string }) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onBlockColorChange: (type: string, color: string) => void;
    customBlockName: string;
    setCustomBlockName: (name: string) => void;
    onAddCustomBlock: () => void;
    onApplyTemplate: (template: Template, mode: 'replace' | 'append') => void;
}

const StructurePalette: React.FC<StructurePaletteProps> = ({
    blockTypeColors,
    onDragStart,
    onDragEnd,
    onBlockColorChange,
    customBlockName,
    setCustomBlockName,
    onAddCustomBlock,
    onApplyTemplate
}) => {
    return (
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-200 dark:border-green-700 shadow-md">
            <h2 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">Structure Palette</h2>
            <div className="grid grid-cols-2 gap-2">
                {predefinedBlockTypes.map(type => {
                    const bgColor = blockTypeColors[type] || '#555';
                    const textColor = getContrastingTextColor(bgColor);
                    return (
                        <div key={type} className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm">
                            <div 
                                draggable 
                                onDragStart={(e) => onDragStart(e, 'palette', { type })} 
                                onDragEnd={onDragEnd} 
                                className="flex-grow p-1 text-center text-sm font-medium rounded-md cursor-grab active:cursor-grabbing hover:opacity-90 transition-opacity" 
                                style={{ backgroundColor: bgColor, color: textColor }}
                            >
                                [{type}]
                            </div>
                            <input 
                                type="color" 
                                value={bgColor} 
                                onChange={(e) => onBlockColorChange(type, e.target.value)} 
                                className="w-8 h-8 p-0 border-none rounded-md cursor-pointer bg-transparent" 
                                title={`Set color for ${type}`} 
                            />
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                <label htmlFor="customBlockInput" className="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">Add Custom Block</label>
                <div className="flex gap-2"> 
                    <input 
                        id="customBlockInput" 
                        type="text" 
                        value={customBlockName} 
                        onChange={e => setCustomBlockName(e.target.value)} 
                        placeholder="e.g., Synth Riff" 
                        className="flex-grow px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-green-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 sm:text-sm text-gray-900 dark:text-white"
                    /> 
                    <button 
                        onClick={onAddCustomBlock} 
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium"
                    >
                        Add
                    </button> 
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                <h3 className="text-md font-semibold text-green-700 dark:text-green-300 mb-2">Arrangement Templates</h3>
                <div className="space-y-2">
                    {arrangementTemplates.map(template => (
                        <div key={template.name} className="flex gap-1">
                            <div className="flex-grow p-2 text-left text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm" title={template.description}>
                                {template.name}
                            </div>
                            <button onClick={() => onApplyTemplate(template, 'replace')} className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 text-black rounded-md text-xs font-medium" title="Replace current timeline">Replace</button>
                            <button onClick={() => onApplyTemplate(template, 'append')} className="px-2 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-md text-xs font-medium" title="Add to end of timeline">Append</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StructurePalette;
