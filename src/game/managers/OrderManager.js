import Phaser from 'phaser';
import {
  BUILDING_LABELS,
  BUILDING_TEXTURES,
  ORDER_DEFINITIONS,
  ORDER_QUEUE_SIZE,
} from '../data.js';

export class OrderManager {
  constructor(scene) {
    this.scene = scene;
    this.activeOrders = [];
    this.nextId = 1;
    this.completed = 0;
    this.failed = 0;
  }

  initialize() {
    while (this.activeOrders.length < ORDER_QUEUE_SIZE) {
      const site = this.scene.sites[this.activeOrders.length];
      if (!site) {
        break;
      }
      this.spawnOrder(site);
    }
    this.emitUpdate();
  }

  update(delta) {
    const expired = [];

    this.activeOrders.forEach((order) => {
      order.remainingTime = Math.max(0, order.remainingTime - delta);
      if (order.remainingTime === 0) {
        expired.push(order.id);
      }
    });

    expired.forEach((orderId) => this.failOrder(orderId));
    this.emitUpdate();
  }

  spawnOrder(site) {
    const definition = Phaser.Utils.Array.GetRandom(ORDER_DEFINITIONS);
    const order = {
      id: `order-${this.nextId += 1}`,
      buildingType: definition.buildingType,
      ingredients: [...definition.ingredients],
      delivered: [],
      scoreValue: definition.scoreValue,
      remainingTime: definition.timeLimit,
      siteId: site.id,
      textureKey: BUILDING_TEXTURES[definition.buildingType]
    };

    site.orderId = order.id;
    this.activeOrders.push(order);
    return order;
  }

  assignOrderToSite(site) {
    if (!site) {
      return null;
    }

    const order = this.spawnOrder(site);
    this.emitUpdate();
    return order;
  }

  tryDeliver(siteId, resourceType) {
    const order = this.activeOrders.find((candidate) => candidate.siteId === siteId);
    if (!order) {
      return { accepted: false, reason: 'Aucune commande' };
    }

    const requirementCounts = this.countByType(order.ingredients);
    const deliveredCounts = this.countByType(order.delivered);

    if ((deliveredCounts[resourceType] ?? 0) >= (requirementCounts[resourceType] ?? 0)) {
      return { accepted: false, reason: 'Ingredient deja livre' };
    }

    if (!requirementCounts[resourceType]) {
      return { accepted: false, reason: 'Mauvais ingredient' };
    }

    order.delivered.push(resourceType);
    const isComplete = order.delivered.length >= order.ingredients.length;
    this.emitUpdate();
    return { accepted: true, isComplete, order };
  }

  completeOrder(orderId, comboMultiplier) {
    const order = this.activeOrders.find((candidate) => candidate.id === orderId);
    if (!order) {
      return null;
    }

    const scoreGain = Math.round(order.scoreValue + (comboMultiplier * 18) + order.remainingTime / 700);
    this.activeOrders = this.activeOrders.filter((candidate) => candidate.id !== orderId);
    this.completed += 1;

    this.emitUpdate();
    return {
      scoreGain,
      buildingLabel: BUILDING_LABELS[order.buildingType],
      siteId: order.siteId,
      textureKey: order.textureKey
    };
  }

  failOrder(orderId) {
    const order = this.activeOrders.find((candidate) => candidate.id === orderId);
    if (!order) {
      return;
    }

    this.activeOrders = this.activeOrders.filter((candidate) => candidate.id !== orderId);
    this.failed += 1;
    this.scene.events.emit('order-failed', order);
    this.emitUpdate();
  }

  getSnapshot() {
    return this.activeOrders.map((order) => ({
      id: order.id,
      buildingType: order.buildingType,
      buildingLabel: BUILDING_LABELS[order.buildingType],
      ingredients: [...order.ingredients],
      delivered: [...order.delivered],
      remainingTime: order.remainingTime,
      siteId: order.siteId,
      textureKey: order.textureKey
    }));
  }

  emitUpdate() {
    this.scene.events.emit('orders-updated', this.getSnapshot());
  }

  countByType(values) {
    return values.reduce((counts, value) => {
      counts[value] = (counts[value] ?? 0) + 1;
      return counts;
    }, {});
  }
}
