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
}
