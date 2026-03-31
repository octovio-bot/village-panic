import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../data.js';
import { createPlaque } from '../ui/tinySwordsUi.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.summary = data;
    this.restartScene = data.restartScene ?? 'GameScene';
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x101817, 0.95);
    createPlaque(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      frameKey: 'tinyswords.ui.paper.special.frame',
      width: 620,
      height: 420,
      alpha: 0.95,
    });

    this.add.text(GAME_WIDTH / 2, 218, 'Fin de partie', {
      fontFamily: 'Georgia',
      fontSize: '54px',
      color: '#57311a',
      stroke: '#f6ebc7',
      strokeThickness: 6
    }).setOrigin(0.5);

    [
      `Score final: ${this.summary.score}`,
      `Commandes reussies: ${this.summary.completedOrders}`,
      `Commandes ratees: ${this.summary.failedOrders}`,
      `Chaos restant: ${this.summary.chaosValue}`
    ].forEach((line, index) => {
      this.add.text(GAME_WIDTH / 2, 336 + (index * 40), line, {
        fontFamily: 'Georgia',
        fontSize: '28px',
        color: '#4f341f'
      }).setOrigin(0.5);
    });

    const button = createPlaque(this, {
      x: GAME_WIDTH / 2,
      y: 584,
      frameKey: 'tinyswords.ui.button.red.frame',
      width: 170,
      height: 170,
    }).container;
    button.setSize(170, 170);
    button.setInteractive(
      new Phaser.Geom.Rectangle(-85, -85, 170, 170),
      Phaser.Geom.Rectangle.Contains,
    );
    this.add.text(GAME_WIDTH / 2, 584, 'Rejouer', {
      fontFamily: 'Georgia',
      fontSize: '28px',
      color: '#f7efcf'
    }).setOrigin(0.5);

    button.on('pointerdown', () => this.restart());
    this.input.keyboard.once('keydown-ENTER', () => this.restart());
  }

  restart() {
    this.scene.start(this.restartScene);
  }
}
