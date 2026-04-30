import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ui:colorScheme";
const EVENT_NAME = "ui:colorScheme:changed";

export type ColorScheme = "light" | "dark";
export type ColorSchemePreference = ColorScheme | "system";

const isBrowser = () => typeof window !== "undefined";

const readStored = (): ColorSchemePreference => {
    if (!isBrowser()) return "system";
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
    return "system";
};

const systemPrefersDark = (): boolean => {
    if (!isBrowser() || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * Resolves the user's color scheme preference: explicit `light`/`dark`
 * overrides the OS, `system` follows `prefers-color-scheme`. Persists across
 * tabs via a custom DOM event (lightweight, no Redux required).
 */
const useColorScheme = (): {
    preference: ColorSchemePreference;
    scheme: ColorScheme;
    setPreference: (next: ColorSchemePreference) => void;
} => {
    const [preference, setPreferenceState] = useState<ColorSchemePreference>(
        () => readStored()
    );
    const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark);

    useEffect(() => {
        if (!isBrowser() || typeof window.matchMedia !== "function") return;
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (event: MediaQueryListEvent) => {
            setSystemDark(event.matches);
        };
        if (typeof media.addEventListener === "function") {
            media.addEventListener("change", handler);
            return () => media.removeEventListener("change", handler);
        }
        media.addListener(handler);
        return () => media.removeListener(handler);
    }, []);

    useEffect(() => {
        if (!isBrowser()) return;
        const handler = (event: Event) => {
            const detail = (event as CustomEvent<ColorSchemePreference>).detail;
            if (detail === "light" || detail === "dark" || detail === "system") {
                setPreferenceState(detail);
            }
        };
        window.addEventListener(EVENT_NAME, handler);
        return () => window.removeEventListener(EVENT_NAME, handler);
    }, []);

    const setPreference = useCallback((next: ColorSchemePreference) => {
        if (!isBrowser()) return;
        window.localStorage.setItem(STORAGE_KEY, next);
        window.dispatchEvent(
            new CustomEvent<ColorSchemePreference>(EVENT_NAME, { detail: next })
        );
    }, []);

    const scheme: ColorScheme =
        preference === "system" ? (systemDark ? "dark" : "light") : preference;

    return { preference, scheme, setPreference };
};

export default useColorScheme;
