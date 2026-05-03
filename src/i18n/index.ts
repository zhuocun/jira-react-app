/**
 * Public surface of the i18n module. Importers should reach for these
 * symbols rather than digging into the internal files.
 *
 * Adding a new language: see `registry.ts` for the one-stop instructions.
 */
export { LanguageProvider, useLocale, useTranslation } from "./context";
export {
    DEFAULT_LOCALE,
    LOCALES,
    detectInitialLocale,
    getLocaleEntry,
    isLocaleCode,
    persistLocale,
    type LocaleCode,
    type LocaleEntry
} from "./registry";
export {
    getActiveDictionary,
    getActiveLocaleCode,
    setActiveLocale
} from "./active";
export type { Dictionary } from "./types";
