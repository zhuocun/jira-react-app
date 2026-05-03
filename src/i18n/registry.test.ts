import dayjs from "dayjs";

import {
    applyDayjsLocale,
    DEFAULT_LOCALE,
    detectInitialLocale,
    getLocaleEntry,
    isLocaleCode,
    persistLocale,
    type LocaleCode
} from "./registry";

describe("i18n registry", () => {
    const storageKey = "pulse.locale";

    beforeEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    describe("getLocaleEntry", () => {
        it("returns the matching locale entry", () => {
            const en = getLocaleEntry("en");
            expect(en.code).toBe("en");
            expect(en.htmlLang).toBe("en");

            const zh = getLocaleEntry("zh-CN");
            expect(zh.code).toBe("zh-CN");
            expect(zh.htmlLang).toBe("zh-CN");
        });
    });

    describe("isLocaleCode", () => {
        it("accepts only supported locale strings", () => {
            expect(isLocaleCode("en")).toBe(true);
            expect(isLocaleCode("zh-CN")).toBe(true);
            expect(isLocaleCode("fr")).toBe(false);
            expect(isLocaleCode("")).toBe(false);
            expect(isLocaleCode(null)).toBe(false);
        });
    });

    describe("detectInitialLocale", () => {
        it("returns DEFAULT_LOCALE when localStorage is empty and navigator is absent", () => {
            const navSpy = jest
                .spyOn(window, "navigator", "get")
                .mockReturnValue({ language: undefined } as Navigator);

            expect(detectInitialLocale()).toBe(DEFAULT_LOCALE);

            navSpy.mockRestore();
        });

        it("returns persisted locale when valid", () => {
            localStorage.setItem(storageKey, "zh-CN");
            expect(detectInitialLocale()).toBe("zh-CN");
        });

        it("ignores unknown persisted codes", () => {
            localStorage.setItem(storageKey, "fr-FR");
            expect(detectInitialLocale()).toBe(DEFAULT_LOCALE);
        });

        it("maps navigator language prefix zh to zh-CN", () => {
            jest.spyOn(window, "navigator", "get").mockReturnValue({
                language: "zh"
            } as Navigator);

            expect(detectInitialLocale()).toBe("zh-CN");
        });

        it("uses exact navigator locale when supported", () => {
            jest.spyOn(window, "navigator", "get").mockReturnValue({
                language: "zh-CN"
            } as Navigator);

            expect(detectInitialLocale()).toBe("zh-CN");
        });
    });

    describe("persistLocale", () => {
        it("writes the locale code to localStorage", () => {
            persistLocale("zh-CN");
            expect(localStorage.getItem(storageKey)).toBe("zh-CN");
        });

        it("does not throw when localStorage.setItem fails", () => {
            const setItem = jest
                .spyOn(Storage.prototype, "setItem")
                .mockImplementation(() => {
                    throw new Error("quota");
                });

            expect(() => persistLocale("en" as LocaleCode)).not.toThrow();

            setItem.mockRestore();
        });
    });

    describe("applyDayjsLocale", () => {
        it("sets dayjs global locale from the registry entry", () => {
            const localeSpy = jest.spyOn(dayjs, "locale");

            applyDayjsLocale("zh-CN");

            expect(localeSpy).toHaveBeenCalledWith("zh-cn");

            localeSpy.mockRestore();
        });
    });
});
