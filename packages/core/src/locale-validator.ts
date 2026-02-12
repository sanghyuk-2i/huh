import type {
  LocalizedErrorConfig,
  CrossLocaleValidationError,
  CrossLocaleValidationResult,
} from './schema';

export function validateLocales(locales: LocalizedErrorConfig): CrossLocaleValidationResult {
  const errors: CrossLocaleValidationError[] = [];
  const warnings: CrossLocaleValidationError[] = [];

  const localeNames = Object.keys(locales);
  if (localeNames.length < 2) {
    return { valid: true, errors, warnings };
  }

  // Collect all trackIds across all locales
  const trackIdsByLocale = new Map<string, Set<string>>();
  const allTrackIds = new Set<string>();

  for (const locale of localeNames) {
    const trackIds = new Set(Object.keys(locales[locale]));
    trackIdsByLocale.set(locale, trackIds);
    for (const id of trackIds) {
      allTrackIds.add(id);
    }
  }

  // Check each trackId exists in every locale
  for (const trackId of allTrackIds) {
    const missingLocales: string[] = [];
    for (const locale of localeNames) {
      if (!trackIdsByLocale.get(locale)!.has(trackId)) {
        missingLocales.push(locale);
      }
    }

    if (missingLocales.length > 0) {
      const presentLocales = localeNames.filter((l) => !missingLocales.includes(l));
      errors.push({
        trackId,
        locales: missingLocales,
        message: `trackId "${trackId}" exists in [${presentLocales.join(', ')}] but missing in [${missingLocales.join(', ')}]`,
      });
    }
  }

  // Check type and actionType consistency across locales for shared trackIds
  for (const trackId of allTrackIds) {
    const presentLocales = localeNames.filter((l) => trackIdsByLocale.get(l)!.has(trackId));
    if (presentLocales.length < 2) continue;

    // Check type consistency
    const types = new Map<string, string[]>();
    for (const locale of presentLocales) {
      const type = locales[locale][trackId].type;
      if (!types.has(type)) {
        types.set(type, []);
      }
      types.get(type)!.push(locale);
    }

    if (types.size > 1) {
      const details = [...types.entries()]
        .map(([type, locs]) => `${type} in [${locs.join(', ')}]`)
        .join(', ');
      warnings.push({
        trackId,
        field: 'type',
        locales: presentLocales,
        message: `type mismatch for "${trackId}": ${details}`,
      });
    }

    // Check actionType consistency
    const actionTypes = new Map<string, string[]>();
    for (const locale of presentLocales) {
      const actionType = locales[locale][trackId].action?.type ?? '';
      if (!actionTypes.has(actionType)) {
        actionTypes.set(actionType, []);
      }
      actionTypes.get(actionType)!.push(locale);
    }

    if (actionTypes.size > 1) {
      const details = [...actionTypes.entries()]
        .map(([type, locs]) => `${type || '(none)'} in [${locs.join(', ')}]`)
        .join(', ');
      warnings.push({
        trackId,
        field: 'action.type',
        locales: presentLocales,
        message: `actionType mismatch for "${trackId}": ${details}`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
