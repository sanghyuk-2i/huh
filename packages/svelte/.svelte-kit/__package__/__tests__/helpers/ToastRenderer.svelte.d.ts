import type { ResolvedError } from '@sanghyuk-2i/huh-core';
interface Props {
    error: ResolvedError;
    onAction: () => void;
    onDismiss: () => void;
}
declare const ToastRenderer: import("svelte").Component<Props, {}, "">;
type ToastRenderer = ReturnType<typeof ToastRenderer>;
export default ToastRenderer;
//# sourceMappingURL=ToastRenderer.svelte.d.ts.map