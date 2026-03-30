
import React, { useState, useCallback, useEffect } from 'react';
import type { ToolProps } from '../../Layout';
import type { SparkTuneChallengeData } from '../../types';
import InputField from '../../components/forms/InputField';
import TextAreaField from '../../components/forms/TextAreaField';

const TOOL_CATEGORY = 'SparkTuneChallenge';
const LOCAL_STORAGE_KEY = 'sparkTuneChallenges_v1';

const predefinedGenres = ["Synthwave", "Lo-fi Hip Hop", "Epic Orchestral", "Pixel Melody", "Dark Ambient", "Future Bass", "80s Pop", "Trap Metal", "Cyberpunk Industrial", "Chillstep", "Folk Ballad", "Jazz Fusion", "Cosmic Disco", "Pirate Metal", "Alien Reggae"];
const predefinedMoods = ["Mysterious", "Uplifting", "Melancholy", "Energetic", "Dreamy", "Aggressive", "Peaceful", "Suspenseful", "Whimsical", "Hopeful", "Romantic", "Introspective", "Chaotic", "Serene", "Hypnotic"];
const predefinedInstrumentations = ["Vintage Synths & 808 Drums", "Acoustic Piano & Cello", "Distorted Guitars & Heavy Drums", "Kalimba & Nature Sounds", "Orchestral Strings & Brass", "Wobbly Bass & Glitchy Beats", "Electric Guitar & Hammond Organ", "Didgeridoo & Tribal Drums", "Acoustic Guitar & Harmonica", "Modular Synths & Found Sounds", "Bagpipes & Distorted Bass", "Theremin & Church Organ"];
const predefinedThemes = ["Space Opera", "Cyberpunk Detective", "Lost Jungle Temple", "Retro Arcade", "Haunted Mansion", "Mythical Creatures", "Time Travel", "Steampunk World", "Ancient Rituals", "Urban Fantasy", "Robot Uprising", "Post-Apocalyptic Journey", "Deep Sea Exploration", "Mad Scientist's Lab", "Interdimensional Rift"];
const predefinedVocalStyles = ["Male Vocals", "Female Vocals", "Instrumental / No Vocals", "Whispered Vocals", "Operatic Vocals", "Rap Vocals", "Harmonized Backing Vocals", "A-cappella", "Robotic Vocals"];


const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => (
    <details className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4" open={defaultOpen}>
        <summary className="text-lg font-semibold text-green-700 dark:text-green-300 cursor-pointer hover:text-green-600 dark:hover:text-green-200 transition-colors">
            {title}
        </summary>
        <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
            {children}
        </div>
    </details>
);

const SparkTuneTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
    const [challengeName, setChallengeName] = useState('');
    const [organizedBy, setOrganizedBy] = useState('');
    const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
    
    const [genre, setGenre] = useState('');
    const [mood, setMood] = useState('');
    const [instrumentation, setInstrumentation] = useState('');
    const [themeOrKeyword, setThemeOrKeyword] = useState('');
    const [vocalStyle, setVocalStyle] = useState('');
    const [tempo, setTempo] = useState('');
    const [negativeConstraints, setNegativeConstraints] = useState('');
    const [durationConstraint, setDurationConstraint] = useState('Max 1:45');
    const [lyricPart, setLyricPart] = useState('');
    
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
        try {
            const storedChallenges = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedChallenges) {
                setSavedChallenges(JSON.parse(storedChallenges));
            }
        } catch (error) {
            console.error("Error loading challenges from localStorage:", error);
        }
    }, []);

    const saveChallenge = (challengeData: SparkTuneChallengeData) => {
        const updatedChallenges = [challengeData, ...savedChallenges.filter(c => c.id !== challengeData.id)].slice(0, 50); 
        setSavedChallenges(updatedChallenges);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedChallenges));
    };
    
    const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)] || '';

    const handleGeneratePost = () => {
        if (!challengeName.trim() || !organizedBy.trim() || !dueDate) {
            alert("Hold your horses! 🐴 Challenge Name, Organized By, and Due Date are essential ingredients. Please fill them in!");
            return;
        }

        const challengeId = Date.now().toString();
        const currentChallenge: SparkTuneChallengeData = {
            id: challengeId, challengeName: challengeName.trim(), organizedBy: organizedBy.trim(), 
            genre: genre.trim(), mood: mood.trim(), instrumentation: instrumentation.trim(), 
            themeOrKeyword: themeOrKeyword.trim(), vocalStyle: vocalStyle.trim(), tempo: tempo.trim(),
            negativeConstraints: negativeConstraints.trim(), durationConstraint: durationConstraint.trim(), 
            lyricPart: lyricPart.trim(), sunoSampleLink: sunoSampleLink.trim(), 
            audioSampleLink: audioSampleLink.trim(), submissionLink: submissionLink.trim(), 
            showcasePlaylistLink: showcasePlaylistLink.trim(), dueDate, additionalDetails: additionalDetails.trim()
        };

        const formattedDueDate = new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        let challengeTag = challengeName.trim().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '') || "MusicChallenge";
        
        let dynamicHashtags = new Set<string>();
        if (currentChallenge.genre) dynamicHashtags.add(`#${currentChallenge.genre.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}`);
        if (currentChallenge.themeOrKeyword) dynamicHashtags.add(`#${currentChallenge.themeOrKeyword.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}`);
        
        const finalHashtags = `#SparkTuneChallenge #${challengeTag} #AIMusic #MusicChallenge #CreativeSpark #AICommunity ${Array.from(dynamicHashtags).join(' ')}`;

        // --- Generate Announcement Post ---
        let announcement = `🎉🔊 **MEGA MUSIC ALERT: Announcing the "[${currentChallenge.challengeName}]" Challenge!** 🔊🎉\n`;
        announcement += `Brought to you by the legendary: ${currentChallenge.organizedBy}\n\n`;
        announcement += `Hey Music Mavericks & AI Virtuosos! 🚀 Get ready to ignite your creativity! The SparkTune challenge is ON!\n`;
        announcement += `Craft something truly mind-blowing with AI and let the world hear your genius!\n\n`;
        announcement += `--- \n\n`;
        announcement += `✨ **YOUR EPIC QUEST (The Prompt!):** ✨\n`;
        if (currentChallenge.genre) announcement += `🎶 **Genre Fusion:** ${currentChallenge.genre}\n`; else announcement += `🎶 **Genre Fusion:** Surprise us!\n`;
        if (currentChallenge.mood) announcement += `🤩 **Mood Canvas:** ${currentChallenge.mood}\n`; else announcement += `🤩 **Mood Canvas:** Let your feelings guide you!\n`;
        if (currentChallenge.instrumentation) announcement += `🎹 **Instrumental Arsenal:** ${currentChallenge.instrumentation}\n`; else announcement += `🎹 **Instrumental Arsenal:** Anything goes!\n`;
        if (currentChallenge.themeOrKeyword) announcement += `💡 **Theme/Keyword Focus:** ${currentChallenge.themeOrKeyword}\n`;
        if (currentChallenge.vocalStyle) announcement += `🎙️ **Vocal Style:** ${currentChallenge.vocalStyle}\n`;
        if (currentChallenge.tempo) announcement += `💨 **Tempo Target:** ${currentChallenge.tempo}\n`;
        if (currentChallenge.durationConstraint) announcement += `⏱️ **Beat the Clock (Duration):** ${currentChallenge.durationConstraint}\n`;
        if (currentChallenge.lyricPart) announcement += `🎤 **The Golden Line (Must-Include Lyric/Theme):** "${currentChallenge.lyricPart}"\n`;
        
        if (currentChallenge.negativeConstraints) {
            announcement += `\n🚫 **The Twist (Banned Elements/Constraints):**\n${currentChallenge.negativeConstraints}\n`;
        }
        if (currentChallenge.additionalDetails) {
            announcement += `\n📜 **THE SCROLL OF RULES (Additional Details & Guidelines):**\n${currentChallenge.additionalDetails}\n`;
        }
        announcement += `\n---\n`;

        if (currentChallenge.sunoSampleLink) announcement += `\n🎧 **Tune In! Get Inspired by this Suno Sample:**\n${currentChallenge.sunoSampleLink}\n`;
        if (currentChallenge.audioSampleLink) announcement += `\n🎶 **Vibe Check! Listen to this Audio Sample (for inspiration/reference):**\n${currentChallenge.audioSampleLink}\n`;
        if (currentChallenge.submissionLink) announcement += `\n✅ **SUBMIT YOUR ENTRY HERE:**\n${currentChallenge.submissionLink}\n`;
        if (currentChallenge.showcasePlaylistLink) announcement += `\n🌟 **Hall of Fame! Accepted Anthems will be Featured Here:**\n${currentChallenge.showcasePlaylistLink}\n`;
        announcement += `\n---\n\n`;
        announcement += `🗓️ **MARK YOUR CALENDARS! Submission Deadline:** **${formattedDueDate}**! 🗓️\n\n`;
        announcement += `We're absolutely buzzing to hear your sonic creations! 🎧💥\n`;
        announcement += `Good luck, have an absolute blast, and may the most creative tune echo through the cosmos! 🥳\n`;
        announcement += finalHashtags;

        setGeneratedAnnouncementPost(announcement);

        // --- Generate Reminder Post ---
        let reminder = `🔔 **CHALLENGE REMINDER: Time to Shine with "[${currentChallenge.challengeName}]"!** 🔥\n`;
        reminder += `Brought to you by the fantastic: ${currentChallenge.organizedBy}\n\n`;
        reminder += `Hey SparkTune Superstars! Just a friendly nudge – the clock is ticking and your masterpiece awaits! ⏰ Don't let this awesome challenge slip by!\n\n`;
        reminder += `🗓️ **FINAL COUNTDOWN! Deadline:** **${formattedDueDate}**! 🗓️\n\n`;
        reminder += `**Quick Recap of Your Mission:**\n`;
        if (currentChallenge.themeOrKeyword) reminder += `- **Theme:** ${currentChallenge.themeOrKeyword}\n`;
        if (currentChallenge.lyricPart) reminder += `- **Must-Include:** "${currentChallenge.lyricPart}"\n`;
        reminder += `- **Vibe:** ${[currentChallenge.genre, currentChallenge.mood].filter(Boolean).join(' / ') || 'Anything goes!'}\n\n`;
        if (currentChallenge.submissionLink) reminder += `**Submit Here:** ${currentChallenge.submissionLink}\n`;
        if (currentChallenge.showcasePlaylistLink) reminder += `**View Showcase:** ${currentChallenge.showcasePlaylistLink}\n`;
        reminder += `\nGet those creative juices flowing and let's hear the AI magic! 🎶✨\n`;
        reminder += finalHashtags;
        
        setGeneratedReminderPost(reminder);
        
        setActivePostTab('announcement');
        saveChallenge(currentChallenge);
        trackLocalEvent(TOOL_CATEGORY, 'postGenerated', challengeName.trim());
    };

    const handleCopyGeneratedPost = () => {
        const postToCopy = activePostTab === 'announcement' ? generatedAnnouncementPost : generatedReminderPost;
        if (postToCopy) {
            navigator.clipboard.writeText(postToCopy).then(() => {
                setCopyPostStatus('Rockstar! Copied to Clipboard!');
                setTimeout(() => setCopyPostStatus(''), 2500);
            }).catch(err => {
                setCopyPostStatus('Oops! Copy Failed.');
                console.error("Failed to copy post:", err);
            });
        }
    };
    
    const loadChallengeToForm = (challenge: SparkTuneChallengeData) => {
        setChallengeName(challenge.challengeName);
        setOrganizedBy(challenge.organizedBy);
        setGenre(challenge.genre);
        setMood(challenge.mood);
        setInstrumentation(challenge.instrumentation);
        setThemeOrKeyword(challenge.themeOrKeyword || '');
        setVocalStyle(challenge.vocalStyle || '');
        setTempo(challenge.tempo || '');
        setNegativeConstraints(challenge.negativeConstraints || '');
        setDurationConstraint(challenge.durationConstraint);
        setLyricPart(challenge.lyricPart);
        setSunoSampleLink(challenge.sunoSampleLink);
        setAudioSampleLink(challenge.audioSampleLink || '');
        setSubmissionLink(challenge.submissionLink);
        setShowcasePlaylistLink(challenge.showcasePlaylistLink);
        setAdditionalDetails(challenge.additionalDetails || '');
        setDueDate(challenge.dueDate);
        
        setGeneratedAnnouncementPost(''); 
        setGeneratedReminderPost('');
        setActivePostTab('announcement');
        
        setShowLoadModal(false);
        trackLocalEvent(TOOL_CATEGORY, 'challengeLoaded', challenge.challengeName);
    };

    return (
        <div className="w-full">
            <header className="mb-10 text-center">
                <h1 className="text-5xl font-extrabold text-green-600 dark:text-green-400">SparkTune Challenge Generator</h1>
                <p className="mt-3 text-md text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                    Ignite creativity! Design, manage, and share electrifying music challenges for your community.
                </p>
            </header>

            <main className="w-full bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 md:p-10 border-2 border-green-600 dark:border-green-500 transition-colors duration-300">
                <div className="grid md:grid-cols-2 gap-x-8">
                    {/* Column 1: Setup & Prompt */}
                    <div className="space-y-4">
                        <CollapsibleSection title="1. Challenge Basics" defaultOpen>
                          <InputField id="challengeName" label="Challenge Name" value={challengeName} onChange={setChallengeName} placeholder="e.g., Galactic Grooves Contest" required />
                          <InputField id="organizedBy" label="Organized By" value={organizedBy} onChange={setOrganizedBy} placeholder="e.g., Your Discord Handle or Group Name" required />
                          <InputField type="date" id="dueDate" label="Submission Deadline" value={dueDate} onChange={setDueDate} required />
                        </CollapsibleSection>
                        
                        <CollapsibleSection title="2. The Musical Mission" defaultOpen>
                            <div className="flex items-end gap-2 mb-4">
                                <InputField id="genre" label="Genre Focus" value={genre} onChange={setGenre} placeholder="e.g., Cosmic Disco" className="flex-grow mb-0" />
                                <button onClick={() => setGenre(getRandomItem(predefinedGenres))} className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm whitespace-nowrap">Randomize!</button>
                            </div>
                            <div className="flex items-end gap-2 mb-4">
                                <InputField id="mood" label="Mood/Atmosphere Target" value={mood} onChange={setMood} placeholder="e.g., Euphoric & Spacey" className="flex-grow mb-0" />
                                <button onClick={() => setMood(getRandomItem(predefinedMoods))} className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm whitespace-nowrap">Randomize!</button>
                            </div>
                            <div className="flex items-end gap-2 mb-4">
                                <InputField id="instrumentation" label="Key Instrumentation Suggestion" value={instrumentation} onChange={setInstrumentation} placeholder="e.g., Laser Harps & Funky Basslines" className="flex-grow mb-0" />
                                <button onClick={() => setInstrumentation(getRandomItem(predefinedInstrumentations))} className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm whitespace-nowrap">Randomize!</button>
                            </div>
                            <div className="flex items-end gap-2 mb-4">
                                <InputField id="themeOrKeyword" label="Theme / Keyword (Optional)" value={themeOrKeyword} onChange={setThemeOrKeyword} placeholder="e.g., Alien Jungle Party" className="flex-grow mb-0" info="A central theme or keyword to inspire creations." />
                                <button onClick={() => setThemeOrKeyword(getRandomItem(predefinedThemes))} className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm whitespace-nowrap">Randomize!</button>
                            </div>
                             <div className="flex items-end gap-2 mb-4">
                                <InputField id="vocalStyle" label="Vocal Style (Optional)" value={vocalStyle} onChange={setVocalStyle} placeholder="e.g., Female Vocals, Instrumental" className="flex-grow mb-0" />
                                <button onClick={() => setVocalStyle(getRandomItem(predefinedVocalStyles))} className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm whitespace-nowrap">Randomize!</button>
                            </div>
                            <InputField id="tempo" label="Tempo (BPM) (Optional)" value={tempo} onChange={setTempo} placeholder="e.g., 120 BPM, 90-100 BPM" className="mb-4" />
                            <InputField id="durationConstraint" label="Duration Goal" value={durationConstraint} onChange={setDurationConstraint} placeholder="e.g., Around 2:00 minutes" info="Examples: 'Max 1:30', 'Between 2:00 and 3:00', 'Exactly 1:00'" />
                            <TextAreaField id="lyricPart" label="Mandatory Lyric/Theme Element" value={lyricPart} onChange={setLyricPart} placeholder="e.g., 'The stars are aligning tonight!'" rows={4} className="mb-4" info="A specific phrase, line, or core theme that participants must incorporate into their song." />
                            <InputField id="negativeConstraints" label="Negative Constraints / Banned Elements (Optional)" value={negativeConstraints} onChange={setNegativeConstraints} placeholder="e.g., No guitars, must be A-cappella" info="Add a fun twist by forbidding certain elements." />
                        </CollapsibleSection>
                    </div>

                    {/* Column 2: Links, Details & Actions */}
                    <div className="space-y-4">
                        <CollapsibleSection title="3. Hubs & Timelines">
                            <InputField type="url" id="sunoSampleLink" label="Inspirational Suno Track Link" value={sunoSampleLink} onChange={setSunoSampleLink} placeholder="https://suno.com/song/..." info="Link to a Suno song for vibe/inspiration (optional)." />
                            <InputField type="url" id="audioSampleLink" label="Inspirational Audio Sample Link" value={audioSampleLink} onChange={setAudioSampleLink} placeholder="e.g., YouTube, Soundcloud..." info="Link to a non-Suno audio sample for inspiration (optional)." />
                            <InputField type="url" id="submissionLink" label="Submission Link" value={submissionLink} onChange={setSubmissionLink} placeholder="e.g., Discord channel link, Google Form" info="Where participants should submit their entries." />
                            <InputField type="url" id="showcasePlaylistLink" label="Hall of Fame Playlist Link" value={showcasePlaylistLink} onChange={setShowcasePlaylistLink} placeholder="https://youtube.com/playlist?list=..." info="Link to your public playlist for featuring accepted entries (optional)." />
                            <TextAreaField id="additionalDetails" label="Extra Rules & Juicy Details" value={additionalDetails} onChange={setAdditionalDetails} placeholder="e.g., No covers allowed, judging criteria, bonus points for..." rows={5} className="mb-4" info="Any other specific rules, guidelines, or fun details for the challenge (optional)." />
                        </CollapsibleSection>

                        <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700 space-y-3">
                             <button onClick={handleGeneratePost} className="w-full py-2.5 px-4 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-md text-md transition-colors">Craft My Challenge Posts!</button>
                             <button onClick={() => setShowLoadModal(true)} className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md text-sm">Load Previous Challenges ({savedChallenges.length})</button>
                        </div>
                    </div>
                </div>
                
                {(generatedAnnouncementPost || generatedReminderPost) && (
                    <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-3">Your Generated Posts:</h2>
                        <div className="flex border-b border-gray-300 dark:border-gray-600 mb-2">
                            <button onClick={() => setActivePostTab('announcement')} className={`py-2 px-4 text-sm font-medium ${activePostTab === 'announcement' ? 'border-b-2 border-green-600 dark:border-green-400 text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}>🎉 Announcement</button>
                            <button onClick={() => setActivePostTab('reminder')} className={`py-2 px-4 text-sm font-medium ${activePostTab === 'reminder' ? 'border-b-2 border-green-600 dark:border-green-400 text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}>🔔 Reminder</button>
                        </div>
                        <TextAreaField id="generatedPostOutput" label="" value={activePostTab === 'announcement' ? generatedAnnouncementPost : generatedReminderPost} onChange={() => {}} rows={18} readOnly/>
                        <button onClick={handleCopyGeneratedPost} className="mt-2 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm" disabled={copyPostStatus === 'Rockstar! Copied to Clipboard!' || copyPostStatus === 'Oops! Copy Failed.'}>
                            {copyPostStatus || `Copy ${activePostTab === 'announcement' ? 'Announcement' : 'Reminder'}`}
                        </button>
                    </div>
                )}

                {showLoadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-green-500 max-h-[80vh] flex flex-col">
                            <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-2 z-10">Load a Past Challenge Adventure</h3>
                            {savedChallenges.length > 0 ? (
                                <ul className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 flex-grow space-y-2">
                                    {savedChallenges.map(challenge => (
                                        <li key={challenge.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer border border-gray-300 dark:border-gray-600 transition-all hover:border-green-400" onClick={() => loadChallengeToForm(challenge)}>
                                            <p className="font-semibold text-green-800 dark:text-green-200">{challenge.challengeName}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Organized by: {challenge.organizedBy} - Due: {new Date(challenge.dueDate + 'T00:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No past adventures (challenges) found in your archive!</p>
                            )}
                            <div className="mt-4 sticky bottom-0 bg-white dark:bg-gray-800 pt-2 z-10">
                                <button onClick={() => setShowLoadModal(false)} className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Close Archive</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SparkTuneTool;
