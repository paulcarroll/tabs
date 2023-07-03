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
const regexSection = /^\[?(instrumental|intro|outro|chorus|verse|solo|interlude)[\s\d:-]*\]?$/i;

const regexChordBlock = /(^[a-g]{1,2}[\d\/#bmsusa-g]*:?\s+\[?[\dx]+\]?)/i;

const regexChordLine = /([a-g]{1,2}[\d\/#bmsusa-g]*\s*)+/mi

const regexTabLine = /(^[a-gx#]?([|-]+[|-\dxhpbr\\ ~\/()]+))+/i;


/**
 * 
 * @param {*} song 
 * @returns 
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

  // Wrap chord blocks and tab blocks in a codeblock
  // song = replace(song, '```chordpro\n$1\n```', regexChords);
  // song = replace(song, '```chordpro\n$1\n```', tabBlock);

  // song = replace(song, '', /```\n```chordpro\n/);

  // Replace multiple contiguous line breaks with a single line break
  // song = replace(song, '\n', /\s*\n{2,}/);
  
  function lineType(line) {
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
  
    var capTab = false;
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      const previous = lineType(i ? lines[i + 1] : null);
      const current = lineType(lines[i]);
      const peek = lineType(lines[i + 1]);
      var type;

      if (previous?.line?.trim() === '' && current.line.startsWith('  ')) {
        current.line = `&nbsp;${current.line.slice(1)}`;
      }

      if (previous?.line?.startsWith('## ') && current.line.trimEnd() !== '') {
        current.line = `\n${current.line}`;
      }

      if (!capTab) {
        if (current.type === 'chord-line' && peek?.type === 'tab-line' || current.type === 'chord-block') {
          capTab = true;
          result.push('```chordpro');
        }
      }
      else {
        if (current.type !== 'tab-line' && current.type !== 'chord-block') {
          capTab = false;
          result.push('```');
        }
      }
      
      if (previous?.line === '' && current.line !== '' || current?.line.length) {
        result.push(current.line);
      }
    }
    if (capTab) {
      result.push('```');
    }

    song = result.map(it => it).join('\n'); 


    console.log(song)
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
capo: ${processed.capo}
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



