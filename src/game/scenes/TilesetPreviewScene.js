import Phaser from 'phaser';
import tileIndexMapping from '../data/tileIndexMapping.json';
import { GAME_HEIGHT, GAME_WIDTH } from '../data.js';

const TILE_TEXTURE_KEY = 'tinyswords.terrain.tilemap1';
const TILE_SIZE = tileIndexMapping.meta.tileSize;
const GRID_COLS = tileIndexMapping.meta.columns;
const GRID_ROWS = tileIndexMapping.meta.rows;
const PAGE_PADDING_X = 36;
const PAGE_PADDING_Y = 96;
const GAP = 10;
const GRID_TILE_PREVIEW_SIZE = 84;
const INSPECTOR_PREVIEW_SIZE = 256;

export class TilesetPreviewScene extends Phaser.Scene {
  constructor() {
    super('TilesetPreviewScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a2a1f');

    this.add.text(PAGE_PADDING_X, 26, 'Tileset Preview — indices + mapping', {
      fontFamily: 'Georgia',
      fontSize: '30px',
      color: '#f4f0d8',
      stroke: '#162015',
      strokeThickness: 5,
    }).setOrigin(0, 0).setDepth(10);

    this.add.text(PAGE_PADDING_X, 64, 'But : te laisser me donner le sens de chaque index. Échap : menu | Entrée : jeu', {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#f4f0d8',
      stroke: '#162015',
      strokeThickness: 4,
    }).setOrigin(0, 0).setDepth(10);

    this.selectedIndex = 0;
    this.selectionBoxes = [];
    this.mappingEntries = tileIndexMapping.tiles;

    this.createGrid();
    this.createInspector();
    this.refreshSelection();

    this.input.keyboard.on('keydown-LEFT', () => this.moveSelection(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.moveSelection(1));
    this.input.keyboard.on('keydown-UP', () => this.moveSelection(-GRID_COLS));
    this.input.keyboard.on('keydown-DOWN', () => this.moveSelection(GRID_COLS));
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('GameScene'));
  }

  getTileCrop(index) {
    const col = index % GRID_COLS;
    const row = Math.floor(index / GRID_COLS);
    return {
      col,
      row,
      x: col * TILE_SIZE,
      y: row * TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
    };
  }

  getTileTextureKey(index) {
    return `${TILE_TEXTURE_KEY}::tile-${index}`;
  }

