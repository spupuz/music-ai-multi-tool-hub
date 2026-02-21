import fs from 'fs';
import path from 'path';

const CHANGELOG_PATH = path.resolve('CHANGELOG.md');
const DATA_PATH = path.resolve('data/releaseNotesData.tsx');

function parseChangelog() {
    const content = fs.readFileSync(CHANGELOG_PATH, 'utf8');
    const sections = content.split(/^## /m).slice(1);

    return sections.map(section => {
        const lines = section.split('\n');
        const headerMatch = lines[0].match(/\[(.*?)\]\s*-\s*(.*)/);
        if (!headerMatch) return null;

        const version = headerMatch[1];
        const bodyLines = lines.slice(1).filter(line => line.trim() !== '');

        // Very basic MD to JSX converter
        let jsxContent = bodyLines.map(line => {
            if (line.startsWith('### ')) {
                return `<SubSectionTitle>${line.replace('### ', '').trim()}</SubSectionTitle>`;
            }
            if (line.startsWith('- ')) {
                // Handle bold in lists
                let text = line.replace('- ', '').trim();
                text = text.replace(/\*\*(.*?)\*\*/g, '<STRONG>$1</STRONG>');
                text = text.replace(/`(.*?)`/g, '<CODE>$1</CODE>');
                return `<LI>${text}</LI>`;
            }
            if (line.match(/^[^<]/)) {
                let text = line.trim();
                text = text.replace(/\*\*(.*?)\*\*/g, '<STRONG>$1</STRONG>');
                return `<P>${text}</P>`;
            }
            return line;
        });

        // Group LIs into ULs
        const groupedJsx = [];
        let inList = false;
        jsxContent.forEach(item => {
            if (item.startsWith('<LI>')) {
                if (!inList) {
                    groupedJsx.push('<UL>');
                    inList = true;
                }
                groupedJsx.push(`  ${item}`);
            } else {
                if (inList) {
                    groupedJsx.push('</UL>');
                    inList = false;
                }
                groupedJsx.push(item);
            }
        });
        if (inList) groupedJsx.push('</UL>');

        return {
            version,
            jsx: `
  {
    version: "${version}",
    content: (
      <section id="version-${version}">
        <SectionTitle>Version ${version} - ${headerMatch[2]}</SectionTitle>
        ${groupedJsx.join('\n        ')}
      </section>
    )
  }`
        };
    }).filter(Boolean);
}

const notes = parseChangelog();
const template = `import React from 'react';
import { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export interface ReleaseNoteItem {
  version: string;
  content: React.ReactNode;
}

export const releaseNotes: ReleaseNoteItem[] = [${notes.map(n => n.jsx).join(',')}
];
`;

fs.writeFileSync(DATA_PATH, template);
console.log('✅ Synchronized data/releaseNotesData.tsx with CHANGELOG.md');
