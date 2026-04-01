import Phaser from 'phaser';
import assetManifest from '../../../public/assets/tinyswords/assets.json';
import { GAME_HEIGHT, GAME_WIDTH } from '../data.js';
import { createPlaque, createThreeSliceHorizontal, setImageDisplayHeight, setImageDisplayWidth } from '../ui/tinySwordsUi.js';

const PARTICLE_FRAME_CONFIGS = {
  'Dust_01.png': { frameWidth: 64, frameHeight: 64, frames: 8 },
  'Dust_02.png': { frameWidth: 64, frameHeight: 64, frames: 10 },
  'Fire_01.png': { frameWidth: 64, frameHeight: 64, frames: 8 },
  'Fire_02.png': { frameWidth: 64, frameHeight: 64, frames: 10 },
  'Fire_03.png': { frameWidth: 64, frameHeight: 64, frames: 12 },
  'Explosion_01.png': { frameWidth: 192, frameHeight: 192, frames: 8 },
  'Explosion_02.png': { frameWidth: 192, frameHeight: 192, frames: 10 },
  'Water Splash.png': { frameWidth: 192, frameHeight: 192, frames: 9 },
};

const ICON_KEYS = [
  'tinyswords.ui.icon.wood',
  'tinyswords.ui.icon.coin',
  'tinyswords.ui.icon.meat',
  'tinyswords.ui.icon.hammer',
];

const CURSOR_KEYS = [
  'tinyswords.ui.cursor.1',
  'tinyswords.ui.cursor.2',
  'tinyswords.ui.cursor.3',
  'tinyswords.ui.cursor.4',
];

const ASSET_BASE_URL = `${import.meta.env.BASE_URL}assets/tinyswords`;
const MANIFEST_BASE_PATH = assetManifest.meta.basePath;

export class AssetPreviewScene extends Phaser.Scene {
  constructor() {
    super('AssetPreviewScene');
  }

  create() {
    const previewMode = new URLSearchParams(window.location.search).get('preview');
    if (previewMode === 'nature') {
      this.createNaturePreview();
      return;
    }
    if (previewMode === 'carousel') {
      this.createCarouselPreview();
      return;
    }

    this.cameras.main.setBackgroundColor('#4fa9ad');

    const board = createPlaque(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      frameKey: 'tinyswords.ui.paper.regular.frame',
      width: 1180,
      height: 468,
    }).container;
    board.setDepth(1);

    const title = createThreeSliceHorizontal(this, {
      x: 210,
      y: 92,
      textureKey: 'tinyswords.ui.ribbons.big',
      row: 0,
      width: 282,
      height: 96,
    }).container;
    title.setDepth(3);

    this.add.text(210, 86, 'UI Elements', {
      fontFamily: 'Georgia',
      fontSize: '28px',
      color: '#eff5f4',
      stroke: '#203040',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(4);

    const leftPanel = createPlaque(this, {
      x: 168,
      y: 286,
      frameKey: 'tinyswords.ui.wood-table.frame',
      fillKey: 'tinyswords.ui.wood-table.fill',
      width: 210,
      height: 228,
      fillInsetX: 24,
      fillInsetY: 24,
    }).container;
    leftPanel.setDepth(2);

    const note = createPlaque(this, {
      x: 470,
      y: 202,
      frameKey: 'tinyswords.ui.paper.special.frame',
      width: 204,
      height: 172,
    }).container;
    note.setDepth(2);

    const darkPaper = createPlaque(this, {
      x: 786,
      y: 170,
      frameKey: 'tinyswords.ui.paper.special.frame',
      width: 168,
      height: 224,
    }).container;
    darkPaper.setDepth(2);
    const darkPaperInset = this.add.rectangle(786, 170, 86, 160, 0x59606d, 0.92)
      .setStrokeStyle(2, 0xceba7d, 0.9)
      .setDepth(3);

    const rightCard = createPlaque(this, {
      x: 1040,
      y: 178,
      frameKey: 'tinyswords.ui.button.blue.frame',
      width: 114,
      height: 134,
    }).container;
    rightCard.setDepth(2);

    const bigButton = createPlaque(this, {
      x: 1166,
      y: 188,
      frameKey: 'tinyswords.ui.button.red.frame',
      width: 92,
      height: 92,
    }).container;
    bigButton.setDepth(3);

    const barBase = createThreeSliceHorizontal(this, {
      x: 430,
      y: 375,
      textureKey: 'tinyswords.ui.bigbar.base.frame',
      width: 210,
      height: 38,
    }).container;
    barBase.setDepth(3);
    this.add.tileSprite(430, 375, 132, 24, 'tinyswords.ui.bigbar.fill')
      .setDepth(4);

    const longRibbon = createThreeSliceHorizontal(this, {
      x: 736,
      y: 382,
      textureKey: 'tinyswords.ui.ribbons.big',
      row: 1,
      width: 266,
      height: 72,
    }).container;
    longRibbon.setDepth(3);

    const swordRibbon = createThreeSliceHorizontal(this, {
      x: 864,
      y: 420,
      textureKey: 'tinyswords.ui.swords',
      row: 2,
      width: 190,
      height: 58,
    }).container;
    swordRibbon.setDepth(3);

    const bottomRibbon = createThreeSliceHorizontal(this, {
      x: 150,
      y: 652,
      textureKey: 'tinyswords.ui.ribbons.big',
      row: 4,
      width: 184,
      height: 88,
    }).container;
    bottomRibbon.setDepth(2);

    const smallBanner = createThreeSliceHorizontal(this, {
      x: 706,
      y: 516,
      textureKey: 'tinyswords.ui.ribbons.big',
      row: 0,
      width: 170,
      height: 56,
    }).container;
    smallBanner.setDepth(3);

    CURSOR_KEYS.forEach((key, index) => {
      setImageDisplayHeight(this, this.add.image(906 + (index * 34), 152 + ((index % 2) * 46), key), 28).setDepth(4);
    });

    ICON_KEYS.forEach((key, index) => {
      setImageDisplayHeight(this, this.add.image(920 + (index * 42), 500, key), 28).setDepth(4);
    });

    setImageDisplayHeight(this, this.add.image(1110, 500, 'tinyswords.ui.icon.hammer'), 28).setDepth(4);
    setImageDisplayHeight(this, this.add.image(1150, 500, 'tinyswords.ui.icon.coin'), 28).setDepth(4);

    this.add.text(50, 30, 'Preview Tiny Swords reconstruite depuis les vraies slices 3x3 / 3-part.', {
      fontFamily: 'Georgia',
      fontSize: '18px',
      color: '#f4f0d8',
      stroke: '#203040',
      strokeThickness: 3,
    }).setDepth(5);

    this.add.text(50, 58, 'Echap pour revenir au menu, Entree pour lancer la partie.', {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#f4f0d8',
      stroke: '#203040',
      strokeThickness: 3,
    }).setDepth(5);

    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('GameScene'));

    void darkPaperInset;
  }

