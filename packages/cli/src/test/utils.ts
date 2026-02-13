import * as net from 'net';
import type { ErrorConfig } from '@sanghyuk-2i/huh-core';

export function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        const port = addr.port;
        server.close(() => resolve(port));
      } else {
        server.close(() => reject(new Error('Failed to get port')));
      }
    });
    server.on('error', reject);
  });
}

export function filterTrackIds(
  config: ErrorConfig,
  filterIds?: string,
  filterTypes?: string,
): string[] {
  let trackIds = Object.keys(config);

  if (filterIds) {
    const allowed = new Set(filterIds.split(',').map((s) => s.trim()));
    trackIds = trackIds.filter((id) => allowed.has(id));
  }

  if (filterTypes) {
    const allowed = new Set(filterTypes.split(',').map((s) => s.trim().toUpperCase()));
    trackIds = trackIds.filter((id) => allowed.has(config[id].type.toUpperCase()));
  }

  return trackIds;
}
