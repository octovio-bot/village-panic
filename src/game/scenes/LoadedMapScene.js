import Phaser from 'phaser';
import { InputManager } from '../input/InputManager.js';
import { PLAYER_SPEED } from '../data.js';
import { ensureSemanticTileTexture } from '../tiles/semanticTilemap.js';

const MAP_KEY = 'custom-map-1';
const TILE_SIZE = 64;

function textureForGid(scene, gid) {
  if (!gid) return null;
  if (gid === 1) {
    return 'tinyswords.terrain.water-background';
  }
  if (gid >= 2) {
    return ensureSemanticTileTexture(scene, 'color1', gid - 2);
  }
  return null;
}

export class LoadedMapScene extends Phaser.Scene {
  constructor() {
    super('LoadedMapScene');
  }

  preload() {
    this.load.json(MAP_KEY, `${import.meta.env.BASE_URL}maps/map1.json`);
  }

  create() {
    this.cameras.main.setBackgroundColor('#102217');
    this.inputManager = new InputManager(this);

    this.mapData = this.cache.json.get(MAP_KEY);
    this.layers = [];

    if (!this.mapData?.layers) {
      this.add.text(28, 110, 'Erreur: impossible de charger maps/map1.json', {
        fontFamily: 'Georgia',
        fontSize: '20px',
        color: '#ffb3b3',
      }).setScrollFactor(0).setDepth(1000);
      return;
    }

    this.mapData.layers.forEach((raw, layerIndex) => {
      if (raw.type !== 'tilelayer') return;
      const tiles = [];
      for (let y = 0; y < raw.height; y += 1) {
        for (let x = 0; x < raw.width; x += 1) {
          const tile = Array.isArray(raw.data?.[y]) ? raw.data[y][x] : raw.data?.[(y * raw.width) + x];
          const gid = typeof tile === 'number' ? tile : tile?.gid ?? tile?.index;
          const texture = textureForGid(this, gid);
          if (!texture) continue;
          const image = this.add.image(x * TILE_SIZE, y * TILE_SIZE, texture)
            .setOrigin(0, 0)
            .setDisplaySize(TILE_SIZE, TILE_SIZE)
            .setDepth(layerIndex * 10);
          tiles.push(image);
        }
      }
      this.layers.push({ name: raw.name, width: raw.width, height: raw.height, tiles });
    });

    this.add.text(28, 20, 'Loaded Map Scene', {
      fontFamily: 'Georgia',
      fontSize: '30px',
      color: '#f4f0d8',
      stroke: '#162015',
      strokeThickness: 5,
    }).setScrollFactor(0).setDepth(1000);

    this.add.text(28, 58, 'Map chargée depuis maps/map1.json', {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#f4f0d8',
      stroke: '#162015',
      strokeThickness: 4,
    }).setScrollFactor(0).setDepth(1000);

    this.createPawn();

    this.mapInfo = {
      width: this.mapData.width,
      height: this.mapData.height,
      layerCount: this.layers.length,
      firstLayerWidth: this.layers[0]?.width ?? 0,
      firstLayerHeight: this.layers[0]?.height ?? 0,
    };

    const worldWidth = this.mapData.width * TILE_SIZE;
    const worldHeight = this.mapData.height * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.pawn, true, 0.12, 0.12);

    this.scene.launch('TouchHudScene');
  }

  createPawn() {
    this.pawn = this.physics.add.sprite(320, 320, 'tinyswords.units.blue.pawn.idle', 0);
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
