import Phaser from 'phaser';
import './style.css';
import { GAME_HEIGHT, GAME_WIDTH } from './game/data.js';
import { AssetPreviewScene } from './game/scenes/AssetPreviewScene.js';
import { BootScene } from './game/scenes/BootScene.js';
import { GameOverScene } from './game/scenes/GameOverScene.js';
import { GameScene } from './game/scenes/GameScene.js';
import { MenuScene } from './game/scenes/MenuScene.js';
import { UIScene } from './game/scenes/UIScene.js';
import { TouchHudScene } from './game/scenes/TouchHudScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#102217',
  pixelArt: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [BootScene, AssetPreviewScene, MenuScene, GameScene, UIScene, TouchHudScene, GameOverScene],
};

const game = new Phaser.Game(config);
window.__VILLAGE_PANIC__ = game;
window.__startAssetPreview__ = () => {
  game.scene.stop('UIScene');
  game.scene.stop('GameScene');
  game.scene.stop('GameOverScene');
  game.scene.stop('MenuScene');
  game.scene.start('AssetPreviewScene');
  return game.scene.getScenes(true).map((scene) => scene.scene.key);
};
window.__startVillagePanic__ = () => {
  game.scene.stop('AssetPreviewScene');
  game.scene.stop('MenuScene');
  game.scene.start('GameScene');
  return game.scene.getScenes(true).map((scene) => scene.scene.key);
};
