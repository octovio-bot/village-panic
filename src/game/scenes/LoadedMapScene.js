import Phaser from 'phaser';
import { InputManager } from '../input/InputManager.js';
import { INTERACT_RANGE, PLAYER_SPEED, RESOURCE_HARVEST_DURATIONS, RESOURCE_LABELS } from '../data.js';
import { ensureSemanticTileTexture } from '../tiles/semanticTilemap.js';
import { createStaticCollisionRectFromManifest, getAssetPathForTinySwordsKey, getGameplayCollisionByAssetPath } from '../assets/manifestRegistry.js';
import { InteractionSystem } from '../managers/InteractionSystem.js';
import { SpawnManager } from '../managers/SpawnManager.js';

const TILE_SIZE = 64;
const FLIPPED_TILE_FLAG_MASK = 0xE0000000;
const PLAYER_ANIMS = {
  base: { idle: 'player-idle-base', run: 'player-run-base' },
  wood: { idle: 'player-idle-wood', run: 'player-run-wood' },
};

function getSelectedMapName() {
  const value = new URLSearchParams(window.location.search).get('map') || 'map1';
  return /^[a-zA-Z0-9_-]+$/.test(value) ? value : 'map1';
}

function textureForGid(scene, gid) {
  if (!gid) return null;
  if (gid === 1) {
    return 'tinyswords.terrain.water-background';
  }
  if (gid >= 2 && gid < 56) {
    return ensureSemanticTileTexture(scene, 'color1', gid - 2);
  }
  if (gid >= 56 && gid < 110) {
    return ensureSemanticTileTexture(scene, 'color2', gid - 56);
  }
  if (gid === 110) {
    return 'tinyswords.terrain.shadow';
  }
  return null;
}

function readLayerGid(raw, x, y) {
  const tile = Array.isArray(raw.data?.[y]) ? raw.data[y][x] : raw.data?.[(y * raw.width) + x];
  const gid = typeof tile === 'number' ? tile : tile?.gid ?? tile?.index;
  return typeof gid === 'number' ? (gid & ~FLIPPED_TILE_FLAG_MASK) : gid;
}

function objectDefForGid(gid) {
  const defs = {
    111: { texture: 'tinyswords.resources.tree1', kind: 'tree', anim: 'tree1-wind', originX: 0, originY: 1, stumpTexture: 'tinyswords.resources.stump1' },
    112: { texture: 'tinyswords.resources.tree2', kind: 'tree', anim: 'tree2-wind', originX: 0, originY: 1, stumpTexture: 'tinyswords.resources.stump2' },
    113: { texture: 'tinyswords.resources.tree3', kind: 'tree', anim: 'tree3-wind', originX: 0, originY: 1, stumpTexture: 'tinyswords.resources.stump3' },
    114: { texture: 'tinyswords.resources.tree4', kind: 'tree', anim: 'tree4-wind', originX: 0, originY: 1, stumpTexture: 'tinyswords.resources.stump4' },
    115: { texture: 'tinyswords.resources.stump1', kind: 'stump', originX: 0, originY: 1 },
    116: { texture: 'tinyswords.resources.stump2', kind: 'stump', originX: 0, originY: 1 },
    117: { texture: 'tinyswords.resources.stump3', kind: 'stump', originX: 0, originY: 1 },
    118: { texture: 'tinyswords.resources.stump4', kind: 'stump', originX: 0, originY: 1 },
    119: { texture: 'tinyswords.resources.gold-item', kind: 'image', originX: 0, originY: 1 },
    121: { texture: 'tinyswords.resources.sheep-idle', kind: 'animated', anim: 'sheep-idle', originX: 0, originY: 1 },
  };
  return defs[gid] ?? null;
}

