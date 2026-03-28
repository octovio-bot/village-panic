import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, RESOURCE_LABELS } from '../data.js';
import { createThreeSliceHorizontal } from '../ui/tinySwordsUi.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    this.gameScene = this.scene.get('GameScene');

    this.add.rectangle(176, 48, 312, 72, 0x0f1a14, 0.78)
      .setStrokeStyle(2, 0xe8d9a5, 0.24)
      .setDepth(95);
    this.add.rectangle(GAME_WIDTH - 120, 32, 170, 44, 0x0f1a14, 0.78)
      .setStrokeStyle(2, 0xe8d9a5, 0.24)
      .setDepth(95);
    this.add.rectangle(196, GAME_HEIGHT - 34, 368, 46, 0x0f1a14, 0.84)
      .setStrokeStyle(2, 0xe8d9a5, 0.24)
      .setDepth(95);

    this.toastText = this.add.text(GAME_WIDTH / 2, 30, '', {
      fontFamily: 'Georgia',
      fontSize: '26px',
      color: '#fff2bf',
      stroke: '#3d2211',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(100);

    this.scoreText = this.add.text(26, 18, '', {
      fontFamily: 'Georgia',
      fontSize: '25px',
      color: '#f7e8bd',
    }).setDepth(100);

    this.timeText = this.add.text(GAME_WIDTH - 26, 18, '', {
      fontFamily: 'Georgia',
      fontSize: '25px',
      color: '#f7e8bd',
    }).setOrigin(1, 0).setDepth(100);

    this.carryText = this.add.text(26, 52, '', {
      fontFamily: 'Georgia',
      fontSize: '20px',
      color: '#f3deb1',
    }).setDepth(100);

    this.promptText = this.add.text(26, GAME_HEIGHT - 40, '', {
      fontFamily: 'Georgia',
      fontSize: '20px',
      color: '#fff0bf',
      stroke: '#2d1a10',
      strokeThickness: 4,
    }).setDepth(100);

    this.chaosBase = createThreeSliceHorizontal(this, {
      x: GAME_WIDTH / 2,
      y: 48,
      textureKey: 'tinyswords.ui.bigbar.base.frame',
      width: 320,
      height: 40,
      alpha: 1,
    }).container.setDepth(100);
    this.chaosFill = this.add.tileSprite(GAME_WIDTH / 2 - 114, 48, 228, 24, 'tinyswords.ui.bigbar.fill')
      .setOrigin(0, 0.5)
      .setDepth(101);
    this.chaosFill.tileScaleX = 24 / 64;
    this.chaosFill.tileScaleY = 24 / 64;
    this.add.text(GAME_WIDTH / 2, 48, 'CHAOS', {
      fontFamily: 'Georgia',
      fontSize: '18px',
      color: '#31140f',
    }).setOrigin(0.5).setDepth(102);
  }

  update() {
    if (!this.gameScene || !this.gameScene.scene.isActive()) {
      return;
    }

    const snapshot = this.gameScene.getUiSnapshot();
    this.scoreText.setText(`Score ${snapshot.score} | Combo ${snapshot.combo}`);
    this.timeText.setText(`Temps ${this.formatTime(snapshot.remainingRoundTime)}`);
    this.carryText.setText(snapshot.carriedItem ? `Porte: ${RESOURCE_LABELS[snapshot.carriedItem]}` : 'Porte: rien');
    this.promptText.setText(snapshot.interactionPrompt ?? 'Explore le village');
    this.chaosFill.width = 228 * (snapshot.chaos.value / snapshot.chaos.threshold);

    if (snapshot.toast) {
      this.toastText.setText(snapshot.toast.message);
      this.toastText.setAlpha(1 - (snapshot.toast.elapsed / snapshot.toast.duration));
    } else {
      this.toastText.setText('');
    }
  }

  formatTime(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = `${totalSeconds % 60}`.padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
}
