import { useContext } from 'react';
import { HuhContext } from './ErrorContentProvider';
import type { HuhContextValue } from './types';

export function useHuh(): HuhContextValue {
  const context = useContext(HuhContext);
  if (!context) {
    throw new Error(
      'useHuh must be used within a <HuhProvider>. ' +
        'Wrap your app with <HuhProvider source={...} renderers={...}>.',
    );
  }
  return context;
}
