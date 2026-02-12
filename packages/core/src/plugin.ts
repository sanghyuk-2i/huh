import type { HuhPlugin } from './schema';

export function runPluginHook<K extends 'onError' | 'onAction'>(
  plugins: HuhPlugin[],
  hook: K,
  ...args: Parameters<NonNullable<HuhPlugin[K]>>
): void {
  for (const plugin of plugins) {
    try {
      (plugin[hook] as Function | undefined)?.(...args);
    } catch (err) {
      console.warn(`[huh] Plugin "${plugin.name}" threw in ${hook}:`, err);
    }
  }
}
