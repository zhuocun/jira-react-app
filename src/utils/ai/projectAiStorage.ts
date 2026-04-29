export const PROJECT_AI_DISABLED_MESSAGE =
    "Board Copilot is disabled for this project.";

const STORAGE_KEY = "boardCopilot:disabledProjectIds";
const EVENT_NAME = "boardCopilot:projectAiChanged";

const readIds = (): Set<string> => {
    if (typeof window === "undefined") return new Set();
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Set();
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return new Set();
        return new Set(parsed.filter((id) => typeof id === "string" && id));
    } catch {
        return new Set();
    }
};

const writeIds = (ids: Set<string>) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
};

export const isProjectAiDisabled = (
    projectId: string | null | undefined
): boolean => {
    if (!projectId) return false;
    return readIds().has(projectId);
};

export const setProjectAiDisabledInStorage = (
    projectId: string,
    disabled: boolean
): void => {
    const next = readIds();
    if (disabled) next.add(projectId);
    else next.delete(projectId);
    writeIds(next);
};

export const subscribeProjectAiDisabled = (
    listener: () => void
): (() => void) => {
    if (typeof window === "undefined") return () => undefined;
    window.addEventListener(EVENT_NAME, listener);
    return () => window.removeEventListener(EVENT_NAME, listener);
};
