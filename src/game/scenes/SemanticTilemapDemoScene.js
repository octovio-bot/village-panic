import Phaser from 'phaser';
import { InputManager } from '../input/InputManager.js';
import { GAME_HEIGHT, GAME_WIDTH, PLAYER_SPEED } from '../data.js';
import {
  createSemanticTileSprites,
} from '../tiles/semanticTilemap.js';

const TILE = 64;
const MAP_ORIGIN_X = 96;
const MAP_ORIGIN_Y = 112;
const DEMO_LAYOUT = {
  background: Array.from({ length: 10 }, () => Array.from({ length: 14 }, () => null)),
  flat: [
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, 'level1-water-nw', 'level1-water-north', 'level1-water-north', 'level1-water-ne', null, null, null, null, null, null, null, null, null],
    [null, 'level1-water-west', 'level1-center', 'level1-center', 'level1-water-east', null, null, null, null, null, null, null, null, null],
    [null, 'level1-water-west', 'level1-center', 'level1-center', 'level1-water-east', 'level1-water-vertical-top', null, null, null, null, null, null, null, null],
    [null, 'level1-water-sw', 'level1-water-south', 'level1-water-south', 'level1-water-se', 'level1-water-vertical-center', null, null, null, null, null, null, null, null],
    [null, null, 'level1-water-horizontal-left', 'level1-water-horizontal-center', 'level1-water-horizontal-right', 'level1-water-vertical-bottom', null, null, null, null, null, null, null, null],
    [null, null, null, null, 'level1-water-isolated', null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ],
  shadow1: [
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ],
  elevated1: [
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, 'level2-cliff-nw', 'level2-cliff-north', 'level2-cliff-ne', 'level2-cliff-vertical-top', null, null],
    [null, null, null, null, null, null, null, null, 'level2-cliff-west', 'level2-center', 'level2-cliff-east', 'level2-cliff-vertical-center', null, null],
    [null, null, null, null, null, null, null, null, 'level2-cliff-sw', 'level2-cliff-south', 'level2-cliff-se', 'level2-cliff-vertical-bottom', null, null],
    [null, null, null, null, null, null, null, null, 'level2-cliff-horizontal-left', 'level2-cliff-horizontal-center', 'level2-cliff-horizontal-right', 'level2-cliff-isolated', null, null],
    [null, null, null, null, null, null, null, null, null, 'cliff-face-left', 'cliff-face-center', 'cliff-face-right', null, null],
    [null, null, null, null, null, null, null, null, null, 'cliff-face-water-left', 'cliff-face-water-center', 'cliff-face-water-right', null, null],
    [null, null, null, null, null, 'slope-right-top', null, null, null, null, null, null, null, null],
  ],
  slope1: [
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, 'slope-right-bottom', null, null, null, null, null, null, null],
    [null, null, null, null, 'slope-left-top', null, null, null, null, null, null, null, null, null],
  ],
  slope2: [
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, 'slope-left-bottom', null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ],
};

export class SemanticTilemapDemoScene extends Phaser.Scene {
  constructor() {
    super('SemanticTilemapDemoScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#102217');
    this.inputManager = new InputManager(this);
    window.__SEMANTIC_TILEMAP_DEMO__ = { layout: DEMO_LAYOUT };

    this.add.text(28, 20, 'Semantic Tilemap Demo', {
      fontFamily: 'Georgia',
      fontSize: '30px',
      color: '#f4f0d8',
      stroke: '#162015',
      strokeThickness: 5,
    }).setScrollFactor(0).setDepth(1000);

    this.add.text(28, 58, 'Eau en fond, niveau 1, falaise, pente et pawn mobile pour vérifier la cohérence.', {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#f4f0d8',
      stroke: '#162015',
      strokeThickness: 4,
    }).setScrollFactor(0).setDepth(1000);

    this.renderDemoLayers();
    this.createPawn();
    this.cameras.main.startFollow(this.pawn, true, 0.12, 0.12);
    this.cameras.main.setBounds(0, 0, 1400, 900);
    this.physics.world.setBounds(0, 0, 1400, 900);
    this.scene.launch('TouchHudScene');
  }

  renderDemoLayers() {
    this.add.rectangle(MAP_ORIGIN_X + (14 * TILE / 2), MAP_ORIGIN_Y + (10 * TILE / 2), 14 * TILE, 10 * TILE, 0x3a6ea5, 1).setOrigin(0.5).setDepth(-5);
    createSemanticTileSprites(this, { x: MAP_ORIGIN_X, y: MAP_ORIGIN_Y, tileSize: TILE, colorVariant: 'color2', grid: DEMO_LAYOUT.background }).forEach((sprite) => sprite.setDepth(0));

    createSemanticTileSprites(this, { x: MAP_ORIGIN_X, y: MAP_ORIGIN_Y, tileSize: TILE, colorVariant: 'color1', grid: DEMO_LAYOUT.flat }).forEach((sprite) => sprite.setDepth(20));
    createSemanticTileSprites(this, { x: MAP_ORIGIN_X, y: MAP_ORIGIN_Y + TILE, tileSize: TILE, colorVariant: 'color4', grid: DEMO_LAYOUT.shadow1 }).forEach((sprite) => sprite.setAlpha(0.35).setDepth(30));
    createSemanticTileSprites(this, { x: MAP_ORIGIN_X, y: MAP_ORIGIN_Y, tileSize: TILE, colorVariant: 'color3', grid: DEMO_LAYOUT.elevated1 }).forEach((sprite) => sprite.setDepth(40));
    createSemanticTileSprites(this, { x: MAP_ORIGIN_X, y: MAP_ORIGIN_Y, tileSize: TILE, colorVariant: 'color3', grid: DEMO_LAYOUT.slope1 }).forEach((sprite) => sprite.setDepth(45));
    createSemanticTileSprites(this, { x: MAP_ORIGIN_X, y: MAP_ORIGIN_Y, tileSize: TILE, colorVariant: 'color3', grid: DEMO_LAYOUT.slope2 }).forEach((sprite) => sprite.setDepth(46));
  }

  createPawn() {
    this.pawn = this.physics.add.sprite(MAP_ORIGIN_X + 3.5 * TILE, MAP_ORIGIN_Y + 3.5 * TILE, 'tinyswords.units.blue.pawn.idle', 0);
    this.pawn.setCollideWorldBounds(true);
    this.pawn.setDepth(500);
    this.pawn.play('player-idle-base');
  }

  update() {
    const move = this.inputManager.getMoveVector();
    this.pawn.body.setVelocity(move.x * PLAYER_SPEED, move.y * PLAYER_SPEED);

    if (move.lengthSq() > 0) {
      this.pawn.play('player-run-base', true);
    } else {
      this.pawn.play('player-idle-base', true);
    }

    this.pawn.setDepth(Math.round((this.pawn.y + (this.pawn.displayHeight * 0.5)) * 10) + 500);
  }
}
