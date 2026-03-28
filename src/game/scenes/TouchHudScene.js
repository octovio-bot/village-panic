import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../data.js';

const JOYSTICK_RADIUS = 72;
const JOYSTICK_KNOB_RADIUS = 30;
const ACTION_RADIUS = 52;

export class TouchHudScene extends Phaser.Scene {
  constructor() {
    super('TouchHudScene');
  }

  create() {
    this.gameScene = this.scene.get('GameScene');
    this.inputManager = this.gameScene.inputManager;

    this.joyBasePos = { x: 110, y: GAME_HEIGHT - 110 };
    this.actionPos = { x: GAME_WIDTH - 110, y: GAME_HEIGHT - 110 };

    this.base = this.add.circle(this.joyBasePos.x, this.joyBasePos.y, JOYSTICK_RADIUS, 0x0f1a14, 0.34)
      .setStrokeStyle(3, 0xe8d9a5, 0.35)
      .setScrollFactor(0)
      .setDepth(140);
    this.knob = this.add.circle(this.joyBasePos.x, this.joyBasePos.y, JOYSTICK_KNOB_RADIUS, 0xf7e8bd, 0.8)
      .setScrollFactor(0)
      .setDepth(141);

    this.actionButton = this.add.circle(this.actionPos.x, this.actionPos.y, ACTION_RADIUS, 0x8b2c2c, 0.65)
      .setStrokeStyle(3, 0xf7e8bd, 0.35)
      .setScrollFactor(0)
      .setDepth(140)
      .setInteractive();
    this.actionLabel = this.add.text(this.actionPos.x, this.actionPos.y, 'ACT', {
      fontFamily: 'Georgia',
      fontSize: '24px',
      color: '#fff2d0',
      stroke: '#3d2211',
      strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(141);

    this.baseZone = this.add.zone(this.joyBasePos.x, this.joyBasePos.y, JOYSTICK_RADIUS * 2.8, JOYSTICK_RADIUS * 2.8)
      .setScrollFactor(0)
      .setInteractive();

    this.joyPointerId = null;

    this.baseZone.on('pointerdown', (pointer) => {
      this.joyPointerId = pointer.id;
      this.updateJoystick(pointer);
    });

    this.input.on('pointermove', (pointer) => {
      if (this.joyPointerId === pointer.id) {
        this.updateJoystick(pointer);
      }
    });

    this.input.on('pointerup', (pointer) => {
      if (this.joyPointerId === pointer.id) {
        this.joyPointerId = null;
        this.resetJoystick();
      }
    });

    this.actionButton.on('pointerdown', () => {
      this.inputManager.setTouchActionHeld(true);
      this.inputManager.pulseTouchAction();
      this.actionButton.setScale(0.94);
    });
    this.actionButton.on('pointerup', () => {
      this.inputManager.setTouchActionHeld(false);
      this.actionButton.setScale(1);
    });
    this.actionButton.on('pointerout', () => {
      this.inputManager.setTouchActionHeld(false);
      this.actionButton.setScale(1);
    });
  }

  update() {
    const visible = this.inputManager?.getControlMode() === 'touch';
    [this.base, this.knob, this.actionButton, this.actionLabel, this.baseZone].forEach((obj) => obj.setVisible(visible));
  }

  updateJoystick(pointer) {
    const dx = pointer.x - this.joyBasePos.x;
    const dy = pointer.y - this.joyBasePos.y;
    const len = Math.hypot(dx, dy);
    const clamped = Math.min(len, JOYSTICK_RADIUS);
    const angle = Math.atan2(dy, dx);
    const knobX = this.joyBasePos.x + Math.cos(angle) * clamped;
    const knobY = this.joyBasePos.y + Math.sin(angle) * clamped;
    this.knob.setPosition(knobX, knobY);

    const nx = len === 0 ? 0 : Math.cos(angle) * (clamped / JOYSTICK_RADIUS);
    const ny = len === 0 ? 0 : Math.sin(angle) * (clamped / JOYSTICK_RADIUS);
    this.inputManager.setTouchVector(nx, ny);
  }

  resetJoystick() {
    this.knob.setPosition(this.joyBasePos.x, this.joyBasePos.y);
    this.inputManager.clearTouchVector();
  }
}
