import { createPlaque, createThreeSliceHorizontal } from './tinySwordsUi.js';

export function createHudPanel(scene, {
  x,
  y,
  width,
  height,
  frameKey = 'tinyswords.ui.paper.special.frame',
  fillKey = null,
  fillInsetX = 0,
  fillInsetY = 0,
  depth = 95,
  alpha = 0.96,
}) {
  return createPlaque(scene, {
    x,
    y,
    frameKey,
    fillKey,
    width,
    height,
    fillInsetX,
    fillInsetY,
    depth,
    alpha,
  });
}

export function createChaosBar(scene, {
  x,
  y,
  width = 320,
  height = 40,
  fillWidth = 228,
  fillHeight = 24,
  depth = 100,
}) {
  const base = createThreeSliceHorizontal(scene, {
    x,
    y,
    textureKey: 'tinyswords.ui.bigbar.base.frame',
    width,
    height,
    alpha: 1,
  }).container.setDepth(depth);

  const fill = scene.add.tileSprite(x - (fillWidth / 2), y, fillWidth, fillHeight, 'tinyswords.ui.bigbar.fill')
    .setOrigin(0, 0.5)
    .setDepth(depth + 1);
  fill.tileScaleX = fillHeight / 64;
  fill.tileScaleY = fillHeight / 64;

  const label = scene.add.text(x, y, 'CHAOS', {
    fontFamily: 'Georgia',
    fontSize: '18px',
    color: '#31140f',
  }).setOrigin(0.5).setDepth(depth + 2);

  return { base, fill, label, fillWidth };
}
