import { useCallback, useEffect, useState } from "react";

import {
    isProjectAiDisabled,
    setProjectAiDisabledInStorage,
    subscribeProjectAiDisabled
} from "../ai/projectAiStorage";

/**
 * Per-project opt-out for Board Copilot (PRD §8). When disabled, no AI requests
 * run for that project and board-scoped AI UI should hide.
 */
const useAiProjectDisabled = (
    projectId: string | undefined | null
): { disabled: boolean; setDisabled: (next: boolean) => void } => {
    const [disabled, setState] = useState(() =>
        isProjectAiDisabled(projectId ?? undefined)
    );

    useEffect(() => {
        setState(isProjectAiDisabled(projectId ?? undefined));
    }, [projectId]);

    useEffect(() => {
        return subscribeProjectAiDisabled(() => {
            setState(isProjectAiDisabled(projectId ?? undefined));
        });
    }, [projectId]);

    const setDisabled = useCallback(
        (next: boolean) => {
            if (!projectId) return;
            setProjectAiDisabledInStorage(projectId, next);
            setState(next);
        },
        [projectId]
    );

    return { disabled, setDisabled };
};

export default useAiProjectDisabled;
