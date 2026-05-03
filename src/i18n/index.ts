/**
 * Public surface of the i18n module. Importers should reach for these
 * symbols rather than digging into the internal files.
 *
 * Adding a new language: see `registry.ts` for the one-stop instructions.
 */
export {
    getActiveDictionary,
    getActiveLocaleCode,
    setActiveLocale
} from "./active";
export { LanguageProvider, useLocale, useTranslation } from "./context";
export {
    DEFAULT_LOCALE,
    detectInitialLocale,
    getLocaleEntry,
    isLocaleCode,
    type LocaleCode,
    type LocaleEntry,
    LOCALES,
    persistLocale
} from "./registry";
export type { Dictionary } from "./types";
