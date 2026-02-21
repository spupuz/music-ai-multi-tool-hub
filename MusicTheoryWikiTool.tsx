
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOMServer from 'react-dom/server';
import type { ToolProps } from './Layout';

const TOOL_CATEGORY = 'MusicTheoryWiki';

interface WikiTopic {
  id: string;
  title: string;
  category: string;
  // Fix: Replaced JSX.Element with React.ReactElement
  content: React.ReactElement;
  keywords: string[]; // Added for search
}

// Helper for content styling - Updated for Light/Dark Mode
const H3: React.FC<{children: React.ReactNode}> = ({children}) => <h3 className="text-2xl font-semibold text-green-700 dark:text-green-300 mt-6 mb-3">{children}</h3>;
const P: React.FC<{children: React.ReactNode}> = ({children}) => <p className="mb-3 leading-relaxed text-gray-800 dark:text-gray-300">{children}</p>;
const UL: React.FC<{children: React.ReactNode}> = ({children}) => <ul className="list-disc list-inside pl-4 mb-3 space-y-1 text-gray-800 dark:text-gray-300">{children}</ul>;
const LI: React.FC<{children: React.ReactNode}> = ({children}) => <li>{children}</li>;
const CODE: React.FC<{children: React.ReactNode}> = ({children}) => <code className="bg-gray-200 dark:bg-gray-700 text-sm text-yellow-700 dark:text-yellow-300 px-1.5 py-0.5 rounded-md font-mono">{children}</code>;
const PRE: React.FC<{children: React.ReactNode}> = ({children}) => <pre className="bg-gray-800 dark:bg-gray-700 p-3 rounded-md text-sm text-yellow-300 overflow-x-auto mb-3">{children}</pre>;
const STRONG: React.FC<{children: React.ReactNode}> = ({children}) => <strong className="font-semibold text-green-700 dark:text-green-200">{children}</strong>;


