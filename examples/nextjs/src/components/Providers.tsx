'use client';

import type { ErrorConfig } from '@sanghyuk-2i/huh-core';
import { HuhProvider } from '@sanghyuk-2i/huh-react';
import { renderers } from './renderers';
import errorConfig from '../huh.json';

const config = errorConfig as ErrorConfig;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HuhProvider source={config} renderers={renderers}>
      {children}
    </HuhProvider>
  );
}
