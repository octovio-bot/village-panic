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
    }), { timeout: 15000 }).toBeGreaterThan(5);

    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('LoadedMapScene');
      const objectLayer = scene?.layers?.find?.((layer) => layer.name === 'Arbres');
      const objects = objectLayer?.objects ?? [];
      return objects.filter((obj) => obj.sprite?.anims).length;
    }), { timeout: 15000 }).toBeGreaterThan(2);
  });

  test('builds obstacle bodies for loaded maps, including water blocking', async ({ page }) => {
    await page.goto('/village-panic/?scene=loaded-map&map=map2');

    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('LoadedMapScene');
      return scene?.obstacleBodies?.length ?? 0;
    }), { timeout: 15000 }).toBeGreaterThan(0);
  });

  test('cuts a nearby tree and puts wood in the player hands', async ({ page }) => {
    await page.goto('/village-panic/?scene=loaded-map&map=map2');

    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('LoadedMapScene');
      return (scene?.mapObjects ?? []).filter((obj) => obj.kind === 'tree' && !obj.harvested).length;
    }), { timeout: 15000 }).toBeGreaterThan(0);

    await page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('LoadedMapScene');
      const tree = scene.mapObjects.find((obj) => obj.kind === 'tree' && !obj.harvested);
      scene.pawn.setPosition(tree.x - 20, tree.y - 20);
    });

    await page.keyboard.press('e');

    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('LoadedMapScene');
      const stump = scene?.mapObjects?.find?.((obj) => obj.kind === 'stump' && obj.harvested);
      return {
        carriedItem: scene?.carriedItem?.resourceType ?? null,
        harvestedTexture: stump?.sprite?.texture?.key ?? null,
      };
    }), { timeout: 15000 }).toMatchObject({
      carriedItem: 'wood',
      harvestedTexture: expect.stringContaining('stump'),
    });
  });
});
