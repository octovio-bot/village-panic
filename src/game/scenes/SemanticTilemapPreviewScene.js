import Phaser from 'phaser';
import { GAME_WIDTH } from '../data.js';
import {
  createSemanticTileSprites,
  getTileIndexBySemanticName,
  getTilesetTextureKey,
  SEMANTIC_TILEMAP_EXAMPLE,
} from '../tiles/semanticTilemap.js';

export class SemanticTilemapPreviewScene extends Phaser.Scene {
  constructor() {
    super('SemanticTilemapPreviewScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#18271f');
    this.example = SEMANTIC_TILEMAP_EXAMPLE;
    this.semanticDebug = {
      level1Center: getTileIndexBySemanticName('level1-center'),
      level2Center: getTileIndexBySemanticName('level2-center'),
      paletteKey: getTilesetTextureKey('color3'),
    };
    window.__SEMANTIC_TILEMAP_PREVIEW__ = {
      semanticDebug: this.semanticDebug,
      example: this.example,
    };

    this.add.text(36, 28, 'Semantic Tilemap Preview', {
      fontFamily: 'Georgia',
      fontSize: '30px',
      color: '#f4f0d8',
      stroke: '#162015',
      strokeThickness: 5,
    }).setDepth(10);

    this.add.text(36, 64, 'Cette scène valide le moteur sémantique : noms de tiles -> index -> rendu avec palette.', {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#f4f0d8',
      stroke: '#162015',
      strokeThickness: 4,
    }).setDepth(10);

    const leftX = 72;
    const startY = 150;
    const gapY = 340;

    SEMANTIC_TILEMAP_EXAMPLE.layers.forEach((layer, index) => {
      const y = startY + (index * gapY);
      this.add.text(leftX, y - 42, `${layer.name} · ${SEMANTIC_TILEMAP_EXAMPLE.palette}`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#dbe5f0',
      }).setDepth(10);

      createSemanticTileSprites(this, {
        x: leftX,
        y,
        tileSize: 96,
        colorVariant: SEMANTIC_TILEMAP_EXAMPLE.palette,
        grid: layer.grid,
      }).forEach((sprite) => sprite.setDepth(2));
    });

    this.add.text(GAME_WIDTH - 32, 32, 'Échap : menu', {
      fontFamily: 'Georgia',
      fontSize: '18px',
      color: '#f4f0d8',
      stroke: '#162015',
      strokeThickness: 4,
    }).setOrigin(1, 0).setDepth(10);

    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }
}
