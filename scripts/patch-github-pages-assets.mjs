import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const outDir = join(process.cwd(), 'out');
const textExtensions = new Set(['.html', '.txt', '.js', '.css']);
const replacements = [
  ['"/assets/', '"/tehuset-website/assets/'],
  ["'/assets/", "'/tehuset-website/assets/"],
  ['url(/assets/', 'url(/tehuset-website/assets/'],
  ["url('/assets/", "url('/tehuset-website/assets/"],
  ['url("/assets/', 'url("/tehuset-website/assets/'],
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    if (!textExtensions.has(extname(entry.name))) continue;
    let source = await readFile(path, 'utf8');
    let patched = source;
    for (const [from, to] of replacements) {
      patched = patched.split(from).join(to);
    }
    if (patched !== source) {
      await writeFile(path, patched);
    }
  }
}

await walk(outDir);
await writeFile(join(outDir, '.nojekyll'), '');
