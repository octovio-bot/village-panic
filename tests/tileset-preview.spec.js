import { expect, test } from '@playwright/test';

test.describe('tileset preview scene', () => {
  test('loads tileset preview with mapping inspector', async ({ page }) => {
    await page.goto('/village-panic/?scene=tileset-preview');
    await expect(page.locator('canvas')).toBeVisible();

    await expect.poll(async () => page.evaluate(() => {
      const game = window.__VILLAGE_PANIC__;
      return game?.scene?.getScenes(true)?.map((scene) => scene.scene.key) ?? [];
    }), { timeout: 15000 }).toContain('TilesetPreviewScene');

    const info = await page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('TilesetPreviewScene');
      return {
        selectedIndex: scene?.selectedIndex,
        title: scene?.inspectorTitle?.text,
        mapping: scene?.mappingText?.text,
        boxes: scene?.selectionBoxes?.length ?? 0,
        previewWidth: scene?.inspectorPreview?.displayWidth ?? 0,
      };
    });

    expect(info.selectedIndex).toBe(0);
    expect(info.title).toContain('Tile #0');
    expect(info.mapping).toContain('name: level1-water-nw');
    expect(info.boxes).toBe(54);
    expect(info.previewWidth).toBeGreaterThanOrEqual(256);
  });
});
