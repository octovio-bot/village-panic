# Notes from upstream README

Source: `chongdashu/phaserjs-tinyswords`

Important takeaways:
- The project uses a curated subset of Tiny Swords assets to reduce size.
- It recommends using metadata (`assets.json`) as a contract for frame dimensions, variants, and path templates.
- `public/test.html` acts as a visual test harness and is worth copying/adapting.
- Nine-slice style UI scaling is a real rendering problem with Tiny Swords UI art because of transparent padding.
- Phaser scene separation (boot/game/ui/test) is a productive structure for this asset pack.
