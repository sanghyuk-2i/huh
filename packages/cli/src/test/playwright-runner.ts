import type { DeviceConfig, ScreenshotResult } from './types';

type PlaywrightModule = typeof import('playwright');

export async function loadPlaywright(): Promise<PlaywrightModule> {
  try {
    return await import('playwright');
  } catch {
    throw new Error(
      'Playwright is required for "huh test".\n' +
      'Install: npm install -D playwright\n' +
      'Then: npx playwright install chromium',
    );
  }
}

export interface PlaywrightRunnerOptions {
  port: number;
  trackIds: string[];
  device: DeviceConfig;
  waitTimeout: number;
  screenshotDelay: number;
}

export async function runPlaywrightTests(
  options: PlaywrightRunnerOptions,
): Promise<ScreenshotResult[]> {
  const { port, trackIds, device, waitTimeout, screenshotDelay } = options;
  const pw = await loadPlaywright();

  const browser = await pw.chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: device.width, height: device.height },
    deviceScaleFactor: device.deviceScaleFactor,
    isMobile: device.isMobile,
  });

  const results: ScreenshotResult[] = [];

  for (const trackId of trackIds) {
    const page = await context.newPage();
    const start = Date.now();

    try {
      const url = `http://localhost:${port}/?trackId=${encodeURIComponent(trackId)}`;
      await page.goto(url, { waitUntil: 'networkidle' });

      // Wait for the rendered marker
      await page.waitForSelector('[data-huh-rendered="true"]', {
        timeout: waitTimeout,
      });

      // Determine type-specific delay
      const typeAttr = await page.$eval(
        '[data-huh-type]',
        (el) => el.getAttribute('data-huh-type'),
      ).catch(() => null);

      const typeDelay = getTypeDelay(typeAttr, screenshotDelay);
      await page.waitForTimeout(typeDelay);

      const screenshot = await page.screenshot({ fullPage: true });
      const renderTimeMs = Date.now() - start;

      results.push({
        trackId,
        type: typeAttr ?? 'UNKNOWN',
        buffer: Buffer.from(screenshot),
        width: device.width,
        height: device.height,
        renderTimeMs,
        success: true,
      });
    } catch (err) {
      const renderTimeMs = Date.now() - start;

      // Still try to capture a screenshot of the failed state
      let buffer: Buffer;
      try {
        buffer = Buffer.from(await page.screenshot({ fullPage: true }));
      } catch {
        buffer = Buffer.alloc(0);
      }

      results.push({
        trackId,
        type: 'UNKNOWN',
        buffer,
        width: device.width,
        height: device.height,
        renderTimeMs,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      await page.close();
    }
  }

  await context.close();
  await browser.close();

  return results;
}

function getTypeDelay(type: string | null, defaultDelay: number): number {
  switch (type?.toUpperCase()) {
    case 'TOAST':
      return 350;
    case 'MODAL':
      return 250;
    case 'PAGE':
      return 400;
    default:
      return defaultDelay;
  }
}
