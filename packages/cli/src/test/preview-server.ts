import * as http from 'http';
import type { ErrorConfig } from '@sanghyuk-2i/huh-core';
import type { SimulateConfig } from './types';
import { buildPreviewHtml } from './preview-app';

export interface PreviewServerOptions {
  config: ErrorConfig;
  simulate?: SimulateConfig;
  port: number;
}

export function startPreviewServer(options: PreviewServerOptions): Promise<http.Server> {
  const { config, simulate, port } = options;

  const previewHtml = buildPreviewHtml(port);

  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${port}`);
    const pathname = url.pathname;

    // CORS headers for Playwright
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    if (pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(previewHtml);
      return;
    }

    if (pathname === '/__huh__/config.json') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(config));
      return;
    }

    if (pathname === '/__huh__/variables.json') {
      const trackId = url.searchParams.get('trackId') ?? '';
      const perTrack = simulate?.variables?.[trackId] ?? {};
      const defaults = simulate?.defaultVariables ?? {};
      const merged = { ...defaults, ...perTrack };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(merged));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  return new Promise((resolve, reject) => {
    server.listen(port, () => resolve(server));
    server.on('error', reject);
  });
}

export function stopPreviewServer(server: http.Server): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}
