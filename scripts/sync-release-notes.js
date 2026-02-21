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

        // MD to JSX converter with basic nested list support
        let jsxContent = bodyLines.map(line => {
            if (line.startsWith('### ')) {
                return `<SubSectionTitle>${line.replace('### ', '').trim()}</SubSectionTitle>`;
            }
            if (line.trim().startsWith('- ')) {
                const isNested = line.startsWith('  ');
                let text = line.trim().replace('- ', '').trim();
                text = text.replace(/\*\*(.*?)\*\*/g, '<STRONG>$1</STRONG>');
                text = text.replace(/`(.*?)`/g, '<CODE>$1</CODE>');
                return { type: 'LI', text, nested: isNested };
            }
            if (line.match(/^[^<]/)) {
                let text = line.trim();
                text = text.replace(/\*\*(.*?)\*\*/g, '<STRONG>$1</STRONG>');
                return `<P>${text}</P>`;
            }
            return line;
        });

        // Group LIs into ULs (supports one level of nesting)
        const groupedJsx = [];
        let listStack = []; // 'UL' or 'NESTED_UL'

        jsxContent.forEach(item => {
            if (typeof item === 'object' && item.type === 'LI') {
                if (item.nested) {
                    if (listStack[listStack.length - 1] !== 'NESTED_UL') {
                        groupedJsx.push('  <UL>');
                        listStack.push('NESTED_UL');
                    }
                    groupedJsx.push(`    <LI>${item.text}</LI>`);
                } else {
                    while (listStack.length > 0 && listStack[listStack.length - 1] === 'NESTED_UL') {
                        groupedJsx.push('  </UL>');
                        listStack.pop();
                    }
                    if (listStack[listStack.length - 1] !== 'UL') {
                        groupedJsx.push('<UL>');
                        listStack.push('UL');
                    }
                    groupedJsx.push(`  <LI>${item.text}</LI>`);
                }
            } else {
                while (listStack.length > 0) {
                    const last = listStack.pop();
                    groupedJsx.push(last === 'NESTED_UL' ? '  </UL>' : '</UL>');
                }
                groupedJsx.push(item);
            }
        });
        while (listStack.length > 0) {
            const last = listStack.pop();
            groupedJsx.push(last === 'NESTED_UL' ? '  </UL>' : '</UL>');
        }

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
