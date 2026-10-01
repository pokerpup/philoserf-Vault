import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';

// Phase 0 TESTS FIRST: `pnpm dev` renders the placeholder map at an integer zoom with
// image-rendering: pixelated, and lists the sim's 12 agents in a plain DOM list.
test('placeholder town renders at an integer zoom and lists 12 sim agents', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.__townReady === true, null, { timeout: 45_000 });

  const canvas = page.locator('#game-container canvas');
  await expect(canvas).toHaveCSS('image-rendering', 'pixelated');
  const size = await canvas.evaluate((c) => {
    const el = c as HTMLCanvasElement;
    const r = el.getBoundingClientRect();
    return { backingW: el.width, backingH: el.height, cssW: r.width, cssH: r.height };
  });
  expect(size.backingW).toBe(480);
  expect(size.backingH).toBe(270);
  const zoom = size.cssW / 480;
  expect(Number.isInteger(zoom)).toBe(true);
  expect(zoom).toBeGreaterThanOrEqual(1);
  expect(size.cssH / 270).toBe(zoom);

  await expect(page.locator('#agents li')).toHaveCount(12, { timeout: 15_000 });
  await expect(page.locator('#agents li[data-online="true"]')).toHaveCount(12, { timeout: 30_000 });
  await expect(page.locator('#clock')).toContainText('Year 1');

  mkdirSync('screens', { recursive: true });
  await page.screenshot({ path: 'screens/phase-0-town.png' });
});
