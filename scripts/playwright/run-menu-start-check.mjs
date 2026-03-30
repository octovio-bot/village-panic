import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, devices } from 'playwright';

const root = process.cwd();
const port = 41731;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8',
};

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let filePath = path.join(root, reqPath === '/' ? 'index.html' : reqPath.replace(/^\//, ''));
  if (!filePath.startsWith(root)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  serveFile(filePath, res);
});

await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ...devices['iPhone 13'] });
const page = await context.newPage();
const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push(String(err)));

try {
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'mobile-before-play.png' });

  const scenesBefore = await page.evaluate(() => window.__VILLAGE_PANIC__.scene.getScenes(true).map((s) => s.scene.key));

  const box = await page.locator('canvas').boundingBox();
  if (!box) throw new Error('Canvas not found');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(1500);
  const scenesAfterCenterClick = await page.evaluate(() => window.__VILLAGE_PANIC__.scene.getScenes(true).map((s) => s.scene.key));

  // Explicit click near menu play area center
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.73);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'mobile-after-play.png' });
  const scenesAfterPlayClick = await page.evaluate(() => window.__VILLAGE_PANIC__.scene.getScenes(true).map((s) => s.scene.key));

  const ok = scenesAfterCenterClick.includes('GameScene') || scenesAfterPlayClick.includes('GameScene');
  console.log(JSON.stringify({ ok, scenesBefore, scenesAfterCenterClick, scenesAfterPlayClick, consoleErrors }, null, 2));
  if (!ok) process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
