import Phaser from 'phaser';
import { INTERACT_RANGE } from '../data.js';

export class InteractionSystem {
  constructor(scene) {
    this.scene = scene;
    this.entries = [];
  }

  setEntries(entries) {
    this.entries = entries;
  }

  findNearest(source) {
    let best = null;
    let bestDistance = INTERACT_RANGE;

    this.entries.forEach((entry) => {
      if (!entry.active) {
        return;
      }

      const distance = Phaser.Math.Distance.Between(source.x, source.y, entry.x, entry.y);
      if (distance < bestDistance) {
        best = entry;
        bestDistance = distance;
      }
    });

    return best;
  }
}
