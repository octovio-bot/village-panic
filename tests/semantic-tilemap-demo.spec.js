import { expect, test } from '@playwright/test';

test.describe('semantic tilemap demo scene', () => {
  test('loads demo scene with a controllable pawn', async ({ page }) => {
    await page.goto('/village-panic/?scene=semantic-tilemap-demo');
    await expect(page.locator('canvas')).toBeVisible();

    await expect.poll(async () => page.evaluate(() => {
      const game = window.__VILLAGE_PANIC__;
      return game?.scene?.getScenes(true)?.map((scene) => scene.scene.key) ?? [];
    }), { timeout: 15000 }).toContain('SemanticTilemapDemoScene');

    const before = await page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('SemanticTilemapDemoScene');
      return {
        x: scene?.pawn?.x ?? 0,
        y: scene?.pawn?.y ?? 0,
        spriteCount: scene?.children?.list?.filter?.((child) => child.type === 'Image')?.length ?? 0,
      };
    });

    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(300);
    await page.keyboard.up('ArrowRight');

    const after = await page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('SemanticTilemapDemoScene');
      return {
        x: scene?.pawn?.x ?? 0,
        y: scene?.pawn?.y ?? 0,
      };
    });

    expect(before.spriteCount).toBeGreaterThan(20);
    expect(after.x).toBeGreaterThan(before.x);
  });
});
