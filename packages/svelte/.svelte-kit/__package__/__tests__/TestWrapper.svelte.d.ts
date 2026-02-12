import type { ErrorConfig } from '@huh/core';
import type { RendererMap } from '../types';
interface Props {
    source: ErrorConfig;
    renderers: RendererMap;
    onRetry?: () => void;
    onCustomAction?: (action: {
        type: string;
        target?: string;
    }) => void;
}
declare const TestWrapper: import("svelte").Component<Props, {}, "">;
type TestWrapper = ReturnType<typeof TestWrapper>;
export default TestWrapper;
//# sourceMappingURL=TestWrapper.svelte.d.ts.map