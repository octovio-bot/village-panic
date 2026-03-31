export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 768;
export const WORLD_WIDTH = 3072;
export const WORLD_HEIGHT = 1792;
export const TILE_SIZE = 64;
export const ORDER_QUEUE_SIZE = 3;
export const ROUND_DURATION_MS = 6 * 60 * 1000;
export const CHAOS_THRESHOLD = 100;
export const INTERACT_RANGE = 86;
export const PLAYER_SPEED = 245;

export const ResourceType = Object.freeze({
  WOOD: 'wood',
  GOLD: 'gold',
  MEAT: 'meat',
  TOOLS: 'tools',
});

export const BuildingType = Object.freeze({
  HOUSE: 'house',
  TOWER: 'tower',
  BARRACKS: 'barracks',
  ARCHERY: 'archery',
  MONASTERY: 'monastery',
  CASTLE: 'castle',
});

export const MonsterState = Object.freeze({
  SPAWNING: 'spawning',
  HARASSING: 'harassing',
  STUNNED: 'stunned',
  DESPAWNING: 'despawning',
});

export const RESOURCE_COLORS = {
  [ResourceType.WOOD]: 0x8c5a32,
  [ResourceType.GOLD]: 0xf1c94a,
  [ResourceType.MEAT]: 0xb95858,
  [ResourceType.TOOLS]: 0xb8c6d0,
};

export const RESOURCE_LABELS = {
  [ResourceType.WOOD]: 'Bois',
  [ResourceType.GOLD]: 'Or',
  [ResourceType.MEAT]: 'Viande',
  [ResourceType.TOOLS]: 'Outils',
};

export const RESOURCE_ICON_TEXTURES = {
  [ResourceType.WOOD]: 'tinyswords.resources.wood-item',
  [ResourceType.GOLD]: 'tinyswords.resources.gold-item',
  [ResourceType.MEAT]: 'tinyswords.resources.meat-item',
  [ResourceType.TOOLS]: 'tinyswords.resources.tools-item',
};

export const RESOURCE_HARVEST_DURATIONS = {
  [ResourceType.WOOD]: 1400,
  [ResourceType.GOLD]: 1800,
  [ResourceType.MEAT]: 1100,
  [ResourceType.TOOLS]: 0,
};

export const BUILDING_LABELS = {
  [BuildingType.HOUSE]: 'Maison',
  [BuildingType.TOWER]: 'Tour',
  [BuildingType.BARRACKS]: 'Caserne',
  [BuildingType.ARCHERY]: 'Archers',
  [BuildingType.MONASTERY]: 'Monastere',
  [BuildingType.CASTLE]: 'Chateau',
};

export const BUILDING_TEXTURES = {
  [BuildingType.HOUSE]: 'tinyswords.buildings.blue.house1',
  [BuildingType.TOWER]: 'tinyswords.buildings.blue.tower',
  [BuildingType.BARRACKS]: 'tinyswords.buildings.blue.barracks',
  [BuildingType.ARCHERY]: 'tinyswords.buildings.blue.archery',
  [BuildingType.MONASTERY]: 'tinyswords.buildings.blue.monastery',
  [BuildingType.CASTLE]: 'tinyswords.buildings.blue.castle',
};

export const ORDER_DEFINITIONS = [
  {
    buildingType: BuildingType.HOUSE,
    ingredients: [ResourceType.WOOD, ResourceType.WOOD],
    timeLimit: 90000,
    scoreValue: 140,
  },
  {
    buildingType: BuildingType.TOWER,
    ingredients: [ResourceType.WOOD, ResourceType.GOLD],
    timeLimit: 95000,
    scoreValue: 175,
  },
  {
    buildingType: BuildingType.BARRACKS,
    ingredients: [ResourceType.WOOD, ResourceType.GOLD, ResourceType.TOOLS],
    timeLimit: 115000,
    scoreValue: 230,
  },
  {
    buildingType: BuildingType.ARCHERY,
    ingredients: [ResourceType.WOOD, ResourceType.TOOLS],
    timeLimit: 100000,
    scoreValue: 190,
  },
  {
    buildingType: BuildingType.MONASTERY,
    ingredients: [ResourceType.GOLD, ResourceType.MEAT],
    timeLimit: 105000,
    scoreValue: 205,
  },
  {
    buildingType: BuildingType.CASTLE,
    ingredients: [ResourceType.WOOD, ResourceType.GOLD, ResourceType.TOOLS],
    timeLimit: 125000,
    scoreValue: 260,
  },
];

export const PLAYER_SPAWN = { x: 1536, y: 918 };

export const VILLAGE_BUILD_ZONE = {
  x: 1536,
  y: 940,
  width: 1240,
  height: 700,
  label: 'Village en expansion',
};

export const WORLD_ZONES = {
  forest: { x: 470, y: 360, width: 440, height: 340, color: 0x305f2f, label: 'Foret' },
  mine: { x: 2580, y: 340, width: 420, height: 320, color: 0x545862, label: 'Mine' },
  pasture: { x: 2580, y: 1380, width: 430, height: 280, color: 0x6f8f4b, label: 'Paturage' },
  workshop: { x: 520, y: 1340, width: 420, height: 280, color: 0x7f5737, label: 'Atelier' },
};

export const RESOURCE_NODES = [
  { id: 'wood-1', resourceType: ResourceType.WOOD, x: 326, y: 248, texture: 'tinyswords.resources.tree1', label: 'Arbre' },
  { id: 'wood-2', resourceType: ResourceType.WOOD, x: 514, y: 430, texture: 'tinyswords.resources.tree2', label: 'Arbre' },
  { id: 'wood-3', resourceType: ResourceType.WOOD, x: 410, y: 336, texture: 'tinyswords.resources.tree3', label: 'Arbre' },
  { id: 'wood-4', resourceType: ResourceType.WOOD, x: 612, y: 286, texture: 'tinyswords.resources.tree4', label: 'Arbre' },
  { id: 'gold-1', resourceType: ResourceType.GOLD, x: 2484, y: 258, texture: 'tinyswords.resources.gold-stone1', label: 'Rocher d or' },
  { id: 'gold-2', resourceType: ResourceType.GOLD, x: 2708, y: 398, texture: 'tinyswords.resources.gold-stone2', label: 'Rocher d or' },
  { id: 'meat-1', resourceType: ResourceType.MEAT, x: 2468, y: 1322, texture: 'tinyswords.resources.sheep-idle', label: 'Mouton' },
  { id: 'meat-2', resourceType: ResourceType.MEAT, x: 2702, y: 1454, texture: 'tinyswords.resources.sheep-idle', label: 'Mouton' },
];

export const STATIONS = [
  {
    id: 'tool-station',
    x: 520,
    y: 1340,
    width: 164,
    height: 164,
    input: ResourceType.WOOD,
    output: ResourceType.TOOLS,
    label: 'Forge',
  },
];

export const MONSTER_SPAWNS = [
  { x: 120, y: 120 },
  { x: 2950, y: 120 },
  { x: 2950, y: 1670 },
  { x: 120, y: 1670 },
];
