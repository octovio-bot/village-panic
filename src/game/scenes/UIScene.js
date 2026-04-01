import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, RESOURCE_LABELS } from '../data.js';
import { createHudPanel, createChaosBar } from '../ui/tinySwordsHud.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    this.gameScene = this.scene.get('GameScene');

    createHudPanel(this, {
      x: 176,
      y: 48,
      width: 312,
      height: 72,
      frameKey: 'tinyswords.ui.paper.special.frame',
      depth: 95,
      alpha: 0.92,
    });
    createHudPanel(this, {
      x: GAME_WIDTH - 120,
      y: 32,
      width: 170,
      height: 44,
      frameKey: 'tinyswords.ui.paper.special.frame',
      depth: 95,
      alpha: 0.92,
    });
    createHudPanel(this, {
      x: 196,
      y: GAME_HEIGHT - 34,
      width: 368,
      height: 46,
      frameKey: 'tinyswords.ui.paper.special.frame',
      depth: 95,
      alpha: 0.94,
    });

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

    const chaosBar = createChaosBar(this, {
      x: GAME_WIDTH / 2,
      y: 48,
      width: 320,
      height: 40,
      fillWidth: 228,
      fillHeight: 24,
      depth: 100,
    });
    this.chaosBase = chaosBar.base;
    this.chaosFill = chaosBar.fill;
    this.chaosFillWidth = chaosBar.fillWidth;
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
    this.chaosFill.width = this.chaosFillWidth * (snapshot.chaos.value / snapshot.chaos.threshold);

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