const wikiTopics: WikiTopic[] = [
  // Song Structure
  {
    id: 'what-is-a-verse', category: 'Song Structure', title: 'What is a Verse?',
    keywords: ['lyrics', 'narrative', 'story', 'section', 'melody', 'harmony', 'verse'],
    content: (
      <>
        <P>A verse is a main section of a song that typically features new lyrical content with each repetition. Verses drive the song's narrative or develop its themes.</P>
        <P>Musically, all verses in a song usually share the same melody, harmony, and rhythmic structure, though variations can occur. They often contrast with the chorus to build dynamics.</P>
        <UL>
          <LI>Tells the story or sets the scene.</LI>
          <LI>Lyrics change, music often stays similar for each verse.</LI>
          <LI>Leads into a pre-chorus or chorus.</LI>
        </UL>
        <P><STRONG>In AI Prompts (e.g., Suno):</STRONG> Use tags like <CODE>[Verse]</CODE> or <CODE>[Verse 1]</CODE>, <CODE>[Verse 2]</CODE> to denote these sections. You can describe the lyrical theme or mood: e.g., <CODE>[Verse] [telling a story about a journey, melancholic mood]</CODE>.</P>
      </>
    )
  },
  {
    id: 'what-is-a-chorus', category: 'Song Structure', title: 'What is a Chorus?',
    keywords: ['hook', 'main idea', 'repeated section', 'energetic', 'memorable', 'chorus'],
    content: (
      <>
        <P>The chorus is the most memorable and often repeated section of a song. It usually contains the main lyrical and melodic ideas (the "hook") and summarizes the song's central theme or message.</P>
        <P>Musically, the chorus tends to be more energetic or "bigger" sounding than the verse and often has the same lyrics and melody each time it appears.</P>
        <UL>
          <LI>Contains the main message or hook.</LI>
          <LI>Lyrics and music usually repeat each time.</LI>
          <LI>Often the loudest or most intense part of the song.</LI>
        </UL>
        <P><STRONG>In AI Prompts:</STRONG> Use <CODE>[Chorus]</CODE>. This is a critical tag. You can emphasize its energy: e.g., <CODE>[Chorus] [powerful, uplifting, with layered vocals]</CODE>.</P>
      </>
    )
  },
  {
    id: 'what-is-a-bridge', category: 'Song Structure', title: 'What is a Bridge?',
    keywords: ['contrast', 'variation', 'new melody', 'key change', 'connection', 'bridge'],
    content: (
      <>
        <P>A bridge is a contrasting section that typically occurs only once in a song, often after the second chorus. It provides a musical and lyrical departure from the verse and chorus.</P>
        <P>Bridges can introduce a new perspective, a shift in the narrative, a different melody, chord progression, or even a key change. Its purpose is to add variety and build anticipation for a return to the chorus or a final section.</P>
        <UL>
          <LI>Provides contrast and variation.</LI>
          <LI>Often features different chords, melody, and lyrics.</LI>
          <LI>Connects two sections of a song, often leading back to a final chorus.</LI>
        </UL>
        <P><STRONG>In AI Prompts:</STRONG> Use <CODE>[Bridge]</CODE>. Describe its intended feeling or musical shift: e.g., <CODE>[Bridge] [reflective, slower tempo, minor key feel]</CODE> or <CODE>[Bridge] [builds tension, rhythmic]</CODE>.</P>
      </>
    )
  },
  {
    id: 'what-is-a-pre-chorus', category: 'Song Structure', title: 'What is a Pre-Chorus?',
    keywords: ['build-up', 'transition', 'anticipation', 'channel', 'pre-chorus'],
    content: (
      <>
        <P>A pre-chorus (also known as a "build" or "channel") is a short section that sits between a verse and a chorus. Its primary function is to create a smooth transition and build anticipation for the upcoming chorus.</P>
        <P>Musically and lyrically, it's distinct from both the verse and the chorus. It often uses a melody and harmony that create a sense of lift or tension leading into the chorus.</P>
        <UL>
          <LI>Connects the verse to the chorus.</LI>
          <LI>Builds energy or anticipation for the chorus.</LI>
          <LI>Often has the same lyrics and melody each time it appears.</LI>
        </UL>
        <P><STRONG>In AI Prompts:</STRONG> Use <CODE>[Pre-Chorus]</CODE>. Indicate its transitional nature: e.g., <CODE>[Pre-Chorus] [building intensity, rising melody]</CODE>.</P>
      </>
    )
  },
  {
    id: 'what-is-a-post-chorus', category: 'Song Structure', title: 'What is a Post-Chorus?',
    keywords: ['after-chorus', 'hook extension', 'energy release', 'transition', 'post-chorus', 'post anything'],
    content: (
      <>
        <P>A post-chorus is a section that immediately follows a chorus. It often serves to extend the energy or main idea of the chorus, or to provide a brief transition to the next section (like a verse or bridge).</P>
        <P>It can be instrumental, feature a simple vocal hook (often non-lexical or a repeated phrase), or be a simplified version of the chorus melody. Common in modern pop and electronic music.</P>
        <UL>
          <LI>Follows the chorus, acts as an extension or transition.</LI>
          <LI>Can reinforce the chorus hook or provide a brief change of pace.</LI>
          <LI>Often shorter and simpler than the chorus itself.</LI>
        </UL>
        <P><STRONG>In AI Prompts:</STRONG> Use <CODE>[Post-Chorus]</CODE>. Specify its character: e.g., <CODE>[Post-Chorus] [instrumental synth hook]</CODE>, <CODE>[Post-Chorus] (repeating vocal "oh-oh-ohs")</CODE>, or <CODE>[Post-Chorus] [short, punchy]</CODE>. You can use variations like <CODE>[Post-Verse]</CODE> or <CODE>[Post-Bridge]</CODE> for similar transitional sections after other parts if the AI understands it.</P>
      </>
    )
  },
  {
    id: 'what-is-a-drop', category: 'Song Structure', title: 'What is a Drop?',
    keywords: ['EDM', 'electronic', 'trap', 'bass-heavy', 'instrumental payoff', 'climax', 'buildup result', 'drop'],
    content: (
      <>
        <P>A drop is a key moment in many electronic dance music (EDM), trap, and some modern pop songs. It's a point where, after a buildup of tension (often called a "build" or "riser"), the rhythm and bassline suddenly "drop" back in with full force, creating a powerful instrumental payoff.</P>
        <P>The drop is typically the most energetic part of the track, designed for dancing. It often features a prominent bassline, a strong beat, and a catchy instrumental hook or synth melody, with minimal or no vocals.</P>
        <UL>
          <LI>Climactic section in EDM, trap, and related genres.</LI>
          <LI>Follows a buildup section that increases tension.</LI>
          <LI>Characterized by a sudden impact, strong bass, and rhythmic focus.</LI>
          <LI>Usually instrumental or with minimal vocal chops.</LI>
        </UL>
        <P><STRONG>In AI Prompts:</STRONG> Use <CODE>[Drop]</CODE>. It's often preceded by <CODE>[Build-up]</CODE> or <CODE>[Riser]</CODE>. Describe the intensity and sound: e.g., <CODE>[Drop] [heavy dubstep bass, hard-hitting drums]</CODE> or <CODE>[Drop] [melodic future bass chords, energetic synth lead]</CODE>.</P>
      </>
    )
  },
  {
    id: 'what-is-a-breakdown', category: 'Song Structure', title: 'What is a Breakdown?',
    keywords: ['contrast section', 'stripped-down', 'rhythmic shift', 'groove change', 'metal', 'punk', 'hip hop', 'electronic', 'breakdown'],
    content: (
      <>
        <P>A breakdown is a section in a song where the music becomes simplified, often with a change in rhythm or tempo, creating a distinct contrast to the preceding parts. It's used across many genres for different effects.</P>
        <UL>
          <LI><STRONG>Metal/Hardcore/Punk:</STRONG> Often a slower, heavier, mosh-inducing section with syncopated, chugging guitar riffs and powerful drumming.</LI>
          <LI><STRONG>Hip Hop:</STRONG> Can be a point where the beat simplifies, focusing on the drums and bass, or an instrumental break.</LI>
          <LI><STRONG>Electronic Music:</STRONG> A section where many elements drop out, perhaps leaving only a beat and a bassline, or a more atmospheric interlude before building back up.</LI>
          <LI>Generally, it's a moment of reduced complexity or a shift in groove, intended to create impact or a change of pace.</LI>
        </UL>
        <P><STRONG>In AI Prompts:</STRONG> Use <CODE>[Breakdown]</CODE>. Specify the genre context if it helps: e.g., <CODE>[Breakdown] [heavy metal, slow chugging riff]</CODE>, <CODE>[Breakdown] [funky hip hop, drum and bass focus]</CODE>, or <CODE>[Breakdown] [electronic, minimal beat, atmospheric pads]</CODE>.</P>
      </>
    )
  },
  {
    id: 'what-is-a-build-buildup', category: 'Song Structure', title: 'What is a Build / Buildup?',
    keywords: ['tension', 'rising energy', 'anticipation', 'riser', 'crescendo', 'pre-drop', 'pre-chorus variation', 'build', 'build-up'],
    content: (
      <>
        <P>A build or buildup (often also called a "riser" in electronic music) is a section designed to create musical tension and anticipation, typically leading into a more impactful section like a chorus or a drop.</P>
        <P>This is achieved by gradually adding instrumental layers, increasing rhythmic complexity (e.g., faster drum fills like snare rolls), using rising synth effects (risers), increasing volume (crescendo), and sometimes modulating pitch upwards.</P>
        <UL>
          <LI>Creates tension and anticipation for a subsequent section.</LI>
          <LI>Often involves increasing layers, volume, and rhythmic intensity.</LI>
          <LI>Commonly uses effects like risers, filter sweeps, and drum rolls.</LI>
          <LI>Ubiquitous in EDM (leading to a drop) and also found in pop, rock (leading to a powerful chorus or bridge), and post-rock.</LI>
        </UL>
        <P><STRONG>In AI Prompts:</STRONG> Use <CODE>[Build]</CODE>, <CODE>[Build-up]</CODE>, or <CODE>[Riser]</CODE>. Describe the desired effect: e.g., <CODE>[Build-up] [intense crescendo, fast snare rolls, rising synth]</CODE> or <CODE>[Build] [gradual addition of strings and percussion leading to chorus]</CODE>. Often followed by <CODE>[Drop]</CODE> or <CODE>[Chorus]</CODE>.</P>
      </>
    )
  },
  {
    id: 'what-is-an-intro-outro', category: 'Song Structure', title: 'What is an Intro/Outro?',
    keywords: ['beginning', 'ending', 'introduction', 'conclusion', 'fade in', 'fade out', 'intro', 'outro'],
    content: (
      <>
        <P><STRONG>Intro (Introduction):</STRONG> The beginning section of a song that sets the mood, key, and tempo before the main lyrical or melodic content (usually the first verse or chorus) begins. Intros can be instrumental or include non-lyrical vocals.</P>
        <P><STRONG>Outro (Conclusion):</STRONG> The ending section of a song. It provides a sense of closure. Outros can fade out, end abruptly, repeat a section, or introduce new musical material to conclude the piece.</P>
        <UL>
          <LI>Intro: Sets the stage for the song.</LI>
          <LI>Outro: Brings the song to a close.</LI>
          <LI>Can be instrumental, vocal, or a mix.</LI>
        </UL>
        <P><STRONG>In AI Prompts:</STRONG> Use <CODE>[Intro]</CODE> and <CODE>[Outro]</CODE>. Specify their character: e.g., <CODE>[Intro] [atmospheric synth pad, slow fade-in]</CODE>, <CODE>[Outro] [fades out with repeating guitar riff]</CODE>.</P>
      </>
    )
  },
  {
    id: 'what-is-an-instrumental-solo', category: 'Song Structure', title: 'What is an Instrumental / Solo?',
    keywords: ['no vocals', 'instrument feature', 'guitar solo', 'piano solo', 'break', 'instrumental', 'solo'],
    content: (
      <>
        <P>An <STRONG>instrumental section</STRONG> is a part of a song where instruments take the lead, without prominent lead vocals. It can serve as a bridge, an interlude, or simply provide a musical break.</P>
        <P>A <STRONG>solo</STRONG> is a specific type of instrumental section where one instrument is featured, often playing an improvised or composed melodic line. Common solo instruments include guitar, saxophone, piano, and drums.</P>
        <UL>
          <LI>Instrumental: Focuses on the music rather than lyrics.</LI>
          <LI>Solo: Highlights a particular instrument's performance.</LI>
          <LI>Provides musical variety and showcases instrumental skill.</LI>
        </UL>
        <P><STRONG>In AI Prompts:</STRONG> Use tags like <CODE>[Instrumental]</CODE>, <CODE>[Guitar Solo]</CODE>, <CODE>[Piano Solo]</CODE>, <CODE>[Synth Lead Break]</CODE>, etc. Be specific about the instrument and style: e.g., <CODE>[Guitar Solo] [bluesy, with heavy vibrato]</CODE> or <CODE>[Instrumental] [fast-paced, orchestral strings]</CODE>.</P>
      </>
    )
  },
  {
    id: 'what-is-a-hook-refrain', category: 'Song Structure', title: 'What is a Hook / Refrain?',
    keywords: ['catchy part', 'repeated line', 'memorable phrase', 'hook', 'refrain'],
    content: (
      <>
        <P>A <STRONG>hook</STRONG> is a short, catchy musical or lyrical phrase that stands out and is easily remembered. It's designed to "hook" the listener. Hooks can appear anywhere but are often part of the chorus.</P>
        <P>A <STRONG>refrain</STRONG> is a line or group of lines that repeat regularly throughout a song, often at the end of each verse or as part of the chorus. If the refrain is the main lyrical idea of the chorus, the terms can be used interchangeably.</P>
        <UL>
          <LI>Hook: Catchy, memorable part of the song.</LI>
          <LI>Refrain: Recurring line(s) of text.</LI>
          <LI>Often found in the chorus but can be elsewhere.</LI>
        </UL>
        <P><STRONG>In AI Prompts:</STRONG> While you might not tag "hook" directly, you can describe the desired catchiness in your chorus or other sections. E.g., <CODE>[Chorus] [very catchy melody, simple lyrics]</CODE>. For refrains within verses, you might repeat the lyrical line in your prompt for each verse.</P>
      </>
    )
  },
  {
    id: 'common-song-structures', category: 'Song Structure', title: 'Common Song Structures',
    keywords: ['form', 'arrangement', 'VCVC', 'AABA', 'structure', 'layout'],
    content: (
      <>
        <P>While there are endless variations, some common song structures include:</P>
        <UL>
          <LI><STRONG>Verse-Chorus-Verse-Chorus (VCVC):</STRONG> A very common and simple structure.</LI>
          <LI><STRONG>Verse-Chorus-Verse-Chorus-Bridge-Chorus (VCVCBC):</STRONG> Adds a bridge for contrast. This is extremely popular in many genres.</LI>
          <LI><STRONG>Verse-PreChorus-Chorus-Verse-PreChorus-Chorus (VPcCVPC):</STRONG> Uses a pre-chorus to build into the chorus.</LI>
          <LI><STRONG>Intro-Verse-Chorus-Verse-Chorus-Solo-Bridge-Chorus-Outro:</STRONG> A more extended structure often found in rock and pop.</LI>
          <LI><STRONG>AABA:</STRONG> Common in older pop, jazz standards, and some folk. 'A' sections are similar, 'B' is the contrasting bridge.</LI>
        </UL>
        <P>Understanding these structures can help you prompt AI more effectively by laying out the desired flow of your song.</P>
        <P><STRONG>In AI Prompts:</STRONG> You can list the desired sections in order in your prompt, e.g., <CODE>[Intro] [Verse 1] [Pre-Chorus] [Chorus] [Verse 2] [Pre-Chorus] [Chorus] [Guitar Solo] [Bridge] [Chorus] [Outro]</CODE>.</P>
      </>
    )
  },
  // Music Theory Basics
  {
    id: 'beats-tempo-rhythm', category: 'Music Theory Basics', title: 'Beats, Tempo (BPM) & Rhythm',
    keywords: ['pulse', 'speed', 'BPM', 'pattern', 'time', 'feel', 'groove', 'beat', 'tempo', 'rhythm'],
    content: (
      <>
        <P><STRONG>Beat:</STRONG> The basic, underlying pulse of a piece of music. It's what you tap your foot to.</P>
        <P><STRONG>Tempo:</STRONG> The speed of the beat, usually measured in Beats Per Minute (BPM). A higher BPM means a faster song.</P>
        <UL>
          <LI>Slow: ~60-80 BPM (e.g., ballads)</LI>
          <LI>Moderate: ~90-120 BPM (e.g., many pop songs)</LI>
          <LI>Fast: ~130-160+ BPM (e.g., dance music, upbeat rock)</LI>
        </UL>
        <P><STRONG>Rhythm:</STRONG> The pattern of sounds and silences in music, organized around the beat. Rhythm is created by varying the duration and accentuation of notes.</P>
        <P><STRONG>In AI Prompts:</STRONG> Specify tempo like <CODE>120 BPM</CODE>, <CODE>slow tempo</CODE>, <CODE>fast electronic beat</CODE>. Describe rhythm: <CODE>driving rhythm</CODE>, <CODE>syncopated rhythm</CODE>, <CODE>simple 4/4 beat</CODE>.</P>
      </>
    )
  },
   {
    id: 'bars-measures', category: 'Music Theory Basics', title: 'Bars / Measures',
    keywords: ['time signature', 'beats per bar', 'section length', 'phrasing', 'bar', 'measure'],
    content: (
      <>
        <P>A <STRONG>bar</STRONG> (or <STRONG>measure</STRONG>) is a segment of time defined by a given number of beats. Music is divided into bars to help organize its rhythm and structure.</P>
        <P>The number of beats in a bar is determined by the <STRONG>time signature</STRONG>. For example, in <CODE>4/4</CODE> time (the most common), there are four beats per bar, and a quarter note typically gets one beat.</P>
        <P>Song sections are often described in terms of bars, e.g., "an 8-bar verse" or "a 16-bar chorus."</P>
        <P><STRONG>In AI Prompts:</STRONG> While AI might not always precisely adhere to bar counts, you can suggest lengths for sections: <CODE>[Verse] [8 bars long]</CODE>, <CODE>[Chorus] [16 bars, energetic]</CODE>. This helps guide the AI on the relative length and pacing of different parts.</P>
      </>
    )
  },
  {
    id: 'notes-octaves', category: 'Music Theory Basics', title: 'Notes and Octaves',
    keywords: ['pitch', 'frequency', 'CDEFGAB', 'sharp', 'flat', 'semitone', 'note', 'octave'],
    content: (
      <>
        <P><STRONG>Note:</STRONG> A symbol representing a musical sound. In Western music, notes are named A, B, C, D, E, F, G. These can be modified by sharps (<CODE>#</CODE> - raising the pitch by a semitone) or flats (<CODE>b</CODE> - lowering the pitch by a semitone).</P>
        <P><STRONG>Octave:</STRONG> The interval between one musical pitch and another with double or half its frequency. When you go up or down an octave from a note (e.g., from C to the next C higher up), you are playing the "same" note but at a higher or lower pitch. Keyboards and other instruments have multiple octaves of notes.</P>
        <P><STRONG>In AI Prompts:</STRONG> You might specify a <CODE>[low octave bassline]</CODE> or <CODE>[high octave synth melody]</CODE>. While you don't usually list individual notes unless for a very specific melody, understanding that music is built from these helps conceptualize instrumental parts.</P>
      </>
    )
  },
  {
    id: 'scales-intro', category: 'Music Theory Basics', title: 'Scales (Introduction)',
    keywords: ['major scale', 'minor scale', 'modes', 'key signature', 'tonality', 'melody basis', 'scale'],
    content: (
      <>
        <P>A <STRONG>scale</STRONG> is a set of musical notes ordered by fundamental frequency or pitch. Scales form the basis for melodies and harmonies.</P>
        <P>The two most common types of scales in Western music are <STRONG>Major</STRONG> and <STRONG>Minor</STRONG> scales.</P>
        <UL>
          <LI><STRONG>Major Scale:</STRONG> Often associated with happy, bright, or triumphant sounds. (e.g., C Major: C-D-E-F-G-A-B-C)</LI>
          <LI><STRONG>Minor Scale (Natural Minor):</STRONG> Often associated with sad, melancholic, serious, or intense sounds. (e.g., A Minor: A-B-C-D-E-F-G-A)</LI>
        </UL>
        <P>There are other types of minor scales (Harmonic, Melodic) and many other scales called "modes" (like Dorian, Mixolydian) that have distinct moods.</P>
        <P><STRONG>In AI Prompts:</STRONG> Specify the desired tonality: <CODE>[C Major key]</CODE>, <CODE>[sad song in A minor]</CODE>, <CODE>[Dorian mode melody]</CODE>. This is a powerful way to influence the overall feel of the generated music.</P>
      </>
    )
  },
  {
    id: 'chords-intro', category: 'Music Theory Basics', title: 'Chords (Basic Triads)',
    keywords: ['harmony', 'triad', 'major chord', 'minor chord', 'root', 'third', 'fifth', 'progression', 'chord'],
    content: (
      <>
        <P>A <STRONG>chord</STRONG> is three or more different notes played or sung simultaneously. Chords create harmony in music.</P>
        <P>The most basic type of chord is a <STRONG>triad</STRONG>, which consists of three notes: the <STRONG>root</STRONG>, a <STRONG>third</STRONG> above the root, and a <STRONG>fifth</STRONG> above the root.</P>
        <UL>
          <LI><STRONG>Major Triad:</STRONG> Sounds happy or bright. Formed from the 1st, 3rd, and 5th notes of a major scale. (e.g., C Major chord: C-E-G)</LI>
          <LI><STRONG>Minor Triad:</STRONG> Sounds sad or melancholic. Formed from the 1st, flattened 3rd (minor third), and 5th notes of a major scale (or 1st, 3rd, 5th of a natural minor scale). (e.g., A Minor chord: A-C-E)</LI>
        </UL>
        <P>Chord progressions (sequences of chords) form the harmonic backbone of most songs.</P>
        <P><STRONG>In AI Prompts:</STRONG> You can specify <CODE>[simple major chords]</CODE>, <CODE>[minor key chord progression]</CODE>, or even list specific chords like <CODE>[Am - G - C - F]</CODE> if you have a progression in mind. The Chord Progression Generator tool can help with this!</P>
      </>
    )
  },
  // Composition Tips for AI
  {
    id: 'ai-using-tags', category: 'Composition Tips for AI', title: 'Using Structural Tags',
    keywords: ['AI prompting', 'Suno tags', 'song form', 'section markers', 'structure tags'],
    content: (
      <>
        <P>When prompting AI music generators like Suno, using structural tags is one of the most effective ways to guide the song's form. These tags tell the AI where different sections of your song should occur.</P>
        <PRE><CODE>
{`[Intro]
[Verse 1]
lyrics for the first verse...
[Pre-Chorus]
lyrics for the build-up...
[Chorus]
lyrics for the main hook...
[Verse 2]
more lyrics...
[Chorus]
same chorus lyrics...
[Guitar Solo]
[Bridge]
a lyrical or musical shift...
[Chorus]
final chorus...
[Outro]`}
        </CODE></PRE>
        <P>Common tags include: <CODE>[Intro]</CODE>, <CODE>[Verse]</CODE>, <CODE>[Pre-Chorus]</CODE>, <CODE>[Chorus]</CODE>, <CODE>[Post-Chorus]</CODE>, <CODE>[Bridge]</CODE>, <CODE>[Outro]</CODE>, <CODE>[Solo]</CODE>, <CODE>[Instrumental]</CODE>, <CODE>[Guitar Solo]</CODE>, <CODE>[Piano Solo]</CODE>, <CODE>[Synth Lead]</CODE>, <CODE>[Hook]</CODE>, <CODE>[Drop]</CODE>, <CODE>[Build-up]</CODE>, <CODE>[Breakdown]</CODE>.</P>
        <P>You can also number verses: <CODE>[Verse 1]</CODE>, <CODE>[Verse 2]</CODE>. Some AIs might recognize repetition cues like <CODE>[Chorus] (x2)</CODE> but it's often better to explicitly write out the sections if you want specific repetition.</P>
      </>
    )
  },
  {
    id: 'ai-describing-instrumentation', category: 'Composition Tips for AI', title: 'Describing Instrumentation & Mood',
    keywords: ['AI prompting', 'instruments', 'sound', 'texture', 'vibe', 'timbre', 'mood cues'],
    content: (
      <>
        <P>Beyond structure, describe the <STRONG>instrumentation</STRONG> and <STRONG>mood</STRONG> you envision for each section, or for the song overall. This helps the AI choose appropriate sounds and textures.</P>
        <P><STRONG>Overall Style Prompt (beginning of lyrics):</STRONG></P>
        <PRE><CODE>
{`[Style: Dream Pop, Shoegaze, Female Vocals, Ethereal]
[Mood: Nostalgic, Melancholic, Hopeful]
[Tempo: Slow, 90 BPM]

[Intro]
[atmospheric synth pads, distant echoing guitar]
...`}
        </CODE></PRE>
        <P><STRONG>Within Structural Tags:</STRONG></P>
        <PRE><CODE>
{`[Verse]
[gentle acoustic guitar, soft female vocals, introspective]
These are my lyrics...

[Chorus]
[full band enters, layered vocals, distorted guitars, powerful drums, uplifting mood]
This is the chorus part!

[Guitar Solo]
[epic, melodic guitar solo with delay and reverb, 80s rock feel]

[Bridge]
[quieter, piano and strings, reflective mood]
Lyrics for the bridge...`}
        </CODE></PRE>
        <UL>
          <LI>Be specific: Instead of "guitar," say "distorted electric guitar" or "fingerpicked acoustic guitar."</LI>
          <LI>Combine mood and instruments: "sad piano melody," "energetic synth arpeggio."</LI>
          <LI>Use square brackets <CODE>[]</CODE> for descriptive cues for overall style or section-specific moods/instrumentation. Parentheses <CODE>()</CODE> are typically used for ad-libs or backing vocal lines directly within the lyrical content.</LI>
        </UL>
      </>
    )
  },
  {
    id: 'ai-prompting-dynamics', category: 'Composition Tips for AI', title: 'Prompting for Dynamics & Energy',
    keywords: ['AI prompting', 'loudness', 'softness', 'energy level', 'crescendo', 'diminuendo', 'build-up', 'drop'],
    content: (
      <>
        <P>Dynamics (how loud or soft the music is) and energy levels are crucial for an engaging song. You can guide the AI on these aspects.</P>
        <UL>
          <LI><STRONG>Use descriptive words:</STRONG>
            <UL>
                <LI>For soft/low energy: <CODE>quiet</CODE>, <CODE>gentle</CODE>, <CODE>soft</CODE>, <CODE>minimal</CODE>, <CODE>sparse</CODE>, <CODE>atmospheric</CODE>, <CODE>whispered vocals</CODE>, <CODE>fade in</CODE>.</LI>
                <LI>For loud/high energy: <CODE>powerful</CODE>, <CODE>energetic</CODE>, <CODE>driving</CODE>, <CODE>intense</CODE>, <CODE>epic</CODE>, <CODE>full band</CODE>, <CODE>loud drums</CODE>, <CODE>shouted vocals</CODE>, <CODE>crescendo</CODE>.</LI>
                <LI>For transitions: <CODE>build-up</CODE>, <CODE>gradual crescendo</CODE>, <CODE>drop</CODE>, <CODE>suddenly quiet</CODE>, <CODE>fade out</CODE>.</LI>
            </UL>
          </LI>
          <LI><STRONG>Place cues strategically:</STRONG>
            <PRE><CODE>
{`[Pre-Chorus]
[music starts to build, adding drums, slight crescendo]
Getting ready for something big...

[Chorus]
[Explosive energy, full band, powerful vocals]
THIS IS THE CHORUS!`}
            </CODE></PRE>
          </LI>
          <LI><STRONG>Consider the overall arc:</STRONG> Does your song start quiet and build? Does it have dynamic peaks and valleys?</LI>
        </UL>
        <P>While AI interpretation varies, providing these cues increases the chance of getting the desired dynamic shape and energy flow in your generated music.</P>
      </>
    )
  },
  {
    id: 'alikan-overlap-technique', category: 'Composition Tips for AI', title: 'The Alikan Overlap Technique (Suno Specific)',
    keywords: ["overlap", "suno", "alikan", "seed", "adlib", "vocal layering", "instrumental overlap", "persona", "harmonic overlap", "melodic overlap", "counter-melody", "backing vocals"],
    content: (
      <>
        <P>Harmonic and Melodic Overlap is a powerful musical technique. Controlling it to a degree in Suno will enhance your musical depth and cohesion, unlocking the ability to layer melodies and harmonies effectively. This guide provides a factual breakdown of the process and key considerations to optimize success.</P>
        <P>While some parts of this technique may be common knowledge, or have been improved based on others' observations, this guide aims to offer a comprehensive and repeatable method for achieving overlap of vocal lines or key instrumental melodies/harmonies as backing to specific song parts.</P>
        
        <H3>Step 1: Seeding the Background/Core Sound</H3>
        <P>The first and most critical step is to establish what is called the contextual seed—the foundational sound you want to overlap with later.</P>
        <UL>
            <LI>Place the seed at the start of the song. Typically, 4 to 8 lines of a simple and clear melody or harmony work best. It's not always necessary to tag this section as an <CODE>[Intro]</CODE>.</LI>
            <LI>This section serves as the core sound. Pay close attention to lyric syllable counts; they need to make sense. Typically 6-8 syllables per line is optimum. Fewer syllables may result in the adlib trying to "chase" the line rather than overlap it. Too many can lead to an unpredictable structure as Suno might break it across two lines.</LI>
        </UL>
        <P>Seeding is essential for setting up the structure. Without it, achieving harmonic and melodic overlap becomes unreliable. The seed does NOT need to be put into adlib brackets at this initial stage. A good seed intro may be up to 1 minute long; this can be adjusted later (see "Covering Songs" section).</P>

        <H3>Step 2: Copy and Paste the Seed alongside your other part!</H3>
        <P>Once the seed is in place, incorporate it into the part of the song where the overlap will occur, such as the Chorus.</P>
        <UL>
            <LI><STRONG>Locate the Target Section:</STRONG> Identify where the seed will reappear (commonly dropped into the chorus).</LI>
            <LI><STRONG>Copy the Seed:</STRONG> Use the exact same structure and paste it into the target section. It can be clearer to differentiate from the main lyrics by putting the copied seed into adlib brackets <CODE>()</CODE>, or vice versa (main lyrics in adlibs, seed outside).</LI>
            <LI><STRONG>Experiment with Meta Tags and Symbols:</STRONG>
                <UL>
                    <LI>Use round brackets <CODE>()</CODE> for ad-libbing meta tags in Suno.</LI>
                    <LI>Vary where you place the seed and your new sung lines (inside or outside the tags) to influence what the AI emphasizes.</LI>
                    <LI>Try surrounding the copied structure with quotes, or symbols like <CODE>+</CODE> and <CODE>*</CODE>. This seems to make nuanced differences in how clearly Suno differentiates between the two parts.</LI>
                </UL>
            </LI>
        </UL>
        <P>This experimentation allows some control over how different singers or instruments respond to the overlap.</P>

        <H3>Step 3: Generating and Evaluating the Song</H3>
        <P>After configuring the seed and meta tags, generate the song to see if the overlap has been achieved. It is usually quite reliable, but finding something you like is another matter!</P>
        <UL>
            <LI><STRONG>Generate the Song:</STRONG> Use Suno to render the composition.</LI>
            <LI><STRONG>Listen Critically:</STRONG> Focus on whether the overlap aligns with your expectations.</LI>
            <LI><STRONG>Refine as Needed:</STRONG> If the effect is not as desired, adjust the placement of the seed, the meta tags, or the core structure.</LI>
            <LI><STRONG>Be Patient:</STRONG> There's a lot going on to hit the sweet spots that work.</LI>
        </UL>

        <H3>Other Factors to Consider and how to improve on your result!</H3>
        
        <H3>A) Genre/Style Tags and Model Versions</H3>
        <UL>
            <LI><STRONG>Genre Tags:</STRONG> Clarity of the overlap depends on the genre or style tags used. Tags like “minimalist” or “acoustic” often enhance the effect, while complex tags like “experimental” may hinder clarity.</LI>
            <LI><STRONG>Model Versions:</STRONG>
                <UL>
                    <LI><STRONG>V4 (and later, as applicable):</STRONG> Generally best for achieving clear and well-defined overlaps.</LI>
                    <LI><STRONG>V3.5:</STRONG> Can work with simpler and shorter seeds but may struggle with complex overlaps (i.e., two clear vocal lines sung simultaneously). It can be done, e.g., <a href="https://suno.com/song/0ebbb564-1787-43a8-a89d-97d707a82c77" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Suno Example by Alikan</a>.</LI>
                </UL>
            </LI>
        </UL>

        <H3>B) Beyond Vocals: Instrumental Overlap</H3>
        <P>This technique is not limited to vocals. Written lyrics can be used to encourage an instrument, such as using ‘OOOs’ with a Theremin tag. Knowing this, you can produce instrumental-like effects that layer effectively in the overlap.</P>

        <H3>C) Covering vs. Extending Songs</H3>
        <UL>
            <LI><STRONG>Covering Songs:</STRONG> The overlap effect is usually preserved when covering existing songs that have an overlap. This method allows for creative variation while maintaining the integrity of the overlap. Covering also allows you to DELETE the entire seed section from the prompt; the cover will retain the context and the overlap will appear as it did without the long intro.</LI>
            <LI><STRONG>Extending Songs:</STRONG> Adding new sections (e.g., additional verses or choruses) can disrupt the overlap unless the effect has been firmly established in earlier parts of the song at least once. If you extend before the first chorus where the overlap is meant to occur, it is more likely to vanish.</LI>
        </UL>

        <H3>D) Vocal Quality Issues</H3>
        <P>Overlap success can sometimes result in vocal distortions. It's thought that too many layers (e.g., 3+ simultaneous melodic layers + backing) might be a limit.</P>
        <UL>
            <LI>Remember these limits are common and may require patience during generation. If you get close to something you like, use a "Cover" to clean up and rebuild any missing final part and get a better version.</LI>
            <LI>Generating multiple versions and refining style meta tags as you progress can help achieve a better balance between overlap clarity and vocal quality. It's not possible to "one-shot" every song.</LI>
            <LI>Some genres do not like to play together (e.g., Theremin + Metal often wipes the Theremin out). In these cases, it's best to add the conflicting element (like Metal) via an "Extend" command, then strengthen it with a "Cover" of the entire song with the conflicting element in the meta-tags.</LI>
        </UL>

        <H3>E) Using Personas</H3>
        <P>When a working overlap is achieved, saving it as a Persona can streamline future attempts.</P>
        <UL>
            <LI><STRONG>What is a Persona?</STRONG> A saved configuration of meta tags, style choices, and a snapshot of song structure that can be replicated or used as a source seed. This works because it will include the overlap effect.</LI>
            <LI><STRONG>Benefits:</STRONG> Personas increase the success rate of future overlaps and serve as templates for further exploration. Note: very short personas are more likely to have less variation.</LI>
        </UL>

        <H3>Additional Observations</H3>
        <UL>
            <LI><STRONG>Language Differences:</STRONG> Lyrical overlap tends to work better when the languages in the seed and target sections are vastly different. For example, using Japanese backing vocals with an English chorus often yields clearer overlaps, likely because Suno’s AI can distinguish the parts more effectively. Pairing languages with contrasting phonetic and tonal qualities can further enhance distinction.</LI>
        </UL>
        
        <H3>Template Notes (General Advice)</H3>
        <UL>
            <LI>Older guides to Suno sometimes mentioned avoiding commas or periods. While this is not a strict rule, using double new lines between sections can improve clarity for the AI (and for you).</LI>
            <LI>Pay special attention to chorus structure. For example, overlapping 'ooo's might end up in an adlib section <CODE>()</CODE> on the SAME LINE as the main sung lyrics.</LI>
        </UL>
        
        <P><STRONG>-- WARNING: The specific example prompt below may no longer work as expected due to changes in Suno AI models (e.g., post-V4.5 updates). It is provided for legacy/illustrative purposes. --</STRONG></P>
        <P>Apologies for any disappointment if the example does not replicate perfectly.</P>
        <H3>Legacy Example Prompt: Summon your own Theremin!</H3>
        <PRE><CODE>
{`[Genre Style:Rock halloween, theremin synth, powershow]
[Persona: https://suno.com/persona/ace96380-1c73-4503-8424-7e89420ee51f (optional)]

[theremin]
ooo-oooo-oo-ooo
ooo-oooo-oo-ooo
ooo-oooo-oo-ooo
ooo-oooo-oo-ooo
ooo-oooo-oo-ooo
ooo-oooo-oo-ooo
ooo-oooo-oo-ooo

[Power guitar riff, Mystical]  
Through the veil, where the shadows sleep,  
The shimmer fades, the silence deep.  
A voice calls out, through fractured skies,  
A new world born, where the echoes lie.  

[Verse 1]
[Driving bass, Mystical tone]  
Beneath the stars, a trembling hum,  
A theremin’s song, the time has come.  
Threads of light in a spectral weave,  
Binding the void with a melody.  

[Pre-Chorus]
[Haunting vocals, Percussive build-up]  
From the ashes, a song takes flight,  
Piercing the dark with spectral light.  
A trembling call, the ether bends,  
A mystic thread that never ends.  

[Chorus]  
(ooo-oooo-oo-ooo) Summon the theremin, let it wail,  
(ooo-oooo-oo-ooo) A voice of the cosmos, a ghostly tale.  
(ooo-oooo-oo-ooo) In the new world, where the shimmer fades,  
(ooo-oooo-oo-ooo) Echoes arise in eternal waves.  

[Verse 2]
[Soft dynamics, Atmospheric guitar]  
Winds that whisper in the shattered glow,  
Stories of realms we’ll never know.  
A beacon rising, a sound profound,  
Carving the air with a phantom sound.  

[Pre-Chorus]
[Rising tension, Ethereal backing vocals]  
The fabric tears, the music grows,  
Through endless voids, the rhythm flows.  
A sound that shapes the formless night,  
Leading us forth to endless light.  

[Chorus]  
(ooo-oooo-oo-ooo) Summon the theremin, let it wail,  
(ooo-oooo-oo-ooo) A voice of the cosmos, a ghostly tale.  
(ooo-oooo-oo-ooo) In the new world, where the shimmer fades,  
(ooo-oooo-oo-ooo) Echoes arise in eternal waves.  

[Bridge]
[Instrumental crescendo, Theremin solo with dynamic drums]  
[A climactic build, layers of guitar and theremin]  
[theremin]
(ooo-oooo-oo-ooo)
Let the waves collide, let the echoes sing,  
In the heart of void, let the music ring.`}
        </CODE></PRE>
        <P>Which (historically) gave results like: <a href="https://suno.com/song/b7c45cc1-f44b-45aa-89d2-9a03f1b50eaf" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Suno Song Example 1</a></P>
        <P>And a few versions later, by using "Cover" and removing the seed section from the prompt: <a href="https://suno.com/song/1c0ccd72-8163-499f-a71e-a7ace588bfc9" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Suno Song Example 2 (Covered/Refined)</a></P>

        <H3>Final Notes</H3>
        <P>Achieving Harmonic and Melodic Overlap with Suno requires careful seeding, strategic placement, and a willingness to experiment with tags and styles. By adhering to these steps and considerations, creators can reliably produce cohesive and dynamic songs. While the process may require patience, the results are worth the effort and unlock a whole new way to differentiate your music.</P>
        <P>I hope you find some of this useful to make better music with Suno.</P>
      </>
    )
  }
];

const MusicTheoryWikiTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(wikiTopics[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(wikiTopics.map(topic => topic.category))).sort();
    return uniqueCategories;
  }, []); // Depends only on the static wikiTopics

  useEffect(() => {
    // Initialize expandedCategories: all categories initially collapsed or based on some logic
    const initialExpansionState: Record<string, boolean> = {};
    categories.forEach(cat => initialExpansionState[cat] = false); // Start all collapsed
    
    // Attempt to expand the category of the initially selected topic
    const initialTopic = wikiTopics.find(topic => topic.id === selectedTopicId);
    if (initialTopic) {
      initialExpansionState[initialTopic.category] = true;
    } else if (categories.length > 0) {
      // Fallback: expand the first category if the initial topic wasn't found or isn't set
      initialExpansionState[categories[0]] = true; 
    }
    setExpandedCategories(initialExpansionState);
  }, [selectedTopicId, categories]);


  const filteredWikiTopics = useMemo(() => {
    if (!searchTerm.trim()) {
      return wikiTopics;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return wikiTopics.filter(topic => {
      const titleMatch = topic.title.toLowerCase().includes(lowerSearchTerm);
      const keywordMatch = topic.keywords.some(keyword => keyword.toLowerCase().includes(lowerSearchTerm));
      
      let contentText = '';
      try {
        const htmlContent = ReactDOMServer.renderToStaticMarkup(topic.content);
        // Remove HTML tags and normalize whitespace (replace multiple spaces/newlines with a single space then trim)
        contentText = htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s\s+/g, ' ').trim().toLowerCase();
      } catch (e) {
        console.error("Error processing topic content for search:", topic.title, e);
      }
      const contentMatch = contentText.includes(lowerSearchTerm);
  
      return titleMatch || keywordMatch || contentMatch;
    });
  }, [searchTerm]); // wikiTopics is stable

  const selectedTopic = useMemo(() => {
    const topicExistsInFiltered = filteredWikiTopics.find(topic => topic.id === selectedTopicId);
    if (topicExistsInFiltered) return topicExistsInFiltered;
    
    if (filteredWikiTopics.length > 0) {
      return filteredWikiTopics[0];
    }
    return wikiTopics.find(topic => topic.id === selectedTopicId) || wikiTopics[0];
  }, [selectedTopicId, filteredWikiTopics]);

  useEffect(() => {
    const currentSelectionStillVisible = filteredWikiTopics.some(topic => topic.id === selectedTopicId);
    if (!currentSelectionStillVisible && filteredWikiTopics.length > 0) {
      setSelectedTopicId(filteredWikiTopics[0].id);
    } else if (filteredWikiTopics.length === 0 && wikiTopics.length > 0 && !selectedTopicId) {
        setSelectedTopicId(wikiTopics[0].id);
    }
  }, [searchTerm, filteredWikiTopics, selectedTopicId]);


  const handleSelectTopic = (id: string) => {
    setSelectedTopicId(id);
    const topic = wikiTopics.find(t => t.id === id);
    if (topic) {
      trackLocalEvent(TOOL_CATEGORY, 'topicViewed', topic.title);
      setExpandedCategories(prev => ({ ...prev, [topic.category]: true }));
    }
    const articleElement = document.getElementById('wiki-article-content');
    if (articleElement) articleElement.scrollTop = 0;
  };
  
  useEffect(() => {
      if (selectedTopicId) {
        const initialTopic = wikiTopics.find(t => t.id === selectedTopicId);
        if (initialTopic) {
            trackLocalEvent(TOOL_CATEGORY, 'topicViewed', initialTopic.title);
        }
      }
  }, []); 


  const visibleCategories = useMemo(() => {
    return Array.from(new Set(filteredWikiTopics.map(topic => topic.category))).sort();
  }, [filteredWikiTopics]);
  
  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };
  
  const getRelatedTopics = (currentTopic: WikiTopic | undefined): WikiTopic[] => {
    if (!currentTopic) return [];
    return wikiTopics
      .filter(topic => topic.category === currentTopic.category && topic.id !== currentTopic.id)
      .slice(0, 2); 
  };
  
  const relatedTopics = getRelatedTopics(selectedTopic);

  return (
    <div className="w-full text-gray-900 dark:text-gray-200">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-green-600 dark:text-green-400">Music Theory & Composition Wiki</h1>
        <p className="mt-3 text-md text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Your quick guide to understanding song structures, music theory basics, and tips for composing with AI.
        </p>
      </header>

      <main className="w-full bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-4 md:p-6 border-2 border-green-600 dark:border-green-500">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="md:w-1/3 lg:w-1/4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 self-start md:sticky md:top-20 max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
            <input
              type="search"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 mb-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 focus:ring-green-500 focus:border-green-500"
              aria-label="Search wiki topics"
            />
            {visibleCategories.length === 0 && searchTerm && (
                 <p className="text-gray-500 dark:text-gray-400 text-sm">No topics match your search.</p>
            )}
            {visibleCategories.map(category => {
              const topicsInCategory = filteredWikiTopics.filter(topic => topic.category === category);
              if(topicsInCategory.length === 0) return null; 

              return (
                <div key={category} className="mb-3">
                  <button
                    onClick={() => toggleCategoryExpansion(category)}
                    className="w-full flex justify-between items-center text-left text-md font-semibold text-green-700 dark:text-green-200 mb-1.5 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md focus:outline-none transition-colors"
                    aria-expanded={!!expandedCategories[category]}
                    aria-controls={`category-panel-${category.replace(/\s+/g, '-')}`}
                  >
                    {category} ({topicsInCategory.length})
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transform transition-transform ${expandedCategories[category] ? 'rotate-0' : '-rotate-90'}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  {expandedCategories[category] && (
                    <ul id={`category-panel-${category.replace(/\s+/g, '-')}`} className="space-y-1 pl-2 border-l-2 border-gray-300 dark:border-gray-600">
                      {topicsInCategory.map(topic => (
                        <li key={topic.id}>
                          <button
                            onClick={() => handleSelectTopic(topic.id)}
                            className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors 
                                          ${selectedTopic?.id === topic.id 
                                            ? 'bg-green-600 text-white font-medium' 
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-green-700 dark:hover:text-green-200'}`}
                            aria-current={selectedTopic?.id === topic.id ? 'page' : undefined}
                          >
                            {topic.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </aside>

          {/* Main Content Area */}
          <article id="wiki-article-content" className="flex-1 bg-gray-50 dark:bg-gray-800 p-6 rounded-md border border-gray-200 dark:border-gray-700 min-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
            {selectedTopic ? (
              <>
                <h2 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-1">{selectedTopic.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Category: {selectedTopic.category}</p>
                <div>{selectedTopic.content}</div>

                {relatedTopics.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-gray-300 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-3">Related Topics:</h3>
                    <ul className="space-y-2">
                      {relatedTopics.map(topic => (
                        <li key={`related-${topic.id}`}>
                          <button
                            onClick={() => handleSelectTopic(topic.id)}
                            className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 hover:underline text-left"
                          >
                            {topic.title} <span className="text-xs text-gray-500 dark:text-gray-400">({topic.category})</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : filteredWikiTopics.length > 0 ? ( 
                 <p className="text-gray-600 dark:text-gray-300">Select a topic from the menu to view its content, or clear your search.</p>
            ) : ( 
                <p className="text-gray-500 dark:text-gray-400 text-lg text-center py-10">
                  No topic selected, or no topics match your current search criteria. Try clearing the search or selecting a topic from the list.
                </p>
            )}
          </article>
        </div>
      </main>
    </div>
  );
};

export default MusicTheoryWikiTool;
