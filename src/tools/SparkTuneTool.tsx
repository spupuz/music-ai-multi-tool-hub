import React, { useState, useEffect } from 'react';
import type { ToolProps } from '@/Layout';
import type { SparkTuneChallengeData } from '@/types';
import InputField from '@/components/forms/InputField';
import TextAreaField from '@/components/forms/TextAreaField';
import Button from '@/components/common/Button';
import { 
  RefreshIcon, 
  SparklesIcon, 
  HistoryIcon, 
  ChevronDownIcon, 
  CopyIcon, 
  RecordIcon,
  StarIcon,
  TrashIcon,
  ComplianceCheckIcon,
  MusicNoteIcon,
  LinkIcon
} from '@/components/Icons';

const TOOL_CATEGORY = 'PromptSpark';
const LOCAL_STORAGE_KEY = 'promptSparkChallenges_v1';

const predefinedGenres = ["Cyberpunk Industrial", "Lofi Jazz Hop", "Ethereal Dream Pop", "Aggressive Phonk", "Vintage Soul-Funk", "Cinematic Orchestral", "Retrowave / Synthwave", "Dark Trap", "Bossa Nova Lounge", "Heavy Metal Core"];
const predefinedMoods = ["Vibrant & Euphoric", "Melancholic & Rainy", "Dark & Sinister", "Epic & Heroic", "Mystical & Foggy", "Gritty & Urban", "Chill & Relaxed", "Aggressive & Intense", "Playful & Quirky", "Nostalgic & Warm"];
const predefinedThemes = ["Lost in Deep Space", "Cyber City Rain", "Ancient Ritual", "Underwater Kingdom", "Haunted Victorian Mansion", "Robot Revolution", "Desert Caravan", "Temporal Paradox", "Neon Jungle", "Summit of the Mountain"];
const predefinedInstrumentations = ["Solo Acoustic Guitar", "Aggressive Sawtooth Synths", "Smooth Rhodes & Saxophone", "Glitchy 808 Drums", "Grand Piano & Cello", "Distant Echoing Pads", "Funky Slap Bass", "Tribal Percussion", "Lo-fi Vinyl Crackle", "8-bit Chiptune Leads"];
const predefinedVocalStyles = ["Male Vocals", "Female Vocals", "Instrumental / No Vocals", "Whispered Vocals", "Operatic Vocals", "Rap Vocals", "Harmonized Backing Vocals", "A-cappella", "Robotic Vocals"];