function createMapObject(scene, obj, gid, def, layerIndex) {
  const sprite = scene.add.sprite(obj.x, obj.y, def.texture)
    .setOrigin(def.originX ?? 0, def.originY ?? 1)
    .setDepth(Math.round(obj.y * 10) + (layerIndex * 10));
  if (def.anim) {
    sprite.play(def.anim);
  }
  const manifestAssetPath = getAssetPathForTinySwordsKey(def.texture);
  const manifestCollision = getGameplayCollisionByAssetPath(manifestAssetPath);
  const obstacle = manifestCollision
    ? scene.registerObstacleBody(createStaticCollisionRectFromManifest(scene, obj.x, obj.y, sprite.displayWidth, sprite.displayHeight, manifestCollision))
    : null;

  return {
    id: obj.id ?? `${gid}-${obj.x}-${obj.y}`,
    x: obj.x,
    y: obj.y,
    gid,
    kind: def.kind,
    texture: def.texture,
    stumpTexture: def.stumpTexture ?? null,
    anim: def.anim ?? null,
    sprite,
    obstacle,
    harvested: def.kind === 'stump',
  };
}

export class LoadedMapScene extends Phaser.Scene {
  constructor() {
    super('LoadedMapScene');
  }

  preload() {
    this.selectedMapName = getSelectedMapName();
    this.mapCacheKey = `loaded-map::${this.selectedMapName}`;
    this.load.json(this.mapCacheKey, `${import.meta.env.BASE_URL}maps/${this.selectedMapName}.json`);
  }

