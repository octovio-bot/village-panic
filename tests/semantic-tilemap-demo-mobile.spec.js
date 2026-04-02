import { expect, test } from '@playwright/test';

test.describe('semantic tilemap demo mobile controls', () => {
  test('shows touch HUD in the semantic demo scene', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'mobile profile covered separately by project config');

    await page.goto('/village-panic/?scene=semantic-tilemap-demo');
    await expect(page.locator('canvas')).toBeVisible();

    await expect.poll(async () => page.evaluate(() => {
      const game = window.__VILLAGE_PANIC__;
      return game?.scene?.getScenes(true)?.map((scene) => scene.scene.key) ?? [];
    }), { timeout: 15000 }).toContain('TouchHudScene');
  });
});
