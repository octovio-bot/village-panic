import { expect, test } from '@playwright/test';

test.describe('manifest registry integration', () => {
  test('game scene uses manifest-backed obstacle bodies for gameplay assets', async ({ page }) => {
    await page.goto('/village-panic/');

    await expect.poll(async () => page.evaluate(() => {
      const game = window.__VILLAGE_PANIC__;
      return game?.scene?.getScenes(true)?.map((scene) => scene.scene.key) ?? [];
    }), { timeout: 15000 }).toContain('MenuScene');

    await page.evaluate(() => window.__startVillagePanic__());

    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('GameScene');
      return scene?.resourceNodes?.length ?? 0;
    }), { timeout: 15000 }).toBeGreaterThan(0);

    const data = await page.evaluate(() => {
      const scene = window.__VILLAGE_PANIC__?.scene?.getScene('GameScene');
      const woodNode = scene.resourceNodes.find((node) => node.id === 'wood-1');
      const secondWoodNode = scene.resourceNodes.find((node) => node.id === 'wood-2');
      const goldNode = scene.resourceNodes.find((node) => node.id === 'gold-1');
      const dropped = scene.spawnManager.createDroppedItem('wood', 900, 900);

      const result = {
        woodTexture: woodNode?.texture ?? null,
        secondWoodTexture: secondWoodNode?.texture ?? null,
        woodObstacle: woodNode?.obstacle ? {
          width: woodNode.obstacle.width,
          height: woodNode.obstacle.height,
        } : null,
        secondWoodObstacle: secondWoodNode?.obstacle ? {
          width: secondWoodNode.obstacle.width,
          height: secondWoodNode.obstacle.height,
        } : null,
        goldObstacle: goldNode?.obstacle ? {
          width: goldNode.obstacle.width,
          height: goldNode.obstacle.height,
        } : null,
        droppedObstacle: dropped?.obstacle ? {
          width: dropped.obstacle.width,
          height: dropped.obstacle.height,
        } : null,
      };

      scene.spawnManager.removeDroppedItem(dropped.id);
      return result;
    });

    expect(data.woodTexture).toBe('tinyswords.resources.tree1');
    expect(data.secondWoodTexture).toBe('tinyswords.resources.tree2');
    expect(data.woodObstacle.width).toBeGreaterThan(0);
    expect(data.woodObstacle.height).toBeGreaterThan(0);
    expect(data.secondWoodObstacle.width).toBeGreaterThan(0);
    expect(data.secondWoodObstacle.height).toBeGreaterThan(0);
    expect(data.goldObstacle.width).toBeGreaterThan(0);
    expect(data.goldObstacle.height).toBeGreaterThan(0);
    expect(data.droppedObstacle.width).toBeGreaterThan(0);
    expect(data.droppedObstacle.height).toBeGreaterThan(0);
  });
});
