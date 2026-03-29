# Tiny Swords + Phaser

Use this skill when building or extending a Phaser game that uses the Tiny Swords asset pack.

## Purpose

This skill focuses specifically on **effective Tiny Swords usage inside Phaser**:
- how to reference and organize Tiny Swords assets
- how to load them cleanly in Phaser scenes
- how to deal with UI scaling and nine-slice issues
- how to use the upstream Tiny Swords Phaser reference project as guidance

## Key principles

1. **Use asset metadata and conventions, not guesswork.**
2. **Prefer stable path wrappers/constants** over raw string paths scattered through scenes.
3. **Treat Tiny Swords UI assets carefully**: transparent padding can break naive scaling.
4. **Use the upstream `test.html` reference** as a practical implementation guide for Phaser rendering patterns.

## Included references

- `references/README-notes.md`
- `references/tinyswords-phaser-guidelines.md`
- `examples/upstream-test.html`

## Workflow

### 1) Before changing code
- Inspect current asset keys and loader setup.
- Map required Tiny Swords assets into a centralized registry (keys/constants).
- Check whether a similar usage already exists in `examples/upstream-test.html`.

### 2) For world/terrain usage
- Keep terrain tile sizing consistent.
- Prefer explicit constants for tile size and frame regions.
- Group terrain/decor/resource keys by domain.

### 3) For units/buildings
- Normalize naming by faction, unit/building type, and animation/state.
- Wrap complex path mapping in helper registries.
- Keep scene code using logical asset keys, not raw filesystem paths.

### 4) For UI elements
- Be careful with banners, ribbons, bars, and framed panels.
- Tiny Swords UI frames often contain significant transparent padding.
- If scaling artifacts appear, prefer stitched/composed textures over naive scaling.

### 5) For testing
- Use or adapt `examples/upstream-test.html` patterns for visual validation.
- Build isolated visual test scenes for:
  - buttons
  - health bars
  - banners
  - framed panels
  - unit idle/run/attack animations

## Phaser-specific guidance

### Asset loading
Recommended pattern:
- centralize all Tiny Swords asset keys in one file
- separate `preloadTinySwords()` from scene logic
- generate animation definitions once in a boot scene

### UI scaling
When using Tiny Swords UI art in Phaser:
- avoid direct stretch of raw frames if padding is heavy
- use:
  - composed containers,
  - sliced regions,
  - or stitched render textures

### Scene architecture
Good split:
- `BootScene` → asset loading + animation registration
- `MenuScene` → menu only
- `GameScene` → gameplay logic
- `UIScene` → overlay HUD
- optional visual `TestScene` / `AssetPreviewScene`

## Upstream reference project takeaways

The upstream repo README highlights several practical lessons:
- curated Tiny Swords subsets are preferable to dumping the full asset pack
- `assets.json`-style metadata is useful as a machine-readable asset contract
- `public/test.html` is valuable as a test harness for Tiny Swords rendering and UI verification
- nine-slice / panel rendering is a known pain point and deserves dedicated helpers/tests

## What to copy from upstream mindset

- test harnesses for visual regressions
- metadata-driven asset organization
- explicit UI rendering helpers
- careful curation of used assets only

## What not to do

- Don’t scatter raw asset paths everywhere.
- Don’t assume all UI sprites can be resized directly without artifacts.
- Don’t build gameplay scenes before validating that UI/components render correctly.
- Don’t import the whole asset pack blindly if only a subset is needed.
