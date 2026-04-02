import Phaser from 'phaser';
import './style.css';
import { GAME_HEIGHT, GAME_WIDTH } from './game/data.js';
import { AssetPreviewScene } from './game/scenes/AssetPreviewScene.js';
import { TilesetPreviewScene } from './game/scenes/TilesetPreviewScene.js';
import { SemanticTilemapPreviewScene } from './game/scenes/SemanticTilemapPreviewScene.js';
import { SemanticTilemapDemoScene } from './game/scenes/SemanticTilemapDemoScene.js';
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
  scene: [BootScene, AssetPreviewScene, TilesetPreviewScene, SemanticTilemapPreviewScene, SemanticTilemapDemoScene, MenuScene, GameScene, UIScene, TouchHudScene, GameOverScene],
};

const game = new Phaser.Game(config);
window.__VILLAGE_PANIC__ = game;

const requestFullscreenIfPossible = async () => {
  const root = document.documentElement;
  const candidate = root?.requestFullscreen
    || root?.webkitRequestFullscreen
    || root?.msRequestFullscreen;

  if (!candidate || document.fullscreenElement) {
    return false;
  }

  try {
    await candidate.call(root, { navigationUI: 'hide' });
    return true;
  } catch {
    try {
      await candidate.call(root);
      return true;
    } catch {
      return false;
    }
  }
};

const isStandalone = () => window.matchMedia?.('(display-mode: standalone)')?.matches
  || window.matchMedia?.('(display-mode: fullscreen)')?.matches
  || window.navigator.standalone === true;

window.__requestVillagePanicFullscreen__ = requestFullscreenIfPossible;
window.__isVillagePanicStandalone__ = isStandalone;
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


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((err) => {
      console.warn('SW registration failed', err);
    });
  });
}
