/**
 * Module-level singleton holding the currently active dictionary.
 *
 * Two consumers read from here:
 *   1. The Proxy in `src/constants/microcopy.ts` — every property access
 *      forwards into `getActiveDictionary()`, so any component that imports
 *      `microcopy` automatically sees the active locale's strings without
 *      a per-component refactor.
 *   2. Non-React code (`utils/authApis.ts`, `utils/hooks/useApi.ts`,
 *      `utils/hooks/useUndoToast.tsx`) that builds error messages
 *      asynchronously and can't subscribe to React context.
 *
 * The React `LanguageProvider` is responsible for keeping the singleton in
 * sync — it calls `setActiveDictionary` whenever the locale changes, before
 * notifying its subscribers, so a re-render reads the new strings.
 */
import en from "./locales/en";
import { DEFAULT_LOCALE, getLocaleEntry, type LocaleCode } from "./registry";
import type { Dictionary } from "./types";

// Seeded with the English literal (read-only `as const`) cast to the mutable
// `Dictionary` shape — the singleton itself is treated as read-only at the
// usage site (the Proxy in `constants/microcopy.ts` never writes), so the
// stripped readonly modifier is purely a typing convenience for the `let`.
let activeDictionary: Dictionary = en as unknown as Dictionary;
let activeCode: LocaleCode = DEFAULT_LOCALE;

export const getActiveDictionary = (): Dictionary => activeDictionary;

export const getActiveLocaleCode = (): LocaleCode => activeCode;

export const setActiveLocale = (code: LocaleCode): void => {
    const entry = getLocaleEntry(code);
    activeDictionary = entry.dictionary;
    activeCode = entry.code;
};
