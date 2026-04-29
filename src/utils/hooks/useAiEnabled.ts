import { useCallback, useEffect, useState } from "react";

import environment from "../../constants/env";

const STORAGE_KEY = "boardCopilot:enabled";
const EVENT_NAME = "boardCopilot:toggled";

const readStored = (): boolean => {
    if (typeof window === "undefined") return true;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return true;
    return raw === "true";
};

const useAiEnabled = (): {
    enabled: boolean;
    setEnabled: (next: boolean) => void;
    available: boolean;
} => {
    const [stored, setStored] = useState<boolean>(() => readStored());

    useEffect(() => {
        const handler = (event: Event) => {
            const detail = (event as CustomEvent<boolean>).detail;
            setStored(Boolean(detail));
        };
        window.addEventListener(EVENT_NAME, handler);
        return () => {
            window.removeEventListener(EVENT_NAME, handler);
        };
    }, []);

    const setEnabled = useCallback((next: boolean) => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(STORAGE_KEY, String(next));
        window.dispatchEvent(
            new CustomEvent<boolean>(EVENT_NAME, { detail: next })
        );
    }, []);

    return {
        available: environment.aiEnabled,
        enabled: environment.aiEnabled && stored,
        setEnabled
    };
};

export default useAiEnabled;
