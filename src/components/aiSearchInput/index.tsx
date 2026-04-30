import { Alert, Button, Input, Space, Spin } from "antd";
import React, { useCallback, useEffect, useState } from "react";

import environment from "../../constants/env";
import { microcopy } from "../../constants/microcopy";
import { space as themeSpace } from "../../theme/tokens";
import {
    AiContextProject,
    AiSearchProjectsContext,
    semanticSearch
} from "../../utils/ai/engine";
import { isProjectAiDisabled } from "../../utils/ai/projectAiStorage";
import { validateSearch } from "../../utils/ai/validate";
import useAi, {
    assertRunPayloadProjectsAiAllowed
} from "../../utils/hooks/useAi";
import useAiEnabled from "../../utils/hooks/useAiEnabled";
import AiSparkleIcon from "../aiSparkleIcon";

type TaskSearchProps = {
    kind: "tasks";
    projectContext: AiContextProject;
    semanticIds: string | null | undefined;
    setSemanticIds: (value: string | undefined) => void;
};

type ProjectSearchProps = {
    kind: "projects";
    projectsContext: AiSearchProjectsContext;
    semanticIds: string | null | undefined;
    setSemanticIds: (value: string | undefined) => void;
};

type Props = TaskSearchProps | ProjectSearchProps;

/** URL search params use `null` for missing keys; treat like unset. */
const hasActiveSemanticFilter = (semanticIds: string | null | undefined) =>
    Boolean(semanticIds?.trim());

const AiSearchInput: React.FC<Props> = (props) => {
    const { enabled: aiEnabled } = useAiEnabled();
    const searchAi = useAi<ISearchResult>({ route: "search" });
    const [draft, setDraft] = useState("");
    const [noMatchHint, setNoMatchHint] = useState<string | null>(null);
    const semanticActive = hasActiveSemanticFilter(props.semanticIds);

    useEffect(() => {
        if (!semanticActive) {
            setNoMatchHint(null);
        }
    }, [semanticActive]);

    const applyResult = useCallback(
        (result: ISearchResult) => {
            if (result.ids.length === 0) {
                props.setSemanticIds(undefined);
                setNoMatchHint(
                    result.rationale?.trim() ||
                        "No semantic match for that phrase."
                );
                return;
            }
            setNoMatchHint(null);
            props.setSemanticIds(result.ids.join(","));
        },
        [props]
    );

    const onSearch = async () => {
        const query = draft.trim();
        if (!query) return;
        setNoMatchHint(null);
        const searchPayload =
            props.kind === "tasks"
                ? {
                      search: {
                          kind: "tasks" as const,
                          query,
                          projectContext: (props as TaskSearchProps)
                              .projectContext
                      }
                  }
                : (() => {
                      // Per-project AI off (PRD §8): silently drop those
                      // projects from the projects-list semantic search so a
                      // single opt-out doesn't break global discovery.
                      const ctx = (props as ProjectSearchProps).projectsContext;
                      const filtered: AiSearchProjectsContext = {
                          ...ctx,
                          projects: ctx.projects.filter(
                              (p) => !isProjectAiDisabled(p._id)
                          )
                      };
                      return {
                          search: {
                              kind: "projects" as const,
                              query,
                              projectsContext: filtered
                          }
                      };
                  })();
        try {
            assertRunPayloadProjectsAiAllowed(searchPayload);
        } catch {
            setNoMatchHint("Board Copilot is disabled for this project.");
            return;
        }
        if (!environment.aiUseLocalEngine) {
            try {
                const result = await searchAi.run(searchPayload);
                applyResult(result);
            } catch {
                setNoMatchHint("Board Copilot search failed. Try again.");
            }
            return;
        }
        let raw: ISearchResult;
        if (props.kind === "tasks") {
            const ctx = (props as TaskSearchProps).projectContext;
            raw = semanticSearch("tasks", query, ctx);
            const valid = new Set(ctx.tasks.map((t) => t._id));
            applyResult(validateSearch(raw, valid));
        } else {
            // Use the same filtered context the remote payload would use.
            const projectsCtx =
                searchPayload.search.kind === "projects"
                    ? searchPayload.search.projectsContext!
                    : (props as ProjectSearchProps).projectsContext;
            raw = semanticSearch("projects", query, projectsCtx);
            const valid = new Set(projectsCtx.projects.map((p) => p._id));
            applyResult(validateSearch(raw, valid));
        }
    };

    const onClear = () => {
        setDraft("");
        setNoMatchHint(null);
        searchAi.reset();
        props.setSemanticIds(undefined);
    };

    if (!aiEnabled) return null;

    const busy = searchAi.isLoading;

    return (
        <div style={{ marginBottom: themeSpace.md }}>
            <Space wrap align="start">
                <Input
                    aria-label="Ask Board Copilot a question about tasks or projects"
                    disabled={busy}
                    onChange={(e) => setDraft(e.target.value)}
                    onPressEnter={() => void onSearch()}
                    placeholder="Ask Board Copilot a question…"
                    style={{ width: "min(22rem, 100%)" }}
                    value={draft}
                />
                <Button
                    aria-label="Run natural language search"
                    disabled={busy || !draft.trim()}
                    icon={<AiSparkleIcon />}
                    loading={busy}
                    onClick={() => void onSearch()}
                    type="default"
                >
                    Search
                </Button>
                {semanticActive ? (
                    <Button aria-label="Clear AI search" onClick={onClear}>
                        Clear AI search
                    </Button>
                ) : null}
            </Space>
            {busy ? (
                <Spin
                    aria-label="Searching"
                    style={{
                        display: "block",
                        marginTop: themeSpace.sm
                    }}
                />
            ) : null}
            {noMatchHint ? (
                <Alert
                    action={
                        <Button
                            onClick={() => void onSearch()}
                            size="small"
                            type="link"
                        >
                            {microcopy.actions.retry}
                        </Button>
                    }
                    closable
                    description={noMatchHint}
                    onClose={() => setNoMatchHint(null)}
                    showIcon
                    style={{
                        marginTop: themeSpace.sm,
                        maxWidth: "40rem"
                    }}
                    title="AI semantic search"
                    type="info"
                />
            ) : null}
            {searchAi.error ? (
                <Alert
                    action={
                        <Button
                            onClick={() => void onSearch()}
                            size="small"
                            type="link"
                        >
                            {microcopy.actions.retry}
                        </Button>
                    }
                    closable
                    onClose={() => searchAi.reset()}
                    style={{
                        marginTop: themeSpace.sm,
                        maxWidth: "40rem"
                    }}
                    title={
                        searchAi.error.message || microcopy.feedback.loadFailed
                    }
                    type="warning"
                />
            ) : null}
        </div>
    );
};

export default AiSearchInput;
