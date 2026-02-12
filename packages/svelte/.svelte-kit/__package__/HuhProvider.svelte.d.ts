import type { Snippet } from 'svelte';
import type { ErrorConfig, LocalizedErrorConfig } from '@huh/core';
import type { RendererMap } from './types';
interface Props {
    source?: ErrorConfig;
    locales?: LocalizedErrorConfig;
    defaultLocale?: string;
    locale?: string;
    renderers: RendererMap;
    children: Snippet;
    onRetry?: () => void;
    onCustomAction?: (action: {
        type: string;
        target?: string;
    }) => void;
}
declare const HuhProvider: import("svelte").Component<Props, {}, "">;
type HuhProvider = ReturnType<typeof HuhProvider>;
export default HuhProvider;
//# sourceMappingURL=HuhProvider.svelte.d.ts.map