import { useCallback, useEffect, useState } from "react";

import environment from "../../constants/env";
import type { AutonomyLevel } from "../../interfaces/agent";

const STORAGE_KEY = "boardCopilot:enabled";
const EVENT_NAME = "boardCopilot:toggled";

const AUTONOMY_STORAGE_KEY = "boardCopilot:autonomy";
const AUTONOMY_EVENT_NAME = "boardCopilot:autonomyChanged";
const AUTONOMY_LEVELS: ReadonlyArray<AutonomyLevel> = [
    "suggest",
    "plan",
    "auto"
];
const DEFAULT_AUTONOMY: AutonomyLevel = "plan";

const readStored = (): boolean => {
    if (typeof window === "undefined") return true;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return true;
    return raw === "true";
};

const isAutonomyLevel = (value: unknown): value is AutonomyLevel =>
    typeof value === "string" &&
    (AUTONOMY_LEVELS as ReadonlyArray<string>).includes(value);

const readStoredAutonomy = (): AutonomyLevel => {
    if (typeof window === "undefined") return DEFAULT_AUTONOMY;
    const raw = window.localStorage.getItem(AUTONOMY_STORAGE_KEY);
    if (raw && isAutonomyLevel(raw)) return raw;
    return DEFAULT_AUTONOMY;
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

/**
 * Per-browser autonomy level for Board Copilot v2.1 (PRD §6.1). The default
 * is `"plan"`: the agent gathers context and proposes mutations, and the
 * user accepts/rejects from the UI. Lowering to `"suggest"` disables
 * proposals; raising to `"auto"` lets low-risk, undoable proposals apply
 * with a toast-based undo. Sibling consumers stay in sync via the
 * `boardCopilot:autonomyChanged` custom event.
 */
export const useAutonomyLevel = (): {
    level: AutonomyLevel;
    setLevel: (next: AutonomyLevel) => void;
} => {
    const [level, setLevelState] = useState<AutonomyLevel>(() =>
        readStoredAutonomy()
    );

    useEffect(() => {
        if (typeof window === "undefined") return;
        const handler = (event: Event) => {
            const detail = (event as CustomEvent<AutonomyLevel>).detail;
            if (isAutonomyLevel(detail)) setLevelState(detail);
        };
        window.addEventListener(AUTONOMY_EVENT_NAME, handler);
        return () => {
            window.removeEventListener(AUTONOMY_EVENT_NAME, handler);
        };
    }, []);

    const setLevel = useCallback((next: AutonomyLevel) => {
        if (typeof window === "undefined") return;
        if (!isAutonomyLevel(next)) return;
        window.localStorage.setItem(AUTONOMY_STORAGE_KEY, next);
        window.dispatchEvent(
            new CustomEvent<AutonomyLevel>(AUTONOMY_EVENT_NAME, {
                detail: next
            })
        );
    }, []);

    return { level, setLevel };
};

export default useAiEnabled;
