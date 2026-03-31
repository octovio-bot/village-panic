import { expect, test } from '@playwright/test';

test.describe('Village Panic app shell', () => {
  test('loads the menu screen', async ({ page }) => {
    await page.goto('/village-panic/');
    await expect(page).toHaveTitle(/Village Panic/i);
    await expect(page.locator('canvas')).toBeVisible();

    await expect.poll(async () => page.evaluate(() => {
      const game = window.__VILLAGE_PANIC__;
      return game?.scene?.getScenes(true)?.map((scene) => scene.scene.key) ?? [];
    })).toContain('MenuScene');
  });

  test('starts the game from the menu helper API', async ({ page }) => {
    await page.goto('/village-panic/');

    await expect.poll(async () => page.evaluate(() => {
      const game = window.__VILLAGE_PANIC__;
      return game?.scene?.getScenes(true)?.map((scene) => scene.scene.key) ?? [];
    }), { timeout: 15000 }).toContain('MenuScene');

    await page.evaluate(() => window.__startVillagePanic__());

    await expect.poll(async () => page.evaluate(() => {
      const game = window.__VILLAGE_PANIC__;
      return game?.scene?.getScenes(true)?.map((scene) => scene.scene.key) ?? [];
    })).toContain('GameScene');
  });

  test('registers PWA essentials', async ({ page }) => {
    await page.goto('/village-panic/');

    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestHref).toBe('/village-panic/manifest.webmanifest');

    await expect.poll(async () => page.evaluate(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.length;
    })).toBeGreaterThan(0);
  });
});
