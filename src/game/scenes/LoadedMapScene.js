import Phaser from 'phaser';
import {
  BUILDING_LABELS,
  BUILDING_TEXTURES,
  INTERACT_RANGE,
  ORDER_DEFINITIONS,
  PLAYER_SPEED,
  RESOURCE_HARVEST_DURATIONS,
  RESOURCE_ICON_TEXTURES,
  RESOURCE_LABELS,
  ResourceType,
  VILLAGE_BUILD_ZONE,
} from '../data.js';
import { InputManager } from '../input/InputManager.js';
import { ensureSemanticTileTexture } from '../tiles/semanticTilemap.js';
import { createStaticCollisionRectFromManifest, getAssetPathForTinySwordsKey, getGameplayCollisionByAssetPath } from '../assets/manifestRegistry.js';
import { InteractionSystem } from '../managers/InteractionSystem.js';
import { SpawnManager } from '../managers/SpawnManager.js';
import { setImageDisplayHeight } from '../ui/tinySwordsUi.js';

const TILE_SIZE = 64;
const FLIPPED_TILE_FLAG_MASK = 0xE0000000;
const PLAYER_ANIMS = {
  base: { idle: 'player-idle-base', run: 'player-run-base' },
  wood: { idle: 'player-idle-wood', run: 'player-run-wood' },
  gold: { idle: 'player-idle-gold', run: 'player-run-gold' },
  meat: { idle: 'player-idle-meat', run: 'player-run-meat' },
};

function getSelectedMapName() {
  const value = new URLSearchParams(window.location.search).get('map') || 'map1';
  return /^[a-zA-Z0-9_-]+$/.test(value) ? value : 'map1';
}

function textureForGid(scene, gid) {
  if (!gid) return null;
  if (gid === 1) return 'tinyswords.terrain.water-background';
  if (gid >= 2 && gid < 56) return ensureSemanticTileTexture(scene, 'color1', gid - 2);
  if (gid >= 56 && gid < 110) return ensureSemanticTileTexture(scene, 'color2', gid - 56);
  if (gid === 110) return 'tinyswords.terrain.shadow';
  return null;
}

function readLayerGid(raw, x, y) {
  const tile = Array.isArray(raw.data?.[y]) ? raw.data[y][x] : raw.data?.[(y * raw.width) + x];
  const gid = typeof tile === 'number' ? tile : tile?.gid ?? tile?.index;
  return typeof gid === 'number' ? (gid & ~FLIPPED_TILE_FLAG_MASK) : gid;
}

function objectDefForGid(gid) {
  const defs = {
    111: { texture: 'tinyswords.resources.tree1', kind: 'tree', resourceType: ResourceType.WOOD, label: 'Arbre', anim: 'tree1-wind', originX: 0, originY: 1, harvestedTexture: 'tinyswords.resources.stump1', harvestedKind: 'stump' },
    112: { texture: 'tinyswords.resources.tree2', kind: 'tree', resourceType: ResourceType.WOOD, label: 'Arbre', anim: 'tree2-wind', originX: 0, originY: 1, harvestedTexture: 'tinyswords.resources.stump2', harvestedKind: 'stump' },
    113: { texture: 'tinyswords.resources.tree3', kind: 'tree', resourceType: ResourceType.WOOD, label: 'Arbre', anim: 'tree3-wind', originX: 0, originY: 1, harvestedTexture: 'tinyswords.resources.stump3', harvestedKind: 'stump' },
    114: { texture: 'tinyswords.resources.tree4', kind: 'tree', resourceType: ResourceType.WOOD, label: 'Arbre', anim: 'tree4-wind', originX: 0, originY: 1, harvestedTexture: 'tinyswords.resources.stump4', harvestedKind: 'stump' },
    115: { texture: 'tinyswords.resources.stump1', kind: 'stump', label: 'Souche', originX: 0, originY: 1 },
    116: { texture: 'tinyswords.resources.stump2', kind: 'stump', label: 'Souche', originX: 0, originY: 1 },
    117: { texture: 'tinyswords.resources.stump3', kind: 'stump', label: 'Souche', originX: 0, originY: 1 },
    118: { texture: 'tinyswords.resources.stump4', kind: 'stump', label: 'Souche', originX: 0, originY: 1 },
    119: { texture: 'tinyswords.resources.gold-item', kind: 'gold-node', resourceType: ResourceType.GOLD, label: 'Or', originX: 0, originY: 1, harvestedTexture: null, harvestedKind: 'empty' },
    121: { texture: 'tinyswords.resources.sheep-idle', kind: 'sheep', resourceType: ResourceType.MEAT, label: 'Mouton', anim: 'sheep-idle', originX: 0, originY: 1, harvestedTexture: null, harvestedKind: 'empty' },
  };
  return defs[gid] ?? null;
}

