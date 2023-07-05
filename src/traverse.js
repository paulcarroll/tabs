import fs from 'fs/promises';
import path from 'path';

/**
 * 
 * @param {*} dir 
 * @returns 
 */
export async function traverseDir(dir) {
  const contents = await fs.readdir(dir);
  let result = [];
  
  for (const file of contents) {
    let fullPath = path.join(dir, file);
    if (!(await fs.lstat(fullPath)).isDirectory()) {
       result.push(fullPath);
    }  
    else {
      result = result.concat(await traverseDir(fullPath));
    }
  }

  return result;
}


