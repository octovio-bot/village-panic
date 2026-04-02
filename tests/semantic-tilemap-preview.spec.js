import { expect, test } from '@playwright/test';

test.describe('semantic tilemap preview scene', () => {
  test('loads semantic tilemap preview scene', async ({ page }) => {
    await page.goto('/village-panic/?scene=semantic-tilemap-preview');
    await expect(page.locator('canvas')).toBeVisible();

    await expect.poll(async () => page.evaluate(() => {
      const game = window.__VILLAGE_PANIC__;
      return game?.scene?.getScenes(true)?.map((scene) => scene.scene.key) ?? [];
    }), { timeout: 15000 }).toContain('SemanticTilemapPreviewScene');
  });
});
