import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[Build] Preparing Pragati University CampusTech production build...');

// Ensure public directory exists for environments expecting a public/ output folder
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy essential entry and static files to public as fallback
const filesToCopy = ['index.html', 'metadata.json'];
for (const file of filesToCopy) {
  const src = path.join(__dirname, file);
  const dest = path.join(publicDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

// Copy directories if needed
const dirsToCopy = ['css', 'js', 'data'];
for (const dir of dirsToCopy) {
  const src = path.join(__dirname, dir);
  const dest = path.join(publicDir, dir);
  if (fs.existsSync(src) && !fs.existsSync(dest)) {
    try {
      fs.cpSync(src, dest, { recursive: true });
    } catch (e) {
      console.warn(`[Build] Notice: cpSync for ${dir} skipped:`, e.message);
    }
  }
}

console.log('[Build] Build completed successfully. Ready for Vercel deployment.');
