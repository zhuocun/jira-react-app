import { CloseCircleFilled, InfoCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Input, Space, Tag, Tooltip, Typography } from "antd";
import React, { useCallback, useEffect, useId, useRef, useState } from "react";

import { ANALYTICS_EVENTS, track } from "../../constants/analytics";
import environment from "../../constants/env";
import { microcopy } from "../../constants/microcopy";
import { space as themeSpace } from "../../theme/tokens";
import {
    AiContextProject,
    AiSearchProjectsContext,
    semanticSearch
} from "../../utils/ai/engine";
import { aiErrorView } from "../../utils/ai/errorTemplate";
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

/**
 * Minimal-effort "Did you mean?" reformulator (SR-R9). Generates up to
 * three rephrasings the user can click to retry — synonyms, broader
 * scope, and a verb shift. The output is intentionally lo-fi: when the
 * agent server adds real reformulation we'll swap the implementation
 * but the surface stays the same.
 */
const reformulate = (query: string): string[] => {
    const trimmed = query.trim();
    if (trimmed.length === 0) return [];
    const words = trimmed.split(/\s+/);
    const head = words[0];
    const candidates: string[] = [];
    if (words.length > 2) {
        candidates.push(words.slice(0, 2).join(" "));
    }
    if (head && head.length > 3) {
        candidates.push(`tasks about ${trimmed}`);
    }
    candidates.push(`open ${trimmed}`);
    // Dedupe while preserving order, drop self-matches.
    const seen = new Set<string>([trimmed.toLowerCase()]);
    return candidates
        .filter((candidate) => {
            const key = candidate.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .slice(0, 3);
};

const AiSearchInput: React.FC<Props> = (props) => {
    const { enabled: aiEnabled } = useAiEnabled();
    const searchAi = useAi<ISearchResult>({ route: "search" });
    const [draft, setDraft] = useState("");
    const [noMatchHint, setNoMatchHint] = useState<string | null>(null);
    const [reformulations, setReformulations] = useState<string[]>([]);
    const [matchRationale, setMatchRationale] = useState<string | null>(null);
    const [boardHasItems, setBoardHasItems] = useState(true);
    const announcerId = useId();
    const semanticActive = hasActiveSemanticFilter(props.semanticIds);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!semanticActive) {
            setNoMatchHint(null);
            setReformulations([]);
            setMatchRationale(null);
        }
    }, [semanticActive]);

    // Abort any in-flight remote search if the component unmounts so the
    // resolved/rejected promise doesn't try to setState on an unmounted tree.
    useEffect(
        () => () => {
            abortRef.current?.abort();
        },
        []
    );

    /**
     * Track whether the underlying scope has any data at all so the
     * empty-state copy can disambiguate between "no AI hits" and "no
     * tasks at all" (SR-R7).
     */
    useEffect(() => {
        if (props.kind === "tasks") {
            setBoardHasItems(props.projectContext.tasks.length > 0);
        } else {
            setBoardHasItems(props.projectsContext.projects.length > 0);
        }
    }, [props]);

    const applyResult = useCallback(
        (result: ISearchResult, query: string) => {
            if (result.ids.length === 0) {
                props.setSemanticIds(undefined);
                setMatchRationale(null);
                setNoMatchHint(
                    result.rationale?.trim() ||
                        (boardHasItems
                            ? "No tasks matched your search. Try different words, or clear to see everything."
                            : "This board has no tasks yet.")
                );
                setReformulations(reformulate(query));
                return;
            }
            setNoMatchHint(null);
            setReformulations([]);
            setMatchRationale(result.rationale?.trim() || null);
            props.setSemanticIds(result.ids.join(","));
        },
        [boardHasItems, props]
    );

    const performSearch = useCallback(
        async (rawQuery: string) => {
            const query = rawQuery.trim();
            if (!query) return;
            // SR-R3: don't disable the input. Cancel any in-flight request
            // so the latest query wins, then start a fresh one.
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
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
                          const ctx = (props as ProjectSearchProps)
                              .projectsContext;
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
                setNoMatchHint(microcopy.ai.projectDisabled);
                return;
            }
            if (!environment.aiUseLocalEngine) {
                try {
                    const result = await searchAi.run(searchPayload);
                    if (controller.signal.aborted) return;
                    applyResult(result, query);
                } catch {
                    if (controller.signal.aborted) return;
                    setNoMatchHint("Search failed. Try again.");
                }
                return;
            }
            let raw: ISearchResult;
            if (props.kind === "tasks") {
                const ctx = (props as TaskSearchProps).projectContext;
                raw = semanticSearch("tasks", query, ctx);
                const valid = new Set(ctx.tasks.map((t) => t._id));
                applyResult(validateSearch(raw, valid), query);
            } else {
                const projectsCtx =
                    searchPayload.search.kind === "projects"
                        ? searchPayload.search.projectsContext!
                        : (props as ProjectSearchProps).projectsContext;
                raw = semanticSearch("projects", query, projectsCtx);
                const valid = new Set(projectsCtx.projects.map((p) => p._id));
                applyResult(validateSearch(raw, valid), query);
            }
        },
        [applyResult, props, searchAi]
    );

    const onClear = () => {
        setDraft("");
        setNoMatchHint(null);
        setReformulations([]);
        setMatchRationale(null);
        searchAi.reset();
        abortRef.current?.abort();
        props.setSemanticIds(undefined);
    };

    if (!aiEnabled) return null;

    const busy = searchAi.isLoading;
    const errorView = searchAi.error
        ? aiErrorView(searchAi.error, "Search failed")
        : null;
    const labels =
        props.kind === "tasks"
            ? {
                  aria: microcopy.ai.findRelatedTasksAria,
                  helper: microcopy.ai.findRelatedTasksHelper,
                  placeholder: microcopy.ai.findRelatedTasksPlaceholder,
                  submit: microcopy.ai.findRelatedTasks
              }
            : {
                  aria: microcopy.ai.findRelatedProjectsAria,
                  helper: microcopy.ai.findRelatedProjectsHelper,
                  placeholder: microcopy.ai.findRelatedProjectsPlaceholder,
                  submit: microcopy.ai.findRelatedProjects
              };

    return (
        <div style={{ marginBottom: themeSpace.md }}>
            <div
                style={{
                    alignItems: "center",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: themeSpace.xs
                }}
            >
                <Input
                    allowClear={{ clearIcon: <CloseCircleFilled /> }}
                    aria-describedby={`${announcerId}-helper`}
                    aria-label={labels.aria}
                    onChange={(e) => setDraft(e.target.value)}
                    onPressEnter={() => void performSearch(draft)}
                    placeholder={labels.placeholder}
                    /*
                     * Sparkle prefix is the only thing that visually separates
                     * this AI input from the plain text filter that often sits
                     * directly below it. Without it the two inputs read as
                     * duplicate search boxes and users couldn't tell which one
                     * accepts a natural-language question.
                     */
                    prefix={
                        <AiSparkleIcon
                            aria-hidden
                            style={{
                                color: "var(--ant-color-primary, #5e6ad2)"
                            }}
                        />
                    }
                    style={{ flex: "1 1 14rem", minWidth: 0 }}
                    suffix={
                        busy ? <Tag color="processing">Searching…</Tag> : null
                    }
                    value={draft}
                />
                <Button
                    disabled={!draft.trim()}
                    icon={<AiSparkleIcon aria-hidden />}
                    loading={busy}
                    onClick={() => void performSearch(draft)}
                    type="default"
                >
                    {labels.submit}
                </Button>
                {semanticActive ? (
                    <Button
                        aria-label={microcopy.actions.clearAiSearch}
                        onClick={onClear}
                    >
                        {microcopy.actions.clearAiSearch}
                    </Button>
                ) : null}
            </div>
            <Typography.Paragraph
                id={`${announcerId}-helper`}
                style={{ marginBottom: 0, marginTop: themeSpace.xs }}
                type="secondary"
            >
                {labels.helper}
            </Typography.Paragraph>
            <span
                aria-live="assertive"
                id={announcerId}
                style={{
                    border: 0,
                    clip: "rect(0 0 0 0)",
                    height: 1,
                    margin: -1,
                    overflow: "hidden",
                    padding: 0,
                    position: "absolute",
                    width: 1
                }}
            >
                {busy
                    ? "Searching"
                    : semanticActive && matchRationale
                      ? `Results filtered. ${matchRationale}`
                      : (noMatchHint ?? "")}
            </span>
            {matchRationale && (
                <Tooltip title={matchRationale}>
                    <Typography.Paragraph
                        style={{
                            marginBottom: 0,
                            marginTop: themeSpace.xs
                        }}
                        type="secondary"
                    >
                        <InfoCircleOutlined
                            aria-hidden
                            style={{ marginInlineEnd: 4 }}
                        />
                        Why this result?{" "}
                        <Button
                            onClick={() =>
                                track(
                                    ANALYTICS_EVENTS.SEARCH_RESULT_RATIONALE_VIEWED
                                )
                            }
                            size="small"
                            style={{
                                borderBottom: "1px dotted currentColor",
                                borderRadius: 0,
                                height: "auto",
                                padding: 0
                            }}
                            type="link"
                        >
                            Show reasoning
                        </Button>
                    </Typography.Paragraph>
                </Tooltip>
            )}
            {noMatchHint ? (
                <Alert
                    action={
                        <Button
                            onClick={() => void performSearch(draft)}
                            size="small"
                            type="link"
                        >
                            {microcopy.ai.retryLabel}
                        </Button>
                    }
                    closable
                    description={
                        reformulations.length > 0 ? (
                            <Space size={themeSpace.xs} wrap>
                                <span>Did you mean:</span>
                                {reformulations.map((alt) => (
                                    <Tag.CheckableTag
                                        checked={false}
                                        key={alt}
                                        onChange={() => {
                                            setDraft(alt);
                                            void performSearch(alt);
                                        }}
                                    >
                                        {alt}
                                    </Tag.CheckableTag>
                                ))}
                            </Space>
                        ) : null
                    }
                    onClose={() => setNoMatchHint(null)}
                    showIcon
                    style={{
                        marginTop: themeSpace.sm,
                        maxWidth: "40rem"
                    }}
                    title={noMatchHint}
                    type="info"
                />
            ) : null}
            {errorView ? (
                <Alert
                    action={
                        errorView.retryable ? (
                            <Button
                                onClick={() => void performSearch(draft)}
                                size="small"
                                type="link"
                            >
                                {microcopy.ai.retryLabel}
                            </Button>
                        ) : null
                    }
                    closable
                    onClose={() => searchAi.reset()}
                    style={{
                        marginTop: themeSpace.sm,
                        maxWidth: "40rem"
                    }}
                    title={errorView.heading}
                    description={errorView.body || undefined}
                    type={errorView.severity}
                />
            ) : null}
        </div>
    );
};

export default AiSearchInput;
