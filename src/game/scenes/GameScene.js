import Phaser from 'phaser';
import {
  BUILDING_LABELS,
  GAME_HEIGHT,
  GAME_WIDTH,
  ORDER_QUEUE_SIZE,
  PLAYER_SPEED,
  PLAYER_SPAWN,
  RESOURCE_COLORS,
  RESOURCE_HARVEST_DURATIONS,
  RESOURCE_ICON_TEXTURES,
  RESOURCE_LABELS,
  RESOURCE_NODES,
  ROUND_DURATION_MS,
  STATIONS,
  TILE_SIZE,
  VILLAGE_BUILD_ZONE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  WORLD_ZONES
} from '../data.js';
import { ChaosManager } from '../managers/ChaosManager.js';
import { InteractionSystem } from '../managers/InteractionSystem.js';
import { OrderManager } from '../managers/OrderManager.js';
import { SpawnManager } from '../managers/SpawnManager.js';
import { createPlaque, setImageDisplayHeight } from '../ui/tinySwordsUi.js';
import { InputManager } from '../input/InputManager.js';

const PLAYER_ANIMS = {
  base: { idle: 'player-idle-base', run: 'player-run-base' },
  wood: { idle: 'player-idle-wood', run: 'player-run-wood' },
  gold: { idle: 'player-idle-gold', run: 'player-run-gold' },
  meat: { idle: 'player-idle-meat', run: 'player-run-meat' },
  tools: { idle: 'player-idle-tools', run: 'player-run-tools' }
};

const SITE_WIDTH = 176;
const SITE_HEIGHT = 152;
const SITE_TITLE_HEIGHT = 78;
const MIN_SITE_DISTANCE = 220;
const MIN_STRUCTURE_DISTANCE = 140;
const SITE_SEARCH_ATTEMPTS = 80;
const MAX_INGREDIENT_SLOTS = 4;
const SITE_BUBBLE_WIDTH = 188;
const SITE_BUBBLE_HEIGHT = 56;

