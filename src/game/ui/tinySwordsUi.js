const NINE_SLICE_DEFS = {
  'tinyswords.ui.banner.frame': {
    textureKey: 'tinyswords.ui.banner',
    cols: [{ x: 28, width: 100 }, { x: 192, width: 64 }, { x: 320, width: 84 }],
    rows: [{ y: 60, height: 68 }, { y: 192, height: 64 }, { y: 320, height: 111 }],
  },
  'tinyswords.ui.banner.fill': {
    textureKey: 'tinyswords.ui.banner-slots',
    cols: [{ x: 0, width: 64 }, { x: 64, width: 64 }, { x: 128, width: 64 }],
    rows: [{ y: 0, height: 64 }, { y: 64, height: 64 }, { y: 128, height: 64 }],
  },
  'tinyswords.ui.wood-table.frame': {
    textureKey: 'tinyswords.ui.wood-table',
    cols: [{ x: 44, width: 84 }, { x: 192, width: 64 }, { x: 320, width: 84 }],
    rows: [{ y: 43, height: 85 }, { y: 192, height: 64 }, { y: 320, height: 103 }],
  },
  'tinyswords.ui.wood-table.fill': {
    textureKey: 'tinyswords.ui.wood-table-slots',
    cols: [{ x: 0, width: 64 }, { x: 64, width: 64 }, { x: 128, width: 64 }],
    rows: [{ y: 0, height: 64 }, { y: 64, height: 64 }, { y: 128, height: 64 }],
  },
  'tinyswords.ui.paper.regular.frame': {
    textureKey: 'tinyswords.ui.paper.regular',
    cols: [{ x: 12, width: 52 }, { x: 128, width: 64 }, { x: 256, width: 52 }],
    rows: [{ y: 20, height: 44 }, { y: 128, height: 64 }, { y: 256, height: 45 }],
  },
  'tinyswords.ui.paper.special.frame': {
    textureKey: 'tinyswords.ui.paper.special',
    cols: [{ x: 9, width: 55 }, { x: 128, width: 64 }, { x: 256, width: 55 }],
    rows: [{ y: 20, height: 44 }, { y: 128, height: 64 }, { y: 256, height: 43 }],
  },
  'tinyswords.ui.button.blue.frame': {
    textureKey: 'tinyswords.ui.button.blue',
    cols: [{ x: 19, width: 45 }, { x: 128, width: 64 }, { x: 256, width: 45 }],
    rows: [{ y: 17, height: 47 }, { y: 128, height: 64 }, { y: 256, height: 47 }],
  },
  'tinyswords.ui.button.red.frame': {
    textureKey: 'tinyswords.ui.button.red',
    cols: [{ x: 19, width: 45 }, { x: 128, width: 64 }, { x: 256, width: 45 }],
    rows: [{ y: 17, height: 47 }, { y: 128, height: 64 }, { y: 256, height: 47 }],
  },
};

const THREE_SLICE_DEFS = {
  'tinyswords.ui.bigbar.base.frame': {
    textureKey: 'tinyswords.ui.bigbar.base',
    cols: [{ x: 40, width: 24 }, { x: 128, width: 64 }, { x: 256, width: 24 }],
    rows: [{ y: 9, height: 51 }],
  },
  'tinyswords.ui.ribbons.big': {
    textureKey: 'tinyswords.ui.ribbons.big',
    cols: [{ x: 30, width: 98 }, { x: 192, width: 64 }, { x: 320, width: 97 }],
    rows: [
      { y: 20, height: 103 },
      { y: 148, height: 103 },
      { y: 276, height: 103 },
      { y: 404, height: 103 },
      { y: 532, height: 103 },
    ],
  },
  'tinyswords.ui.swords': {
    textureKey: 'tinyswords.ui.swords',
    cols: [{ x: 23, width: 105 }, { x: 192, width: 64 }, { x: 320, width: 92 }],
    rows: [
      { y: 0, height: 128 },
      { y: 128, height: 128 },
      { y: 256, height: 128 },
      { y: 384, height: 128 },
      { y: 512, height: 128 },
    ],
  },
};