  create() {
    this.cameras.main.setBackgroundColor('#102217');
    this.inputManager = new InputManager(this);
    this.interactionSystem = new InteractionSystem(this);
    this.spawnManager = new SpawnManager(this);
    this.interactionPrompt = 'Explore la carte';
    this.carriedItem = null;
    this.harvestAction = null;
    this.toast = null;

    this.mapData = this.cache.json.get(this.mapCacheKey);
    this.layers = [];
    this.obstacleBodies = [];
    this.mapObjects = [];

    if (!this.mapData?.layers) {
      this.add.text(28, 110, 'Erreur: impossible de charger maps/map1.json', {
        fontFamily: 'Georgia',
        fontSize: '20px',
        color: '#ffb3b3',
      }).setScrollFactor(0).setDepth(1000);
      return;
    }

    this.mapData.layers.forEach((raw, layerIndex) => {
      if (raw.type === 'tilelayer') {
        const tiles = [];
        for (let y = 0; y < raw.height; y += 1) {
          for (let x = 0; x < raw.width; x += 1) {
            const gid = readLayerGid(raw, x, y);
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
        return;
      }

      if (raw.type === 'objectgroup') {
        const objects = [];
        raw.objects?.forEach((obj) => {
          const gid = typeof obj.gid === 'number' ? (obj.gid & ~FLIPPED_TILE_FLAG_MASK) : obj.gid;
          const def = objectDefForGid(gid);
          if (!def) return;
          const entry = createMapObject(this, obj, gid, def, layerIndex);
          objects.push(entry);
          this.mapObjects.push(entry);
        });
        this.layers.push({ name: raw.name, width: 0, height: 0, objects });
      }
    });

    this.add.text(28, 20, 'Loaded Map Scene', {
      fontFamily: 'Georgia',
      fontSize: '30px',
      color: '#f4f0d8',
      stroke: '#162015',
      strokeThickness: 5,
    }).setScrollFactor(0).setDepth(1000);

    this.add.text(28, 58, `Map chargée depuis maps/${this.selectedMapName}.json`, {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#f4f0d8',
      stroke: '#162015',
      strokeThickness: 4,
    }).setScrollFactor(0).setDepth(1000);

    this.createPawn();
    this.createWaterCollisions();

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
    this.setupObstacleCollisions();

    this.scene.launch('TouchHudScene');
  }

  createPawn() {
    this.pawn = this.physics.add.sprite(320, 320, 'tinyswords.units.blue.pawn.idle', 0);
    this.pawn.setCollideWorldBounds(true);
    this.pawn.body.setCircle(26, 70, 112);
    this.pawn.setDepth(500);
    this.pawn.play('player-idle-base');
  }

  registerObstacleBody(bodyRect) {
    if (!bodyRect) {
      return null;
    }
    this.obstacleBodies.push(bodyRect);
    if (this.pawn) {
      this.physics.add.collider(this.pawn, bodyRect);
    }
    return bodyRect;
  }

  setupObstacleCollisions() {
    this.obstacleBodies.forEach((obstacle) => {
      this.physics.add.collider(this.pawn, obstacle);
    });
  }

  createWaterCollisions() {
    const tileLayers = this.mapData.layers.filter((layer) => layer.type === 'tilelayer');
    const waterRows = [];

    for (let y = 0; y < this.mapData.height; y += 1) {
      const row = [];
      for (let x = 0; x < this.mapData.width; x += 1) {
        let topmostGid = 0;
        tileLayers.forEach((layer) => {
          const gid = readLayerGid(layer, x, y) ?? 0;
          if (gid > 0) {
            topmostGid = gid;
          }
        });
        row.push(topmostGid === 1);
      }
      waterRows.push(row);
    }

    waterRows.forEach((row, y) => {
      let runStart = -1;
      const flushRun = (xEnd) => {
        if (runStart < 0) return;
        const width = (xEnd - runStart) * TILE_SIZE;
        const rect = this.add.rectangle((runStart * TILE_SIZE) + (width / 2), (y * TILE_SIZE) + (TILE_SIZE / 2), width, TILE_SIZE, 0x2b6cb0, 0);
        this.physics.add.existing(rect, true);
        rect.setDepth(-30);
        this.registerObstacleBody(rect);
        runStart = -1;
      };

      row.forEach((isWater, x) => {
        if (isWater && runStart < 0) {
          runStart = x;
        }
        if (!isWater && runStart >= 0) {
          flushRun(x);
        }
      });
      flushRun(row.length);
    });
  }

  findInteractiveTree() {
    const candidates = (this.mapObjects ?? []).filter((obj) => obj.kind === 'tree' && !obj.harvested);
    let best = null;
    let bestDistance = INTERACT_RANGE;

    candidates.forEach((obj) => {
      const distance = Phaser.Math.Distance.Between(this.pawn.x, this.pawn.y, obj.x, obj.y);
      if (distance < bestDistance) {
        best = obj;
        bestDistance = distance;
      }
    });

    return best;
  }

  handleAction() {
    if (this.harvestAction) {
      return;
    }

    if (this.carriedItem) {
      this.dropCarriedItem();
      return;
    }

    const droppedItem = this.findNearbyDroppedItem();
    if (droppedItem) {
      this.carriedItem = { resourceType: droppedItem.resourceType };
      this.spawnManager.removeDroppedItem(droppedItem.id);
      this.showToast(`${RESOURCE_LABELS[droppedItem.resourceType]} ramasse`, 900);
      return;
    }

    const tree = this.findInteractiveTree();
    if (!tree) {
      return;
    }

    this.harvestAction = {
      target: tree,
      elapsed: 0,
      duration: RESOURCE_HARVEST_DURATIONS.wood ?? 1400,
    };
    tree.sprite.setTint(0xd9ffd0);
    this.pawn.body.setVelocity(0, 0);
  }

  findNearbyDroppedItem() {
    let best = null;
    let bestDistance = INTERACT_RANGE;

    this.spawnManager.droppedItems.forEach((item) => {
      if (!item.active) {
        return;
      }
      const distance = Phaser.Math.Distance.Between(this.pawn.x, this.pawn.y, item.x, item.y);
      if (distance < bestDistance) {
        best = item;
        bestDistance = distance;
      }
    });

    return best;
  }

  updateInteractions() {
    const droppedItem = this.findNearbyDroppedItem();
    const tree = this.harvestAction?.target ?? this.findInteractiveTree();
    if (this.harvestAction?.target) {
      this.interactionPrompt = '[Action] Coupe du bois...';
      return;
    }
    if (this.carriedItem) {
      this.interactionPrompt = '[Action] Poser la ressource';
      return;
    }
    if (droppedItem) {
      this.interactionPrompt = `[Action] Ramasser ${RESOURCE_LABELS[droppedItem.resourceType]}`;
      return;
    }
    this.interactionPrompt = tree
      ? '[Action] Couper cet arbre'
      : 'Explore la carte';
  }

  dropCarriedItem() {
    if (!this.carriedItem) {
      return;
    }
    const offsetX = this.pawn.flipX ? -28 : 28;
    this.spawnManager.createDroppedItem(this.carriedItem.resourceType, this.pawn.x + offsetX, this.pawn.y + 16);
    this.showToast(`${RESOURCE_LABELS[this.carriedItem.resourceType]} pose`, 900);
    this.carriedItem = null;
  }

  finishHarvest(tree) {
    tree.harvested = true;
    tree.sprite.clearTint();
    tree.sprite.stop?.();
    tree.sprite.setTexture(tree.stumpTexture);
    tree.sprite.setOrigin(0, 1);
    if (tree.obstacle) {
      tree.obstacle.destroy();
      this.obstacleBodies = this.obstacleBodies.filter((candidate) => candidate !== tree.obstacle);
      tree.obstacle = null;
    }
    const manifestAssetPath = getAssetPathForTinySwordsKey(tree.stumpTexture);
    const manifestCollision = getGameplayCollisionByAssetPath(manifestAssetPath);
    tree.obstacle = manifestCollision
      ? this.registerObstacleBody(createStaticCollisionRectFromManifest(this, tree.x, tree.y, tree.sprite.displayWidth, tree.sprite.displayHeight, manifestCollision))
      : null;
    tree.kind = 'stump';
    this.carriedItem = { resourceType: 'wood' };
    this.showToast(`${RESOURCE_LABELS.wood} recupere`, 900);
  }

  updateHarvesting(delta) {
    if (!this.harvestAction) {
      return;
    }

    const { target } = this.harvestAction;
    this.harvestAction.elapsed = Math.min(this.harvestAction.duration, this.harvestAction.elapsed + delta);
    if (this.harvestAction.elapsed >= this.harvestAction.duration) {
      this.harvestAction = null;
      this.finishHarvest(target);
    }
  }

  showToast(message, duration = 1200) {
    this.toast = {
      message,
      startTime: this.time.now,
      duration,
      elapsed: 0,
    };
  }

  getUiSnapshot() {
    return {
      score: 0,
      combo: 0,
      remainingRoundTime: 0,
      carriedItem: this.carriedItem?.resourceType ?? null,
      interactionPrompt: this.interactionPrompt,
      chaos: { value: 0, threshold: 100 },
      toast: this.toast,
    };
  }

  update(time, delta) {
    if (this.inputManager.consumeActionPressed()) {
      this.handleAction();
    }

    this.updateHarvesting(delta);
    this.spawnManager.update(time);

    const move = this.harvestAction ? new Phaser.Math.Vector2(0, 0) : this.inputManager.getMoveVector();
    this.pawn.body.setVelocity(move.x * PLAYER_SPEED, move.y * PLAYER_SPEED);

    const moveKey = this.carriedItem?.resourceType ?? 'base';
    if (move.lengthSq() > 0) {
      this.pawn.setFlipX(move.x < -0.05);
      this.pawn.play(PLAYER_ANIMS[moveKey]?.run ?? PLAYER_ANIMS.base.run, true);
    } else {
      this.pawn.play(PLAYER_ANIMS[moveKey]?.idle ?? PLAYER_ANIMS.base.idle, true);
    }

    this.updateInteractions();
    this.pawn.setDepth(Math.round((this.pawn.y + (this.pawn.displayHeight * 0.5)) * 10) + 500);

    if (this.toast) {
      this.toast.elapsed = time - this.toast.startTime;
      if (this.toast.elapsed >= this.toast.duration) {
        this.toast = null;
      }
    }
  }
}