const CollapsibleSection: React.FC<{ 
    title: string; 
    children: React.ReactNode; 
    defaultOpen?: boolean;
    icon?: React.ReactNode;
}> = ({ title, children, defaultOpen = false, icon }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    return (
        <div className="glass-card p-0 border-white/5 mb-2 overflow-hidden transition-all duration-500 shadow-none">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-5 flex flex-row items-center justify-start text-left group hover:bg-white/5 transition-all duration-300 border-none h-auto gap-6 outline-none appearance-none bg-transparent"
                aria-expanded={isOpen}
            >
                <div className="flex flex-col items-center shrink-0 w-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border ${
                        isOpen 
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                        : 'bg-white/5 border-white/5 text-gray-400'
                    }`}>
                        {icon || <SparklesIcon className="w-5 h-5" />}
                    </div>
                    <div className="h-5 flex items-center justify-center">
                         <ChevronDownIcon className={`w-4 h-4 transition-transform duration-500 ${isOpen ? 'rotate-180 text-emerald-500' : 'rotate-0 text-gray-700'}`} />
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors leading-none">
                        {title}
                    </span>
                    <div className={`h-0.5 mt-2 bg-emerald-500/30 transition-all duration-700 ${isOpen ? 'w-full' : 'w-0'}`} />
                </div>
            </button>
            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                <div className="overflow-hidden">
                    <div className="p-3 sm:p-8 pt-1 sm:pt-2 space-y-4 sm:space-y-6 border-t border-white/5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PromptSparkTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
    const [challengeName, setChallengeName] = useState('');
    const [organizedBy, setOrganizedBy] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [genre, setGenre] = useState('');
    const [mood, setMood] = useState('');
    const [themeOrKeyword, setThemeOrKeyword] = useState('');
    const [instrumentation, setInstrumentation] = useState('');
    const [vocalStyle, setVocalStyle] = useState('');
    const [tempo, setTempo] = useState('');
    const [durationConstraint, setDurationConstraint] = useState('');
    const [lyricPart, setLyricPart] = useState('');
    const [negativeConstraints, setNegativeConstraints] = useState('');
    const [sunoSampleLink, setSunoSampleLink] = useState('');
    const [audioSampleLink, setAudioSampleLink] = useState('');
    const [submissionLink, setSubmissionLink] = useState('');
    const [showcasePlaylistLink, setShowcasePlaylistLink] = useState('');
    const [additionalDetails, setAdditionalDetails] = useState('');

    const [generatedAnnouncementPost, setGeneratedAnnouncementPost] = useState('');
    const [generatedReminderPost, setGeneratedReminderPost] = useState('');
    const [activePostTab, setActivePostTab] = useState<'announcement' | 'reminder'>('announcement');
    const [copyPostStatus, setCopyPostStatus] = useState('');
    const [savedChallenges, setSavedChallenges] = useState<SparkTuneChallengeData[]>([]);
    const [showLoadModal, setShowLoadModal] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            try {
                setSavedChallenges(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to load saved challenges", e);
            }
        }
    }, []);

    const saveChallengeToLocal = (challenge: SparkTuneChallengeData) => {
        const updated = [challenge, ...savedChallenges.filter(c => c.id !== challenge.id)].slice(0, 20);
        setSavedChallenges(updated);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    };

    const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    const handleGeneratePost = () => {
        if (!challengeName || !organizedBy || !dueDate) {
            alert("Please fill in Challenge Identity, Mastermind, and Extraction Deadline!");
            return;
        }

        const dateObj = new Date(dueDate + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

        const mainInfo = `
🚀 **NEW SONIC MISSION: ${challengeName.toUpperCase()}** 🚀

Greetings Architects! It's time to synchronize our neural networks for a new creative excavation.

**THE BLUEPRINT:**
- **Genre Vector:** ${genre || 'Any / Open'}
- **Vibe Spectrum:** ${mood || 'Any / Open'}
- **Core Theme:** ${themeOrKeyword || 'Open Interpretation'}
- **Arsenal Gear:** ${instrumentation || 'Any / Open'}
- **Vocal Signal:** ${vocalStyle || 'Any / Open'}
${tempo ? `- **Pulse (BPM):** ${tempo}` : ''}
${durationConstraint ? `- **Time Warp:** ${durationConstraint}` : ''}
${lyricPart ? `- **Lyric Core / Mandatory Phrase:** "${lyricPart}"` : ''}
${negativeConstraints ? `- **BANNED ELEMENTS (TWIST):** ${negativeConstraints}` : ''}

**CHRONOLOGY:**
💥 **Extraction Deadline:** ${formattedDate}

**ACCESS PORTALS:**
${sunoSampleLink ? `- Suno Pulse Sample: ${sunoSampleLink}` : ''}
${audioSampleLink ? `- Audio Feed Sample: ${audioSampleLink}` : ''}
${submissionLink ? `- Deployment Portal: ${submissionLink}` : ''}
${showcasePlaylistLink ? `- Showcase Vector: ${showcasePlaylistLink}` : ''}

**MASTERMIND:** ${organizedBy}
${additionalDetails ? `\n**THE FINE PRINT:**\n${additionalDetails}` : ''}

Assemble your assets. Let the synthesis begin! 🎹✨
        `;

        const reminderInfo = `
⚠️ **TEMPORAL WARNING: ${challengeName.toUpperCase()}** ⚠️

Architects, the window for current creative extraction is closing rapidly!

- **Target:** ${challengeName}
- **Mastermind:** ${organizedBy}
- **Final Extraction Sequence:** ${formattedDate}

**MISSION PARAMETERS:**
- ${genre ? `Genre: ${genre} | ` : ''}${mood ? `Vibe: ${mood}` : ''}
- ${themeOrKeyword ? `Theme: ${themeOrKeyword}` : ''}

${submissionLink ? `📤 **DEPLOY YOUR SIGNAL HERE:** ${submissionLink}` : 'Deployment protocols ready in the mission hub.'}

Synchronize your efforts. The deadline is absolute. ⚡️
        `;

        setGeneratedAnnouncementPost(mainInfo.trim());
        setGeneratedReminderPost(reminderInfo.trim());
        trackLocalEvent(TOOL_CATEGORY, 'ChallengeGenerated', challengeName);

        saveChallengeToLocal({
            id: Date.now().toString(),
            challengeName, organizedBy, dueDate, genre, mood, themeOrKeyword, instrumentation, vocalStyle,
            tempo, durationConstraint, lyricPart, negativeConstraints, sunoSampleLink, audioSampleLink,
            submissionLink, showcasePlaylistLink, additionalDetails
        });
    };

    const handleCopyGeneratedPost = () => {
        const textToCopy = activePostTab === 'announcement' ? generatedAnnouncementPost : generatedReminderPost;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopyPostStatus('Rockstar! Copied to Clipboard!');
            setTimeout(() => setCopyPostStatus(''), 3000);
            trackLocalEvent(TOOL_CATEGORY, 'ChallengeCopied', activePostTab);
        }).catch(err => {
            setCopyPostStatus('Oops! Copy Failed.');
            console.error('Copy failed:', err);
        });
    };

    const loadChallengeToForm = (c: SparkTuneChallengeData) => {
        setChallengeName(c.challengeName);
        setOrganizedBy(c.organizedBy || '');
        setDueDate(c.dueDate);
        setGenre(c.genre || '');
        setMood(c.mood || '');
        setThemeOrKeyword(c.themeOrKeyword || '');
        setInstrumentation(c.instrumentation || '');
        setVocalStyle(c.vocalStyle || '');
        setTempo(c.tempo || '');
        setDurationConstraint(c.durationConstraint || '');
        setLyricPart(c.lyricPart || '');
        setNegativeConstraints(c.negativeConstraints || '');
        setSunoSampleLink(c.sunoSampleLink || '');
        setAudioSampleLink(c.audioSampleLink || '');
        setSubmissionLink(c.submissionLink || '');
        setShowcasePlaylistLink(c.showcasePlaylistLink || '');
        setAdditionalDetails(c.additionalDetails || '');
        setShowLoadModal(false);
    };

    return (
        <div className="w-full">
            <header className="mb-2 md:mb-14 text-center pt-0 md:pt-8 px-4 animate-fadeIn">
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic drop-shadow-2xl mb-1 md:mb-4">SparkTune</h1>
                <p className="mt-1 md:mt-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">
                    AI Prompt Refinement • Musical Prompt Engineering Hub
                </p>
            </header>

            <main className="w-full relative">
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-12 xl:col-span-7 space-y-2">
                        <CollapsibleSection title="Deployment Intel" defaultOpen icon={<ComplianceCheckIcon className="w-4 h-4" />}>
                          <InputField id="challengeName" label="Challenge Identity" value={challengeName} onChange={setChallengeName} placeholder="e.g., Galactic Grooves Contest" required />
                          <InputField id="organizedBy" label="Mastermind" value={organizedBy} onChange={setOrganizedBy} placeholder="e.g., Your Discord Handle or Group Name" required />
                          <InputField type="date" id="dueDate" label="Extraction Deadline" value={dueDate} onChange={setDueDate} required />
                        </CollapsibleSection>
                        
                        <CollapsibleSection title="Sonic DNA" defaultOpen icon={<MusicNoteIcon className="w-4 h-4" />}>
                            <div className="flex items-end gap-3">
                                <InputField id="genre" label="Genre Vector" value={genre} onChange={setGenre} placeholder="e.g., Cosmic Disco" className="flex-grow mb-0" />
                                <Button onClick={() => setGenre(getRandomItem(predefinedGenres))} variant="ghost" size="xs" startIcon={<RefreshIcon className="w-3.5 h-3.5" />} className="px-3 border-white/10 text-gray-500 hover:text-green-500"></Button>
                            </div>
                            <div className="flex items-end gap-3">
                                <InputField id="mood" label="Vibe Spectrum" value={mood} onChange={setMood} placeholder="e.g., Euphoric & Spacey" className="flex-grow mb-0" />
                                <Button onClick={() => setMood(getRandomItem(predefinedMoods))} variant="ghost" size="xs" startIcon={<RefreshIcon className="w-3.5 h-3.5" />} className="px-3 border-white/10 text-gray-500 hover:text-green-500"></Button>
                            </div>
                            <div className="flex items-end gap-3">
                                <InputField id="instrumentation" label="Arsenal Gear" value={instrumentation} onChange={setInstrumentation} placeholder="e.g., Laser Harps & Funky Basslines" className="flex-grow mb-0" />
                                <Button onClick={() => setInstrumentation(getRandomItem(predefinedInstrumentations))} variant="ghost" size="xs" startIcon={<RefreshIcon className="w-3.5 h-3.5" />} className="px-3 border-white/10 text-gray-500 hover:text-green-500"></Button>
                            </div>
                            <div className="flex items-end gap-3">
                                <InputField id="themeOrKeyword" label="Core Theme" value={themeOrKeyword} onChange={setThemeOrKeyword} placeholder="e.g., Alien Jungle Party" className="flex-grow mb-0" />
                                <Button onClick={() => setThemeOrKeyword(getRandomItem(predefinedThemes))} variant="ghost" size="xs" startIcon={<RefreshIcon className="w-3.5 h-3.5" />} className="px-3 border-white/10 text-gray-500 hover:text-green-500"></Button>
                            </div>
                             <div className="flex items-end gap-3">
                                <InputField id="vocalStyle" label="Vocal Signal" value={vocalStyle} onChange={setVocalStyle} placeholder="e.g., Female Vocals, Instrumental" className="flex-grow mb-0" />
                                <Button onClick={() => setVocalStyle(getRandomItem(predefinedVocalStyles))} variant="ghost" size="xs" startIcon={<RefreshIcon className="w-3.5 h-3.5" />} className="px-3 border-white/10 text-gray-500 hover:text-green-500"></Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField id="tempo" label="Pulse (BPM)" value={tempo} onChange={setTempo} placeholder="e.g., 120 BPM" className="mb-0" />
                                <InputField id="durationConstraint" label="Time Warp" value={durationConstraint} onChange={setDurationConstraint} placeholder="e.g., Max 1:45" className="mb-0" />
                            </div>
                            <TextAreaField id="lyricPart" label="Lyric Core / Mandatory Phrase" value={lyricPart} onChange={setLyricPart} placeholder="e.g., 'The stars are aligning tonight!'" rows={3} className="mb-0" />
                            <InputField id="negativeConstraints" label="Banned Elements (Twist)" value={negativeConstraints} onChange={setNegativeConstraints} placeholder="No guitars, must be A-cappella" className="mb-0" />
                        </CollapsibleSection>

                        <CollapsibleSection title="Satellite Links" icon={<LinkIcon className="w-4 h-4" />}>
                            <InputField type="url" id="sunoSampleLink" label="Suno Pulse Sample" value={sunoSampleLink} onChange={setSunoSampleLink} placeholder="https://suno.com/song/..." />
                            <InputField type="url" id="audioSampleLink" label="Audio Feed Sample" value={audioSampleLink} onChange={setAudioSampleLink} placeholder="e.g., YouTube, Soundcloud..." />
                            <InputField type="url" id="submissionLink" label="Deployment Portal" value={submissionLink} onChange={setSubmissionLink} placeholder="e.g., Discord channel, Google Form" />
                            <InputField type="url" id="showcasePlaylistLink" label="Showcase Vector" value={showcasePlaylistLink} onChange={setShowcasePlaylistLink} placeholder="https://youtube.com/playlist?list=..." />
                            <TextAreaField id="additionalDetails" label="The Fine Print" value={additionalDetails} onChange={setAdditionalDetails} placeholder="Judging criteria, extra rules..." rows={3} className="mb-0" />
                        </CollapsibleSection>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5 relative z-20">
                             <Button 
                                onClick={handleGeneratePost} 
                                variant="primary" 
                                size="lg" 
                                startIcon={<SparklesIcon className="w-5 h-5 text-black/50" />}
                                className="font-black uppercase tracking-widest text-xs h-16 shadow-2xl shadow-green-500/20"
                                backgroundColor="#10b981"
                             >
                                ACTIVATE SPARK
                             </Button>
                             <Button 
                                onClick={() => setShowLoadModal(true)} 
                                variant="ghost" 
                                size="lg" 
                                startIcon={<HistoryIcon className="w-5 h-5" />}
                                className="font-black uppercase tracking-widest text-[10px] h-16 border-white/10 text-gray-500 hover:text-white"
                             >
                                OPEN ARCHIVES ({savedChallenges.length})
                             </Button>
                        </div>
                    </div>

                    <div className="lg:col-span-12 xl:col-span-5 space-y-2">
                        {(generatedAnnouncementPost || generatedReminderPost) ? (
                            <div className="animate-fadeIn glass-card p-10 border-white/10 shadow-2xl relative overflow-hidden h-full flex flex-col min-h-[600px]">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] pointer-events-none"></div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center">
                                        <CopyIcon className="w-4 h-4 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600 dark:text-green-500 leading-none">Transmission Ready</h3>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mt-2 opacity-60 italic">Copy to your distribution networks</p>
                                    </div>
                                </div>

                                <div className="flex mb-6 p-1.5 bg-black/20 rounded-2xl border border-white/5 w-fit">
                                    <Button 
                                        onClick={() => setActivePostTab('announcement')} 
                                        variant={activePostTab === 'announcement' ? "primary" : "ghost"}
                                        size="xs"
                                        className={`font-black uppercase tracking-widest text-[9px] px-6 transition-all duration-300 ${activePostTab === 'announcement' ? 'text-black' : 'text-gray-500 hover:text-white'}`}
                                        backgroundColor={activePostTab === 'announcement' ? "#10b981" : undefined}
                                    >
                                        Announcement
                                    </Button>
                                    <Button 
                                        onClick={() => setActivePostTab('reminder')} 
                                        variant={activePostTab === 'reminder' ? "primary" : "ghost"}
                                        size="xs"
                                        className={`font-black uppercase tracking-widest text-[9px] px-6 transition-all duration-300 ${activePostTab === 'reminder' ? 'text-black' : 'text-gray-500 hover:text-white'}`}
                                        backgroundColor={activePostTab === 'reminder' ? "#10b981" : undefined}
                                    >
                                        Reminder
                                    </Button>
                                </div>

                                <div className="relative flex-grow group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                                    <textarea
                                        readOnly
                                        value={activePostTab === 'announcement' ? generatedAnnouncementPost : generatedReminderPost}
                                        className="relative w-full h-[380px] p-6 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl text-[10px] font-mono text-gray-300 leading-relaxed outline-none scrollbar-thin scrollbar-thumb-white/10"
                                        aria-label="Generated Transmission Content"
                                    />
                                </div>
                                
                                <Button 
                                    onClick={handleCopyGeneratedPost} 
                                    variant="primary" 
                                    size="lg" 
                                    startIcon={<CopyIcon className="w-4 h-4 text-black/50" />}
                                    className="w-full mt-6 font-black uppercase tracking-[0.2em] text-[10px] h-14"
                                    backgroundColor="#10b981"
                                    disabled={copyPostStatus === 'Rockstar! Copied to Clipboard!' || copyPostStatus === 'Oops! Copy Failed.'}
                                >
                                    {copyPostStatus || `COPY ${activePostTab.toUpperCase()} SIGNAL`}
                                </Button>
                            </div>
                        ) : (
                            <div className="glass-card p-20 border-white/5 bg-slate-50/50 dark:bg-black/10 flex flex-col items-center justify-center text-center opacity-20 h-full min-h-[600px]">
                                <RecordIcon className="w-20 h-20 mb-8 animate-pulse text-gray-500" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4">Transmission Idle</h3>
                                <p className="text-[8px] font-black uppercase tracking-widest max-w-[200px]">Awaiting sonic challenge blueprints for neural network synthesis.</p>
                            </div>
                        )}
                    </div>
                </div>

                {showLoadModal && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-fadeIn">
                        <div className="glass-card p-10 border-green-500/30 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-green-500/10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                                        <HistoryIcon className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-green-600 dark:text-green-500 leading-none">Chrono Vault</h3>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mt-2 opacity-60">Retrieved historical challenge records</p>
                                    </div>
                                </div>
                                <Button onClick={() => setShowLoadModal(false)} variant="ghost" size="xs" className="w-10 h-10 border-white/10 text-white/50 hover:text-white">&times;</Button>
                            </div>

                            {savedChallenges.length > 0 ? (
                                <div className="overflow-y-auto pr-4 space-y-3 flex-grow scrollbar-thin scrollbar-thumb-white/10">
                                    {savedChallenges.map(challenge => (
                                        <div 
                                            key={challenge.id} 
                                            onClick={() => loadChallengeToForm(challenge)}
                                            className="group relative p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-green-500/50 hover:bg-white/10 cursor-pointer transition-all duration-300"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-sm font-black uppercase tracking-tight text-white group-hover:text-green-500 transition-colors">{challenge.challengeName}</p>
                                                <StarIcon className="w-4 h-4 text-yellow-500/20 group-hover:text-yellow-500 transition-colors" />
                                            </div>
                                            <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">
                                                <span>Pilot: {challenge.organizedBy}</span>
                                                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                                <span>Due: {new Date(challenge.dueDate + 'T00:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-grow flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                                     <TrashIcon className="w-16 h-16" />
                                     <p className="text-[9px] font-black uppercase tracking-widest">No historical data detected in the vault.</p>
                                </div>
                            )}

                            <div className="mt-8 pt-8 border-t border-white/10">
                                <Button onClick={() => setShowLoadModal(false)} variant="ghost" size="lg" className="w-full font-black uppercase tracking-widest text-[9px] border-white/10 py-6">EXIT VAULT</Button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PromptSparkTool;
