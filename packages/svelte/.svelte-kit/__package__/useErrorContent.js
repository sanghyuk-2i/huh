import { getContext } from 'svelte';
import { HUH_CONTEXT_KEY } from './context';
export function useHuh() {
    const context = getContext(HUH_CONTEXT_KEY);
    if (!context) {
        throw new Error('useHuh must be used within a <HuhProvider>. ' +
            'Wrap your app with <HuhProvider source={...} renderers={...}>.');
    }
    return context;
}
