import Phaser from 'phaser';
import { createTinySwordsAnimations, preloadTinySwords } from '../assetKeys.js';
import { GAME_HEIGHT, GAME_WIDTH } from '../data.js';
import { DEFAULT_POST_BOOT_SCENE } from '../launchOptions.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x112619);

    const title = this.add.text(GAME_WIDTH / 2, 220, 'Village Panic', {
      fontFamily: 'Georgia',
      fontSize: '54px',
      color: '#f6e7b1',
      stroke: '#3f2412',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.rectangle(GAME_WIDTH / 2, 420, 460, 38, 0x000000, 0.25).setStrokeStyle(2, 0xf6e7b1, 0.6);
    const barFill = this.add.rectangle(GAME_WIDTH / 2 - 226, 420, 8, 26, 0xe8b94d).setOrigin(0, 0.5);

    this.load.on('progress', (value) => {
      barFill.width = 8 + (444 * value);
    });

    preloadTinySwords(this.load);
    if (DEFAULT_POST_BOOT_SCENE === 'LoadedMapScene') {
      this.load.tilemapTiledJSON('custom-map-1', `${import.meta.env.BASE_URL}maps/map1.json`);
    }

    this.load.once('complete', () => {
      createTinySwordsAnimations(this);
      title.setText('Le village s eveille...');
      this.time.delayedCall(280, () => this.scene.start(DEFAULT_POST_BOOT_SCENE));
    });
  }
}