export function setImageDisplayHeight(scene, image, targetHeight) {
  const source = scene.textures.get(image.texture.key).getSourceImage();
  const scale = targetHeight / source.height;

  image.setDisplaySize(source.width * scale, targetHeight);
  return image;
}

export function setImageDisplayWidth(scene, image, targetWidth) {
  const source = scene.textures.get(image.texture.key).getSourceImage();
  const scale = targetWidth / source.width;

  image.setDisplaySize(targetWidth, source.height * scale);
  return image;
}

function getCropTextureKey(textureKey, crop) {
  return `${textureKey}::${crop.x},${crop.y},${crop.width},${crop.height}`;
}

function ensureCroppedTexture(scene, textureKey, crop) {
  const cropTextureKey = getCropTextureKey(textureKey, crop);
  if (scene.textures.exists(cropTextureKey)) {
    return cropTextureKey;
  }

  const source = scene.textures.get(textureKey).getSourceImage();
  const canvasTexture = scene.textures.createCanvas(cropTextureKey, crop.width, crop.height);
  const context = canvasTexture.getContext();

  context.clearRect(0, 0, crop.width, crop.height);
  context.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
  canvasTexture.refresh();

  return cropTextureKey;
}

function createCroppedPiece(scene, textureKey, crop, x, y, width, height, alpha, tiled = false) {
  const cropTextureKey = ensureCroppedTexture(scene, textureKey, crop);
  const piece = tiled
    ? scene.add.tileSprite(x, y, width, height, cropTextureKey)
    : scene.add.image(x, y, cropTextureKey).setDisplaySize(width, height);

  piece.setAlpha(alpha);
  return piece;
}

export function createNineSlice(scene, {
  x,
  y,
  textureKey,
  width,
  height,
  alpha = 1,
}) {
  const definition = NINE_SLICE_DEFS[textureKey];
  const [leftCol, centerCol, rightCol] = definition.cols;
  const [topRow, middleRow, bottomRow] = definition.rows;
  const leftWidth = leftCol.width;
  const rightWidth = rightCol.width;
  const topHeight = topRow.height;
  const bottomHeight = bottomRow.height;
  const centerWidth = Math.max(1, width - leftWidth - rightWidth);
  const centerHeight = Math.max(1, height - topHeight - bottomHeight);

  const container = scene.add.container(x, y);
  const pieces = [
    createCroppedPiece(scene, definition.textureKey, { x: leftCol.x, y: topRow.y, width: leftCol.width, height: topRow.height }, (-width / 2) + (leftWidth / 2), (-height / 2) + (topHeight / 2), leftWidth, topHeight, alpha),
    createCroppedPiece(scene, definition.textureKey, { x: centerCol.x, y: topRow.y, width: centerCol.width, height: topRow.height }, 0, (-height / 2) + (topHeight / 2), centerWidth, topHeight, alpha, true),
    createCroppedPiece(scene, definition.textureKey, { x: rightCol.x, y: topRow.y, width: rightCol.width, height: topRow.height }, (width / 2) - (rightWidth / 2), (-height / 2) + (topHeight / 2), rightWidth, topHeight, alpha),
    createCroppedPiece(scene, definition.textureKey, { x: leftCol.x, y: middleRow.y, width: leftCol.width, height: middleRow.height }, (-width / 2) + (leftWidth / 2), 0, leftWidth, centerHeight, alpha, true),
    createCroppedPiece(scene, definition.textureKey, { x: centerCol.x, y: middleRow.y, width: centerCol.width, height: middleRow.height }, 0, 0, centerWidth, centerHeight, alpha, true),
    createCroppedPiece(scene, definition.textureKey, { x: rightCol.x, y: middleRow.y, width: rightCol.width, height: middleRow.height }, (width / 2) - (rightWidth / 2), 0, rightWidth, centerHeight, alpha, true),
    createCroppedPiece(scene, definition.textureKey, { x: leftCol.x, y: bottomRow.y, width: leftCol.width, height: bottomRow.height }, (-width / 2) + (leftWidth / 2), (height / 2) - (bottomHeight / 2), leftWidth, bottomHeight, alpha),
    createCroppedPiece(scene, definition.textureKey, { x: centerCol.x, y: bottomRow.y, width: centerCol.width, height: bottomRow.height }, 0, (height / 2) - (bottomHeight / 2), centerWidth, bottomHeight, alpha, true),
    createCroppedPiece(scene, definition.textureKey, { x: rightCol.x, y: bottomRow.y, width: rightCol.width, height: bottomRow.height }, (width / 2) - (rightWidth / 2), (height / 2) - (bottomHeight / 2), rightWidth, bottomHeight, alpha),
  ];

  pieces.forEach((piece) => container.add(piece));

  return { container, pieces };
}

