import fs from 'fs/promises';
import { rimraf } from 'rimraf';

export const match = (str, pattern, index) => {
  const match = pattern.exec(str);
  return match !== null ? match[index] : null;
}

export const replace = (str, replacement, pattern) => str.replaceAll(new RegExp(pattern, 'gim'), replacement);


const regexTitle = /{(t|title):([\w\s\d'-]+)}/i;
const regexSubtitle = /{(s|st|subtitle):([\w\s\d'-]+)}/;

const regexCapo = /^{?capo}?:?.*(\d).*$/im;

const regexSectionChorus = /{start_of_chorus}/i;
const regexSectionBridge = /{start_of_bridge}/i;
const regexSection = /^\[?(instrumental|intro|outro|bridge|pre-chorus|chorus|verse|solo|interlude)[\s\d:-]*\]?$/i;

const regexChordBlock = /(^[a-g]{1,2}[\d\/#bmsusa-g]*:?\s+\[?[\dx]+\]?)/i;

const regexChordLine = /([a-g](b|#)?((m(aj)?|M|aug|dim|sus)\/([2-7]|9|13)?)?(\/[A-G](b|#)?)?\s*)+$/mi

const regexTabLine = /^[a-g]{1}[#b]?\s{0,3}[[|]?-([-\dxhpbr\\~\/()]+)+/i;


/**
 * 
 * @param {*} line 
 * @returns 
 */
export function lineType(line) {
  if (line === undefined || line === null) {
    return {
      line
    };
  }
  if (regexChordBlock.test(line)) {
    return {
      type: 'chord-block',
      line
    };
  }
  if (regexTabLine.test(line)) {
    return {
      type: 'tab-line',
      line
    };
  }
  if (regexChordLine.test(line)) {
    return {
      type: 'chord-line',
      line
    };
  }
  if (line.startsWith('##')) {
    return {
      type: 'section',
      line
    }
  }
  if (line.trim() === '') {
    return {
      type: 'empty',
      line
    };
  }
  return {
    type: 'lyric-line',
    line
  };
}

/**
 * It's not nice, and it's not pretty, but it works.
 */
export const process = (song) => {
  const title = match(song, regexTitle, 2);
  const subtitle = match(song, regexSubtitle, 2);
  const capo = match(song, regexCapo, 1);

  song = replace(song, '', /-+pto-+/i);
  song = replace(song, '', regexTitle);
  song = replace(song, '', regexSubtitle);
  song = replace(song, '', regexCapo);
  song = replace(song, '## Chorus', regexSectionChorus);
  song = replace(song, '## Bridge', regexSectionBridge);
  song = replace(song, '## $1', regexSection);

  const lines = song
    .split('\n')
    .map(line => line.trimEnd())
    .map(line => {
      if (line.trim() !== '') { 
        const uniqChars = String.prototype.concat.call(...Array.from(new Set(line)).sort());
        if (uniqChars === ' ^v' || uniqChars === ' *') {
          line = '';
        }
      }
      return line;
    });
  
    var outputCodeBlock = false;
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      const previous = lineType(i ? lines[i - 1] : null);
      const current = lineType(lines[i]);
      const peek = lineType(lines[i + 1]);

      // Manage the start/stop of code block captures for
      // chord definitions and tablature
      if (!outputCodeBlock) {
        // Start capturing a code block?
        if (current.type === 'chord-line' && peek?.type === 'tab-line' || current.type === 'chord-block' || current.type === 'tab-line') {
          outputCodeBlock = true;
          result.push('```chordpro');
        }
      }
      else {
        // We are done capturing a code block?
        if (current.type !== 'tab-line' && current.type !== 'chord-block' && current.line !== '') {
          outputCodeBlock = false;

          // Remove trailing empty lines
          while (result[result.length - 1] === '') {
            result.pop();
          }
          result.push('```\n');
        }
      }

      // If the line starts with spaces, the markdown renderer will
      // think it's a codeblock and render it as such.  We need to
      // hack in a HTML space to prevent this.
      if (!outputCodeBlock && current.line.startsWith('  ')) {
        current.line = `&nbsp;${current.line.slice(1)}`;
      }
      
      // Append the line, while trying not to append consequtive
      // empty lines
      if (previous?.line === '' && current.line !== '' || previous?.line !== '') {
        result.push(current.line);
      }
    }

    // Don't forget to close out a code block if we are still capturing
    if (outputCodeBlock) {
      // Remove trailing empty lines
      while (result[result.length - 1] === '') {
        result.pop();
      }
      result.push('```\n');
    }

    song = result.map(it => it).join('\n'); 
  return {
    title,
    subtitle,
    capo,
    song
  }
}

async function traverseDir(dir) {
  const contents = await fs.readdir(dir);
  const result = [];
  
  for (const file of contents) {
    let fullPath = path.join(dir, file);
    if (!(await fs.lstat(fullPath)).isDirectory()) {
       result.push(fullPath);
     }  
  }

  return result;
}

const kebab = (str) => str.replaceAll(' ', '-').replaceAll('_', '').toLowerCase();

export async function main() {
  const files = await traverseDir('./import');

  await rimraf('./output', { preserveRoot: true });
  await fs.mkdir('./output');

  for (const file of files) {
    console.log(`Importing ${file}`);
    
    const text = await fs.readFile(file, 'utf8');
    const processed = process(text);
    const filename = file.replace('import/', '');
    const parts = filename.split(' - ');
    const artist = parts[0];
    const title = parts[1].replace('.txt', '');

    const outputDir = kebab(`./output/${artist}`);
    const outputPath = kebab(`${outputDir}/${title}.md`);

    const content = 
`---
group: ${artist}
title: ${title}
tags: []
layout: page
capo: ${processed.capo || ''}
links: 
  - type: 
    title: 
    url: 
---

${processed.song}
`
    try {
      await fs.mkdir(outputDir);
    } catch {}
    await fs.writeFile(outputPath, content);
  }  
}



