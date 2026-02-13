import type { ScreenshotResult, DeviceConfig, SimulateConfig } from './types';
import type { ErrorConfig } from '@huh/core';
import { startPreviewServer, stopPreviewServer } from './preview-server';
import { runPlaywrightTests } from './playwright-runner';
import { findFreePort } from './utils';

export interface CaptureOptions {
  config: ErrorConfig;
  trackIds: string[];
  device: DeviceConfig;
  simulate?: SimulateConfig;
}

export async function captureAllScreenshots(options: CaptureOptions): Promise<ScreenshotResult[]> {
  const { config, trackIds, device, simulate } = options;
  const waitTimeout = simulate?.waitTimeout ?? 5000;
  const screenshotDelay = simulate?.screenshotDelay ?? 300;

  const port = await findFreePort();
  const server = await startPreviewServer({ config, simulate, port });

  try {
    return await runPlaywrightTests({
      port,
      trackIds,
      device,
      waitTimeout,
      screenshotDelay,
    });
  } finally {
    await stopPreviewServer(server);
  }
}
