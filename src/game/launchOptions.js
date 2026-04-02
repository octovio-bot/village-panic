const sceneParam = new URLSearchParams(window.location.search).get('scene');

export const DEFAULT_POST_BOOT_SCENE = sceneParam === 'asset-preview'
  ? 'AssetPreviewScene'
  : sceneParam === 'tileset-preview'
    ? 'TilesetPreviewScene'
    : sceneParam === 'semantic-tilemap-preview'
      ? 'SemanticTilemapPreviewScene'
      : sceneParam === 'semantic-tilemap-demo'
        ? 'SemanticTilemapDemoScene'
        : 'MenuScene';
