import fs from 'fs/promises';
import { rimraf } from 'rimraf';

export const match = (str, pattern, index) => {
  const match = pattern.exec(str);
  return match !== null ? match[index] : null;
}

export const replace = (str, replacement, pattern) => str.replaceAll(new RegExp(pattern, 'gim'), replacement);


const regexTitle = /{(t|title):([\w\s\d'-]+)}/i;
const regexSubtitle = /{(s|st|subtitle):([\w\s\d'-]+)}/;

const regexCapo = /{(capo)\s*:\s*(\d+)\s*}/i;
const regexCapoFreestyle = /capo.*(\d).*$/i;

const regexSection = /^(instrumental|outro|chorus|verse|interlude)[\s\d:-]*$/i;
const regexSectionChorus = /({start_of_chorus})/i;
const regexSectionAlt = /^\[(intro|outro|instrumental|interlude|chorus|verse|solo)\s*\d?\]/i;

const regexChords = /(^[a-g]{1,2}[\d\/#bmsusa-g]*:?\s+\[?[\dx]+\]?)/i;
const tabBlock = /([a-gx#]?([|-]+[|-\dxhpbr\\ ~\/()]+))+/i;


/**
 * 
 * @param {*} song 
 * @returns 
 */
export const process = (song) => {
  const title = match(song, regexTitle, 2);
  const subtitle = match(song, regexSubtitle, 2);
  const capoRegular = match(song, regexCapo, 2);
  const capoFreestyle = match(song, regexCapoFreestyle, 1);
  const capo = capoRegular || capoFreestyle;

  song = replace(song, '', /-+pto-+/i);
  song = replace(song, '', regexTitle);
  song = replace(song, '', regexSubtitle);
  song = replace(song, '', regexCapo);
  song = replace(song, '', regexCapoFreestyle);
  song = replace(song, '## Chorus', regexSectionChorus);
  song = replace(song, '## $1', regexSectionAlt);
  song = replace(song, '## $1', regexSection);

  // Wrap chord blocks and tab blocks in a codeblock
  song = replace(song, '```chordpro\n$1\n```', regexChords);
  song = replace(song, '```chordpro\n$1\n```', tabBlock);

  song = replace(song, '', /```\n```chordpro\n/);

  // Replace multiple contiguous line breaks with a single line break
  song = replace(song, '\n', /\s*\n{2,}/);
  
  var previousLine = null;

  song = song
    .split('\n')
    .map(line => {
      if (previousLine?.trim() === '' && line.startsWith('  ')) {
        line = `&nbsp;${line.slice(1)}`;
      }
      if (previousLine?.startsWith('## ') && line !== '\n') {
        line = `\n${line}`;
      }
      if (line.trim() !== '') { 
        const uniqChars = String.prototype.concat.call(...Array.from(new Set(line)).sort());
        if (uniqChars === ' ^v' || uniqChars === ' *') {
          line = '';
        }
      }

      return previousLine = line.trimEnd();
    })
    .join('\n'); 

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



