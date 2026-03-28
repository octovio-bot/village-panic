import Phaser from 'phaser';

const DEAD_ZONE = 0.18;

export class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.mode = this.detectTouchDevice() ? 'touch' : 'keyboard';
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      action: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this.touchVector = new Phaser.Math.Vector2(0, 0);
    this.touchActionPressed = false;
    this.touchActionHeld = false;
    this.lastActionState = false;

    scene.input.keyboard.on('keydown', () => {
      this.mode = 'keyboard';
    });
  }

  detectTouchDevice() {
    return window.matchMedia?.('(pointer: coarse)')?.matches || (navigator.maxTouchPoints || 0) > 0;
  }

  setTouchVector(x, y) {
    this.touchVector.set(x, y);
    if (this.touchVector.length() < DEAD_ZONE) {
      this.touchVector.set(0, 0);
    }
    this.mode = 'touch';
  }

  clearTouchVector() {
    this.touchVector.set(0, 0);
  }

  setTouchActionHeld(value) {
    this.touchActionHeld = value;
    if (value) {
      this.mode = 'touch';
    }
  }

  pulseTouchAction() {
    this.touchActionPressed = true;
    this.mode = 'touch';
  }

  getMoveVector() {
    if (this.mode === 'touch') {
      return this.touchVector.clone();
    }

    const horizontal = (this.cursors.left.isDown || this.keys.left.isDown ? -1 : 0)
      + (this.cursors.right.isDown || this.keys.right.isDown ? 1 : 0);
    const vertical = (this.cursors.up.isDown || this.keys.up.isDown ? -1 : 0)
      + (this.cursors.down.isDown || this.keys.down.isDown ? 1 : 0);
    return new Phaser.Math.Vector2(horizontal, vertical).normalize();
  }

  consumeActionPressed() {
    const keyboardPressed = Phaser.Input.Keyboard.JustDown(this.keys.interact) || Phaser.Input.Keyboard.JustDown(this.keys.action);
    const touchPressed = this.touchActionPressed;
    this.touchActionPressed = false;
    return keyboardPressed || touchPressed;
  }

  getActionHeld() {
    return this.touchActionHeld || this.keys.interact.isDown || this.keys.action.isDown;
  }

  getControlMode() {
    return this.mode;
  }
}
