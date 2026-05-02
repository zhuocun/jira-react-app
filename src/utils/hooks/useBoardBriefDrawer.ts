import { useCallback } from "react";

import useUrl from "./useUrl";

/**
 * URL-driven open/close state for the Board Brief drawer. Tying the drawer
 * to a query param means the system back button (iOS swipe-back, Android
 * hardware back) dismisses the drawer instead of exiting the board route —
 * a baseline mobile-native expectation that 59% of sites violate (Baymard
 * 2024).
 */
const useBoardBriefDrawer = () => {
    const [{ brief }, setUrl] = useUrl(["brief"]);
    const open = brief === "1";
    const openDrawer = useCallback(() => {
        setUrl({ brief: "1" });
    }, [setUrl]);
    const closeDrawer = useCallback(() => {
        setUrl({ brief: undefined });
    }, [setUrl]);
    return { open, openDrawer, closeDrawer };
};

export default useBoardBriefDrawer;