function isWalkableTile(mapData, x, y) {
  const tileLayers = mapData.layers.filter((layer) => layer.type === 'tilelayer');
  let topmostGid = 0;
  tileLayers.forEach((layer) => {
    const gid = readLayerGid(layer, x, y) ?? 0;
    if (gid > 0) topmostGid = gid;
  });
  return topmostGid !== 1;
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = `${totalSeconds % 60}`.padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function createMapObject(scene, obj, gid, def, layerIndex) {
  const displayWidth = obj.width || undefined;
  const displayHeight = obj.height || undefined;
  const sprite = scene.add.sprite(obj.x, obj.y, def.texture)
    .setOrigin(def.originX ?? 0, def.originY ?? 1)
    .setDepth(Math.round(obj.y * 10) + (layerIndex * 10));
  if (displayWidth && displayHeight) sprite.setDisplaySize(displayWidth, displayHeight);
  if (def.anim) sprite.play(def.anim);

  const manifestAssetPath = getAssetPathForTinySwordsKey(def.texture);
  const manifestCollision = getGameplayCollisionByAssetPath(manifestAssetPath);
  const obstacle = manifestCollision
    ? scene.registerObstacleBody(createStaticCollisionRectFromManifest(scene, obj.x, obj.y, sprite.displayWidth, sprite.displayHeight, manifestCollision))
    : null;

  const progressBack = scene.add.rectangle(obj.x + (sprite.displayWidth * 0.5), obj.y - sprite.displayHeight - 18, 62, 10, 0x0b140e, 0.84)
    .setStrokeStyle(2, 0xe7d798, 0.2)
    .setVisible(false)
    .setDepth(Math.round(obj.y * 10) + (layerIndex * 10) + 1);
  const progressFill = scene.add.rectangle(obj.x - 29 + (sprite.displayWidth * 0.5), obj.y - sprite.displayHeight - 18, 58, 6, 0xd7c18e, 0.95)
    .setOrigin(0, 0.5)
    .setVisible(false)
    .setDepth(Math.round(obj.y * 10) + (layerIndex * 10) + 2);
  const progressLabel = scene.add.text(obj.x + (sprite.displayWidth * 0.5), obj.y - sprite.displayHeight - 34, '', {
    fontFamily: 'Georgia', fontSize: '14px', color: '#fff0bf', stroke: '#223019', strokeThickness: 4,
  }).setOrigin(0.5).setVisible(false).setDepth(Math.round(obj.y * 10) + (layerIndex * 10) + 2);

  return {
    id: obj.id ?? `${gid}-${obj.x}-${obj.y}`,
    x: obj.x,
    y: obj.y,
    interactionX: obj.x + (sprite.displayWidth * 0.5),
    interactionY: obj.y - Math.min(28, sprite.displayHeight * 0.2),
    gid,
    kind: def.kind,
    resourceType: def.resourceType ?? null,
    label: def.label ?? 'Objet',
    texture: def.texture,
    harvestedTexture: def.harvestedTexture ?? null,
    harvestedKind: def.harvestedKind ?? null,
    anim: def.anim ?? null,
    sprite,
    obstacle,
    harvested: def.kind === 'stump' || def.kind === 'empty',
    progressBack,
    progressFill,
    progressLabel,
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
    this.completedStructures = [];
    this.score = 0;
    this.combo = 0;

    this.mapData = this.cache.json.get(this.mapCacheKey);
    this.layers = [];
    this.obstacleBodies = [];
    this.mapObjects = [];

    if (!this.mapData?.layers) return;

    this.mapData.layers.forEach((raw, layerIndex) => {
      if (raw.type === 'tilelayer') {
        const tiles = [];
        for (let y = 0; y < raw.height; y += 1) {
          for (let x = 0; x < raw.width; x += 1) {
            const gid = readLayerGid(raw, x, y);
            const texture = textureForGid(this, gid);
            if (!texture) continue;
            tiles.push(this.add.image(x * TILE_SIZE, y * TILE_SIZE, texture).setOrigin(0, 0).setDisplaySize(TILE_SIZE, TILE_SIZE).setDepth(layerIndex * 10));
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

    this.createVillageZone();
    this.createOrder();
    this.createPawn();
    this.createWaterCollisions();

    const worldWidth = this.mapData.width * TILE_SIZE;
    const worldHeight = this.mapData.height * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.pawn, true, 0.12, 0.12);
    this.setupObstacleCollisions();
    this.scene.launch('TouchHudScene');
  }

  findVillageBuildPosition() {
    const centerTileX = Math.round(VILLAGE_BUILD_ZONE.x / TILE_SIZE);
    const centerTileY = Math.round(VILLAGE_BUILD_ZONE.y / TILE_SIZE);
    for (let radius = 0; radius < 10; radius += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const tileX = centerTileX + dx;
          const tileY = centerTileY + dy;
          if (tileX < 0 || tileY < 0 || tileX >= this.mapData.width || tileY >= this.mapData.height) continue;
          if (!isWalkableTile(this.mapData, tileX, tileY)) continue;
          const x = (tileX * TILE_SIZE) + (TILE_SIZE / 2);
          const y = (tileY * TILE_SIZE) + (TILE_SIZE / 2);
          const tooCloseToBuilt = this.completedStructures.some((structure) => Phaser.Math.Distance.Between(x, y, structure.x, structure.y) < 220);
          if (!tooCloseToBuilt) {
            return { x, y };
          }
        }
      }
    }
    return { x: VILLAGE_BUILD_ZONE.x, y: VILLAGE_BUILD_ZONE.y };
  }

  createVillageZone() {
    const buildPos = this.findVillageBuildPosition();
    this.villageZone = {
      id: `village-site-${this.completedStructures.length + 1}`,
      x: buildPos.x,
      y: buildPos.y,
      width: 224,
      height: 176,
    };
    this.villageZoneFill = this.add.rectangle(this.villageZone.x, this.villageZone.y, this.villageZone.width, this.villageZone.height, 0xc69a5b, 0.46)
      .setStrokeStyle(5, 0xf0d39a, 0.7)
      .setDepth(11);
    this.villageZoneInner = this.add.rectangle(this.villageZone.x, this.villageZone.y, this.villageZone.width - 44, this.villageZone.height - 44, 0x8b6a3d, 0.3)
      .setStrokeStyle(2, 0xe2c48f, 0.36)
      .setDepth(11.1);
    this.add.text(this.villageZone.x, this.villageZone.y - (this.villageZone.height / 2) - 26, 'Zone de construction', {
      fontFamily: 'Georgia', fontSize: '28px', color: '#f7edc9', stroke: '#23301d', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(8);

    this.orderTitleText = this.add.text(this.villageZone.x, this.villageZone.y - 34, '', {
      fontFamily: 'Georgia', fontSize: '24px', color: '#fff0bf', stroke: '#2d1a10', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(20);
    this.orderSlots = [-72, -24, 24, 72].map((offsetX) => {
      const marker = this.add.circle(this.villageZone.x + offsetX, this.villageZone.y + 12, 24, 0x2d2116, 0.52)
        .setStrokeStyle(2, 0xf0d39a, 0.35)
        .setDepth(20);
      const icon = this.add.image(this.villageZone.x + offsetX, this.villageZone.y + 12, 'tinyswords.resources.wood-item')
        .setVisible(false)
        .setDepth(21);
      const deliveredRing = this.add.circle(this.villageZone.x + offsetX, this.villageZone.y + 12, 28, 0x8fd28f, 0)
        .setStrokeStyle(3, 0x8fd28f, 0.95)
        .setVisible(false)
        .setDepth(22);
      const deliveredCheck = this.add.text(this.villageZone.x + offsetX, this.villageZone.y + 12, '✓', {
        fontFamily: 'Georgia', fontSize: '24px', color: '#d8ffd8', stroke: '#29421f', strokeThickness: 5,
      }).setOrigin(0.5).setVisible(false).setDepth(23);
      return { marker, icon, deliveredRing, deliveredCheck };
    });
    this.orderNeedsText = this.add.text(this.villageZone.x, this.villageZone.y + 52, '', {
      fontFamily: 'Georgia', fontSize: '18px', color: '#f3deb1', align: 'center', stroke: '#2d1a10', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20);
    this.orderTimerBack = this.add.rectangle(this.villageZone.x, this.villageZone.y + 82, 176, 14, 0x2a1a12, 0.82)
      .setStrokeStyle(2, 0xf0d39a, 0.35)
      .setDepth(20);
    this.orderTimerFill = this.add.rectangle(this.villageZone.x - 88, this.villageZone.y + 82, 172, 8, 0xd96b4d, 0.96)
      .setOrigin(0, 0.5)
      .setDepth(21);
    this.orderTimerText = this.add.text(this.villageZone.x, this.villageZone.y + 104, '', {
      fontFamily: 'Georgia', fontSize: '16px', color: '#ffe4a8', stroke: '#2d1a10', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20);
  }

  createOrder() {
    const allowed = ORDER_DEFINITIONS.filter((o) => o.ingredients.every((i) => i !== ResourceType.TOOLS));
    const definition = Phaser.Utils.Array.GetRandom(allowed);
    this.activeOrder = {
      buildingType: definition.buildingType,
      buildingLabel: BUILDING_LABELS[definition.buildingType],
      ingredients: [...definition.ingredients],
      delivered: [],
      remainingTime: definition.timeLimit,
      textureKey: BUILDING_TEXTURES[definition.buildingType],
    };
    this.refreshOrderText();
  }

  refreshOrderText() {
    if (!this.activeOrder) return;
    const deliveredCounts = this.activeOrder.delivered.reduce((counts, ingredient) => {
      counts[ingredient] = (counts[ingredient] ?? 0) + 1;
      return counts;
    }, {});
    this.orderTitleText.setText(`Construire: ${this.activeOrder.buildingLabel}`);
    this.orderNeedsText.setText('Apporte les ressources dans cette zone');
    const definition = ORDER_DEFINITIONS.find((candidate) => candidate.buildingType === this.activeOrder.buildingType);
    const totalTime = definition?.timeLimit ?? Math.max(this.activeOrder.remainingTime, 1);
    const ratio = Phaser.Math.Clamp(this.activeOrder.remainingTime / totalTime, 0, 1);
    this.orderTimerFill.setDisplaySize(172 * ratio, 8);
    this.orderTimerText.setText(`${formatTime(this.activeOrder.remainingTime)}`);

    this.orderSlots.forEach((slot, index) => {
      const ingredient = this.activeOrder.ingredients[index];
      if (!ingredient) {
        slot.marker.setVisible(false);
        slot.icon.setVisible(false);
        slot.deliveredRing.setVisible(false);
        slot.deliveredCheck.setVisible(false);
        return;
      }
      slot.marker.setVisible(true);
      slot.icon.setVisible(true).setTexture(RESOURCE_ICON_TEXTURES[ingredient]);
      setImageDisplayHeight(this, slot.icon, ingredient === 'tools' ? 28 : 34);
      const delivered = (deliveredCounts[ingredient] ?? 0) > 0;
      if (delivered) deliveredCounts[ingredient] -= 1;
      slot.icon.setAlpha(delivered ? 0.4 : 1);
      slot.deliveredRing.setVisible(delivered);
      slot.deliveredCheck.setVisible(delivered);
    });
  }

  createPawn() {
    this.pawn = this.physics.add.sprite(320, 320, 'tinyswords.units.blue.pawn.idle', 0);
    this.pawn.setCollideWorldBounds(true);
    this.pawn.body.setCircle(26, 70, 112);
    this.pawn.setDepth(500);
    this.pawn.play('player-idle-base');
  }

  registerObstacleBody(bodyRect) {
    if (!bodyRect) return null;
    this.obstacleBodies.push(bodyRect);
    if (this.pawn) this.physics.add.collider(this.pawn, bodyRect);
    return bodyRect;
  }

  setupObstacleCollisions() {
    this.obstacleBodies.forEach((obstacle) => this.physics.add.collider(this.pawn, obstacle));
  }

  createWaterCollisions() {
    const tileLayers = this.mapData.layers.filter((layer) => layer.type === 'tilelayer');
    for (let y = 0; y < this.mapData.height; y += 1) {
      let runStart = -1;
      const flushRun = (xEnd) => {
        if (runStart < 0) return;
        const width = (xEnd - runStart) * TILE_SIZE;
        const rect = this.add.rectangle((runStart * TILE_SIZE) + (width / 2), (y * TILE_SIZE) + (TILE_SIZE / 2), width, TILE_SIZE, 0x2b6cb0, 0);
        this.physics.add.existing(rect, true); rect.setDepth(-30); this.registerObstacleBody(rect); runStart = -1;
      };
      for (let x = 0; x < this.mapData.width; x += 1) {
        let topmostGid = 0;
        tileLayers.forEach((layer) => { const gid = readLayerGid(layer, x, y) ?? 0; if (gid > 0) topmostGid = gid; });
        const isWater = topmostGid === 1;
        if (isWater && runStart < 0) runStart = x;
        if (!isWater && runStart >= 0) flushRun(x);
      }
      flushRun(this.mapData.width);
    }
  }

  findNearestHarvestableObject() {
    const candidates = (this.mapObjects ?? []).filter((obj) => obj.resourceType && !obj.harvested);
    let best = null; let bestDistance = INTERACT_RANGE;
    candidates.forEach((obj) => {
      const distance = Phaser.Math.Distance.Between(this.pawn.x, this.pawn.y, obj.interactionX ?? obj.x, obj.interactionY ?? obj.y);
      if (distance < bestDistance) { best = obj; bestDistance = distance; }
    });
    return best;
  }

  findNearbyDroppedItem() {
    let best = null; let bestDistance = INTERACT_RANGE;
    this.spawnManager.droppedItems.forEach((item) => {
      if (!item.active) return;
      const distance = Phaser.Math.Distance.Between(this.pawn.x, this.pawn.y, item.x, item.y);
      if (distance < bestDistance) { best = item; bestDistance = distance; }
    });
    return best;
  }

  isInsideVillageZone() {
    const margin = 18;
    const left = this.villageZone.x - (this.villageZone.width / 2) - margin;
    const right = this.villageZone.x + (this.villageZone.width / 2) + margin;
    const top = this.villageZone.y - (this.villageZone.height / 2) - margin;
    const bottom = this.villageZone.y + (this.villageZone.height / 2) + margin;
    return this.pawn.x >= left && this.pawn.x <= right && this.pawn.y >= top && this.pawn.y <= bottom;
  }

  deliverToVillage() {
    if (!this.activeOrder || !this.carriedItem) return false;
    const ingredient = this.carriedItem.resourceType;
    const requiredCount = this.activeOrder.ingredients.filter((value) => value === ingredient).length;
    const deliveredCount = this.activeOrder.delivered.filter((value) => value === ingredient).length;
    if (requiredCount === 0) {
      this.showToast('Mauvaise ressource pour ce chantier', 1200);
      return true;
    }
    if (deliveredCount >= requiredCount) {
      this.showToast('Cette ressource est deja complete', 1200);
      return true;
    }
    this.activeOrder.delivered.push(ingredient);
    this.carriedItem = null;
    this.showToast(`${RESOURCE_LABELS[ingredient]} livre`, 900);
    if (this.activeOrder.delivered.length >= this.activeOrder.ingredients.length) {
      this.completeVillageOrder();
    } else {
      this.refreshOrderText();
    }
    return true;
  }

  clearVillageZoneVisuals() {
    [
      this.villageZoneFill,
      this.villageZoneInner,
      this.orderTitleText,
      this.orderNeedsText,
      this.orderTimerBack,
      this.orderTimerFill,
      this.orderTimerText,
      ...(this.orderSlots ?? []).flatMap((slot) => [slot.marker, slot.icon, slot.deliveredRing, slot.deliveredCheck]),
    ].forEach((node) => node?.destroy());
    this.orderSlots = [];
  }

  completeVillageOrder() {
    const completedOrder = { ...this.activeOrder };
    const completedSite = { x: this.villageZone.x, y: this.villageZone.y };
    this.clearVillageZoneVisuals();
    const sprite = this.add.image(completedSite.x, completedSite.y + 20, completedOrder.textureKey).setDepth(12).setAlpha(0.18);
    setImageDisplayHeight(this, sprite, 174);
    this.tweens.add({ targets: sprite, alpha: 1, y: completedSite.y + 4, duration: 650, ease: 'Back.easeOut' });
    this.completedStructures.push({ sprite, x: completedSite.x, y: completedSite.y, buildingType: completedOrder.buildingType });
    this.showToast(`${completedOrder.buildingLabel} termine !`, 1700);
    this.score += 100;
    this.combo += 1;
    this.createVillageZone();
    this.createOrder();
  }

  failVillageOrder() {
    this.showToast(`Commande ratee: ${this.activeOrder.buildingLabel}`, 1700);
    this.combo = 0;
    this.createOrder();
  }

  handleAction() {
    if (this.harvestAction) return;
    if (this.carriedItem && this.isInsideVillageZone()) {
      if (this.deliverToVillage()) return;
    }
    if (this.carriedItem) { this.dropCarriedItem(); return; }
    const droppedItem = this.findNearbyDroppedItem();
    if (droppedItem) {
      this.carriedItem = { resourceType: droppedItem.resourceType };
      this.spawnManager.removeDroppedItem(droppedItem.id);
      this.showToast(`${RESOURCE_LABELS[droppedItem.resourceType]} ramasse`, 900);
      return;
    }
    const target = this.findNearestHarvestableObject();
    if (target) this.startHarvest(target);
  }

  startHarvest(target) {
    this.harvestAction = { target, elapsed: 0, duration: RESOURCE_HARVEST_DURATIONS[target.resourceType] ?? 1400 };
    target.sprite.setTint(target.resourceType === ResourceType.GOLD ? 0xffe4a3 : 0xd9ffd0);
    target.progressBack.setVisible(true); target.progressFill.setVisible(true).setDisplaySize(0, 6); target.progressLabel.setVisible(true).setText('Recolte...');
    this.pawn.body.setVelocity(0, 0);
  }

  updateInteractions() {
    const droppedItem = this.findNearbyDroppedItem();
    const target = this.harvestAction?.target ?? this.findNearestHarvestableObject();
    if (this.harvestAction?.target) return void (this.interactionPrompt = `[Action] Recolte ${RESOURCE_LABELS[this.harvestAction.target.resourceType]}...`);
    if (this.carriedItem && this.isInsideVillageZone()) return void (this.interactionPrompt = `[Action] Livrer ${RESOURCE_LABELS[this.carriedItem.resourceType]}`);
    if (this.carriedItem) return void (this.interactionPrompt = '[Action] Poser la ressource');
    if (droppedItem) return void (this.interactionPrompt = `[Action] Ramasser ${RESOURCE_LABELS[droppedItem.resourceType]}`);
    this.interactionPrompt = target ? `[Action] Recolter ${target.label}` : 'Explore la carte';
  }

  dropCarriedItem() {
    if (!this.carriedItem) return;
    const offsetX = this.pawn.flipX ? -28 : 28;
    this.spawnManager.createDroppedItem(this.carriedItem.resourceType, this.pawn.x + offsetX, this.pawn.y + 16);
    this.showToast(`${RESOURCE_LABELS[this.carriedItem.resourceType]} pose`, 900);
    this.carriedItem = null;
  }

  finishHarvest(target) {
    target.harvested = true; target.sprite.clearTint(); target.progressBack.setVisible(false); target.progressFill.setVisible(false); target.progressLabel.setVisible(false);
    if (target.obstacle) { target.obstacle.destroy(); this.obstacleBodies = this.obstacleBodies.filter((candidate) => candidate !== target.obstacle); target.obstacle = null; }
    if (target.harvestedKind === 'stump' && target.harvestedTexture) {
      target.sprite.stop?.(); target.sprite.setTexture(target.harvestedTexture); target.sprite.setOrigin(0, 1); target.sprite.setDisplaySize(target.sprite.displayWidth, Math.min(target.sprite.displayHeight, 64));
      target.interactionX = target.x + (target.sprite.displayWidth * 0.5); target.interactionY = target.y - Math.min(12, target.sprite.displayHeight * 0.25);
      const manifestAssetPath = getAssetPathForTinySwordsKey(target.harvestedTexture);
      const manifestCollision = getGameplayCollisionByAssetPath(manifestAssetPath);
      target.obstacle = manifestCollision ? this.registerObstacleBody(createStaticCollisionRectFromManifest(this, target.x, target.y, target.sprite.displayWidth, target.sprite.displayHeight, manifestCollision)) : null;
      target.kind = 'stump';
    } else {
      target.sprite.setVisible(false); target.kind = 'empty';
    }
    this.carriedItem = { resourceType: target.resourceType }; this.showToast(`${RESOURCE_LABELS[target.resourceType]} recupere`, 900);
  }

  updateHarvesting(delta) {
    this.mapObjects.forEach((obj) => {
      if (this.harvestAction?.target !== obj) {
        obj.progressBack.setVisible(false); obj.progressFill.setVisible(false); obj.progressLabel.setVisible(false);
        if (!obj.harvested) obj.sprite.clearTint();
      }
    });
    if (!this.harvestAction) return;
    const { target } = this.harvestAction;
    this.harvestAction.elapsed = Math.min(this.harvestAction.duration, this.harvestAction.elapsed + delta);
    const progress = this.harvestAction.elapsed / this.harvestAction.duration;
    target.progressBack.setVisible(true); target.progressFill.setVisible(true).setDisplaySize(58 * progress, 6); target.progressLabel.setVisible(true).setText(`${Math.ceil((this.harvestAction.duration - this.harvestAction.elapsed) / 1000)}s`);
    if (this.harvestAction.elapsed >= this.harvestAction.duration) { this.harvestAction = null; this.finishHarvest(target); }
  }

  updateOrder(delta) {
    if (!this.activeOrder) return;
    this.activeOrder.remainingTime = Math.max(0, this.activeOrder.remainingTime - delta);
    this.refreshOrderText();
    if (this.activeOrder.remainingTime === 0) this.failVillageOrder();
  }

  showToast(message, duration = 1200) {
    this.toast = { message, startTime: this.time.now, duration, elapsed: 0 };
  }

  getUiSnapshot() {
    return {
      score: this.score,
      combo: this.combo,
      remainingRoundTime: this.activeOrder?.remainingTime ?? 0,
      carriedItem: this.carriedItem?.resourceType ?? null,
      interactionPrompt: this.interactionPrompt,
      chaos: { value: 0, threshold: 100 },
      toast: this.toast,
    };
  }

  update(time, delta) {
    if (this.inputManager.consumeActionPressed()) this.handleAction();
    this.updateHarvesting(delta);
    this.updateOrder(delta);
    this.spawnManager.update(time);

    const move = this.harvestAction ? new Phaser.Math.Vector2(0, 0) : this.inputManager.getMoveVector();
    this.pawn.body.setVelocity(move.x * PLAYER_SPEED, move.y * PLAYER_SPEED);
    const moveKey = this.carriedItem?.resourceType ?? 'base';
    if (move.lengthSq() > 0) { this.pawn.setFlipX(move.x < -0.05); this.pawn.play(PLAYER_ANIMS[moveKey]?.run ?? PLAYER_ANIMS.base.run, true); }
    else { this.pawn.play(PLAYER_ANIMS[moveKey]?.idle ?? PLAYER_ANIMS.base.idle, true); }
    this.updateInteractions();
    this.pawn.setDepth(Math.round((this.pawn.y + (this.pawn.displayHeight * 0.5)) * 10) + 500);
    if (this.toast) { this.toast.elapsed = time - this.toast.startTime; if (this.toast.elapsed >= this.toast.duration) this.toast = null; }
  }
}
