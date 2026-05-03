import dayjs from "dayjs";

import {
    applyDayjsLocale,
    DEFAULT_LOCALE,
    detectInitialLocale,
    getLocaleEntry,
    isLocaleCode,
    persistLocale
} from "./registry";

const STORAGE_KEY = "pulse.locale";

describe("i18n registry", () => {
    const originalLanguage = Object.getOwnPropertyDescriptor(
        global.navigator,
        "language"
    );

    afterEach(() => {
        localStorage.clear();
        if (originalLanguage) {
            Object.defineProperty(
                global.navigator,
                "language",
                originalLanguage
            );
        } else {
            delete (global.navigator as { language?: string }).language;
        }
        applyDayjsLocale(DEFAULT_LOCALE);
    });

    describe("isLocaleCode", () => {
        it("accepts registered locale strings", () => {
            expect(isLocaleCode("en")).toBe(true);
            expect(isLocaleCode("zh-CN")).toBe(true);
        });

        it("rejects unknown or non-string values", () => {
            expect(isLocaleCode("fr")).toBe(false);
            expect(isLocaleCode("")).toBe(false);
            expect(isLocaleCode(null)).toBe(false);
            expect(isLocaleCode(1)).toBe(false);
        });
    });

    describe("getLocaleEntry", () => {
        it("returns the matching entry for a known code", () => {
            const en = getLocaleEntry("en");
            expect(en.code).toBe("en");
            expect(en.dictionary.actions.cancel).toBe("Cancel");
            const zh = getLocaleEntry("zh-CN");
            expect(zh.code).toBe("zh-CN");
            expect(zh.dictionary.actions.cancel).toBe("取消");
        });
    });

    describe("detectInitialLocale", () => {
        it("prefers a valid persisted locale over navigator", () => {
            localStorage.setItem(STORAGE_KEY, "zh-CN");
            Object.defineProperty(global.navigator, "language", {
                configurable: true,
                value: "en-US"
            });
            expect(detectInitialLocale()).toBe("zh-CN");
        });

        it("ignores an unknown persisted code and uses navigator when it matches exactly", () => {
            localStorage.setItem(STORAGE_KEY, "xx-YY");
            Object.defineProperty(global.navigator, "language", {
                configurable: true,
                value: "zh-CN"
            });
            expect(detectInitialLocale()).toBe("zh-CN");
        });

        it("maps a language-only navigator tag to a registered locale (zh → zh-CN)", () => {
            Object.defineProperty(global.navigator, "language", {
                configurable: true,
                value: "zh"
            });
            expect(detectInitialLocale()).toBe("zh-CN");
        });

        it("falls back to DEFAULT_LOCALE when nothing matches", () => {
            Object.defineProperty(global.navigator, "language", {
                configurable: true,
                value: "xx-YY"
            });
            expect(detectInitialLocale()).toBe(DEFAULT_LOCALE);
        });

        it("falls back when localStorage.getItem throws", () => {
            const spy = jest
                .spyOn(Storage.prototype, "getItem")
                .mockImplementation(() => {
                    throw new Error("blocked");
                });
            Object.defineProperty(global.navigator, "language", {
                configurable: true,
                value: "en-GB"
            });
            expect(detectInitialLocale()).toBe("en");
            spy.mockRestore();
        });
    });

    describe("persistLocale", () => {
        it("writes the locale code to localStorage", () => {
            persistLocale("zh-CN");
            expect(localStorage.getItem(STORAGE_KEY)).toBe("zh-CN");
        });

        it("swallows setItem errors (quota / disabled storage)", () => {
            const spy = jest
                .spyOn(Storage.prototype, "setItem")
                .mockImplementation(() => {
                    throw new Error("quota");
                });
            expect(() => persistLocale("en")).not.toThrow();
            spy.mockRestore();
        });
    });

    describe("applyDayjsLocale", () => {
        it("switches the global dayjs locale to match the registry entry", () => {
            applyDayjsLocale("zh-CN");
            expect(dayjs.locale()).toBe("zh-cn");
            applyDayjsLocale("en");
            expect(dayjs.locale()).toBe("en");
        });
    });
});
