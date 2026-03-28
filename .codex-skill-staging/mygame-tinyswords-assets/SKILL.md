---
name: mygame-tinyswords-assets
description: Analyze and use the Tiny Swords asset pack stored in `public/assets/tinyswords` for this project. Use when loading Phaser assets, building tilemaps, choosing sprites or UI elements, defining animation keys, organizing asset manifests, or mapping game features to the available Tiny Swords files.
---

# MyGame Tiny Swords Assets

Use this skill as the project-specific guide for the assets in `public/assets/tinyswords`.

## Quick Start

1. Read [references/asset-catalog.md](references/asset-catalog.md) before proposing loaders, animation keys, UI composition, or map content.
2. Treat `public/assets/tinyswords` as the source of truth for file names and categories.
3. Prefer stable Phaser keys derived from normalized relative paths, for example:
   - `tinyswords.units.blue.archer.idle`
   - `tinyswords.terrain.tileset.color1`
   - `tinyswords.ui.buttons.big-blue.regular`
4. Keep filesystem paths unchanged unless the user explicitly asks for a reorganization.
5. Ignore `.DS_Store` files in loaders, manifests, and build logic.

## Workflow

### Loading Assets

- Load files from `/assets/tinyswords/...` because the project stores them under `public/assets`.
- Use the relative folder structure to keep keys predictable and collision-free.
- Prefer one loader helper per asset family instead of one giant preload block.
- When loading many related PNG files, build the list from a manifest rather than hardcoding dozens of paths.
- Use [scripts/build-asset-manifest.ps1](scripts/build-asset-manifest.ps1) to regenerate a JSON inventory when the asset tree changes.

### Choosing Sprites And Animations

- Treat each PNG as either a standalone sprite or a sprite sheet candidate that must be verified before animation wiring.
- Infer animation families from naming:
  - `*_Idle`, `*_Run`, `*_Shoot`, `*_Attack*`, `*_Guard`, `*_Defence`, `Heal`, `Heal_Effect`
  - pawn variants with carried resources or tools, such as `Pawn_Run Wood` or `Pawn_Idle Gold`
- Preserve the original color factions: `Black`, `Blue`, `Purple`, `Red`, `Yellow`.
- Prefer blue assets as the canonical reference set when defining shared logic, then swap folder prefixes for other factions.
- If frame size or frame count is unknown, inspect the PNG or use the manifest generator before writing animation configs.

### Tilemaps And Terrain

- Treat `Terrain/Tileset/Tilemap_color1.png` through `Tilemap_color5.png` as the main terrain tilemap variants.
- Keep `Shadow.png`, `Water Background color.png`, and `Water Foam.png` separate from the tilemap color sheets.
- Use terrain decorations and resources as layered props placed above the base map, not merged into the terrain atlas by default.
- When building a map:
  - choose one terrain color variant,
  - add shadow and foam support explicitly,
  - place decorations and resource nodes as separate objects or prop layers.

### Buildings, Units, UI, And FX

- Buildings are faction-colored and mirror the same building set across all five colors.
- Units are also faction-colored and mirror the same unit families across all five colors.
- UI assets are already categorized by purpose: banners, bars, buttons, cursors, avatars, icons, papers, ribbons, swords, and table elements.
- Important visual rule for UI composition:
  - `Banner.png`, `Banner_Slots.png`, `WoodTable.png`, and `WoodTable_Slots.png` are authored as square UI plaques and surfaces.
  - Do not squash these assets into very wide, short rectangles; this destroys the ornament layout and produces broken-looking UI like scattered corner pieces.
  - Preserve their aspect ratio or stay close to square proportions when using them for site markers, panels, or decorative plaques.
  - Treat `Banner.png` and `WoodTable.png` as ornate variants, and `Banner_Slots.png` / `WoodTable_Slots.png` as simpler fill variants or backing plates when a flatter panel is needed.
- Buttons such as `BigBlueButton_Regular.png` are also square 320x320 assets; do not stretch them into wide horizontal buttons.
- Particle FX should be loaded as a separate family for combat or interaction feedback.

## Output Conventions

- Prefer asset keys in lowercase with dots as separators.
- Preserve semantic names from filenames; only normalize spaces and punctuation.
- When generating code, include the relative asset path next to each key at least once in the relevant loader map.
- When asked to add a new feature, first map it to an existing asset family from the catalog instead of inventing placeholders.

## References

- Read [references/asset-catalog.md](references/asset-catalog.md) for the current inventory and naming guidance.
- Run [scripts/build-asset-manifest.ps1](scripts/build-asset-manifest.ps1) when the asset tree changes or when precise dimensions are needed.
