import { CHAOS_THRESHOLD } from '../data.js';

export class ChaosManager {
  constructor(scene) {
    this.scene = scene;
    this.value = 0;
    this.threshold = CHAOS_THRESHOLD;
  }

  add(amount) {
    this.value += amount;
    while (this.value >= this.threshold) {
      this.value -= this.threshold;
      this.scene.events.emit('chaos-threshold');
    }
    this.emitUpdate();
  }

  emitUpdate() {
    this.scene.events.emit('chaos-updated', {
      value: this.value,
      threshold: this.threshold
    });
  }
}
