export const TOOL_CATEGORY = 'SongStructureBuilder';
export const LOCAL_STORAGE_CURRENT_WORK_KEY = 'songStructureBuilder_currentWork_v2'; 
export const LOCAL_STORAGE_SAVED_ARRANGEMENTS_KEY = 'songStructureBuilder_savedArrangements_v1';
export const LOCAL_STORAGE_TIMELINE_HEIGHT_KEY = 'songStructureBuilder_timelineHeight_v1';

export const DEFAULT_TIMELINE_HEIGHT_PX = 400;
export const MIN_TIMELINE_HEIGHT_PX = 200;
export const MAX_TIMELINE_HEIGHT_PX = typeof window !== 'undefined' ? Math.max(300, window.innerHeight * 0.8) : 800;

export const predefinedBlockTypes = [
    "Verse", "Chorus", "Intro", "Outro", "Bridge", "Pre-Chorus", 
    "Post-Chorus", "Instrumental", "Guitar Solo", "Drop", "Build-up", "Breakdown", "Refrain"
];

export const arrangementTemplates = [
    {
        name: 'Standard Pop (VCVCBC)',
        description: 'A classic structure with verses, choruses, and a bridge.',
        structure: [
            { type: 'Verse', notes: 'Verse 1: Introduce the main character or situation.', barCount: 16 },
            { type: 'Chorus', notes: 'Main hook of the song. Should be catchy and memorable.', barCount: 8 },
            { type: 'Verse', notes: 'Verse 2: Develop the story, introduce a conflict or new idea.', barCount: 16 },
            { type: 'Chorus', notes: 'Repeat the main hook. Reinforce the central theme.', barCount: 8 },
            { type: 'Bridge', notes: 'A change of pace. Lyrically and musically different, provides a new perspective.', barCount: 8 },
            { type: 'Chorus', notes: 'Final chorus, often with more energy or ad-libs.', barCount: 8 },
            { type: 'Outro', notes: 'Fade out or conclusive ending.', barCount: 4 },
        ]
    },
    {
        name: 'Pop with Pre-Chorus',
        description: 'Standard pop form with a Pre-Chorus to build energy.',
        structure: [
            { type: 'Verse', notes: 'Verse 1: Set the scene, introduce the narrative.', barCount: 8 },
            { type: 'Pre-Chorus', notes: 'Build tension and anticipation for the chorus.', barCount: 4 },
            { type: 'Chorus', notes: 'Main hook of the song, high energy.', barCount: 8 },
            { type: 'Verse', notes: 'Verse 2: Develop the story or present a new angle.', barCount: 8 },
            { type: 'Pre-Chorus', notes: 'Repeat the buildup section.', barCount: 4 },
            { type: 'Chorus', notes: 'Repeat the main hook.', barCount: 8 },
            { type: 'Bridge', notes: 'A contrasting section for a change of pace.', barCount: 8 },
            { type: 'Chorus', notes: 'Final, powerful chorus.', barCount: 8 }
        ]
    },
     {
        name: 'Pop with Post-Chorus',
        description: 'Modern structure using a Post-Chorus to extend the hook.',
        structure: [
            { type: 'Verse', notes: 'Verse 1: Keep it relatively sparse and narrative-focused.', barCount: 16 },
            { type: 'Chorus', notes: 'The main, high-energy hook.', barCount: 8 },
            { type: 'Post-Chorus', notes: 'An instrumental or vocal hook that extends the chorus vibe.', barCount: 4 },
            { type: 'Verse', notes: 'Verse 2: New lyrics, similar energy to Verse 1.', barCount: 16 },
            { type: 'Chorus', notes: 'Main hook again.', barCount: 8 },
            { type: 'Post-Chorus', notes: 'Repeat the post-chorus hook.', barCount: 4 },
            { type: 'Bridge', notes: "A complete departure to reset the listener's ear.", barCount: 8 },
            { type: 'Chorus', notes: 'Final main hook.', barCount: 8 },
            { type: 'Post-Chorus', notes: 'Final post-chorus hook to end strong.', barCount: 4 },
            { type: 'Outro', notes: 'Conclusive ending or fade out.', barCount: 4 }
        ]
    },
    {
        name: 'Simple (VCVC)',
        description: 'A straightforward verse-chorus structure.',
        structure: [
            { type: 'Verse', notes: 'Verse 1: Set the scene.', barCount: 8 },
            { type: 'Chorus', notes: 'The main idea.', barCount: 8 },
            { type: 'Verse', notes: 'Verse 2: Continue the story.', barCount: 8 },
            { type: 'Chorus', notes: 'Repeat the main idea.', barCount: 8 },
        ]
    },
    {
        name: 'Verse-Refrain Form',
        description: 'Each verse is followed by a recurring line or phrase (the refrain).',
        structure: [
            { type: 'Verse', notes: 'Verse 1: Main lyrical content for the first section.', barCount: 8 },
            { type: 'Refrain', notes: 'The recurring line or phrase that summarizes the theme.', barCount: 4 },
            { type: 'Verse', notes: 'Verse 2: New lyrical content for the second section.', barCount: 8 },
            { type: 'Refrain', notes: 'Repeat the recurring line or phrase.', barCount: 4 },
            { type: 'Verse', notes: 'Verse 3: Final lyrical content.', barCount: 8 },
            { type: 'Refrain', notes: 'Repeat the recurring line one last time.', barCount: 4 }
        ]
    },
    {
        name: 'Strophic / Ballad Form',
        description: 'Common in folk, hymns, and ballads. All verses have the same music.',
        structure: [
            { type: 'Verse', notes: 'Stanza 1: Introduce the main story.', barCount: 8 },
            { type: 'Verse', notes: 'Stanza 2: Continue the narrative.', barCount: 8 },
            { type: 'Verse', notes: 'Stanza 3: Further development or emotional shift.', barCount: 8 },
            { type: 'Verse', notes: 'Stanza 4: Concluding thoughts or resolution.', barCount: 8 }
        ]
    },
    {
        name: 'EDM Structure',
        description: 'Common structure for electronic dance music.',
        structure: [
            { type: 'Intro', notes: 'Atmospheric intro, build tension.', barCount: 8 },
            { type: 'Build-up', notes: 'Increase energy, add snare rolls, risers.', barCount: 8 },
            { type: 'Drop', notes: 'The main instrumental payoff. High energy.', barCount: 16 },
            { type: 'Breakdown', notes: 'A quieter, simpler section to provide contrast.', barCount: 8 },
            { type: 'Build-up', notes: 'Second buildup, often shorter or more intense.', barCount: 8 },
            { type: 'Drop', notes: 'Second drop, may have variations from the first.', barCount: 16 },
            { type: 'Outro', notes: 'Fade out the elements.', barCount: 8 },
        ]
    },
    {
        name: 'AABA Form',
        description: 'A classic 32-bar form, common in jazz and early pop.',
        structure: [
            { type: 'Verse', notes: 'A Section: Main theme or idea (e.g., 8 bars).', barCount: 8 },
            { type: 'Verse', notes: 'A Section: Repeat of the main theme, perhaps with different lyrics (e.g., 8 bars).', barCount: 8 },
            { type: 'Bridge', notes: 'B Section: The contrasting bridge, new melody and chords (e.g., 8 bars).', barCount: 8 },
            { type: 'Verse', notes: 'A Section: Return to the main theme (e.g., 8 bars).', barCount: 8 },
        ]
    }
];
