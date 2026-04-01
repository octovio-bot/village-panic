import { expect, test } from '@playwright/test';

test.describe('Asset preview carousel mobile controls', () => {
  test('shows touch controls and toggles category/collisions', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/village-panic/?scene=asset-preview&preview=carousel');
    await expect(page.locator('canvas')).toBeVisible();

    await expect.poll(async () => page.evaluate(() => {
      const game = window.__VILLAGE_PANIC__;
      return game?.scene?.getScenes(true)?.map((scene) => scene.scene.key) ?? [];
    }), { timeout: 15000 }).toContain('AssetPreviewScene');

    const stateBefore = await page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('AssetPreviewScene');
      return {
        category: scene?.carouselCategories?.[scene.carouselCategoryIndex],
        collisions: scene?.showCollisionOverlay,
        touchButtons: Object.keys(scene?.touchControls ?? {}),
      };
    });

    expect(stateBefore.touchButtons).toEqual(expect.arrayContaining([
      'prevCategory',
      'nextCategory',
      'prevAsset',
      'nextAsset',
      'collisions',
    ]));
    expect(stateBefore.collisions).toBe(false);

    await page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__.scene.getScene('AssetPreviewScene');
      scene.touchControls.nextCategory.bg.emit('pointerdown', { event: { stopPropagation() {} } });
    });

    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__.scene.getScene('AssetPreviewScene');
      return scene.carouselCategories[scene.carouselCategoryIndex];
    })).not.toBe(stateBefore.category);

    await page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__.scene.getScene('AssetPreviewScene');
      scene.touchControls.collisions.bg.emit('pointerdown', { event: { stopPropagation() {} } });
    });

    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__.scene.getScene('AssetPreviewScene');
      return {
        collisions: scene.showCollisionOverlay,
        label: scene.touchControls.collisions.label.text,
      };
    })).toEqual({
      collisions: true,
      label: 'Collisions : ON',
    });

    const relevantErrors = consoleErrors.filter((text) =>
      !text.includes('GPU stall due to ReadPixels')
    );
    expect(relevantErrors).toEqual([]);
  });
});
