# Tiny Swords Asset Catalog For This Project

This catalog summarizes the assets currently present in `public/assets/tinyswords`.

## Root Summary

- Root path: `public/assets/tinyswords`
- File totals:
  - `410` PNG files
  - `18` Aseprite source files
  - `33` `.DS_Store` files to ignore
- Main families:
  - `Buildings`: `40` PNG files
  - `Particle FX`: `8` PNG files
  - `Terrain`: `60` PNG files
  - `UI Elements`: `77` PNG files
  - `Units`: `225` PNG files

## Buildings

- Factions:
  - `Black Buildings`
  - `Blue Buildings`
  - `Purple Buildings`
  - `Red Buildings`
  - `Yellow Buildings`
- Repeated building set per faction:
  - `Archery.png`
  - `Barracks.png`
  - `Castle.png`
  - `House1.png`
  - `House2.png`
  - `House3.png`
  - `Monastery.png`
  - `Tower.png`

Use building keys that include faction and building type, for example `tinyswords.buildings.blue.castle`.

## Particle FX

- Files:
  - `Dust_01.png`
  - `Dust_02.png`
  - `Explosion_01.png`
  - `Explosion_02.png`
  - `Fire_01.png`
  - `Fire_02.png`
  - `Fire_03.png`
  - `Water Splash.png`
- Source file:
  - `Particle FX.aseprite`

Treat these as reusable feedback or environmental VFX rather than terrain tiles.

## Terrain

### Decorations

- Families:
  - `Bushes`
  - `Clouds`
  - `Rocks`
  - `Rocks in the Water`
  - `Rubber Duck`

### Resources

- Families:
  - `Gold`
  - `Meat`
  - `Tools`
  - `Wood`
- Notable items:
  - gold resource nodes plus highlight variants
  - sheep idle, move, and grass sprites
  - trees and stumps
  - standalone tools

### Tileset

- Core map sheets:
  - `Tilemap_color1.png`
  - `Tilemap_color2.png`
  - `Tilemap_color3.png`
  - `Tilemap_color4.png`
  - `Tilemap_color5.png`
- Supporting layers:
  - `Shadow.png`
  - `Water Background color.png`
  - `Water Foam.png`
- Source file:
  - `Water Foam.aseprite`

Recommended use:

- Choose a single `Tilemap_colorN.png` as the biome base.
- Add `Shadow.png` as a support layer when simulating elevation.
- Use `Water Background color.png` and `Water Foam.png` for water rendering and foam overlays.

## Units

- Factions:
  - `Black Units`
  - `Blue Units`
  - `Purple Units`
  - `Red Units`
  - `Yellow Units`
- Each faction currently exposes `45` PNG files.
- Canonical unit families:
  - `Archer`
  - `Lancer`
  - `Monk`
  - `Pawn`
  - `Warrior`
- Source Aseprite files exist only under `Units (aseprite in Blue only)`.

### Archer

- Files:
  - `Archer_Idle.png`
  - `Archer_Run.png`
  - `Archer_Shoot.png`
  - `Arrow.png`

### Lancer

- Files include directional attack and defence sheets:
  - `Lancer_Idle.png`
  - `Lancer_Run.png`
  - `Lancer_Up_Attack.png`
  - `Lancer_Up_Defence.png`
  - `Lancer_Right_Attack.png`
  - `Lancer_Right_Defence.png`
  - `Lancer_Down_Attack.png`
  - `Lancer_Down_Defence.png`
  - `Lancer_UpRight_Attack.png`
  - `Lancer_UpRight_Defence.png`
  - `Lancer_DownRight_Attack.png`
  - `Lancer_DownRight_Defence.png`

### Monk

- Files:
  - `Idle.png`
  - `Run.png`
  - `Heal.png`
  - `Heal_Effect.png`

### Pawn

- Base files:
  - `Pawn_Idle.png`
  - `Pawn_Run.png`
- Tool and cargo variants include:
  - `Pawn_Idle Axe.png`
  - `Pawn_Idle Gold.png`
  - `Pawn_Idle Hammer.png`
  - `Pawn_Idle Knife.png`
  - `Pawn_Idle Meat.png`
  - `Pawn_Idle Pickaxe.png`
  - `Pawn_Idle Wood.png`
  - `Pawn_Interact Axe.png`
  - `Pawn_Interact Hammer.png`
  - `Pawn_Interact Knife.png`
  - `Pawn_Interact Pickaxe.png`
  - `Pawn_Run Axe.png`
  - `Pawn_Run Gold.png`
  - `Pawn_Run Hammer.png`
  - `Pawn_Run Knife.png`
  - `Pawn_Run Meat.png`
  - `Pawn_Run Pickaxe.png`
  - `Pawn_Run Wood.png`

### Warrior

- Files:
  - `Warrior_Idle.png`
  - `Warrior_Run.png`
  - `Warrior_Guard.png`
  - `Warrior_Attack1.png`
  - `Warrior_Attack2.png`

Recommended conventions:

- Use blue faction assets as the default implementation target when writing initial code.
- Parameterize faction in keys and paths so color swaps are data-driven.
- Treat spaces inside pawn variant names as part of the semantic variant and normalize them when generating keys.

## UI Elements

Two parallel UI folders exist:

- `UI Elements/UI Elements`
- `UI Elements/UI Banners from the store page`

Primary UI categories under `UI Elements/UI Elements`:

- `Banners`
- `Bars`
- `Buttons`
- `Cursors`
- `Human Avatars`
- `Icons`
- `Papers`
- `Ribbons`
- `Swords`
- `Wood Table`

Notable patterns:

- buttons expose `Regular` and `Pressed` states
- bars expose separate base and fill images
- ribbons and banners are natural candidates for reusable HUD components
- icons and avatars are already enumerated for selection UIs or inventories

## Naming Guidance

- Filesystem path example:
  - `/assets/tinyswords/Units/Blue Units/Archer/Archer_Run.png`
- Suggested key:
  - `tinyswords.units.blue.archer.run`

Normalization rules:

- lowercase everything
- replace spaces with hyphens or dots in intermediate processing, but prefer dots in final Phaser keys
- remove duplicate punctuation
- preserve meaningful suffixes such as `attack1`, `attack2`, `heal-effect`, `water-splash`

## Recommended Loader Strategy

- Build one preload helper per family:
  - buildings
  - terrain
  - units
  - ui
  - fx
- For large family loads, generate a manifest first and derive loaders from it.
- Keep `.aseprite` files out of runtime preload unless the build pipeline explicitly consumes them.
