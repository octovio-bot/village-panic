const image = (key, path) => ({ key, path, kind: 'image' });
const sheet = (key, path, config) => ({ key, path, kind: 'sheet', config });

const UNIT_FRAME = { frameWidth: 192, frameHeight: 192 };
const SHEEP_FRAME = { frameWidth: 128, frameHeight: 128 };
const UI_FRAME_128 = { frameWidth: 128, frameHeight: 128, spacing: 32 };
const UI_FRAME_96 = { frameWidth: 96, frameHeight: 96, spacing: 16 };
const UI_FRAME_64 = { frameWidth: 64, frameHeight: 64 };
const UI_BAR_BASE = { frameWidth: 64, frameHeight: 64, spacing: 64 };
const UI_RIBBON_FRAME = { frameWidth: 128, frameHeight: 96, spacing: 32 };

export const TINY_SWORDS_ASSETS = [
  sheet('tinyswords.units.blue.pawn.idle', '/assets/tinyswords/Units/Blue Units/Pawn/Pawn_Idle.png', UNIT_FRAME),
  sheet('tinyswords.units.blue.pawn.run', '/assets/tinyswords/Units/Blue Units/Pawn/Pawn_Run.png', UNIT_FRAME),
  sheet('tinyswords.units.blue.pawn.idle.wood', '/assets/tinyswords/Units/Blue Units/Pawn/Pawn_Idle Wood.png', UNIT_FRAME),
  sheet('tinyswords.units.blue.pawn.run.wood', '/assets/tinyswords/Units/Blue Units/Pawn/Pawn_Run Wood.png', UNIT_FRAME),
  sheet('tinyswords.units.blue.pawn.idle.gold', '/assets/tinyswords/Units/Blue Units/Pawn/Pawn_Idle Gold.png', UNIT_FRAME),
  sheet('tinyswords.units.blue.pawn.run.gold', '/assets/tinyswords/Units/Blue Units/Pawn/Pawn_Run Gold.png', UNIT_FRAME),
  sheet('tinyswords.units.blue.pawn.idle.meat', '/assets/tinyswords/Units/Blue Units/Pawn/Pawn_Idle Meat.png', UNIT_FRAME),
  sheet('tinyswords.units.blue.pawn.run.meat', '/assets/tinyswords/Units/Blue Units/Pawn/Pawn_Run Meat.png', UNIT_FRAME),
  sheet('tinyswords.units.blue.pawn.idle.tools', '/assets/tinyswords/Units/Blue Units/Pawn/Pawn_Idle Hammer.png', UNIT_FRAME),
  sheet('tinyswords.units.blue.pawn.run.tools', '/assets/tinyswords/Units/Blue Units/Pawn/Pawn_Run Hammer.png', UNIT_FRAME),
  sheet('tinyswords.units.red.warrior.idle', '/assets/tinyswords/Units/Red Units/Warrior/Warrior_Idle.png', UNIT_FRAME),
  sheet('tinyswords.units.red.warrior.run', '/assets/tinyswords/Units/Red Units/Warrior/Warrior_Run.png', UNIT_FRAME),
  sheet('tinyswords.units.black.lancer.run', '/assets/tinyswords/Units/Black Units/Lancer/Lancer_Run.png', UNIT_FRAME),
  sheet('tinyswords.units.black.lancer.idle', '/assets/tinyswords/Units/Black Units/Lancer/Lancer_Idle.png', UNIT_FRAME),
  sheet('tinyswords.resources.sheep-idle', '/assets/tinyswords/Terrain/Resources/Meat/Sheep/Sheep_Idle.png', SHEEP_FRAME),
  image('tinyswords.resources.tree1', '/assets/tinyswords/Terrain/Resources/Wood/Trees/Tree1.png'),
  image('tinyswords.resources.tree2', '/assets/tinyswords/Terrain/Resources/Wood/Trees/Tree2.png'),
  image('tinyswords.resources.gold-stone1', '/assets/tinyswords/Terrain/Resources/Gold/Gold Stones/Gold Stone 1.png'),
  image('tinyswords.resources.gold-stone2', '/assets/tinyswords/Terrain/Resources/Gold/Gold Stones/Gold Stone 2.png'),
  image('tinyswords.resources.wood-item', '/assets/tinyswords/Terrain/Resources/Wood/Wood Resource/Wood Resource.png'),
  image('tinyswords.resources.gold-item', '/assets/tinyswords/Terrain/Resources/Gold/Gold Resource/Gold_Resource.png'),
  image('tinyswords.resources.meat-item', '/assets/tinyswords/Terrain/Resources/Meat/Meat Resource/Meat Resource.png'),
  image('tinyswords.resources.tools-item', '/assets/tinyswords/Terrain/Resources/Tools/Tool_01.png'),
  image('tinyswords.buildings.blue.house1', '/assets/tinyswords/Buildings/Blue Buildings/House1.png'),
  image('tinyswords.buildings.blue.tower', '/assets/tinyswords/Buildings/Blue Buildings/Tower.png'),
  image('tinyswords.buildings.blue.barracks', '/assets/tinyswords/Buildings/Blue Buildings/Barracks.png'),
  image('tinyswords.buildings.blue.archery', '/assets/tinyswords/Buildings/Blue Buildings/Archery.png'),
  image('tinyswords.buildings.blue.monastery', '/assets/tinyswords/Buildings/Blue Buildings/Monastery.png'),
  image('tinyswords.buildings.blue.castle', '/assets/tinyswords/Buildings/Blue Buildings/Castle.png'),
  image('tinyswords.fx.fire1', '/assets/tinyswords/Particle FX/Fire_01.png'),
  image('tinyswords.fx.explosion1', '/assets/tinyswords/Particle FX/Explosion_01.png'),
  image('tinyswords.ui.banner', '/assets/tinyswords/UI Elements/UI Elements/Banners/Banner.png'),
  image('tinyswords.ui.banner-slots', '/assets/tinyswords/UI Elements/UI Elements/Banners/Banner_Slots.png'),
  sheet('tinyswords.ui.banner.frame', '/assets/tinyswords/UI Elements/UI Elements/Banners/Banner.png', UI_FRAME_128),
  sheet('tinyswords.ui.banner.fill', '/assets/tinyswords/UI Elements/UI Elements/Banners/Banner_Slots.png', UI_FRAME_64),
  image('tinyswords.ui.paper', '/assets/tinyswords/UI Elements/UI Elements/Papers/SpecialPaper.png'),
  image('tinyswords.ui.paper.regular', '/assets/tinyswords/UI Elements/UI Elements/Papers/RegularPaper.png'),
  image('tinyswords.ui.paper.special', '/assets/tinyswords/UI Elements/UI Elements/Papers/SpecialPaper.png'),
  sheet('tinyswords.ui.paper.regular.frame', '/assets/tinyswords/UI Elements/UI Elements/Papers/RegularPaper.png', UI_FRAME_96),
  sheet('tinyswords.ui.paper.special.frame', '/assets/tinyswords/UI Elements/UI Elements/Papers/SpecialPaper.png', UI_FRAME_96),
  image('tinyswords.ui.bigbar.base', '/assets/tinyswords/UI Elements/UI Elements/Bars/BigBar_Base.png'),
  image('tinyswords.ui.bigbar.fill', '/assets/tinyswords/UI Elements/UI Elements/Bars/BigBar_Fill.png'),
  sheet('tinyswords.ui.bigbar.base.frame', '/assets/tinyswords/UI Elements/UI Elements/Bars/BigBar_Base.png', UI_BAR_BASE),
  image('tinyswords.ui.button.blue', '/assets/tinyswords/UI Elements/UI Elements/Buttons/BigBlueButton_Regular.png'),
  image('tinyswords.ui.button.red', '/assets/tinyswords/UI Elements/UI Elements/Buttons/BigRedButton_Regular.png'),
  sheet('tinyswords.ui.button.blue.frame', '/assets/tinyswords/UI Elements/UI Elements/Buttons/BigBlueButton_Regular.png', UI_FRAME_96),
  sheet('tinyswords.ui.button.red.frame', '/assets/tinyswords/UI Elements/UI Elements/Buttons/BigRedButton_Regular.png', UI_FRAME_96),
  image('tinyswords.ui.icon.hammer', '/assets/tinyswords/UI Elements/UI Elements/Icons/Icon_08.png'),
  image('tinyswords.ui.icon.wood', '/assets/tinyswords/UI Elements/UI Elements/Icons/Icon_06.png'),
  image('tinyswords.ui.icon.coin', '/assets/tinyswords/UI Elements/UI Elements/Icons/Icon_02.png'),
  image('tinyswords.ui.icon.meat', '/assets/tinyswords/UI Elements/UI Elements/Icons/Icon_05.png'),
  image('tinyswords.ui.cursor.1', '/assets/tinyswords/UI Elements/UI Elements/Cursors/Cursor_01.png'),
  image('tinyswords.ui.cursor.2', '/assets/tinyswords/UI Elements/UI Elements/Cursors/Cursor_02.png'),
  image('tinyswords.ui.cursor.3', '/assets/tinyswords/UI Elements/UI Elements/Cursors/Cursor_03.png'),
  image('tinyswords.ui.cursor.4', '/assets/tinyswords/UI Elements/UI Elements/Cursors/Cursor_04.png'),
  image('tinyswords.ui.wood-table', '/assets/tinyswords/UI Elements/UI Elements/Wood Table/WoodTable.png'),
  image('tinyswords.ui.wood-table-slots', '/assets/tinyswords/UI Elements/UI Elements/Wood Table/WoodTable_Slots.png'),
  sheet('tinyswords.ui.wood-table.frame', '/assets/tinyswords/UI Elements/UI Elements/Wood Table/WoodTable.png', UI_FRAME_128),
  sheet('tinyswords.ui.wood-table.fill', '/assets/tinyswords/UI Elements/UI Elements/Wood Table/WoodTable_Slots.png', UI_FRAME_64),
  sheet('tinyswords.ui.ribbons.big', '/assets/tinyswords/UI Elements/UI Elements/Ribbons/BigRibbons.png', UI_RIBBON_FRAME),
  sheet('tinyswords.ui.swords', '/assets/tinyswords/UI Elements/UI Elements/Swords/Swords.png', UI_RIBBON_FRAME),
  image('tinyswords.terrain.tilemap1', '/assets/tinyswords/Terrain/Tileset/Tilemap_color1.png'),
  image('tinyswords.terrain.tilemap2', '/assets/tinyswords/Terrain/Tileset/Tilemap_color2.png'),
  image('tinyswords.decor.bush1', '/assets/tinyswords/Terrain/Decorations/Bushes/Bushe1.png'),
  image('tinyswords.decor.rock1', '/assets/tinyswords/Terrain/Decorations/Rocks/Rock1.png')
];

