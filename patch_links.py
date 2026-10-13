import re

files_to_patch = [
    'src/components/Sidebar.tsx',
    'src/components/sunoUserStats/charts/TopSongsByCommentRateChart.tsx',
    'src/components/sunoUserStats/charts/TopSongsChart.tsx',
    'src/components/sunoUserStats/charts/SongTrendChart.tsx',
    'src/components/sunoUserStats/charts/TopCommentedSongsChart.tsx',
    'src/components/sunoUserStats/charts/TopEngagingSongsChart.tsx',
    'src/pages/AboutPage.tsx',
    'src/tools/LocalMusicResourceDirectoryTool.tsx'
]

for filepath in files_to_patch:
    with open(filepath, 'r') as f:
        content = f.read()

    new_content = ""
    start = 0
    modified = False

    # Find <a ... target="_blank" ...> tags that are missing rel="noopener noreferrer"
    for match in re.finditer(r'<a\b([^>]*)>', content):
        tag_content = match.group(1)
        if 'target="_blank"' in tag_content and 'rel="noopener noreferrer"' not in tag_content:
            # Add it
            replacement = '<a rel="noopener noreferrer"' + tag_content + '>'
            new_content += content[start:match.start()] + replacement
            modified = True
        else:
            new_content += content[start:match.end()]

        start = match.end()

    new_content += content[start:]

    if modified:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
