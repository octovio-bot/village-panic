import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../data.js';
import { createPlaque, createThreeSliceHorizontal, setImageDisplayHeight } from '../ui/tinySwordsUi.js';

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
}
