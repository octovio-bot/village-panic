import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(projectRoot, 'public/assets/tinyswords/assets.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

if (!manifest.collisions?.gameplay) {
  throw new Error('Missing manifest.collisions.gameplay');
}

const entries = Object.entries(manifest.collisions.gameplay);
if (!entries.length) {
  throw new Error('No gameplay collision entries found');
}

for (const [assetPath, def] of entries) {
  if (!def?.box) throw new Error(`Missing box for ${assetPath}`);
  for (const key of ['x', 'y', 'width', 'height']) {
    const value = def.box[key];
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new Error(`Invalid ${key} for ${assetPath}`);
    }
    if (value < 0 || value > 1) {
      throw new Error(`Out-of-range ${key} for ${assetPath}: ${value}`);
    }
  }
  if (def.box.width <= 0 || def.box.height <= 0) {
    throw new Error(`Non-positive box for ${assetPath}`);
  }
}

console.log(`Verified ${entries.length} gameplay collision entries.`);
