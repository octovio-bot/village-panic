# Tiny Swords + Phaser guidelines

## 1) Organize by domain
Recommended asset groupings:
- terrain
- decor
- resources
- units
- buildings
- ui
- particles

## 2) Create a stable key registry
Example:
- `tinyswords.units.blue.warrior.idle`
- `tinyswords.ui.banner.frame`
- `tinyswords.resources.tree1`

## 3) Prefer helpers over repeated scene code
Examples:
- `preloadTinySwords(load)`
- `createTinySwordsAnimations(scene)`
- `createPlaque(scene, opts)`
- `setImageDisplayHeight(scene, image, h)`

## 4) Validate visually in isolation
Before gameplay polish, validate:
- animation frame sizes
n- UI scale behavior
- tile placement and parallax
- unit depth/sorting

## 5) Use upstream test reference as a pattern library
The copied `examples/upstream-test.html` should be consulted when:
- a UI frame scales badly
- a ribbon/bar/button needs clean rendering
- you want a known-good Tiny Swords + Phaser rendering approach
