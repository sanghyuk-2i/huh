import type { HuhSource } from '../commands/init';

export interface SourceAdapter<S extends HuhSource = HuhSource> {
  readonly type: S['type'];
  fetch(source: S): Promise<string[][]>;
}
