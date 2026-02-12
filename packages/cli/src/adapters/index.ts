export type { SourceAdapter } from './types';
export { registerAdapter, getAdapter, getRegisteredTypes, clearAdapters } from './registry';

import './google-sheets';
import './airtable';
import './notion';
import './csv';
import './xlsx';
