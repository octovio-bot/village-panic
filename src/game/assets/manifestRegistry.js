import assetManifest from '../../../public/assets/tinyswords/assets.json';

const ASSET_BASE_URL = `${import.meta.env.BASE_URL}assets/tinyswords`;
const capitalize = (value) => `${value[0].toUpperCase()}${value.slice(1)}`;

function normalizeAssetPath(assetPath) {
  if (!assetPath) return null;
  if (assetPath.startsWith(`${ASSET_BASE_URL}/`)) {
    return assetPath.slice(`${ASSET_BASE_URL}/`.length);
  }
  if (assetPath.startsWith('/assets/tinyswords/')) {
    return assetPath.slice('/assets/tinyswords/'.length);
  }
  if (assetPath.startsWith('assets/tinyswords/')) {
    return assetPath.slice('assets/tinyswords/'.length);
  }
  return assetPath;
}

export function getGameplayCollisionByAssetPath(assetPath) {
  const normalized = normalizeAssetPath(assetPath);
  if (!normalized) return null;
  return assetManifest.collisions?.gameplay?.[normalized]?.box ?? null;
}

export function applyManifestCollisionToBody(gameObject, collisionBox) {
  const body = gameObject?.body;
  if (!body || !collisionBox) {
    return false;
  }

  const width = gameObject.displayWidth * collisionBox.width;
  const height = gameObject.displayHeight * collisionBox.height;
  const offsetX = (gameObject.displayWidth * collisionBox.x) - (width / 2);
  const offsetY = (gameObject.displayHeight * collisionBox.y) - (height / 2);

  body.setSize(width, height);
  body.setOffset(offsetX, offsetY);
  return true;
}

export function createStaticCollisionRectFromManifest(scene, x, y, displayWidth, displayHeight, collisionBox) {
  if (!collisionBox) {
    return null;
  }

  const width = displayWidth * collisionBox.width;
  const height = displayHeight * collisionBox.height;
  const centerX = x + ((collisionBox.x - 0.5) * displayWidth);
  const centerY = y + ((collisionBox.y - 0.5) * displayHeight);

  const rect = scene.add.rectangle(centerX, centerY, width, height, 0x000000, 0);
  scene.physics.add.existing(rect, true);
  rect.setDepth(-20);
  return rect;
}

export function getAssetPathForTinySwordsKey(tinySwordsKey) {
  const keyToPath = {
    'tinyswords.resources.tree1': 'Terrain/Resources/Wood/Trees/Tree1.png',
    'tinyswords.resources.tree2': 'Terrain/Resources/Wood/Trees/Tree2.png',
    'tinyswords.resources.tree3': 'Terrain/Resources/Wood/Trees/Tree3.png',
    'tinyswords.resources.tree4': 'Terrain/Resources/Wood/Trees/Tree4.png',
    'tinyswords.resources.gold-stone1': 'Terrain/Resources/Gold/Gold Stones/Gold Stone 1.png',
    'tinyswords.resources.gold-stone2': 'Terrain/Resources/Gold/Gold Stones/Gold Stone 2.png',
    'tinyswords.resources.wood-item': 'Terrain/Resources/Wood/Wood Resource/Wood Resource.png',
    'tinyswords.resources.gold-item': 'Terrain/Resources/Gold/Gold Resource/Gold_Resource.png',
    'tinyswords.resources.meat-item': 'Terrain/Resources/Meat/Meat Resource/Meat Resource.png',
    'tinyswords.resources.tools-item': 'Terrain/Resources/Tools/Tool_01.png',
    'tinyswords.resources.sheep-idle': 'Terrain/Resources/Meat/Sheep/Sheep_Idle.png',
  };

  return keyToPath[tinySwordsKey] ?? null;
}

export function getTinySwordsAssetDef(tinySwordsKey) {
  const relativePath = getAssetPathForTinySwordsKey(tinySwordsKey);
  if (!relativePath) {
    return null;
  }

  const base = {
    key: tinySwordsKey,
    relativePath,
    assetPath: `${ASSET_BASE_URL}/${relativePath}`,
    collisionBox: getGameplayCollisionByAssetPath(relativePath),
  };

  const treeMatch = tinySwordsKey.match(/^tinyswords\.resources\.tree([1-4])$/);
  if (treeMatch) {
    const treeIndex = Number(treeMatch[1]) - 1;
    const treeDef = assetManifest.terrain.resources.wood.trees.items[treeIndex];
    return {
      ...base,
      kind: 'sheet',
      frameConfig: {
        frameWidth: treeDef.frameWidth,
        frameHeight: treeDef.frameHeight,
      },
      frames: treeDef.frames,
      animationKey: `tree${treeMatch[1]}-wind`,
    };
  }

  if (tinySwordsKey === 'tinyswords.resources.sheep-idle') {
    return {
      ...base,
      kind: 'sheet',
      frameConfig: { ...assetManifest.terrain.resources.meat.sheep.frameSize },
      frames: assetManifest.terrain.resources.meat.sheep.animations.idle.frames,
      animationKey: 'sheep-idle',
    };
  }

  return {
    ...base,
    kind: 'image',
  };
}

export function getTinySwordsAnimationDef(animationKey) {
  const animationDefs = {
    'tree1-wind': { texture: 'tinyswords.resources.tree1', frameRate: 10, repeat: -1 },
    'tree2-wind': { texture: 'tinyswords.resources.tree2', frameRate: 10, repeat: -1 },
    'tree3-wind': { texture: 'tinyswords.resources.tree3', frameRate: 10, repeat: -1 },
    'tree4-wind': { texture: 'tinyswords.resources.tree4', frameRate: 10, repeat: -1 },
    'sheep-idle': { texture: 'tinyswords.resources.sheep-idle', frameRate: 5, repeat: -1 },
  };

  return animationDefs[animationKey] ?? null;
}
