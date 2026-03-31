import React from 'react';
import { predefinedBlockTypes, arrangementTemplates } from './constants';
import { getContrastingTextColor } from './utils';
import Button from '@/components/common/Button';

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
        <div className="lg:col-span-1 glass-card p-6 border-white/10 shadow-xl relative overflow-hidden h-fit">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600 dark:text-green-500 opacity-80 mb-6">Library Palette</h2>
            
            <div className="grid grid-cols-1 gap-2.5">
                {predefinedBlockTypes.map(type => {
                    const bgColor = blockTypeColors[type] || '#555';
                    const textColor = getContrastingTextColor(bgColor);
                    return (
                        <div key={type} className="flex items-center gap-2 p-1.5 bg-black/10 dark:bg-black/40 rounded-xl border border-white/5 group hover:border-white/10 transition-all">
                            <div 
                                draggable 
                                onDragStart={(e) => onDragStart(e, 'palette', { type })} 
                                onDragEnd={onDragEnd} 
                                className="flex-grow py-2.5 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform shadow-lg" 
                                style={{ backgroundColor: bgColor, color: textColor }}
                            >
                                {type}
                            </div>
                            <div className="relative shrink-0 flex items-center">
                              <input 
                                  type="color" 
                                  value={bgColor} 
                                  onChange={(e) => onBlockColorChange(type, e.target.value)} 
                                  className="w-10 h-10 p-0 border-none rounded-lg cursor-pointer bg-transparent" 
                                  title={`Set color for ${type}`} 
                              />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
                <label htmlFor="customBlockInput" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">Expansion Slot</label>
                <div className="flex flex-col gap-2"> 
                    <input 
                        id="customBlockInput" 
                        type="text" 
                        value={customBlockName} 
                        onChange={e => setCustomBlockName(e.target.value)} 
                        placeholder="Custom Name..." 
                        className="w-full px-4 py-3 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl text-xs font-bold placeholder-gray-600 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
                    /> 
                    <Button 
                        onClick={onAddCustomBlock} 
                        variant="primary" 
                        size="sm" 
                        className="w-full font-black uppercase tracking-widest text-[9px]"
                        backgroundColor="#3b82f6"
                    >
                        Register Block
                    </Button> 
                </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600 dark:text-green-500 opacity-80 mb-4">Blueprints</h3>
                <div className="space-y-3">
                    {arrangementTemplates.map(template => (
                        <div key={template.name} className="p-4 bg-white/5 dark:bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-200 mb-3" title={template.description}>
                                {template.name}
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={() => onApplyTemplate(template, 'replace')} variant="primary" size="xs" className="flex-grow font-black uppercase tracking-widest text-[8px]" backgroundColor="#ca8a04">Wipe</Button>
                              <Button onClick={() => onApplyTemplate(template, 'append')} variant="ghost" size="xs" className="flex-grow font-black uppercase tracking-widest text-[8px] border-white/10">Append</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StructurePalette;
