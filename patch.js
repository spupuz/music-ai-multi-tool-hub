const fs = require('fs');

const filesToPatch = [
    'src/components/Sidebar.tsx',
    'src/components/sunoUserStats/charts/TopSongsByCommentRateChart.tsx',
    'src/components/sunoUserStats/charts/TopSongsChart.tsx',
    'src/components/sunoUserStats/charts/SongTrendChart.tsx',
    'src/components/sunoUserStats/charts/TopCommentedSongsChart.tsx',
    'src/components/sunoUserStats/charts/TopEngagingSongsChart.tsx',
    'src/pages/AboutPage.tsx',
    'src/tools/LocalMusicResourceDirectoryTool.tsx'
];

for (const file of filesToPatch) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // Split into lines to safely patch lines that have target="_blank" but NO rel="noopener noreferrer"
    const lines = content.split('\n');
    let patched = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('target="_blank"') && !lines[i].includes('rel="noopener noreferrer"')) {
            // Check the next few lines to see if it's there
            let hasRel = false;
            for(let j=1; j<=3 && (i+j) < lines.length; j++) {
                if (lines[i+j].includes('rel="noopener noreferrer"')) {
                    hasRel = true;
                    break;
                }
            }
            if (!hasRel) {
                // Add it
                // We'll append it right after target="_blank"
                lines[i] = lines[i].replace('target="_blank"', 'target="_blank" rel="noopener noreferrer"');
                patched = true;
            }
        }
    }

    if (patched) {
        fs.writeFileSync(file, lines.join('\n'), 'utf8');
        console.log(`Patched ${file}`);
    }
}
