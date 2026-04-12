import { expect, test } from '@playwright/test';

test.describe('loaded map scene', () => {
  test('loads the external map json scene shell', async ({ page }) => {
    await page.goto('/village-panic/?scene=loaded-map');
    await expect(page.locator('canvas')).toBeVisible();
  });
});