  createNaturePreview() {
    this.cameras.main.setBackgroundColor('#203c24');

    this.add.text(40, 28, 'Nature Preview — Trees & Bushes', {
      fontFamily: 'Georgia',
      fontSize: '28px',
      color: '#f4f0d8',
      stroke: '#162015',
      strokeThickness: 5,
    }).setDepth(5);

    this.add.text(40, 66, 'Compare directement les anims jouees par Phaser. Echap: menu | Entree: jeu', {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#f4f0d8',
      stroke: '#162015',
      strokeThickness: 4,
    }).setDepth(5);

    const groundY = 612;
    this.add.rectangle(GAME_WIDTH / 2, groundY + 92, GAME_WIDTH, 220, 0x355f2f, 1).setDepth(0);
    this.add.rectangle(GAME_WIDTH / 2, groundY + 10, GAME_WIDTH, 26, 0x547c43, 1).setDepth(1);

    const treeEntries = [
      { label: 'Tree1', texture: 'tinyswords.resources.tree1', anim: 'tree1-wind', x: 180, height: 220 },
      { label: 'Tree2', texture: 'tinyswords.resources.tree2', anim: 'tree2-wind', x: 430, height: 220 },
      { label: 'Tree3', texture: 'tinyswords.resources.tree3', anim: 'tree3-wind', x: 690, height: 180 },
      { label: 'Tree4', texture: 'tinyswords.resources.tree4', anim: 'tree4-wind', x: 910, height: 180 },
    ];

    treeEntries.forEach((entry, index) => {
      const shadow = this.add.ellipse(entry.x, groundY + 20, 106, 28, 0x102217, 0.28).setDepth(1);
      const sprite = this.add.sprite(entry.x, groundY, entry.texture, 0).setDepth(3);
      sprite.setOrigin(0.5, 1);
      setImageDisplayHeight(this, sprite, entry.height);
      sprite.play(entry.anim);
      sprite.anims.setProgress((index * 0.19) % 1);

      this.add.text(entry.x, groundY + 48, entry.label, {
        fontFamily: 'Georgia',
        fontSize: '18px',
        color: '#f4f0d8',
        stroke: '#162015',
        strokeThickness: 4,
      }).setOrigin(0.5, 0).setDepth(5);

      void shadow;
    });

    const bushEntries = [
      { label: 'Bushe1', texture: 'tinyswords.decor.bush1', anim: 'bush1-wind', x: 230 },
      { label: 'Bushe2', texture: 'tinyswords.decor.bush2', anim: 'bush2-wind', x: 470 },
      { label: 'Bushe3', texture: 'tinyswords.decor.bush3', anim: 'bush3-wind', x: 710 },
      { label: 'Bushe4', texture: 'tinyswords.decor.bush4', anim: 'bush4-wind', x: 950 },
    ];

    bushEntries.forEach((entry, index) => {
      const sprite = this.add.sprite(entry.x, 280, entry.texture, 0).setDepth(3);
      sprite.setOrigin(0.5, 1);
      setImageDisplayHeight(this, sprite, 96);
      sprite.play(entry.anim);
      sprite.anims.setProgress((index * 0.23) % 1);

      this.add.text(entry.x, 304, entry.label, {
        fontFamily: 'Georgia',
        fontSize: '16px',
        color: '#f4f0d8',
        stroke: '#162015',
        strokeThickness: 4,
      }).setOrigin(0.5, 0).setDepth(5);
    });

    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('GameScene'));
  }

  createCarouselPreview() {
    this.cameras.main.setBackgroundColor('#1d2530');
    this.carouselEntries = this.buildCarouselEntries();
    this.carouselCategories = [...new Set(this.carouselEntries.map((entry) => entry.meta?.categoryGroup ?? entry.meta?.category ?? 'misc'))];
    this.carouselCategoryIndex = 0;
    this.filteredCarouselEntries = this.getFilteredCarouselEntries();
    this.carouselIndex = 0;
    this.carouselPreview = null;
    this.carouselAnimEvent = null;
    this.showCollisionOverlay = false;
    this.collisionOverlay = null;

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0f1720, 0.92).setDepth(0);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 1180, 640, 0x182232, 0.9)
      .setStrokeStyle(3, 0xe1d39f, 0.22)
      .setDepth(1);

    this.titleText = this.add.text(GAME_WIDTH / 2, 58, 'Tiny Swords Debug Carousel', {
      fontFamily: 'Georgia',
      fontSize: '32px',
      color: '#f4f0d8',
      stroke: '#111820',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(5);

    this.indexText = this.add.text(GAME_WIDTH / 2, 96, '', {
      fontFamily: 'Georgia',
      fontSize: '18px',
      color: '#d9d1b4',
      stroke: '#111820',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(5);

    this.categoryText = this.add.text(GAME_WIDTH / 2, 122, '', {
      fontFamily: 'Georgia',
      fontSize: '18px',
      color: '#9ed0ff',
      stroke: '#111820',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(5);

    this.nameText = this.add.text(GAME_WIDTH / 2, 154, '', {
      fontFamily: 'Georgia',
      fontSize: '28px',
      color: '#fff3c7',
      stroke: '#111820',
      strokeThickness: 5,
      align: 'center',
      wordWrap: { width: 980 },
    }).setOrigin(0.5).setDepth(5);

    this.metaText = this.add.text(108, 510, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#dbe5f0',
      lineSpacing: 6,
      wordWrap: { width: 1060 },
    }).setDepth(5);

    this.helpText = this.add.text(GAME_WIDTH / 2, 712, '← / → : asset précédent/suivant · ↑ / ↓ : catégorie · C : collisions · boutons tactiles sur mobile · terrain=grille · ui=exemples · ESC : menu', {
      fontFamily: 'Georgia',
      fontSize: '18px',
      color: '#d9d1b4',
      stroke: '#111820',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(5);

    this.createCarouselTouchControls();

    this.input.keyboard.on('keydown-LEFT', () => this.stepCarousel(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.stepCarousel(1));
    this.input.keyboard.on('keydown-UP', () => this.stepCarouselCategory(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.stepCarouselCategory(1));
    this.input.keyboard.on('keydown-C', () => this.toggleCollisionOverlay());
    this.input.keyboard.on('keydown-SPACE', () => this.renderCarouselEntry());
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));

    this.input.on('pointerdown', (pointer) => {
      if (pointer.x < GAME_WIDTH * 0.5) {
        this.stepCarousel(-1);
      } else {
        this.stepCarousel(1);
      }
    });

    this.renderCarouselEntry();
  }

  createCarouselTouchControls() {
    const makeButton = ({ x, y, width, height, label, onTap, fill = 0x243245, stroke = 0xe1d39f, textColor = '#f4f0d8' }) => {
      const button = this.add.container(x, y).setDepth(6);
      const bg = this.add.rectangle(0, 0, width, height, fill, 0.92)
        .setStrokeStyle(3, stroke, 0.95)
        .setInteractive({ useHandCursor: true });
      const text = this.add.text(0, 0, label, {
        fontFamily: 'Georgia',
        fontSize: '20px',
        color: textColor,
        stroke: '#111820',
        strokeThickness: 4,
        align: 'center',
      }).setOrigin(0.5);

      bg.on('pointerdown', (pointer) => {
        pointer.event?.stopPropagation?.();
        onTap();
      });
      bg.on('pointerover', () => bg.setFillStyle(0x31445e, 0.96));
      bg.on('pointerout', () => bg.setFillStyle(fill, 0.92));

      button.add([bg, text]);
      button.bg = bg;
      button.label = text;
      return button;
    };

    this.touchControls = {
      prevCategory: makeButton({ x: 110, y: 120, width: 92, height: 52, label: 'Cat -', onTap: () => this.stepCarouselCategory(-1) }),
      nextCategory: makeButton({ x: GAME_WIDTH - 110, y: 120, width: 92, height: 52, label: 'Cat +', onTap: () => this.stepCarouselCategory(1) }),
      prevAsset: makeButton({ x: 100, y: GAME_HEIGHT / 2, width: 76, height: 96, label: '◀', onTap: () => this.stepCarousel(-1) }),
      nextAsset: makeButton({ x: GAME_WIDTH - 100, y: GAME_HEIGHT / 2, width: 76, height: 96, label: '▶', onTap: () => this.stepCarousel(1) }),
      collisions: makeButton({ x: GAME_WIDTH / 2, y: 662, width: 260, height: 52, label: 'Collisions : OFF', onTap: () => this.toggleCollisionOverlay() }),
    };
  }

  getFilteredCarouselEntries() {
    const category = this.carouselCategories[this.carouselCategoryIndex];
    return this.carouselEntries.filter((entry) => (entry.meta?.categoryGroup ?? entry.meta?.category ?? 'misc') === category);
  }

  stepCarousel(delta) {
    const total = this.filteredCarouselEntries.length;
    this.carouselIndex = (this.carouselIndex + delta + total) % total;
    this.renderCarouselEntry();
  }

  stepCarouselCategory(delta) {
    const total = this.carouselCategories.length;
    this.carouselCategoryIndex = (this.carouselCategoryIndex + delta + total) % total;
    this.filteredCarouselEntries = this.getFilteredCarouselEntries();
    this.carouselIndex = 0;
    this.renderCarouselEntry();
  }

  toggleCollisionOverlay() {
    this.showCollisionOverlay = !this.showCollisionOverlay;
    this.renderCarouselEntry();
  }

  updateCarouselTouchControls() {
    if (!this.touchControls?.collisions) {
      return;
    }

    const active = this.showCollisionOverlay;
    this.touchControls.collisions.label.setText(`Collisions : ${active ? 'ON' : 'OFF'}`);
    this.touchControls.collisions.bg
      .setFillStyle(active ? 0x3d5f36 : 0x243245, 0.92)
      .setStrokeStyle(3, active ? 0x9fe870 : 0xe1d39f, 0.95);
  }

  buildCarouselEntries() {
    const entries = [];
    const basePath = assetManifest.meta.basePath;
    const unitsPath = assetManifest.units.pathTemplate;
    const assetPath = (relativePath) => this.resolveAssetPath(`${basePath}/${relativePath}`);

    ['black'].forEach((color) => {
      Object.keys(assetManifest.buildings.types).forEach((type) => {
        entries.push({
          label: `Building · ${color}/${type}`,
          kind: 'image',
          path: assetPath(assetManifest.buildings.pathTemplate.replace('{Color}', this.capitalize(color)).replace('{file}', assetManifest.buildings.types[type].file)),
          meta: { category: 'building', categoryGroup: 'buildings', color, type },
          fit: 'height',
          targetSize: 260,
        });
      });
    });

    ['black'].forEach((color) => {
      Object.entries(assetManifest.units.types).forEach(([unit, unitDef]) => {
        Object.entries(unitDef.animations).forEach(([animName, animDef]) => {
          if (animDef.file) {
            entries.push(this.createUnitAnimEntry(basePath, unitsPath, color, unit, animName, animDef, unitDef.frameSize));
            return;
          }
          Object.entries(animDef).forEach(([variant, variantDef]) => {
            entries.push(this.createUnitAnimEntry(basePath, unitsPath, color, unit, `${animName}/${variant}`, variantDef, unitDef.frameSize));
          });
        });

        Object.entries(unitDef.extras ?? {}).forEach(([extraName, extraDef]) => {
          entries.push({
            label: `Unit extra · ${color}/${unit}/${extraName}`,
            kind: extraDef.frames ? 'sheet' : 'image',
            path: this.resolveAssetPath(`${basePath}/${unitsPath.replace('{Color}', this.capitalize(color)).replace('{unit}', this.capitalize(unit)).replace('{file}', extraDef.file)}`),
            frameConfig: extraDef.frames ? { frameWidth: extraDef.width / extraDef.frames, frameHeight: extraDef.height } : null,
            frames: extraDef.frames ?? 1,
            meta: { category: 'unit-extra', categoryGroup: 'units', color, unit, extraName },
            fit: 'width',
            targetSize: 320,
          });
        });
      });
    });

    Object.entries(assetManifest.terrain.tileset.tilemaps).forEach(([key, value]) => {
      entries.push({
        label: `Terrain tilemap · ${key}`,
        kind: 'sheet',
        path: assetPath(`Terrain/Tileset/${value.file}`),
        frameConfig: { frameWidth: 64, frameHeight: 64 },
        frames: value.columns * value.rows,
        meta: { category: 'terrain-tilemap', categoryGroup: 'terrain', ...value },
        fit: 'width',
        targetSize: 420,
      });
    });

    entries.push({
      label: 'Terrain water background',
      kind: 'image',
      path: assetPath(`Terrain/Tileset/${assetManifest.terrain.tileset.water.background.file}`),
      meta: { category: 'terrain-water', categoryGroup: 'terrain' },
      fit: 'width',
      targetSize: 320,
    });

    entries.push({
      label: 'Terrain water foam',
      kind: 'sheet',
      path: assetPath(`Terrain/Tileset/${assetManifest.terrain.tileset.water.foam.file}`),
      frameConfig: {
        frameWidth: assetManifest.terrain.tileset.water.foam.frameWidth,
        frameHeight: assetManifest.terrain.tileset.water.foam.height,
      },
      frames: assetManifest.terrain.tileset.water.foam.frames,
      meta: { category: 'terrain-water-foam', categoryGroup: 'terrain' },
      fit: 'width',
      targetSize: 420,
    });

    entries.push({
      label: 'Terrain shadow',
      kind: 'image',
      path: assetPath(`Terrain/Tileset/${assetManifest.terrain.tileset.shadow.file}`),
      meta: { category: 'terrain-shadow', categoryGroup: 'terrain' },
      fit: 'height',
      targetSize: 220,
    });

    assetManifest.terrain.decorations.bushes.items.forEach((item) => {
      entries.push({
        label: `Decoration bush · ${item.file}`,
        kind: 'sheet',
        path: assetPath(`Terrain/Decorations/Bushes/${item.file}`),
        frameConfig: { frameWidth: assetManifest.terrain.decorations.bushes.frameSize.width, frameHeight: assetManifest.terrain.decorations.bushes.frameSize.height },
        frames: item.frames,
        meta: { category: 'terrain-bush', categoryGroup: 'decorations' },
        fit: 'height',
        targetSize: 180,
      });
    });

    assetManifest.terrain.decorations.clouds.items.forEach((item) => {
      entries.push({
        label: `Decoration cloud · ${item.file}`,
        kind: 'image',
        path: assetPath(`Terrain/Decorations/Clouds/${item.file}`),
        meta: { category: 'terrain-cloud', categoryGroup: 'decorations' },
        fit: 'width',
        targetSize: 440,
      });
    });

    assetManifest.terrain.decorations.rocks.items.forEach((item) => {
      entries.push({
        label: `Decoration rock · ${item}`,
        kind: 'image',
        path: assetPath(`Terrain/Decorations/Rocks/${item}`),
        meta: { category: 'terrain-rock', categoryGroup: 'decorations' },
        fit: 'height',
        targetSize: 140,
      });
    });

    assetManifest.terrain.decorations.waterRocks.items.forEach((item) => {
      entries.push({
        label: `Decoration water rock · ${item.file}`,
        kind: 'sheet',
        path: assetPath(`Terrain/Decorations/Rocks in the Water/${item.file}`),
        frameConfig: { frameWidth: assetManifest.terrain.decorations.waterRocks.frameSize.width, frameHeight: assetManifest.terrain.decorations.waterRocks.frameSize.height },
        frames: item.frames,
        meta: { category: 'terrain-water-rock', categoryGroup: 'decorations' },
        fit: 'height',
        targetSize: 160,
      });
    });

    entries.push({
      label: 'Decoration rubber duck',
      kind: 'sheet',
      path: assetPath(`Terrain/Decorations/Rubber Duck/${assetManifest.terrain.decorations.rubberDuck.file}`),
      frameConfig: {
        frameWidth: assetManifest.terrain.decorations.rubberDuck.frameWidth,
        frameHeight: assetManifest.terrain.decorations.rubberDuck.height,
      },
      frames: assetManifest.terrain.decorations.rubberDuck.frames,
      meta: { category: 'terrain-rubber-duck', categoryGroup: 'decorations' },
      fit: 'width',
      targetSize: 260,
    });

    assetManifest.terrain.resources.gold.stones.items.forEach((item) => {
      entries.push({
        label: `Gold stone · ${item.normal}`,
        kind: 'image',
        path: assetPath(`Terrain/Resources/Gold/Gold Stones/${item.normal}`),
        meta: { category: 'gold-stone', categoryGroup: 'resources' },
        fit: 'height',
        targetSize: 180,
      });
      entries.push({
        label: `Gold stone highlight · ${item.highlight}`,
        kind: 'sheet',
        path: assetPath(`Terrain/Resources/Gold/Gold Stones/${item.highlight}`),
        frameConfig: { frameWidth: 128, frameHeight: 128 },
        frames: assetManifest.terrain.resources.gold.stones.highlightFrames,
        meta: { category: 'gold-stone-highlight', categoryGroup: 'resources' },
        fit: 'height',
        targetSize: 180,
      });
    });

    entries.push({
      label: 'Gold resource',
      kind: 'image',
      path: assetPath(`Terrain/Resources/Gold/Gold Resource/${assetManifest.terrain.resources.gold.resource.normal.file}`),
      meta: { category: 'gold-resource', categoryGroup: 'resources' },
      fit: 'height',
      targetSize: 180,
    });
    entries.push({
      label: 'Gold resource highlight',
      kind: 'sheet',
      path: assetPath(`Terrain/Resources/Gold/Gold Resource/${assetManifest.terrain.resources.gold.resource.highlight.file}`),
      frameConfig: { frameWidth: 128, frameHeight: 128 },
      frames: assetManifest.terrain.resources.gold.resource.highlight.frames,
      meta: { category: 'gold-resource-highlight', categoryGroup: 'resources' },
      fit: 'height',
      targetSize: 180,
    });

    assetManifest.terrain.resources.wood.trees.items.forEach((item, index) => {
      entries.push({
        label: `Wood tree · ${item.tree}`,
        kind: 'sheet',
        path: assetPath(`Terrain/Resources/Wood/Trees/${item.tree}`),
        frameConfig: { frameWidth: item.frameWidth ?? (item.width / item.frames), frameHeight: item.frameHeight ?? item.height },
        frames: item.frames,
        meta: { category: 'wood-tree', categoryGroup: 'resources', stump: item.stump },
        fit: 'height',
        targetSize: 230,
      });
      entries.push({
        label: `Wood stump · ${item.stump}`,
        kind: 'image',
        path: assetPath(`Terrain/Resources/Wood/Trees/${item.stump}`),
        meta: { category: 'wood-stump', categoryGroup: 'resources', index },
        fit: 'height',
        targetSize: 180,
      });
    });

    entries.push({
      label: 'Wood resource',
      kind: 'image',
      path: assetPath(`Terrain/Resources/Wood/Wood Resource/${assetManifest.terrain.resources.wood.resource.file}`),
      meta: { category: 'wood-resource', categoryGroup: 'resources' },
      fit: 'height',
      targetSize: 140,
    });

    entries.push({
      label: 'Meat resource',
      kind: 'image',
      path: assetPath(`Terrain/Resources/Meat/Meat Resource/${assetManifest.terrain.resources.meat.resource.file}`),
      meta: { category: 'meat-resource', categoryGroup: 'resources' },
      fit: 'height',
      targetSize: 140,
    });

    Object.entries(assetManifest.terrain.resources.meat.sheep.animations).forEach(([animName, animDef]) => {
      entries.push({
        label: `Sheep · ${animName}`,
        kind: 'sheet',
        path: assetPath(`Terrain/Resources/Meat/Sheep/${animDef.file}`),
        frameConfig: { frameWidth: assetManifest.terrain.resources.meat.sheep.frameSize.width, frameHeight: assetManifest.terrain.resources.meat.sheep.frameSize.height },
        frames: animDef.frames,
        meta: { category: 'sheep', categoryGroup: 'resources', animName },
        fit: 'height',
        targetSize: 180,
      });
    });

    assetManifest.terrain.resources.tools.items.forEach((item) => {
      entries.push({
        label: `Tool · ${item}`,
        kind: 'image',
        path: assetPath(`Terrain/Resources/Tools/${item}`),
        meta: { category: 'tool', categoryGroup: 'resources' },
        fit: 'height',
        targetSize: 140,
      });
    });

    entries.push(
      { label: 'UI example · bouton rouge', kind: 'ui-example', meta: { category: 'ui-button', categoryGroup: 'ui' } },
      { label: 'UI example · cadre papier', kind: 'ui-example', meta: { category: 'ui-paper', categoryGroup: 'ui' } },
      { label: 'UI example · wood table', kind: 'ui-example', meta: { category: 'ui-wood-table', categoryGroup: 'ui' } },
      { label: 'UI example · big + small bar', kind: 'ui-example', meta: { category: 'ui-bars', categoryGroup: 'ui' } },
      { label: 'UI example · banner page', kind: 'ui-example', meta: { category: 'ui-banner-page', categoryGroup: 'ui' } },
      { label: 'UI example · ribbon + swords', kind: 'ui-example', meta: { category: 'ui-ribbon', categoryGroup: 'ui' } }
    );

    Object.entries(PARTICLE_FRAME_CONFIGS).forEach(([file, config]) => {
      entries.push({
        label: `Particle · ${file}`,
        kind: 'sheet',
        path: assetPath(`Particle FX/${file}`),
        frameConfig: { frameWidth: config.frameWidth, frameHeight: config.frameHeight },
        frames: config.frames,
        meta: { category: 'particle', categoryGroup: 'particles', file },
        fit: config.frameWidth > 64 ? 'height' : 'width',
        targetSize: config.frameWidth > 64 ? 220 : 280,
      });
    });

    return entries;
  }

  createUnitAnimEntry(basePath, pathTemplate, color, unit, animName, animDef, frameSize) {
    return {
      label: `Unit anim · ${color}/${unit}/${animName}`,
      kind: 'sheet',
      path: this.resolveAssetPath(`${basePath}/${pathTemplate.replace('{Color}', this.capitalize(color)).replace('{unit}', this.capitalize(unit)).replace('{file}', animDef.file)}`),
      frameConfig: {
        frameWidth: frameSize.width,
        frameHeight: frameSize.height,
      },
      frames: animDef.frames,
      meta: { category: 'unit', categoryGroup: 'units', color, unit, animName },
      fit: 'height',
      targetSize: unit === 'lancer' ? 280 : 240,
    };
  }

  capitalize(value) {
    return `${value[0].toUpperCase()}${value.slice(1)}`;
  }

  resolveAssetPath(path) {
    if (!path) {
      return path;
    }

    const normalizedBase = ASSET_BASE_URL.replace(/\/$/, '');
    const normalizedManifestBase = MANIFEST_BASE_PATH.replace(/\/$/, '');

    if (path.startsWith(normalizedBase)) {
      return path;
    }

    if (path.startsWith(normalizedManifestBase)) {
      return `${normalizedBase}${path.slice(normalizedManifestBase.length)}`;
    }

    if (path.startsWith('/assets/tinyswords')) {
      return `${normalizedBase}${path.slice('/assets/tinyswords'.length)}`;
    }

    if (path.startsWith('assets/tinyswords')) {
      return `${normalizedBase}${path.slice('assets/tinyswords'.length)}`;
    }

    return path;
  }

  async renderCarouselEntry() {
    const entry = this.filteredCarouselEntries[this.carouselIndex];
    const activeCategory = this.carouselCategories[this.carouselCategoryIndex];
    this.indexText.setText(`${this.carouselIndex + 1} / ${this.filteredCarouselEntries.length}`);
    this.categoryText.setText(`Catégorie : ${activeCategory}`);
    this.nameText.setText(entry.label);
    this.metaText.setText(this.formatEntryMeta(entry));
    this.updateCarouselTouchControls();

    if (this.carouselPreview) {
      if (typeof this.carouselPreview.destroy === 'function') {
        this.carouselPreview.destroy();
      }
      this.carouselPreview = null;
    }
    if (this.carouselAnimEvent) {
      this.carouselAnimEvent.remove(false);
      this.carouselAnimEvent = null;
    }
    if (this.collisionOverlay) {
      this.collisionOverlay.destroy();
      this.collisionOverlay = null;
    }

    if (entry.kind === 'ui-example') {
      this.carouselPreview = this.renderUiExamplePreview(entry);
      return;
    }

    const cacheKey = `carousel::${entry.path}`;
    if (!this.textures.exists(cacheKey)) {
      if (entry.kind === 'sheet') {
        this.load.spritesheet(cacheKey, entry.path, entry.frameConfig);
      } else {
        this.load.image(cacheKey, entry.path);
      }
      await new Promise((resolve) => {
        this.load.once(`filecomplete-${entry.kind === 'sheet' ? 'spritesheet' : 'image'}-${cacheKey}`, resolve);
        this.load.start();
      });
    }

    if (entry.kind === 'sheet') {
      if (activeCategory === 'terrain' && entry.meta?.category === 'terrain-tilemap') {
        this.carouselPreview = this.renderTilemapGridPreview(cacheKey, entry);
        return;
      }

      const sprite = this.add.sprite(GAME_WIDTH / 2, 360, cacheKey, 0).setDepth(4);
      sprite.setOrigin(0.5, 0.5);
      const frameWidth = entry.frameConfig?.frameWidth ?? sprite.width;
      const frameHeight = entry.frameConfig?.frameHeight ?? sprite.height;
      if (entry.fit === 'height') {
        const scale = entry.targetSize / frameHeight;
        sprite.setDisplaySize(frameWidth * scale, entry.targetSize);
      } else {
        const scale = entry.targetSize / frameWidth;
        sprite.setDisplaySize(entry.targetSize, frameHeight * scale);
      }

      const animKey = `${cacheKey}::anim`;
      if (!this.anims.exists(animKey)) {
        this.anims.create({
          key: animKey,
          frames: this.anims.generateFrameNumbers(cacheKey),
          frameRate: Math.min(12, Math.max(4, entry.frames)),
          repeat: -1,
        });
      }
      sprite.play(animKey);
      this.carouselPreview = sprite;
    } else {
      const image = this.add.image(GAME_WIDTH / 2, 360, cacheKey).setDepth(4);
      if (entry.fit === 'height') {
        setImageDisplayHeight(this, image, entry.targetSize);
      } else {
        setImageDisplayWidth(this, image, entry.targetSize);
      }
      this.carouselPreview = image;
    }

    if (this.showCollisionOverlay) {
      this.collisionOverlay = this.renderCollisionOverlay(entry, this.carouselPreview);
    }
  }

  renderUiExamplePreview(entry) {
    const container = this.add.container(0, 0).setDepth(4);
    const attach = (...objects) => {
      objects.flat().forEach((obj) => {
        obj.setData('carousel-ui-preview', true);
        container.add(obj);
      });
    };

    if (entry.meta.category === 'ui-button') {
      const plaque = createPlaque(this, {
        x: GAME_WIDTH / 2,
        y: 340,
        frameKey: 'tinyswords.ui.button.red.frame',
        width: 210,
        height: 118,
      }).container;
      const label = this.add.text(GAME_WIDTH / 2, 340, 'Construire', {
        fontFamily: 'Georgia',
        fontSize: '30px',
        color: '#f7efcf',
        stroke: '#4b2115',
        strokeThickness: 5,
      }).setOrigin(0.5).setDepth(5);
      const code = this.add.text(120, 470, "createPlaque(... frameKey: 'tinyswords.ui.button.red.frame')", {
        fontFamily: 'monospace', fontSize: '16px', color: '#dbe5f0'
      }).setDepth(5);
      attach(plaque, label, code);
    }

    if (entry.meta.category === 'ui-paper') {
      const plaque = createPlaque(this, {
        x: GAME_WIDTH / 2,
        y: 340,
        frameKey: 'tinyswords.ui.paper.special.frame',
        width: 420,
        height: 240,
      }).container;
      const title = this.add.text(GAME_WIDTH / 2, 280, 'Fiche de commande', {
        fontFamily: 'Georgia', fontSize: '28px', color: '#57311a'
      }).setOrigin(0.5).setDepth(5);
      const body = this.add.text(GAME_WIDTH / 2, 350, '2x Bois\n1x Pierre d’or\n1x Outil', {
        fontFamily: 'Georgia', fontSize: '24px', align: 'center', color: '#4f341f'
      }).setOrigin(0.5).setDepth(5);
      const code = this.add.text(120, 500, "createPlaque(... frameKey: 'tinyswords.ui.paper.special.frame')", {
        fontFamily: 'monospace', fontSize: '16px', color: '#dbe5f0'
      }).setDepth(5);
      attach(plaque, title, body, code);
    }

    if (entry.meta.category === 'ui-wood-table') {
      const plaque = createPlaque(this, {
        x: GAME_WIDTH / 2,
        y: 332,
        frameKey: 'tinyswords.ui.wood-table.frame',
        fillKey: 'tinyswords.ui.wood-table.fill',
        width: 360,
        height: 360,
        fillInsetX: 28,
        fillInsetY: 28,
      }).container;
      const code = this.add.text(120, 500, "createPlaque(... frameKey: 'tinyswords.ui.wood-table.frame', fillKey: 'tinyswords.ui.wood-table.fill')", {
        fontFamily: 'monospace', fontSize: '16px', color: '#dbe5f0', wordWrap: { width: 1040 }
      }).setDepth(5);
      attach(plaque, code);
    }

    if (entry.meta.category === 'ui-bars') {
      const makeBar = ({ y, width, textureBase, textureFill, ratio, label }) => {
        const baseHeight = 51;
        const fillInsetLeft = 10;
        const fillInsetRight = 18;
        const fillInsetVertical = 5;
        const usableFillWidth = width - fillInsetLeft - fillInsetRight;
        const fillWidth = usableFillWidth * ratio;
        const fillHeight = baseHeight - (fillInsetVertical * 2);

        const base = createThreeSliceHorizontal(this, {
          x: GAME_WIDTH / 2,
          y,
          textureKey: textureBase,
          width,
          height: baseHeight,
        }).container;
        const fill = this.add.tileSprite(
          (GAME_WIDTH / 2) - (width / 2) + fillInsetLeft,
          y,
          fillWidth,
          fillHeight,
          textureFill
        )
          .setOrigin(0, 0.5)
          .setDepth(5);
        fill.tileScaleX = fillHeight / 64;
        fill.tileScaleY = fillHeight / 64;
        const text = this.add.text(120, y - 34, label, {
          fontFamily: 'Georgia', fontSize: '18px', color: '#f4f0d8'
        }).setDepth(5);
        attach(base, fill, text);
      };

      makeBar({ y: 290, width: 360, textureBase: 'tinyswords.ui.bigbar.base.frame', textureFill: 'tinyswords.ui.bigbar.fill', ratio: 0.72, label: 'Big bar' });
      makeBar({ y: 390, width: 300, textureBase: 'tinyswords.ui.smallbar.base.frame', textureFill: 'tinyswords.ui.smallbar.fill', ratio: 0.48, label: 'Small bar' });

      const code = this.add.text(120, 500, "big/small bar : 3-slice base + tileSprite fill avec largeur variable", {
        fontFamily: 'monospace', fontSize: '16px', color: '#dbe5f0', wordWrap: { width: 1040 }
      }).setDepth(5);
      attach(code);
    }

    if (entry.meta.category === 'ui-banner-page') {
      const banner = createPlaque(this, {
        x: GAME_WIDTH / 2,
        y: 320,
        frameKey: 'tinyswords.ui.banner.frame',
        fillKey: 'tinyswords.ui.banner.fill',
        width: 420,
        height: 240,
        fillInsetX: 28,
        fillInsetY: 28,
      }).container;
      const title = this.add.text(GAME_WIDTH / 2, 265, 'Village Panic', {
        fontFamily: 'Georgia', fontSize: '30px', color: '#57311a'
      }).setOrigin(0.5).setDepth(5);
      const subtitle = this.add.text(GAME_WIDTH / 2, 330, 'Nouvelle vague arrive !', {
        fontFamily: 'Georgia', fontSize: '22px', color: '#4f341f'
      }).setOrigin(0.5).setDepth(5);
      const code = this.add.text(120, 500, "createPlaque(... frameKey: 'tinyswords.ui.banner.frame', fillKey: 'tinyswords.ui.banner.fill')", {
        fontFamily: 'monospace', fontSize: '16px', color: '#dbe5f0', wordWrap: { width: 1040 }
      }).setDepth(5);
      attach(banner, title, subtitle, code);
    }

    if (entry.meta.category === 'ui-ribbon') {
      const ribbon = createThreeSliceHorizontal(this, {
        x: GAME_WIDTH / 2,
        y: 300,
        textureKey: 'tinyswords.ui.ribbons.big',
        row: 1,
        width: 340,
        height: 103,
      }).container;
      const swords = createThreeSliceHorizontal(this, {
        x: GAME_WIDTH / 2,
        y: 404,
        textureKey: 'tinyswords.ui.swords',
        row: 2,
        width: 250,
        height: 128,
      }).container;
      const code = this.add.text(120, 500, "createThreeSliceHorizontal(... 'tinyswords.ui.ribbons.big') / (... 'tinyswords.ui.swords')", {
        fontFamily: 'monospace', fontSize: '16px', color: '#dbe5f0', wordWrap: { width: 1040 }
      }).setDepth(5);
      attach(ribbon, swords, code);
    }

    return container;
  }

  renderCollisionOverlay(entry, preview) {
    const box = this.getCollisionBox(entry, preview);
    if (!box) {
      return null;
    }

    const rect = this.add.rectangle(box.x, box.y, box.width, box.height)
      .setOrigin(0.5)
      .setStrokeStyle(3, 0xff5d73, 0.95)
      .setFillStyle(0xff5d73, 0.08)
      .setDepth(20);
    const label = this.add.text(box.x, box.y - (box.height / 2) - 10, 'collision', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffccd3', stroke: '#111820', strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(21);

    return this.add.container(0, 0, [rect, label]).setDepth(20);
  }

  getCollisionBox(entry, preview) {
    if (!preview || !preview.displayWidth || !preview.displayHeight || !entry.path) {
      return null;
    }

    const relativePath = entry.path.replace(`${ASSET_BASE_URL}/`, '');
    const collisionDef = assetManifest.collisions?.gameplay?.[relativePath]?.box;
    if (!collisionDef) {
      return null;
    }

    return {
      x: preview.x + ((collisionDef.x - 0.5) * preview.displayWidth),
      y: preview.y + ((collisionDef.y - 0.5) * preview.displayHeight),
      width: preview.displayWidth * collisionDef.width,
      height: preview.displayHeight * collisionDef.height,
    };
  }

  renderTilemapGridPreview(cacheKey, entry) {
    const cols = entry.meta.columns ?? 1;
    const rows = entry.meta.rows ?? 1;
    const frameWidth = entry.frameConfig.frameWidth;
    const frameHeight = entry.frameConfig.frameHeight;
    const maxWidth = 780;
    const maxHeight = 340;
    const cellScale = Math.min(maxWidth / (cols * frameWidth), maxHeight / (rows * frameHeight));
    const cellW = frameWidth * cellScale;
    const cellH = frameHeight * cellScale;
    const startX = (GAME_WIDTH / 2) - ((cols * cellW) / 2) + (cellW / 2);
    const startY = 360 - ((rows * cellH) / 2) + (cellH / 2);
    const container = this.add.container(0, 0).setDepth(4);

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const frameIndex = (row * cols) + col;
        const x = startX + (col * cellW);
        const y = startY + (row * cellH);
        const sprite = this.add.image(x, y, cacheKey, frameIndex)
          .setDisplaySize(cellW, cellH)
          .setDepth(4);
        const border = this.add.rectangle(x, y, cellW, cellH)
          .setStrokeStyle(1, 0xe8d9a5, 0.35)
          .setFillStyle(0x000000, 0)
          .setDepth(5);
        const label = this.add.text(x - (cellW / 2) + 4, y - (cellH / 2) + 2, `${frameIndex}`, {
          fontFamily: 'monospace',
          fontSize: `${Math.max(10, Math.floor(12 * cellScale))}px`,
          color: '#fff4cf',
          stroke: '#111820',
          strokeThickness: 3,
        }).setOrigin(0, 0).setDepth(6);
        container.add([sprite, border, label]);
      }
    }

    return container;
  }

  formatEntryMeta(entry) {
    return [
      `Type: ${entry.kind}`,
      `Path: ${entry.path ? entry.path.replace(ASSET_BASE_URL, 'assets/tinyswords') : 'example composition (no direct asset path)'}`,
      entry.frameConfig ? `Frame: ${entry.frameConfig.frameWidth}x${entry.frameConfig.frameHeight}` : 'Frame: image fixe',
      `Frames: ${entry.frames ?? 1}`,
      `Preview mode: ${entry.kind === 'ui-example' ? 'concrete ui composition example' : entry.meta?.category === 'terrain-tilemap' ? 'tile grid with frame ids' : 'animated preview'}`,
      `Meta: ${JSON.stringify(entry.meta)}`,
    ].join('\n');
  }
}