export function createThreeSliceHorizontal(scene, {
  x,
  y,
  textureKey,
  width,
  height,
  row = 0,
  alpha = 1,
}) {
  const definition = THREE_SLICE_DEFS[textureKey];
  const [leftCol, centerCol, rightCol] = definition.cols;
  const rowDef = definition.rows[row];
  const leftWidth = leftCol.width;
  const rightWidth = rightCol.width;
  const centerWidth = Math.max(1, width - leftWidth - rightWidth);

  const container = scene.add.container(x, y);
  const left = createCroppedPiece(scene, definition.textureKey, { x: leftCol.x, y: rowDef.y, width: leftCol.width, height: rowDef.height }, (-width / 2) + (leftWidth / 2), 0, leftWidth, height, alpha);
  const centerX = (-width / 2) + leftWidth + (centerWidth / 2);
  const rightX = (-width / 2) + leftWidth + centerWidth + (rightWidth / 2);
  const center = createCroppedPiece(scene, definition.textureKey, { x: centerCol.x, y: rowDef.y, width: centerCol.width, height: rowDef.height }, centerX, 0, centerWidth, height, alpha, true);
  const right = createCroppedPiece(scene, definition.textureKey, { x: rightCol.x, y: rowDef.y, width: rightCol.width, height: rowDef.height }, rightX, 0, rightWidth, height, alpha);

  [left, center, right].forEach((piece) => container.add(piece));

  return { container, left, center, right };
}

export function createPlaque(scene, {
  x,
  y,
  frameKey,
  fillKey = null,
  width,
  height,
  fillInsetX = 0,
  fillInsetY = 0,
  depth = 0,
  alpha = 1,
}) {
  const container = scene.add.container(x, y).setDepth(depth);
  const parts = {};

  if (fillKey) {
    if (NINE_SLICE_DEFS[fillKey]) {
      parts.fill = createNineSlice(scene, {
        x: 0,
        y: 0,
        textureKey: fillKey,
        width: width - (fillInsetX * 2),
        height: height - (fillInsetY * 2),
        alpha,
      }).container;
    } else {
      parts.fill = setImageDisplayHeight(scene, scene.add.image(0, 0, fillKey), height - (fillInsetY * 2));
      parts.fill.setAlpha(alpha);
    }
    container.add(parts.fill);
  }

  if (NINE_SLICE_DEFS[frameKey]) {
    parts.frame = createNineSlice(scene, {
      x: 0,
      y: 0,
      textureKey: frameKey,
      width,
      height,
      alpha,
    }).container;
  } else {
    parts.frame = setImageDisplayHeight(scene, scene.add.image(0, 0, frameKey), height);
    parts.frame.setAlpha(alpha);
  }

  container.add(parts.frame);

  return { container, ...parts };
}
