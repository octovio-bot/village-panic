import assetManifest from '../../../public/assets/tinyswords/assets.json';

const ASSET_BASE_URL = `${import.meta.env.BASE_URL}assets/tinyswords`;

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
