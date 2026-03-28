import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../data.js';
import { createPlaque, createThreeSliceHorizontal } from '../ui/tinySwordsUi.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'tinyswords.terrain.tilemap2')
      .setDisplaySize(GAME_WIDTH * 1.2, GAME_HEIGHT * 1.2)
      .setAlpha(0.28);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x08120d, 0.58);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 1020, 590, 0x122016, 0.78)
      .setStrokeStyle(3, 0xe6d49a, 0.22);

    const titleRibbon = createThreeSliceHorizontal(this, {
      x: GAME_WIDTH / 2,
      y: 144,
      textureKey: 'tinyswords.ui.ribbons.big',
      row: 0,
      width: 430,
      height: 86,
    }).container;
    titleRibbon.setDepth(2);

    this.add.text(GAME_WIDTH / 2, 146, 'Village Panic', {
      fontFamily: 'Georgia',
      fontSize: '62px',
      color: '#f8efcd',
      stroke: '#203040',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 238, 'Un village a monter. Trois chantiers a nourrir.\nChaque retard attire les monstres.', {
      fontFamily: 'Georgia',
      fontSize: '28px',
      color: '#f5e9c2',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);

    this.add.rectangle(324, 426, 352, 276, 0xf0e3ba, 0.96)
      .setStrokeStyle(3, 0x6a4a2d, 0.35);
    this.add.rectangle(956, 426, 352, 276, 0xf0e3ba, 0.96)
      .setStrokeStyle(3, 0x6a4a2d, 0.35);

    this.add.text(324, 312, 'La pression monte', {
      fontFamily: 'Georgia',
      fontSize: '31px',
      color: '#4b301a',
    }).setOrigin(0.5);

    [
      'Ramasse bois, or et viande.',
      'Transforme le bois en outils a la forge.',
      'Livre vite sur les bons chantiers.',
      'Rate une commande et le chaos explose.',
    ].forEach((line, index) => {
      this.add.text(184, 360 + (index * 39), `- ${line}`, {
        fontFamily: 'Georgia',
        fontSize: '21px',
        color: '#4b311f',
        wordWrap: { width: 282 },
      });
    });

    this.add.text(956, 312, 'Commandes', {
      fontFamily: 'Georgia',
      fontSize: '31px',
      color: '#4b301a',
    }).setOrigin(0.5);

    [
      'Deplacement: WASD ou fleches',
      'Action: E ou Espace',
      'Un seul objet porte a la fois',
      'Etourdis les monstres au contact',
    ].forEach((line, index) => {
      this.add.text(812, 360 + (index * 39), `- ${line}`, {
        fontFamily: 'Georgia',
        fontSize: '21px',
        color: '#4b311f',
        wordWrap: { width: 282 },
      });
    });

    this.add.rectangle(GAME_WIDTH / 2, 620, 300, 124, 0x0e1a13, 0.7)
      .setStrokeStyle(3, 0xe7d6a0, 0.22);

    const button = createPlaque(this, {
      x: GAME_WIDTH / 2,
      y: 592,
      frameKey: 'tinyswords.ui.button.blue.frame',
      width: 126,
      height: 126,
    }).container;
    button.setSize(126, 126);
    button.setInteractive(
      new Phaser.Geom.Rectangle(-63, -63, 126, 126),
      Phaser.Geom.Rectangle.Contains,
    );
    const label = this.add.text(GAME_WIDTH / 2, 592, 'Jouer', {
      fontFamily: 'Georgia',
      fontSize: '27px',
      color: '#f8f0cf',
    }).setOrigin(0.5);
    const helper = this.add.text(GAME_WIDTH / 2, 650, 'Cliquez ou appuyez sur Entree', {
      fontFamily: 'Georgia',
      fontSize: '17px',
      color: '#f0e1b6',
    }).setOrigin(0.5);

    button.on('pointerdown', () => this.startGame());
    this.input.keyboard.once('keydown-ENTER', () => this.startGame());

    this.add.text(GAME_WIDTH / 2, 700, 'Arcade solo | Partie 6 minutes | Chaos croissant', {
      fontFamily: 'Georgia',
      fontSize: '17px',
      color: '#d9c88f',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 726, 'Preview assets: ajoute ?scene=asset-preview a l URL', {
      fontFamily: 'Georgia',
      fontSize: '14px',
      color: '#c8bb88',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: [button, label, helper],
      y: '+=8',
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  startGame() {
    this.scene.start('GameScene');
  }
}
