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
      scene.finishHarvest(tree);
    });

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

  test('drops a carried resource on the map and can pick it back up', async ({ page }) => {
    await page.goto('/village-panic/?scene=loaded-map&map=map2');

    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('LoadedMapScene');
      return !!scene?.pawn;
    }), { timeout: 15000 }).toBe(true);

    await page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('LoadedMapScene');
      scene.carriedItem = { resourceType: 'wood' };
      scene.pawn.setPosition(512, 512);
      scene.dropCarriedItem();
    });

    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('LoadedMapScene');
      return {
        carriedItem: scene?.carriedItem?.resourceType ?? null,
        droppedItems: scene?.spawnManager?.droppedItems?.length ?? 0,
      };
    }), { timeout: 15000 }).toMatchObject({
      carriedItem: null,
      droppedItems: 1,
    });

    await page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('LoadedMapScene');
      const item = scene.spawnManager.droppedItems[0];
      scene.pawn.setPosition(item.x, item.y);
      scene.handleAction();
    });

    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('LoadedMapScene');
      return {
        carriedItem: scene?.carriedItem?.resourceType ?? null,
        droppedItems: scene?.spawnManager?.droppedItems?.length ?? 0,
      };
    }), { timeout: 15000 }).toMatchObject({
      carriedItem: 'wood',
      droppedItems: 0,
    });
  });
});
