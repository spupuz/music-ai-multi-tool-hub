import re
import os

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
    if not os.path.exists(filepath):
        continue

    with open(filepath, 'r') as f:
        content = f.read()

    # The previous regex failed because the <a ...> tags might span multiple lines
    # We will use re.DOTALL to match across newlines inside the tag

    new_content = ""
    start = 0
    modified = False

    for match in re.finditer(r'<a\b([^>]*)>', content, re.DOTALL):
        tag_content = match.group(1)
        if 'target="_blank"' in tag_content and 'rel="noopener noreferrer"' not in tag_content:
            # We must be careful not to match the end of the tag incorrectly, but [^>]* is pretty safe for HTML assuming no > in attributes
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
