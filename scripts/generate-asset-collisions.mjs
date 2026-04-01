import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(projectRoot, 'public/assets/tinyswords/assets.json');
const assetsRoot = path.join(projectRoot, 'public/assets/tinyswords');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const collisions = {
  version: 1,
  generatedAt: new Date().toISOString(),
  alphaThreshold: 8,
  gameplay: {},
};

const toRel = (...parts) => path.posix.join(...parts).replaceAll('\\', '/');

function readPng(filePath) {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function clamp01(value) {
  return Number(Math.max(0, Math.min(1, value)).toFixed(4));
}

function scanAlphaBox(png, frameWidth = png.width, frameHeight = png.height, frames = 1) {
  const result = [];
  for (let frame = 0; frame < frames; frame += 1) {
    const startX = frame * frameWidth;
    let minX = frameWidth;
    let minY = frameHeight;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < frameHeight; y += 1) {
      for (let x = 0; x < frameWidth; x += 1) {
        const idx = (((y * png.width) + startX + x) * 4) + 3;
        const alpha = png.data[idx];
        if (alpha >= collisions.alphaThreshold) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      result.push(null);
      continue;
    }

    result.push({
      minX,
      minY,
      maxX,
      maxY,
      width: (maxX - minX) + 1,
      height: (maxY - minY) + 1,
    });
  }
  return result;
}

function makeFootprint(box, frameWidth, frameHeight, { widthRatio = 0.6, heightRatio = 0.22, bottomInset = 0.02 } = {}) {
  if (!box) return null;
  const spriteBottom = box.maxY + 1;
  const footprintHeightPx = Math.max(1, Math.round(box.height * heightRatio));
  const bottomY = Math.max(spriteBottom - Math.round(box.height * bottomInset), box.minY + footprintHeightPx);
  const topY = bottomY - footprintHeightPx;
  const centerX = (box.minX + box.maxX + 1) / 2;
  const widthPx = Math.max(1, Math.round(box.width * widthRatio));
  const leftX = Math.max(0, Math.round(centerX - (widthPx / 2)));
  const rightX = Math.min(frameWidth, leftX + widthPx);
  const actualWidth = Math.max(1, rightX - leftX);
  const actualHeight = Math.max(1, Math.min(frameHeight, bottomY) - Math.max(0, topY));
  const centerY = Math.max(0, topY) + (actualHeight / 2);

  return {
    x: clamp01((leftX + (actualWidth / 2)) / frameWidth),
    y: clamp01(centerY / frameHeight),
    width: clamp01(actualWidth / frameWidth),
    height: clamp01(actualHeight / frameHeight),
    sourceBox: {
      x: clamp01((box.minX + (box.width / 2)) / frameWidth),
      y: clamp01((box.minY + (box.height / 2)) / frameHeight),
      width: clamp01(box.width / frameWidth),
      height: clamp01(box.height / frameHeight),
    },
  };
}

function aggregateFrames(boxes, frameWidth, frameHeight, options) {
  const valid = boxes.filter(Boolean);
  if (!valid.length) return null;
  const footprintBoxes = valid.map((box) => makeFootprint(box, frameWidth, frameHeight, options)).filter(Boolean);
  return footprintBoxes.reduce((acc, box) => ({
    x: box.x,
    y: Math.max(acc?.y ?? 0, box.y),
    width: Math.max(acc?.width ?? 0, box.width),
    height: Math.max(acc?.height ?? 0, box.height),
  }), null);
}

function register(relPath, frameWidth, frameHeight, frames, options) {
  const png = readPng(path.join(assetsRoot, relPath));
  const boxes = scanAlphaBox(png, frameWidth, frameHeight, frames);
  const footprint = aggregateFrames(boxes, frameWidth, frameHeight, options);
  if (!footprint) return;
  collisions.gameplay[relPath] = {
    frame: { width: frameWidth, height: frameHeight, frames },
    box: footprint,
  };
}

for (const color of manifest.buildings.colorVariants) {
  const Color = `${color[0].toUpperCase()}${color.slice(1)}`;
  for (const building of Object.values(manifest.buildings.types)) {
    register(
      toRel('Buildings', `${Color} Buildings`, building.file),
      building.width,
      building.height,
      1,
      { widthRatio: 0.58, heightRatio: 0.18, bottomInset: 0.01 },
    );
  }
}

for (const item of manifest.terrain.decorations.bushes.items) {
  register(toRel('Terrain/Decorations/Bushes', item.file), 128, 128, item.frames, {
    widthRatio: 0.72, heightRatio: 0.26, bottomInset: 0.02,
  });
}

for (const rock of manifest.terrain.decorations.rocks.items) {
  register(toRel('Terrain/Decorations/Rocks', rock), 64, 64, 1, {
    widthRatio: 0.82, heightRatio: 0.42, bottomInset: 0.01,
  });
}

for (const item of manifest.terrain.decorations.waterRocks.items) {
  register(toRel('Terrain/Decorations/Rocks in the Water', item.file), 64, 64, item.frames, {
    widthRatio: 0.8, heightRatio: 0.34, bottomInset: 0.0,
  });
}

for (const item of manifest.terrain.resources.gold.stones.items) {
  register(toRel('Terrain/Resources/Gold/Gold Stones', item.normal), 128, 128, 1, {
    widthRatio: 0.78, heightRatio: 0.28, bottomInset: 0.01,
  });
  register(toRel('Terrain/Resources/Gold/Gold Stones', item.highlight), 128, 128, manifest.terrain.resources.gold.stones.highlightFrames, {
    widthRatio: 0.78, heightRatio: 0.28, bottomInset: 0.01,
  });
}

register(toRel('Terrain/Resources/Gold/Gold Resource', manifest.terrain.resources.gold.resource.normal.file), 128, 128, 1, {
  widthRatio: 0.7, heightRatio: 0.26, bottomInset: 0.01,
});
register(toRel('Terrain/Resources/Gold/Gold Resource', manifest.terrain.resources.gold.resource.highlight.file), 128, 128, manifest.terrain.resources.gold.resource.highlight.frames, {
  widthRatio: 0.7, heightRatio: 0.26, bottomInset: 0.01,
});

for (const item of manifest.terrain.resources.wood.trees.items) {
  register(toRel('Terrain/Resources/Wood/Trees', item.tree), item.frameWidth, item.frameHeight, item.frames, {
    widthRatio: 0.52, heightRatio: 0.18, bottomInset: 0.01,
  });
  register(toRel('Terrain/Resources/Wood/Trees', item.stump), 128, 128, 1, {
    widthRatio: 0.7, heightRatio: 0.34, bottomInset: 0.02,
  });
}

register(toRel('Terrain/Resources/Wood/Wood Resource', manifest.terrain.resources.wood.resource.file), 64, 64, 1, {
  widthRatio: 0.82, heightRatio: 0.34, bottomInset: 0.02,
});
register(toRel('Terrain/Resources/Meat/Meat Resource', manifest.terrain.resources.meat.resource.file), 64, 64, 1, {
  widthRatio: 0.82, heightRatio: 0.34, bottomInset: 0.02,
});
for (const item of manifest.terrain.resources.tools.items) {
  register(toRel('Terrain/Resources/Tools', item), 64, 64, 1, {
    widthRatio: 0.82, heightRatio: 0.34, bottomInset: 0.02,
  });
}

for (const [animName, anim] of Object.entries(manifest.terrain.resources.meat.sheep.animations)) {
  register(toRel('Terrain/Resources/Meat/Sheep', anim.file), 128, 128, anim.frames, {
    widthRatio: 0.62, heightRatio: 0.24, bottomInset: 0.02,
  });
}

for (const color of ['black']) {
  const Color = `${color[0].toUpperCase()}${color.slice(1)}`;
  for (const [unitName, unitDef] of Object.entries(manifest.units.types)) {
    const fw = unitDef.frameSize.width;
    const fh = unitDef.frameSize.height;
    const unitOptions = unitName === 'lancer'
      ? { widthRatio: 0.28, heightRatio: 0.14, bottomInset: 0.015 }
      : { widthRatio: 0.3, heightRatio: 0.16, bottomInset: 0.015 };

    const visitAnimNode = (node) => {
      if (node?.file && node?.frames) {
        register(toRel('Units', `${Color} Units`, `${unitName[0].toUpperCase()}${unitName.slice(1)}`, node.file), fw, fh, node.frames, unitOptions);
        return;
      }
      Object.values(node ?? {}).forEach(visitAnimNode);
    };

    visitAnimNode(unitDef.animations);

    for (const extra of Object.values(unitDef.extras ?? {})) {
      if (!extra.frames) continue;
      register(toRel('Units', `${Color} Units`, `${unitName[0].toUpperCase()}${unitName.slice(1)}`, extra.file), extra.width / extra.frames, extra.height, extra.frames, {
        widthRatio: 0.34, heightRatio: 0.2, bottomInset: 0.02,
      });
    }
  }
}

manifest.collisions = collisions;
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated ${Object.keys(collisions.gameplay).length} gameplay collision entries in ${manifestPath}`);
