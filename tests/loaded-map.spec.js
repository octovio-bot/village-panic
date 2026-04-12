import { expect, test } from '@playwright/test';

test.describe('loaded map scene', () => {
  test('loads the external map json scene shell', async ({ page }) => {
    await page.goto('/village-panic/?scene=loaded-map&map=map1');
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('accepts selecting another map file via query param', async ({ page }) => {
    await page.goto('/village-panic/?scene=loaded-map&map=map2');
    await expect(page.locator('canvas')).toBeVisible();

    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('LoadedMapScene');
      const objectLayer = scene?.layers?.find?.((layer) => layer.name === 'Arbres');
      return objectLayer?.objects?.length ?? 0;
    }), { timeout: 15000 }).toBeGreaterThan(0);
  });
});
