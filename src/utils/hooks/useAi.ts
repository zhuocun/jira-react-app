import { useCallback, useEffect, useRef, useState } from "react";

import environment from "../../constants/env";
import {
    AiContextProject,
    AiSearchProjectsContext,
    boardBrief,
    breakdownTask,
    DraftRequest,
    draftTask,
    estimate,
    EstimateRequest,
    readiness,
    ReadinessRequest,
    semanticSearch
} from "../ai/engine";
import {
    validateBoardBrief,
    validateBreakdown,
    validateDraft,
    validateEstimate,
    validateReadiness,
    validateSearch
} from "../ai/validate";

export type AiRoute =
    | "task-draft"
    | "task-breakdown"
    | "estimate"
    | "readiness"
    | "board-brief"
    | "search";

interface UseAiOptions {
    route: AiRoute;
}

interface RunPayload {
    draft?: DraftRequest & { count?: number };
    estimate?: EstimateRequest & { context: AiContextProject };
    readiness?: ReadinessRequest & { context: AiContextProject };
    brief?: { context: AiContextProject };
    search?: {
        kind: "tasks" | "projects";
        query: string;
        projectContext?: AiContextProject;
        projectsContext?: AiSearchProjectsContext;
    };
}

const localResolve = (route: AiRoute, payload: RunPayload): unknown => {
    switch (route) {
        case "task-draft": {
            if (!payload.draft) throw new Error("draft payload required");
            return draftTask(payload.draft);
        }
        case "task-breakdown": {
            if (!payload.draft) throw new Error("draft payload required");
            return breakdownTask(payload.draft, payload.draft.count ?? 3);
        }
        case "estimate": {
            if (!payload.estimate) throw new Error("estimate payload required");
            return estimate(payload.estimate);
        }
        case "readiness": {
            if (!payload.readiness)
                throw new Error("readiness payload required");
            return readiness(payload.readiness);
        }
        case "board-brief": {
            if (!payload.brief) throw new Error("brief payload required");
            return boardBrief(payload.brief.context);
        }
        case "search": {
            if (!payload.search) throw new Error("search payload required");
            const { kind, query, projectContext, projectsContext } =
                payload.search;
            if (kind === "tasks") {
                if (!projectContext)
                    throw new Error("projectContext required for task search");
                return semanticSearch("tasks", query, projectContext);
            }
            if (!projectsContext) {
                throw new Error("projectsContext required for project search");
            }
            return semanticSearch("projects", query, projectsContext);
        }
        default:
            throw new Error(`Unknown AI route: ${route as string}`);
    }
};

const validateResponse = (
    route: AiRoute,
    raw: unknown,
    payload: RunPayload
): unknown => {
    if (route === "task-draft" && payload.draft) {
        return validateDraft(raw as IDraftTaskSuggestion, {
            columns: payload.draft.context.columns,
            members: payload.draft.context.members,
            tasks: payload.draft.context.tasks,
            fallbackColumnId: payload.draft.columnId,
            fallbackCoordinatorId: payload.draft.coordinatorId
        });
    }
    if (route === "task-breakdown" && payload.draft) {
        return validateBreakdown(raw as ITaskBreakdownSuggestion, {
            columns: payload.draft.context.columns,
            members: payload.draft.context.members,
            tasks: payload.draft.context.tasks,
            fallbackColumnId: payload.draft.columnId,
            fallbackCoordinatorId: payload.draft.coordinatorId
        });
    }
    if (route === "estimate" && payload.estimate) {
        return validateEstimate(raw as IEstimateSuggestion, {
            columns: payload.estimate.context.columns,
            members: payload.estimate.context.members,
            tasks: payload.estimate.context.tasks
        });
    }
    if (route === "board-brief" && payload.brief) {
        return validateBoardBrief(raw as IBoardBrief, {
            columns: payload.brief.context.columns,
            members: payload.brief.context.members,
            tasks: payload.brief.context.tasks
        });
    }
    if (route === "readiness") {
        return validateReadiness(raw as IReadinessReport);
    }
    if (route === "search" && payload.search) {
        const validIds =
            payload.search.kind === "tasks" && payload.search.projectContext
                ? new Set(
                      payload.search.projectContext.tasks.map(
                          (task) => task._id
                      )
                  )
                : new Set(
                      (payload.search.projectsContext?.projects ?? []).map(
                          (project) => project._id
                      )
                  );
        return validateSearch(raw as ISearchResult, validIds);
    }
    return raw;
};

const remoteResolve = async (
    route: AiRoute,
    payload: RunPayload,
    signal: AbortSignal
): Promise<unknown> => {
    const response = await fetch(`${environment.aiBaseUrl}/api/ai/${route}`, {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal
    });
    if (!response.ok) {
        throw new Error(`AI request failed (${response.status})`);
    }
    return response.json();
};

const useAi = <T>(options: UseAiOptions) => {
    const { route } = options;
    const [data, setData] = useState<T | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const controllerRef = useRef<AbortController | null>(null);
    const mountedRef = useRef(true);

    useEffect(
        () => () => {
            mountedRef.current = false;
            controllerRef.current?.abort();
        },
        []
    );

    const abort = useCallback(() => {
        controllerRef.current?.abort();
        controllerRef.current = null;
    }, []);

    const reset = useCallback(() => {
        abort();
        setData(undefined);
        setError(null);
        setIsLoading(false);
    }, [abort]);

    const run = useCallback(
        async (payload: RunPayload): Promise<T> => {
            controllerRef.current?.abort();
            const controller = new AbortController();
            controllerRef.current = controller;
            setIsLoading(true);
            setError(null);
            try {
                let raw: unknown;
                if (environment.aiUseLocalEngine) {
                    raw = await Promise.resolve(localResolve(route, payload));
                } else {
                    raw = await remoteResolve(
                        route,
                        payload,
                        controller.signal
                    );
                }
                const validated = validateResponse(route, raw, payload) as T;
                if (mountedRef.current && !controller.signal.aborted) {
                    setData(validated);
                }
                return validated;
            } catch (err) {
                const wrapped =
                    err instanceof Error ? err : new Error(String(err));
                if (mountedRef.current && !controller.signal.aborted) {
                    setError(wrapped);
                }
                throw wrapped;
            } finally {
                if (
                    mountedRef.current &&
                    controllerRef.current === controller
                ) {
                    setIsLoading(false);
                    controllerRef.current = null;
                }
            }
        },
        [route]
    );

    return {
        run,
        abort,
        reset,
        data,
        error,
        isLoading
    };
};

export default useAi;
