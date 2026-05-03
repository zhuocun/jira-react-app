import {
    getActiveDictionary,
    getActiveLocaleCode,
    setActiveLocale
} from "./active";

describe("i18n active singleton", () => {
    afterEach(() => {
        setActiveLocale("en");
    });

    it("updates the active locale code and dictionary together", () => {
        setActiveLocale("zh-CN");
        expect(getActiveLocaleCode()).toBe("zh-CN");
        expect(getActiveDictionary().actions.cancel).toBe("取消");
        setActiveLocale("en");
        expect(getActiveLocaleCode()).toBe("en");
        expect(getActiveDictionary().actions.cancel).toBe("Cancel");
    });
});
