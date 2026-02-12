import type { HuhSource } from '../commands/init';
import type { SourceAdapter } from './types';

const adapters = new Map<string, SourceAdapter>();

export function registerAdapter<S extends HuhSource>(adapter: SourceAdapter<S>): void {
  if (adapters.has(adapter.type)) {
    throw new Error(`Adapter already registered for type: ${adapter.type}`);
  }
  adapters.set(adapter.type, adapter as SourceAdapter);
}

export function getAdapter(source: HuhSource): SourceAdapter {
  const adapter = adapters.get(source.type);
  if (!adapter) {
    throw new Error(
      `No adapter registered for source type: ${source.type}. ` +
        `Registered types: ${getRegisteredTypes().join(', ')}`,
    );
  }
  return adapter;
}

export function getRegisteredTypes(): string[] {
  return [...adapters.keys()];
}

export function clearAdapters(): void {
  adapters.clear();
}