const OBSTACLE_BODY_CONFIG = {
  decor: { width: 74, height: 34, offsetY: 28 },
  tree: { width: 58, height: 34, offsetY: 30 },
  gold: { width: 68, height: 36, offsetY: 26 },
  meat: { width: 44, height: 24, offsetY: 22 },
  station: { width: 124, height: 54, offsetY: 44 },
  site: { width: 112, height: 34, offsetY: 38 },
  building: { width: 126, height: 46, offsetY: 58 }
};

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.score = 0;
    this.combo = 0;
    this.remainingRoundTime = ROUND_DURATION_MS;
    this.carriedItem = null;
    this.interactionPrompt = 'Explore le village';
    this.toast = null;
    this.lastStunAt = 0;
    this.harvestAction = null;
    this.sites = [];
    this.completedStructures = [];
    this.blockingDecor = [];
    this.obstacleBodies = [];
    this.siteSerial = 0;

    this.chaosManager = new ChaosManager(this);
    this.interactionSystem = new InteractionSystem(this);
    this.spawnManager = new SpawnManager(this);

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.createWorld();
    this.createSites();
    this.createStations();
    this.createResourceNodes();
    this.createPlayer();
    this.setupObstacleCollisions();
    this.setupCamera();

    this.orderManager = new OrderManager(this);
    this.orderManager.initialize();

    this.inputManager = new InputManager(this);

    this.events.on('order-failed', (order) => {
      const replacementSite = this.recycleConstructionSite(order.siteId);
      if (replacementSite) {
        this.orderManager.assignOrderToSite(replacementSite);
      }

      this.combo = 0;
      this.chaosManager.add(38);
      this.showToast('Commande ratee ! Le chaos grandit.', 1900);
    });
    this.events.on('chaos-threshold', () => {
      this.spawnManager.spawnMonster();
      this.showToast('Des monstres envahissent le chantier !', 2200);
    });

    this.scene.launch('UIScene');
    this.scene.launch('TouchHudScene');
  }

  createWorld() {
    this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 0x173120).setDepth(-10);
    this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'tinyswords.terrain.tilemap1')
      .setDisplaySize(WORLD_WIDTH + 160, WORLD_HEIGHT + 160)
      .setAlpha(0.12)
      .setDepth(-9);

    for (let gridY = 0; gridY < WORLD_HEIGHT / TILE_SIZE; gridY += 1) {
      for (let gridX = 0; gridX < WORLD_WIDTH / TILE_SIZE; gridX += 1) {
        const tint = (gridX + gridY) % 2 === 0 ? 0x214428 : 0x244a2c;
        this.add.rectangle(
          gridX * TILE_SIZE + (TILE_SIZE / 2),
          gridY * TILE_SIZE + (TILE_SIZE / 2),
          TILE_SIZE,
          TILE_SIZE,
          tint,
          0.32
        ).setDepth(-8);
      }
    }

    this.add.rectangle(
      VILLAGE_BUILD_ZONE.x,
      VILLAGE_BUILD_ZONE.y,
      VILLAGE_BUILD_ZONE.width,
      VILLAGE_BUILD_ZONE.height,
      0xd7c18e,
      0.08
    )
      .setStrokeStyle(4, 0xf7e6b7, 0.2)
      .setDepth(-3);
    this.add.text(
      VILLAGE_BUILD_ZONE.x,
      VILLAGE_BUILD_ZONE.y - (VILLAGE_BUILD_ZONE.height / 2) - 26,
      VILLAGE_BUILD_ZONE.label,
      {
        fontFamily: 'Georgia',
        fontSize: '28px',
        color: '#f7edc9',
        stroke: '#23301d',
        strokeThickness: 6
      }
    ).setOrigin(0.5).setDepth(8);

    Object.values(WORLD_ZONES).forEach((zone) => {
      this.add.rectangle(zone.x, zone.y, zone.width, zone.height, zone.color, 0.34)
        .setStrokeStyle(4, 0xf3e4af, 0.18)
        .setDepth(-2);
      this.add.text(zone.x, zone.y - (zone.height / 2) - 20, zone.label, {
        fontFamily: 'Georgia',
        fontSize: '24px',
        color: '#f7edc9',
        stroke: '#22301b',
        strokeThickness: 6
      }).setOrigin(0.5).setDepth(8);
    });

    [
      { x: 278, y: 620, texture: 'tinyswords.decor.bush1', animKey: 'bush1-wind', scale: 1.5, kind: 'bush' },
      { x: 732, y: 162, texture: 'tinyswords.decor.rock1', scale: 1.3, kind: 'rock' },
      { x: 2224, y: 216, texture: 'tinyswords.decor.rock1', scale: 1.4, kind: 'rock' },
      { x: 2840, y: 592, texture: 'tinyswords.decor.bush2', animKey: 'bush2-wind', scale: 1.4, kind: 'bush' },
      { x: 2484, y: 1188, texture: 'tinyswords.decor.bush3', animKey: 'bush3-wind', scale: 1.3, kind: 'bush' },
      { x: 322, y: 1548, texture: 'tinyswords.decor.rock1', scale: 1.25, kind: 'rock' },
      { x: 1194, y: 1410, texture: 'tinyswords.decor.bush4', animKey: 'bush4-wind', scale: 1.1, kind: 'bush' },
      { x: 1950, y: 1504, texture: 'tinyswords.decor.rock1', scale: 1.15, kind: 'rock' },
    ].forEach((decor, index) => {
      const sprite = decor.kind === 'bush'
        ? this.add.sprite(decor.x, decor.y, decor.texture, 0)
        : this.add.image(decor.x, decor.y, decor.texture);
      sprite.setScale(decor.scale).setDepth(1);
      if (decor.kind === 'bush') {
        sprite.play(decor.animKey);
        sprite.anims.setProgress((index * 0.17) % 1);
      }
      this.blockingDecor.push({
        ...decor,
        sprite,
        obstacle: this.createObstacleBody(
          decor.x,
          decor.y,
          OBSTACLE_BODY_CONFIG.decor.width * decor.scale,
          OBSTACLE_BODY_CONFIG.decor.height * decor.scale,
          OBSTACLE_BODY_CONFIG.decor.offsetY * decor.scale
        )
      });
    });
  }

  createSites() {
    for (let index = 0; index < ORDER_QUEUE_SIZE; index += 1) {
      this.sites.push(this.createConstructionSite(this.findSitePlacement()));
    }
  }

  createConstructionSite(position) {
    const siteId = `site-${this.siteSerial += 1}`;
    const site = { id: siteId, x: position.x, y: position.y, orderId: null };

    const zonePlaque = createPlaque(this, {
      x: site.x,
      y: site.y + 8,
      frameKey: 'tinyswords.ui.wood-table.frame',
      fillKey: 'tinyswords.ui.wood-table.fill',
      width: SITE_WIDTH,
      height: SITE_HEIGHT,
      fillInsetX: 22,
      fillInsetY: 22,
      depth: 2,
      alpha: 0.94,
    });
    const titlePlaque = createPlaque(this, {
      x: site.x,
      y: site.y - 82,
      frameKey: 'tinyswords.ui.banner.frame',
      fillKey: 'tinyswords.ui.banner.fill',
      width: 192,
      height: SITE_TITLE_HEIGHT,
      fillInsetX: 20,
      fillInsetY: 16,
      depth: 3,
    });
    const label = this.add.text(site.x, site.y - 88, 'Chantier', {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#fff7d6',
      stroke: '#2f190c',
      strokeThickness: 4,
      padding: { left: 8, right: 8, top: 4, bottom: 4 },
      shadow: {
        offsetX: 0,
        offsetY: 1,
        color: '#2f190c',
        blur: 2,
        fill: true,
        stroke: false,
      },
      wordWrap: { width: 150, useAdvancedWrap: true },
      align: 'center',
    }).setOrigin(0.5).setDepth(4);
    const progressText = this.add.text(site.x, site.y + 64, '', {
      fontFamily: 'Georgia',
      fontSize: '15px',
      color: '#f7edc9',
      stroke: '#29401f',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(4);
    const timerText = this.add.text(site.x, site.y + 84, '', {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#fff1bf',
      stroke: '#3a2413',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(4);

    const bubble = this.add.container(site.x, site.y - 22).setDepth(4);
    const bubbleBack = this.add.rectangle(0, 0, SITE_BUBBLE_WIDTH, SITE_BUBBLE_HEIGHT, 0x112116, 0.9)
      .setStrokeStyle(2, 0xf0e1a8, 0.26);
    bubble.add([bubbleBack]);

    const ingredientSlots = [];
    const slotPositions = [-57, -19, 19, 57];
    for (let index = 0; index < MAX_INGREDIENT_SLOTS; index += 1) {
      const slotX = slotPositions[index];
      const marker = this.add.circle(slotX, 0, 19, 0xf7edc9, 0.08)
        .setStrokeStyle(2, 0xf0e1a8, 0.22);
      const icon = this.add.image(slotX, 0, 'tinyswords.resources.wood-item');
      setImageDisplayHeight(this, icon, 32);
      const deliveredRing = this.add.circle(slotX, 0, 19, 0x91c66b, 0.18).setVisible(false);
      const deliveredCheck = this.add.text(slotX, 0, '✓', {
        fontFamily: 'Georgia',
        fontSize: '21px',
        color: '#f4ffeb',
        stroke: '#20451d',
        strokeThickness: 4,
      }).setOrigin(0.5).setVisible(false);

      ingredientSlots.push({ marker, icon, deliveredRing, deliveredCheck });
      bubble.add([marker, icon, deliveredRing, deliveredCheck]);
    }

    return {
      ...site,
      zoneFill: zonePlaque.fill,
      zone: zonePlaque.frame,
      titleFill: titlePlaque.fill,
      titleFrame: titlePlaque.frame,
      label,
      progressText,
      timerText,
      bubble,
      bubbleBack,
      ingredientSlots,
      obstacle: this.createObstacleBody(
        site.x,
        site.y,
        OBSTACLE_BODY_CONFIG.site.width,
        OBSTACLE_BODY_CONFIG.site.height,
        OBSTACLE_BODY_CONFIG.site.offsetY
      )
    };
  }

  recycleConstructionSite(siteId) {
    const siteIndex = this.sites.findIndex((candidate) => candidate.id === siteId);
    if (siteIndex === -1) {
      return null;
    }

    const [site] = this.sites.splice(siteIndex, 1);
    this.destroySite(site);
    const replacementSite = this.createConstructionSite(this.findSitePlacement());
    this.sites.push(replacementSite);
    return replacementSite;
  }

  destroySite(site) {
    site.zoneFill?.destroy();
    site.zone?.destroy();
    site.titleFill?.destroy();
    site.titleFrame?.destroy();
    site.label?.destroy();
    site.progressText?.destroy();
    site.timerText?.destroy();
    site.bubble?.destroy(true);
    site.obstacle?.destroy();
  }

  findSitePlacement() {
    const paddingX = 120;
    const paddingY = 112;
    let bestCandidate = null;
    let bestScore = -1;

    for (let attempt = 0; attempt < SITE_SEARCH_ATTEMPTS; attempt += 1) {
      const x = Phaser.Math.Between(
        Math.round(VILLAGE_BUILD_ZONE.x - (VILLAGE_BUILD_ZONE.width / 2) + paddingX),
        Math.round(VILLAGE_BUILD_ZONE.x + (VILLAGE_BUILD_ZONE.width / 2) - paddingX)
      );
      const y = Phaser.Math.Between(
        Math.round(VILLAGE_BUILD_ZONE.y - (VILLAGE_BUILD_ZONE.height / 2) + paddingY),
        Math.round(VILLAGE_BUILD_ZONE.y + (VILLAGE_BUILD_ZONE.height / 2) - paddingY)
      );

      const score = this.scoreSitePlacement(x, y);
      if (score > bestScore) {
        bestCandidate = { x, y };
        bestScore = score;
      }

      if (score >= MIN_SITE_DISTANCE) {
        return { x, y };
      }
    }

    return bestCandidate ?? { x: VILLAGE_BUILD_ZONE.x, y: VILLAGE_BUILD_ZONE.y };
  }

  scoreSitePlacement(x, y) {
    let minimumDistance = Number.POSITIVE_INFINITY;

    this.sites.forEach((site) => {
      minimumDistance = Math.min(minimumDistance, Phaser.Math.Distance.Between(x, y, site.x, site.y));
    });
    this.completedStructures.forEach((structure) => {
      minimumDistance = Math.min(minimumDistance, Phaser.Math.Distance.Between(x, y, structure.x, structure.y) - 24);
    });
    this.stations?.forEach((station) => {
      minimumDistance = Math.min(minimumDistance, Phaser.Math.Distance.Between(x, y, station.x, station.y) - 40);
    });
    this.resourceNodes?.forEach((node) => {
      minimumDistance = Math.min(minimumDistance, Phaser.Math.Distance.Between(x, y, node.x, node.y) - 56);
    });

    const villageLeft = VILLAGE_BUILD_ZONE.x - (VILLAGE_BUILD_ZONE.width / 2);
    const villageRight = VILLAGE_BUILD_ZONE.x + (VILLAGE_BUILD_ZONE.width / 2);
    const villageTop = VILLAGE_BUILD_ZONE.y - (VILLAGE_BUILD_ZONE.height / 2);
    const villageBottom = VILLAGE_BUILD_ZONE.y + (VILLAGE_BUILD_ZONE.height / 2);
    const edgeDistance = Math.min(x - villageLeft, villageRight - x, y - villageTop, villageBottom - y);
    minimumDistance = Math.min(minimumDistance, edgeDistance);

    Object.values(WORLD_ZONES).forEach((zone) => {
      if (
        x > zone.x - (zone.width / 2) - 60
        && x < zone.x + (zone.width / 2) + 60
        && y > zone.y - (zone.height / 2) - 60
        && y < zone.y + (zone.height / 2) + 60
      ) {
        minimumDistance = -1;
      }
    });

    return minimumDistance;
  }

  createStations() {
    this.stations = STATIONS.map((station) => {
      const pad = this.add.rectangle(station.x, station.y, station.width, station.height, 0x6c4531, 0.28)
        .setStrokeStyle(3, 0xf8e8b8, 0.28)
        .setDepth(1);
      this.add.image(station.x, station.y - 22, 'tinyswords.ui.icon.hammer')
        .setScale(1.45)
        .setDepth(3);
      const label = this.add.text(station.x, station.y + 58, station.label, {
        fontFamily: 'Georgia',
        fontSize: '20px',
        color: '#f8efcc'
      }).setOrigin(0.5).setDepth(3);
      const blockedOverlay = this.add.rectangle(station.x, station.y, station.width, station.height, 0xc94d3f, 0.28)
        .setVisible(false)
        .setDepth(4);

      return {
        ...station,
        pad,
        label,
        blockedOverlay,
        blockedUntil: 0,
        baseLabel: station.label,
        obstacle: this.createObstacleBody(
          station.x,
          station.y,
          OBSTACLE_BODY_CONFIG.station.width,
          OBSTACLE_BODY_CONFIG.station.height,
          OBSTACLE_BODY_CONFIG.station.offsetY
        )
      };
    });
  }

  createResourceNodes() {
    this.resourceNodes = RESOURCE_NODES.map((node) => {
      let sprite;
      if (node.texture === 'tinyswords.resources.sheep-idle') {
        sprite = this.add.sprite(node.x, node.y, node.texture, 0).setDepth(4);
        sprite.play('sheep-idle');
        sprite.setScale(0.58);
      } else if (node.resourceType === 'wood') {
        sprite = this.add.sprite(node.x, node.y, node.texture, 0).setDepth(4);
        sprite.setScale(1.3);
        const treeAnimKey = node.texture.replace('tinyswords.resources.', '') + '-wind';
        sprite.play(treeAnimKey);
        sprite.anims.setProgress(node.id === 'wood-2' ? 0.45 : 0.1);
      } else {
        sprite = this.add.image(node.x, node.y, node.texture).setDepth(4);
        sprite.setScale(node.resourceType === 'gold' ? 1.15 : 1.3);
      }

      this.add.circle(node.x, node.y + 28, 28, RESOURCE_COLORS[node.resourceType], 0.22).setDepth(3);
      this.add.text(node.x, node.y + 54, RESOURCE_LABELS[node.resourceType], {
        fontFamily: 'Georgia',
        fontSize: '18px',
        color: '#f6ebc3'
      }).setOrigin(0.5).setDepth(5);

      const progressBack = this.add.rectangle(node.x, node.y - 42, 62, 10, 0x0b140e, 0.84)
        .setStrokeStyle(2, 0xe7d798, 0.2)
        .setVisible(false)
        .setDepth(6);
      const progressFill = this.add.rectangle(node.x - 29, node.y - 42, 58, 6, RESOURCE_COLORS[node.resourceType], 0.95)
        .setOrigin(0, 0.5)
        .setVisible(false)
        .setDepth(7);
      const progressLabel = this.add.text(node.x, node.y - 58, '', {
        fontFamily: 'Georgia',
        fontSize: '14px',
        color: '#fff0bf',
        stroke: '#223019',
        strokeThickness: 4,
      }).setOrigin(0.5).setVisible(false).setDepth(7);

      return {
        ...node,
        sprite,
        progressBack,
        progressFill,
        progressLabel,
        obstacle: this.createObstacleBody(
          node.x,
          node.y,
          node.resourceType === 'wood' ? OBSTACLE_BODY_CONFIG.tree.width : node.resourceType === 'gold' ? OBSTACLE_BODY_CONFIG.gold.width : OBSTACLE_BODY_CONFIG.meat.width,
          node.resourceType === 'wood' ? OBSTACLE_BODY_CONFIG.tree.height : node.resourceType === 'gold' ? OBSTACLE_BODY_CONFIG.gold.height : OBSTACLE_BODY_CONFIG.meat.height,
          node.resourceType === 'wood' ? OBSTACLE_BODY_CONFIG.tree.offsetY : node.resourceType === 'gold' ? OBSTACLE_BODY_CONFIG.gold.offsetY : OBSTACLE_BODY_CONFIG.meat.offsetY
        )
      };
    });
  }

  createPlayer() {
    this.player = this.physics.add.sprite(PLAYER_SPAWN.x, PLAYER_SPAWN.y, 'tinyswords.units.blue.pawn.idle', 0);
    this.player.setScale(0.58);
    this.player.setDepth(9);
    this.player.setCollideWorldBounds(true);
    this.player.body.setCircle(26, 70, 112);
    this.player.play('player-idle-base');
    this.playerFacing = 'right';
  }

  createObstacleBody(x, y, width, height, offsetY = 0) {
    const bodyRect = this.add.rectangle(x, y + offsetY, width, height, 0x000000, 0);
    this.physics.add.existing(bodyRect, true);
    bodyRect.setDepth(-20);
    this.obstacleBodies.push(bodyRect);
    if (this.player) {
      this.physics.add.collider(this.player, bodyRect);
    }
    return bodyRect;
  }

  setupObstacleCollisions() {
    this.obstacleBodies.forEach((obstacle) => {
      this.physics.add.collider(this.player, obstacle);
    });
  }

  setupCamera() {
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(GAME_WIDTH * 0.18, GAME_HEIGHT * 0.14);
  }

  update(time, delta) {
    this.remainingRoundTime = Math.max(0, this.remainingRoundTime - delta);
    if (this.remainingRoundTime === 0) {
      this.endRun();
      return;
    }

    this.orderManager.update(delta);
    this.spawnManager.update(time);
    this.updateHarvesting(delta);
    this.updateStations();
    this.updatePlayer();
    this.updateSiteDisplays();
    this.updateInteractionEntries();
    this.updateToast(time);

    if (this.inputManager.consumeActionPressed()) {
      this.handleAction();
    }
  }

  updatePlayer() {
    if (this.harvestAction) {
      this.player.body.setVelocity(0, 0);
      const moveKey = this.carriedItem?.resourceType ?? 'base';
      const anim = PLAYER_ANIMS[moveKey].idle;
      if (this.player.anims.currentAnim?.key !== anim) {
        this.player.play(anim, true);
      }
      return;
    }

    const direction = this.inputManager.getMoveVector();
    this.player.body.setVelocity(direction.x * PLAYER_SPEED, direction.y * PLAYER_SPEED);

    if (direction.x < 0) {
      this.player.setFlipX(true);
      this.playerFacing = 'left';
    } else if (direction.x > 0) {
      this.player.setFlipX(false);
      this.playerFacing = 'right';
    }

    const moveKey = this.carriedItem?.resourceType ?? 'base';
    const anim = direction.lengthSq() > 0 ? PLAYER_ANIMS[moveKey].run : PLAYER_ANIMS[moveKey].idle;
    if (this.player.anims.currentAnim?.key !== anim) {
      this.player.play(anim, true);
    }
  }

  updateStations() {
    this.stations.forEach((station) => {
      const blocked = station.blockedUntil > this.time.now;
      station.blockedOverlay.setVisible(blocked);
      station.label.setText(blocked ? `${station.baseLabel} bloquee` : station.baseLabel);
    });
  }

  updateSiteDisplays() {
    const orders = this.orderManager.getSnapshot();

    this.sites.forEach((site, index) => {
      const order = orders.find((candidate) => candidate.siteId === site.id);
      if (!order) {
        site.progressText.setText('En attente');
        site.timerText.setText('');
        site.label.setText(`Chantier ${index + 1}`);
        site.bubble.setVisible(false);
        return;
      }

      site.label.setText(BUILDING_LABELS[order.buildingType]);
      site.progressText.setText(`${order.delivered.length}/${order.ingredients.length} livres`);
      site.timerText.setText(this.formatTime(order.remainingTime));
      site.bubble.setVisible(true);
      site.bubble.setPosition(site.x, site.y - 22 + (Math.sin((this.time.now / 260) + index) * 2));

      const deliveredCounts = order.delivered.reduce((counts, ingredient) => {
        counts[ingredient] = (counts[ingredient] ?? 0) + 1;
        return counts;
      }, {});

      site.ingredientSlots.forEach((slot, slotIndex) => {
        const ingredient = order.ingredients[slotIndex];
        if (!ingredient) {
          slot.marker.setVisible(false);
          slot.icon.setVisible(false);
          slot.deliveredRing.setVisible(false);
          slot.deliveredCheck.setVisible(false);
          return;
        }

        slot.marker.setVisible(true);
        slot.icon.setVisible(true);
        slot.icon.setTexture(RESOURCE_ICON_TEXTURES[ingredient]);
        setImageDisplayHeight(this, slot.icon, ingredient === 'tools' ? 28 : 34);

        const delivered = (deliveredCounts[ingredient] ?? 0) > 0;
        if (delivered) {
          deliveredCounts[ingredient] -= 1;
        }

        slot.icon.setAlpha(delivered ? 0.4 : 1);
        slot.deliveredRing.setVisible(delivered);
        slot.deliveredCheck.setVisible(delivered);
      });
    });
  }

  updateInteractionEntries() {
    const entries = [];

    this.resourceNodes.forEach((node) => {
      entries.push({
        type: 'resource-node',
        id: node.id,
        x: node.x,
        y: node.y,
        active: !this.carriedItem && !this.harvestAction
      });
    });

    this.sites.forEach((site) => {
      entries.push({
        type: 'site',
        id: site.id,
        x: site.x,
        y: site.y,
        active: true
      });
    });

    this.stations.forEach((station) => {
      entries.push({
        type: 'station',
        id: station.id,
        x: station.x,
        y: station.y,
        active: true
      });
    });

    this.spawnManager.droppedItems.forEach((item) => {
      entries.push({
        type: 'dropped-item',
        id: item.id,
        x: item.x,
        y: item.y,
        active: !this.carriedItem && item.active
      });
    });

    this.spawnManager.monsters.forEach((monster) => {
      entries.push({
        type: 'monster',
        id: monster.id,
        x: monster.sprite.x,
        y: monster.sprite.y,
        active: this.time.now - this.lastStunAt > 600
      });
    });

    this.interactionSystem.setEntries(entries);
    const nearest = this.harvestAction?.node ?? this.interactionSystem.findNearest(this.player);
    this.interactionPrompt = this.describeInteraction(nearest);
  }

  handleAction() {
    if (this.harvestAction) {
      return;
    }

    const stunned = this.spawnManager.tryStunNearestMonster(this.player, 82);
    if (stunned) {
      this.lastStunAt = this.time.now;
      this.showToast('Monstre etourdi !', 900);
      return;
    }

    const interaction = this.interactionSystem.findNearest(this.player);
    if (!interaction) {
      return;
    }

    if (interaction.type === 'resource-node') {
      const node = this.resourceNodes.find((candidate) => candidate.id === interaction.id);
      if (node && !this.carriedItem) {
        this.startHarvest(node);
      }
      return;
    }

    if (interaction.type === 'dropped-item') {
      const item = this.spawnManager.droppedItems.find((candidate) => candidate.id === interaction.id);
      if (item && !this.carriedItem) {
        this.carriedItem = { resourceType: item.resourceType };
        this.spawnManager.removeDroppedItem(item.id);
        this.showToast(`${RESOURCE_LABELS[item.resourceType]} ramasse`, 900);
      }
      return;
    }

    if (interaction.type === 'station') {
      this.useStation(interaction.id);
      return;
    }

    if (interaction.type === 'site') {
      this.deliverToSite(interaction.id);
    }
  }

  useStation(stationId) {
    const station = this.stations.find((candidate) => candidate.id === stationId);
    if (!station) {
      return;
    }

    if (station.blockedUntil > this.time.now) {
      this.showToast('La forge est bloquee !', 1200);
      return;
    }

    if (!this.carriedItem || this.carriedItem.resourceType !== station.input) {
      this.showToast('Apporte du bois pour fabriquer des outils', 1500);
      return;
    }

    this.carriedItem = { resourceType: station.output };
    this.showToast('Outils fabriques', 1000);
  }

  deliverToSite(siteId) {
    const site = this.sites.find((candidate) => candidate.id === siteId);
    if (!site) {
      return;
    }

    if (!this.carriedItem) {
      this.showToast('Il faut porter un ingredient', 1200);
      return;
    }

    const delivery = this.orderManager.tryDeliver(siteId, this.carriedItem.resourceType);
    if (!delivery.accepted) {
      this.showToast(delivery.reason, 1100);
      return;
    }

    const itemLabel = RESOURCE_LABELS[this.carriedItem.resourceType];
    this.carriedItem = null;
    this.showToast(`${itemLabel} livre`, 850);

    if (delivery.isComplete) {
      const result = this.orderManager.completeOrder(delivery.order.id, this.combo);
      this.animateCompletedBuilding(site, result.textureKey);
      const replacementSite = this.recycleConstructionSite(site.id);
      if (replacementSite) {
        this.orderManager.assignOrderToSite(replacementSite);
      }
      this.combo += 1;
      this.score += result.scoreGain;
      this.chaosManager.add(10);
      this.showToast(`${result.buildingLabel} termine ! +${result.scoreGain}`, 1700);
    }
  }

  animateCompletedBuilding(site, textureKey) {
    const sprite = this.add.image(site.x, site.y + 20, textureKey)
      .setDepth(2)
      .setAlpha(0.18);
    setImageDisplayHeight(this, sprite, 174);

    const glow = this.add.ellipse(site.x, site.y + 28, 102, 32, 0xffe4a8, 0.18)
      .setDepth(1.5)
      .setScale(0.45, 0.55);

    this.tweens.add({
      targets: glow,
      scaleX: 1.2,
      scaleY: 1,
      alpha: 0,
      duration: 520,
      ease: 'Sine.easeOut',
      onComplete: () => glow.destroy()
    });

    this.tweens.add({
      targets: sprite,
      alpha: 1,
      y: site.y + 4,
      duration: 650,
      ease: 'Back.easeOut'
    });

    this.completedStructures.push({
      x: site.x,
      y: site.y,
      sprite,
      obstacle: this.createObstacleBody(
        site.x,
        site.y,
        OBSTACLE_BODY_CONFIG.building.width,
        OBSTACLE_BODY_CONFIG.building.height,
        OBSTACLE_BODY_CONFIG.building.offsetY
      )
    });
  }

  startHarvest(node) {
    const duration = RESOURCE_HARVEST_DURATIONS[node.resourceType] ?? 1200;
    this.harvestAction = {
      node,
      elapsed: 0,
      duration,
    };

    node.progressBack.setVisible(true);
    node.progressFill.setVisible(true).setDisplaySize(0, 6);
    node.progressLabel.setVisible(true).setText('Recolte...');
    node.sprite.setTint(node.resourceType === 'gold' ? 0xffe4a3 : 0xd9ffd0);
    this.player.body.setVelocity(0, 0);
  }

  updateHarvesting(delta) {
    this.resourceNodes.forEach((node) => {
      if (this.harvestAction?.node !== node) {
        node.progressBack.setVisible(false);
        node.progressFill.setVisible(false);
        node.progressLabel.setVisible(false);
        if (!this.harvestAction || this.harvestAction.node !== node) {
          node.sprite.clearTint();
        }
      }
    });

    if (!this.harvestAction) {
      return;
    }

    const { node } = this.harvestAction;
    this.harvestAction.elapsed = Math.min(this.harvestAction.duration, this.harvestAction.elapsed + delta);
    const progress = this.harvestAction.elapsed / this.harvestAction.duration;
    node.progressBack.setVisible(true);
    node.progressFill.setVisible(true).setDisplaySize(58 * progress, 6);
    node.progressLabel.setVisible(true).setText(`${Math.ceil((this.harvestAction.duration - this.harvestAction.elapsed) / 1000)}s`);

    if (this.harvestAction.elapsed >= this.harvestAction.duration) {
      node.progressBack.setVisible(false);
      node.progressFill.setVisible(false);
      node.progressLabel.setVisible(false);
      node.sprite.clearTint();
      this.carriedItem = { resourceType: node.resourceType };
      this.harvestAction = null;
      this.showToast(`${RESOURCE_LABELS[node.resourceType]} recupere`, 900);
    }
  }

  dropCarriedItem() {
    if (!this.carriedItem) {
      return;
    }

    this.spawnManager.createDroppedItem(
      this.carriedItem.resourceType,
      this.player.x + (this.playerFacing === 'right' ? 30 : -30),
      this.player.y + 16
    );
    this.carriedItem = null;
  }

  blockNearestStation(x, y) {
    let target = null;
    let bestDistance = 9999;

    this.stations.forEach((station) => {
      const distance = Phaser.Math.Distance.Between(x, y, station.x, station.y);
      if (distance < bestDistance) {
        bestDistance = distance;
        target = station;
      }
    });

    if (target) {
      target.blockedUntil = this.time.now + 3000;
      target.label.setText(`${target.baseLabel} bloquee`);
      this.showToast('La forge est temporairement bloquee !', 1500);
    }
  }

  showToast(message, duration = 1200) {
    this.toast = {
      message,
      startTime: this.time.now,
      duration,
      elapsed: 0
    };
  }

  updateToast(time) {
    if (!this.toast) {
      return;
    }

    this.toast.elapsed = time - this.toast.startTime;
    if (this.toast.elapsed >= this.toast.duration) {
      this.toast = null;
    }
  }

  describeInteraction(interaction) {
    if (this.harvestAction?.node) {
      return `[E] Recolte ${RESOURCE_LABELS[this.harvestAction.node.resourceType]}...`;
    }

    if (!interaction) {
      return 'Explore le village';
    }

    if (interaction.type === 'resource-node') {
      const node = this.resourceNodes.find((candidate) => candidate.id === interaction.id);
      return node ? `[E] Commencer a recolter ${RESOURCE_LABELS[node.resourceType]}` : 'Interagir';
    }

    if (interaction.type === 'dropped-item') {
      const item = this.spawnManager.droppedItems.find((candidate) => candidate.id === interaction.id);
      return item ? `[E] Ramasser ${RESOURCE_LABELS[item.resourceType]}` : 'Interagir';
    }

    if (interaction.type === 'station') {
      return '[Action] Utiliser la forge';
    }

    if (interaction.type === 'site') {
      return '[Action] Livrer au chantier';
    }

    if (interaction.type === 'monster') {
      return '[Action] Etourdir le monstre';
    }

    return 'Interagir';
  }

  getUiSnapshot() {
    return {
      score: this.score,
      combo: this.combo,
      remainingRoundTime: this.remainingRoundTime,
      carriedItem: this.carriedItem?.resourceType ?? null,
      interactionPrompt: this.interactionPrompt,
      chaos: {
        value: this.chaosManager.value,
        threshold: this.chaosManager.threshold
      },
      toast: this.toast
    };
  }

  endRun() {
    this.scene.stop('UIScene');
    this.scene.start('GameOverScene', {
      score: this.score,
      completedOrders: this.orderManager.completed,
      failedOrders: this.orderManager.failed,
      chaosValue: this.chaosManager.value
    });
  }

  formatTime(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = `${totalSeconds % 60}`.padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
}
