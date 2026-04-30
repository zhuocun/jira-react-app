import { useEffect, useState } from "react";

const isBrowser = () => typeof window !== "undefined";

const queryMatches = (query: string): boolean => {
    if (!isBrowser() || typeof window.matchMedia !== "function") return false;
    return window.matchMedia(query).matches;
};

/**
 * Returns true when the user has asked the OS for reduced motion. Components
 * should consult this before running any non-essential animation, satisfying
 * WCAG 2.3.3 / Section 2.A.3 of the optimization plan.
 */
const useReducedMotion = (): boolean => {
    const [reduced, setReduced] = useState<boolean>(() =>
        queryMatches("(prefers-reduced-motion: reduce)")
    );

    useEffect(() => {
        if (!isBrowser() || typeof window.matchMedia !== "function") return;
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const handler = (event: MediaQueryListEvent) => {
            setReduced(event.matches);
        };
        if (typeof media.addEventListener === "function") {
            media.addEventListener("change", handler);
            return () => media.removeEventListener("change", handler);
        }
        media.addListener(handler);
        return () => media.removeListener(handler);
    }, []);

    return reduced;
};

export default useReducedMotion;
