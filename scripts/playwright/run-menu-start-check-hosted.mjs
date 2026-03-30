import { chromium, devices } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ...devices['iPhone 13'] });
const page = await context.newPage();
const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push(String(err)));

try {
  await page.goto('https://octovio-bot.github.io/village-panic/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const scenesBefore = await page.evaluate(() => window.__VILLAGE_PANIC__?.scene?.getScenes(true).map((s) => s.scene.key) || []);
  const box = await page.locator('canvas').boundingBox();
  if (!box) throw new Error('Canvas not found');

  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(1500);
  const scenesAfterCenterClick = await page.evaluate(() => window.__VILLAGE_PANIC__?.scene?.getScenes(true).map((s) => s.scene.key) || []);

  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.73);
  await page.waitForTimeout(1500);
  const scenesAfterPlayClick = await page.evaluate(() => window.__VILLAGE_PANIC__?.scene?.getScenes(true).map((s) => s.scene.key) || []);

  const ok = scenesAfterCenterClick.includes('GameScene') || scenesAfterPlayClick.includes('GameScene');
  console.log(JSON.stringify({ ok, scenesBefore, scenesAfterCenterClick, scenesAfterPlayClick, consoleErrors }, null, 2));
  if (!ok) process.exitCode = 1;
} finally {
  await browser.close();
}
