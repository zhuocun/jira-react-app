import { microcopy } from "./microcopy";
import { setActiveLocale } from "../i18n/active";

describe("locale-aware microcopy proxy", () => {
    afterEach(() => {
        setActiveLocale("en");
    });

    it("resolves string leaves from the active dictionary", () => {
        setActiveLocale("en");
        expect(microcopy.actions.cancel).toBe("Cancel");
        setActiveLocale("zh-CN");
        expect(microcopy.actions.cancel).toBe("取消");
    });

    it("supports Object.entries on a nested namespace after a locale switch", () => {
        setActiveLocale("zh-CN");
        const row = Object.entries(microcopy.actions).find(
            ([k]) => k === "save"
        );
        expect(row?.[1]).toBe("保存");
    });

    it("implements the `in` operator for known keys on a nested proxy", () => {
        setActiveLocale("en");
        expect("save" in microcopy.actions).toBe(true);
        expect("notARealKey" in microcopy.actions).toBe(false);
    });

    it("returns undefined for a missing path segment", () => {
        setActiveLocale("en");
        expect(
            Reflect.get(microcopy.actions as object, "nonexistentKey" as never)
        ).toBeUndefined();
    });
});