export function preloadTinySwords(loader) {
  for (const asset of TINY_SWORDS_ASSETS) {
    if (asset.kind === 'sheet') {
      loader.spritesheet(asset.key, asset.path, asset.config);
      continue;
    }

    loader.image(asset.key, asset.path);
  }
}

export function createTinySwordsAnimations(scene) {
  const animations = [
    { key: 'player-idle-base', texture: 'tinyswords.units.blue.pawn.idle', frameRate: 6, repeat: -1 },
    { key: 'player-run-base', texture: 'tinyswords.units.blue.pawn.run', frameRate: 10, repeat: -1 },
    { key: 'player-idle-wood', texture: 'tinyswords.units.blue.pawn.idle.wood', frameRate: 6, repeat: -1 },
    { key: 'player-run-wood', texture: 'tinyswords.units.blue.pawn.run.wood', frameRate: 10, repeat: -1 },
    { key: 'player-idle-gold', texture: 'tinyswords.units.blue.pawn.idle.gold', frameRate: 6, repeat: -1 },
    { key: 'player-run-gold', texture: 'tinyswords.units.blue.pawn.run.gold', frameRate: 10, repeat: -1 },
    { key: 'player-idle-meat', texture: 'tinyswords.units.blue.pawn.idle.meat', frameRate: 6, repeat: -1 },
    { key: 'player-run-meat', texture: 'tinyswords.units.blue.pawn.run.meat', frameRate: 10, repeat: -1 },
    { key: 'player-idle-tools', texture: 'tinyswords.units.blue.pawn.idle.tools', frameRate: 6, repeat: -1 },
    { key: 'player-run-tools', texture: 'tinyswords.units.blue.pawn.run.tools', frameRate: 10, repeat: -1 },
    { key: 'monster-run-warrior', texture: 'tinyswords.units.red.warrior.run', frameRate: 10, repeat: -1 },
    { key: 'monster-idle-warrior', texture: 'tinyswords.units.red.warrior.idle', frameRate: 6, repeat: -1 },
    { key: 'monster-run-lancer', texture: 'tinyswords.units.black.lancer.run', frameRate: 10, repeat: -1 },
    { key: 'monster-idle-lancer', texture: 'tinyswords.units.black.lancer.idle', frameRate: 6, repeat: -1 },
    { key: 'sheep-idle', texture: 'tinyswords.resources.sheep-idle', frameRate: 5, repeat: -1 }
  ];

  animations.forEach((animation) => {
    if (scene.anims.exists(animation.key)) {
      return;
    }

    scene.anims.create({
      key: animation.key,
      frames: scene.anims.generateFrameNumbers(animation.texture),
      frameRate: animation.frameRate,
      repeat: animation.repeat
    });
  });
}