  ensureTileTexture(index) {
    const key = this.getTileTextureKey(index);
    if (this.textures.exists(key)) {
      return key;
    }

    const crop = this.getTileCrop(index);
    const source = this.textures.get(TILE_TEXTURE_KEY).getSourceImage();
    const canvasTexture = this.textures.createCanvas(key, TILE_SIZE, TILE_SIZE);
    const context = canvasTexture.getContext();
    context.clearRect(0, 0, TILE_SIZE, TILE_SIZE);
    context.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, TILE_SIZE, TILE_SIZE);
    canvasTexture.refresh();
    return key;
  }

  createGrid() {
    const startX = PAGE_PADDING_X;
    const startY = PAGE_PADDING_Y;

    for (let index = 0; index < tileIndexMapping.meta.totalTiles; index += 1) {
      const { col, row } = this.getTileCrop(index);
      const x = startX + (col * (GRID_TILE_PREVIEW_SIZE + GAP));
      const y = startY + (row * (GRID_TILE_PREVIEW_SIZE + 34));

      const frame = this.add.image(x, y, this.ensureTileTexture(index))
        .setOrigin(0, 0)
        .setDisplaySize(GRID_TILE_PREVIEW_SIZE, GRID_TILE_PREVIEW_SIZE)
        .setInteractive(new Phaser.Geom.Rectangle(0, 0, GRID_TILE_PREVIEW_SIZE, GRID_TILE_PREVIEW_SIZE), Phaser.Geom.Rectangle.Contains)
        .setDepth(2);

      frame.on('pointerdown', () => {
        this.selectedIndex = index;
        this.refreshSelection();
      });

      this.add.rectangle(x + (GRID_TILE_PREVIEW_SIZE / 2), y + (GRID_TILE_PREVIEW_SIZE / 2), GRID_TILE_PREVIEW_SIZE + 4, GRID_TILE_PREVIEW_SIZE + 4, 0x000000, 0)
        .setStrokeStyle(2, 0xecd9a2, 0.24)
        .setDepth(1);

      const label = this.add.text(x + (GRID_TILE_PREVIEW_SIZE / 2), y + GRID_TILE_PREVIEW_SIZE + 4, `#${index}`, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#f4f0d8',
      }).setOrigin(0.5, 0).setDepth(3);

      const selection = this.add.rectangle(x + (GRID_TILE_PREVIEW_SIZE / 2), y + (GRID_TILE_PREVIEW_SIZE / 2), GRID_TILE_PREVIEW_SIZE + 8, GRID_TILE_PREVIEW_SIZE + 8, 0xffd86b, 0)
        .setStrokeStyle(4, 0xffd86b, 0.96)
        .setDepth(4)
        .setVisible(false);

      this.selectionBoxes.push(selection);
      void frame;
      void label;
    }
  }

  createInspector() {
    const panelX = 900;
    const panelY = 112;
    const panelWidth = 340;
    const panelHeight = 580;

    this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x101914, 0.88)
      .setOrigin(0, 0)
      .setStrokeStyle(3, 0xe7d798, 0.32)
      .setDepth(5);

    this.inspectorTitle = this.add.text(panelX + 20, panelY + 18, 'Tile #0', {
      fontFamily: 'Georgia',
      fontSize: '28px',
      color: '#f7edc9',
      stroke: '#203019',
      strokeThickness: 4,
    }).setDepth(6);

    this.inspectorPreview = this.add.image(panelX + 170, panelY + 154, this.ensureTileTexture(0))
      .setDisplaySize(INSPECTOR_PREVIEW_SIZE, INSPECTOR_PREVIEW_SIZE)
      .setDepth(6);

    this.mappingText = this.add.text(panelX + 20, panelY + 312, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#dbe5f0',
      wordWrap: { width: panelWidth - 40 },
      lineSpacing: 6,
    }).setDepth(6);

    this.helperText = this.add.text(panelX + 20, panelY + 498, 'Remplis ensuite `src/game/data/tileIndexMapping.json` en me donnant pour chaque index :\n- name\n- category\n- tags\n- notes', {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#f4f0d8',
      stroke: '#162015',
      strokeThickness: 3,
      wordWrap: { width: panelWidth - 40 },
      lineSpacing: 4,
    }).setDepth(6);
  }

  moveSelection(delta) {
    const next = Phaser.Math.Clamp(this.selectedIndex + delta, 0, tileIndexMapping.meta.totalTiles - 1);
    if (next === this.selectedIndex) {
      return;
    }
    this.selectedIndex = next;
    this.refreshSelection();
  }

  refreshSelection() {
    this.selectionBoxes.forEach((box, index) => box.setVisible(index === this.selectedIndex));

    this.inspectorTitle.setText(`Tile #${this.selectedIndex}`);
    this.inspectorPreview.setTexture(this.ensureTileTexture(this.selectedIndex));

    const mapping = this.mappingEntries[String(this.selectedIndex)] ?? { name: '', category: '', tags: [], notes: '' };
    this.mappingText.setText([
      `index: ${this.selectedIndex}`,
      `name: ${mapping.name || '<vide>'}`,
      `category: ${mapping.category || '<vide>'}`,
      `tags: ${(mapping.tags?.length ? mapping.tags.join(', ') : '<vide>')}`,
      '',
      'notes:',
      mapping.notes || '<vide>',
    ].join('\n'));
  }
}
