import tileIndexMapping from '../data/tileIndexMapping.json';

const SEMANTIC_TO_INDEX = Object.entries(tileIndexMapping.tiles).reduce((acc, [index, def]) => {
  if (def.name) {
    acc[def.name] = Number(index);
  }
  return acc;
}, {});

export const TILESET_COLOR_KEYS = {
  color1: 'tinyswords.terrain.tilemap1',
  color2: 'tinyswords.terrain.tilemap2',
  color3: 'tinyswords.terrain.tilemap3',
  color4: 'tinyswords.terrain.tilemap4',
  color5: 'tinyswords.terrain.tilemap5',
};

export function getTileIndexBySemanticName(name) {
  return SEMANTIC_TO_INDEX[name] ?? -1;
}

export function getTilesetTextureKey(colorVariant = 'color1') {
  return TILESET_COLOR_KEYS[colorVariant] ?? TILESET_COLOR_KEYS.color1;
}

export function buildSemanticLayer(grid) {
  return grid.map((row) => row.map((cell) => {
    if (!cell) return -1;
    if (typeof cell === 'number') return cell;
    return getTileIndexBySemanticName(cell);
  }));
}

export function createSemanticTileSprites(scene, {
  x = 0,
  y = 0,
  tileSize = tileIndexMapping.meta.tileSize,
  colorVariant = 'color1',
  grid = [],
}) {
  const textureKey = getTilesetTextureKey(colorVariant);
  const sprites = [];

  grid.forEach((row, gridY) => {
    row.forEach((cell, gridX) => {
      const index = typeof cell === 'number' ? cell : getTileIndexBySemanticName(cell);
      if (index < 0) {
        return;
      }
      const col = index % tileIndexMapping.meta.columns;
      const tileRow = Math.floor(index / tileIndexMapping.meta.columns);
      const sprite = scene.add.image(x + (gridX * tileSize), y + (gridY * tileSize), textureKey)
        .setOrigin(0, 0)
        .setDisplaySize(tileSize, tileSize)
        .setCrop(col * tileSize, tileRow * tileSize, tileSize, tileSize);
      sprites.push(sprite);
    });
  });

  return sprites;
}

export const SEMANTIC_TILEMAP_EXAMPLE = {
  palette: 'color1',
  layers: [
    {
      name: 'ground',
      grid: [
        ['level1-water-nw', 'level1-water-north', 'level1-water-ne', 'level1-water-vertical-top'],
        ['level1-water-west', 'level1-center', 'level1-water-east', 'level1-water-vertical-center'],
        ['level1-water-sw', 'level1-water-south', 'level1-water-se', 'level1-water-vertical-bottom'],
        ['level1-water-horizontal-left', 'level1-water-horizontal-center', 'level1-water-horizontal-right', 'level1-water-isolated'],
      ],
    },
    {
      name: 'elevated',
      grid: [
        ['level2-cliff-nw', 'level2-cliff-north', 'level2-cliff-ne', 'level2-cliff-vertical-top'],
        ['level2-cliff-west', 'level2-center', 'level2-cliff-east', 'level2-cliff-vertical-center'],
        ['level2-cliff-sw', 'level2-cliff-south', 'level2-cliff-se', 'level2-cliff-vertical-bottom'],
        ['level2-cliff-horizontal-left', 'level2-cliff-horizontal-center', 'level2-cliff-horizontal-right', 'level2-cliff-isolated'],
      ],
    },
  ],
};
