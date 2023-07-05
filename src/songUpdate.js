import fs from 'fs/promises';
import { traverseDir } from './traverse.js';
import yamlFront from 'yaml-front-matter';

/**
 * 
 */
export async function update() {
  const files = await traverseDir('./_pages');

  console.log(files)

  for (const file of files) {
    console.log(`Importing ${file}`);
    
    const text = await fs.readFile(file, 'utf8');
    const updated = text.replace(/(type:\s*spotify\s*\stitle:).*$/gmi, '$1 Spotify');
    
    await fs.writeFile(file, updated);
  }  
}


