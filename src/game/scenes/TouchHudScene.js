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
      .setDepth(140);
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
    this.actionZone = this.add.zone(0, 0, 10, 10)
      .setScrollFactor(0)
      .setInteractive();

    this.orientationOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x08110c, 0.88)
      .setScrollFactor(0)
      .setDepth(190)
      .setVisible(false);
    this.orientationText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Tourne ton appareil\nen mode paysage', {
      fontFamily: 'Georgia',
      fontSize: '34px',
      align: 'center',
      color: '#fff2d0',
      stroke: '#2d1a10',
      strokeThickness: 5,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(191).setVisible(false);
    this.orientationHint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 72, 'Le village se joue mieux avec le joystick a gauche\net le bouton action a droite.', {
      fontFamily: 'Georgia',
      fontSize: '20px',
      align: 'center',
      color: '#f3deb1',
      stroke: '#2d1a10',
      strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(191).setVisible(false);

    this.joyPointerId = null;
    this.actionPointerId = null;

    this.baseZone.on('pointerdown', (pointer) => {
      this.joyPointerId = pointer.id;
      this.updateJoystick(pointer);
      this.setHudActive(true);
    });

    this.actionZone.on('pointerdown', (pointer) => {
      this.actionPointerId = pointer.id;
      this.inputManager.setTouchActionHeld(true);
      this.inputManager.pulseTouchAction();
      this.actionButton.setScale(0.94);
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
      if (this.actionPointerId === pointer.id) {
        this.actionPointerId = null;
        this.releaseAction();
      }
    });

    this.input.on('pointerupoutside', (pointer) => {
      if (this.actionPointerId === pointer.id) {
        this.actionPointerId = null;
        this.releaseAction();
      }
    });

    this.layoutHud({ width: GAME_WIDTH, height: GAME_HEIGHT });
  }

  layoutHud(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;
    const scaleFactor = Phaser.Math.Clamp(Math.min(width / GAME_WIDTH, height / GAME_HEIGHT), 0.78, 1.22);
    const safeBottom = height < 500 ? 78 : 104;
    const safeSide = width < 700 ? 78 : 104;

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
    this.actionZone.setPosition(this.actionPos.x, this.actionPos.y).setSize(this.actionRadius * 3, this.actionRadius * 3);

    this.orientationOverlay.setPosition(width / 2, height / 2).setSize(width, height);
    this.orientationText.setPosition(width / 2, height / 2).setFontSize(Math.round(34 * scaleFactor));
    this.orientationHint.setPosition(width / 2, height / 2 + Math.round(72 * scaleFactor)).setFontSize(Math.round(20 * scaleFactor));
  }

  setHudActive(active) {
    this.base.setAlpha(active ? 0.48 : BASE_ALPHA);
    this.actionButton.setAlpha(active ? 0.82 : ACTION_ALPHA);
  }

  isPortraitTouch() {
    if (this.inputManager?.getControlMode() !== 'touch') {
      return false;
    }
    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;
    return height > width;
  }

  update() {
    const touchMode = this.inputManager?.getControlMode() === 'touch';
    const portrait = this.isPortraitTouch();
    const visible = touchMode && !portrait;

    [this.base, this.knob, this.actionButton, this.actionLabel, this.baseZone, this.actionZone].forEach((obj) => obj.setVisible(visible));
    this.orientationOverlay.setVisible(touchMode && portrait);
    this.orientationText.setVisible(touchMode && portrait);
    this.orientationHint.setVisible(touchMode && portrait);
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

  releaseAction() {
    this.inputManager.setTouchActionHeld(false);
    this.actionButton.setScale(1);
  }
}
