import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../data.js';

const BASE_ALPHA = 0.34;
const ACTION_ALPHA = 0.68;

export class TouchHudScene extends Phaser.Scene {
  constructor() {
    super('TouchHudScene');
  }

  create() {
    this.gameScene = this.scene.get('GameScene');
    this.inputManager = this.gameScene.inputManager;
    this.scale.on('resize', this.layoutHud, this);

    this.base = this.add.circle(0, 0, 10, 0x0f1a14, BASE_ALPHA)
      .setStrokeStyle(3, 0xe8d9a5, 0.35)
      .setScrollFactor(0)
      .setDepth(140);
    this.knob = this.add.circle(0, 0, 10, 0xf7e8bd, 0.8)
      .setScrollFactor(0)
      .setDepth(141);

    this.actionButton = this.add.circle(0, 0, 10, 0x8b2c2c, ACTION_ALPHA)
      .setStrokeStyle(3, 0xf7e8bd, 0.35)
      .setScrollFactor(0)
      .setDepth(140)
      .setInteractive();
    this.actionLabel = this.add.text(0, 0, 'ACT', {
      fontFamily: 'Georgia',
      fontSize: '24px',
      color: '#fff2d0',
      stroke: '#3d2211',
      strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(141);

    this.baseZone = this.add.zone(0, 0, 10, 10)
      .setScrollFactor(0)
      .setInteractive();

    this.joyPointerId = null;

    this.baseZone.on('pointerdown', (pointer) => {
      this.joyPointerId = pointer.id;
      this.updateJoystick(pointer);
      this.setHudActive(true);
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
      this.setHudActive(true);
    });
    this.actionButton.on('pointerup', () => {
      this.inputManager.setTouchActionHeld(false);
      this.actionButton.setScale(1);
    });
    this.actionButton.on('pointerout', () => {
      this.inputManager.setTouchActionHeld(false);
      this.actionButton.setScale(1);
    });

    this.layoutHud({ width: GAME_WIDTH, height: GAME_HEIGHT });
  }

  layoutHud(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;
    const scaleFactor = Phaser.Math.Clamp(Math.min(width / GAME_WIDTH, height / GAME_HEIGHT), 0.78, 1.22);
    const safeBottom = height < 500 ? 88 : 110;
    const safeSide = width < 700 ? 84 : 110;

    this.joystickRadius = Math.round(72 * scaleFactor);
    this.knobRadius = Math.round(30 * scaleFactor);
    this.actionRadius = Math.round(52 * scaleFactor);

    this.joyBasePos = { x: safeSide, y: height - safeBottom };
    this.actionPos = { x: width - safeSide, y: height - safeBottom };

    this.base.setPosition(this.joyBasePos.x, this.joyBasePos.y).setRadius(this.joystickRadius);
    this.knob.setPosition(this.joyBasePos.x, this.joyBasePos.y).setRadius(this.knobRadius);
    this.actionButton.setPosition(this.actionPos.x, this.actionPos.y).setRadius(this.actionRadius);
    this.actionLabel.setPosition(this.actionPos.x, this.actionPos.y).setFontSize(Math.round(24 * scaleFactor));
    this.baseZone.setPosition(this.joyBasePos.x, this.joyBasePos.y).setSize(this.joystickRadius * 2.8, this.joystickRadius * 2.8);
  }

  setHudActive(active) {
    this.base.setAlpha(active ? 0.48 : BASE_ALPHA);
    this.actionButton.setAlpha(active ? 0.82 : ACTION_ALPHA);
  }

  update() {
    const visible = this.inputManager?.getControlMode() === 'touch';
    [this.base, this.knob, this.actionButton, this.actionLabel, this.baseZone].forEach((obj) => obj.setVisible(visible));
  }

  updateJoystick(pointer) {
    const dx = pointer.x - this.joyBasePos.x;
    const dy = pointer.y - this.joyBasePos.y;
    const len = Math.hypot(dx, dy);
    const clamped = Math.min(len, this.joystickRadius);
    const angle = Math.atan2(dy, dx);
    const knobX = this.joyBasePos.x + Math.cos(angle) * clamped;
    const knobY = this.joyBasePos.y + Math.sin(angle) * clamped;
    this.knob.setPosition(knobX, knobY);

    let normalized = clamped / this.joystickRadius;
    const deadZone = 0.16;
    if (normalized < deadZone) {
      this.inputManager.setTouchVector(0, 0);
      return;
    }
    normalized = (normalized - deadZone) / (1 - deadZone);
    const nx = Math.cos(angle) * normalized;
    const ny = Math.sin(angle) * normalized;
    this.inputManager.setTouchVector(nx, ny);
  }

  resetJoystick() {
    this.knob.setPosition(this.joyBasePos.x, this.joyBasePos.y);
    this.inputManager.clearTouchVector();
    this.setHudActive(false);
  }
}
