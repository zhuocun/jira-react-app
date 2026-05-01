import styled from "@emotion/styled";
import { Grid, Input, Modal, Tag, Typography } from "antd";
import {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState
} from "react";
import { useNavigate } from "react-router";

import { ANALYTICS_EVENTS, track } from "../../constants/analytics";
import { fontSize, fontWeight, radius, space } from "../../theme/tokens";
import useCachedQueryData from "../../utils/hooks/useCachedQueryData";
import AiSparkleIcon from "../aiSparkleIcon";

interface CommandPaletteProps {
    open: boolean;
    onClose: () => void;
}

interface PaletteEntry {
    id: string;
    label: string;
    sublabel?: string;
    kind: "project" | "task" | "column" | "member";
    href?: string;
}

const ListContainer = styled.ul`
    list-style: none;
    margin: 0;
    max-height: 50vh;
    overflow-y: auto;
    padding: 0;
`;

const Row = styled.li<{ active: boolean }>`
    align-items: center;
    background: ${(props) =>
        props.active
            ? "var(--ant-color-primary-bg, rgba(94, 106, 210, 0.10))"
            : "transparent"};
    border-radius: ${radius.md}px;
    cursor: pointer;
    display: flex;
    gap: ${space.sm}px;
    padding: ${space.xs}px ${space.sm}px;
`;

const KindTag = styled(Tag)`
    && {
        font-size: ${fontSize.xs}px;
        margin-inline-end: 0;
        text-transform: capitalize;
    }
`;

const ModeBanner = styled.div`
    align-items: center;
    background: var(--ant-color-fill-tertiary, rgba(15, 23, 42, 0.04));
    border-radius: ${radius.md}px;
    color: var(--ant-color-text-secondary, rgba(15, 23, 42, 0.65));
    display: flex;
    font-size: ${fontSize.xs}px;
    gap: ${space.xs}px;
    margin-top: ${space.sm}px;
    padding: ${space.xs}px ${space.sm}px;
`;

const HiddenLabel = styled.span`
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
`;

const isMacLike = () => {
    if (typeof navigator === "undefined") return false;
    return /Mac|iPod|iPhone|iPad/i.test(navigator.platform || "");
};

const indexEntries = (
    projects: IProject[],
    tasks: ITask[],
    columns: IColumn[],
    members: IMember[]
): PaletteEntry[] => {
    const out: PaletteEntry[] = [];
    for (const p of projects) {
        out.push({
            id: `project:${p._id}`,
            label: p.projectName,
            sublabel: p.organization,
            kind: "project",
            href: `/projects/${p._id}`
        });
    }
    for (const c of columns) {
        out.push({
            id: `column:${c._id}`,
            label: c.columnName,
            sublabel: "Column",
            kind: "column",
            href: c.projectId ? `/projects/${c.projectId}` : undefined
        });
    }
    for (const t of tasks) {
        out.push({
            id: `task:${t._id}`,
            label: t.taskName,
            sublabel: t.epic,
            kind: "task",
            href: t.projectId ? `/projects/${t.projectId}` : undefined
        });
    }
    for (const m of members) {
        out.push({
            id: `member:${m._id}`,
            label: m.username,
            sublabel: m.email,
            kind: "member"
        });
    }
    return out;
};

const filterEntries = (
    entries: PaletteEntry[],
    query: string
): PaletteEntry[] => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.slice(0, 20);
    const ranked: Array<{ entry: PaletteEntry; score: number }> = [];
    for (const entry of entries) {
        const hay = `${entry.label} ${entry.sublabel ?? ""}`.toLowerCase();
        const idx = hay.indexOf(q);
        if (idx >= 0) {
            ranked.push({ entry, score: idx });
        }
    }
    ranked.sort((a, b) => a.score - b.score);
    return ranked.slice(0, 20).map((row) => row.entry);
};

/**
 * Phase A command palette (PRD §7.1, OQ5 resolved) — navigation-only.
 *
 * Index pulled from the existing React Query caches: `projects`,
 * `users/members`, plus the current project's `boards` and `tasks` if a
 * project context is in cache. Results render as a single ARIA listbox
 * inside a centered modal; AI mode (slash prefix or Tab) shows a
 * placeholder banner — the real LangGraph wiring lands in Phase E.
 */
const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [query, setQuery] = useState("");
    const [aiMode, setAiMode] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const listboxId = useId();
    const screens = Grid.useBreakpoint();

    const projects = useCachedQueryData<IProject[]>(["projects"]) ?? [];
    const members = useCachedQueryData<IMember[]>(["users/members"]) ?? [];
    // Phase A: best-effort look at the most-recently-loaded board/tasks via
    // the global cache. If absent, the palette degrades to projects only.
    const tasksCache = useCachedQueryData<ITask[]>(["tasks"]) ?? [];
    const boardsCache = useCachedQueryData<IColumn[]>(["boards"]) ?? [];

    const entries = useMemo(
        () => indexEntries(projects, tasksCache, boardsCache, members),
        [projects, tasksCache, boardsCache, members]
    );

    const visible = useMemo(() => {
        if (aiMode) return [];
        const q = query.startsWith("/") ? query.slice(1) : query;
        return filterEntries(entries, q);
    }, [aiMode, entries, query]);

    useEffect(() => {
        if (!open) return;
        track(ANALYTICS_EVENTS.PALETTE_OPENED);
        setQuery("");
        setAiMode(false);
        setActiveIndex(0);
        const handle = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
        return () => window.clearTimeout(handle);
    }, [open]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const onKey = (event: KeyboardEvent) => {
            const isToggle =
                (event.metaKey || event.ctrlKey) &&
                (event.key === "k" || event.key === "K");
            if (isToggle) {
                event.preventDefault();
                if (!open) {
                    // Re-open via the same prop boundary; consumers manage open state.
                    window.dispatchEvent(
                        new CustomEvent("commandPalette:open")
                    );
                }
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const handleEntrySelect = useCallback(
        (entry: PaletteEntry) => {
            if (entry.href) {
                navigate(entry.href);
            }
            onClose();
        },
        [navigate, onClose]
    );

    const handleQueryChange = useCallback((value: string) => {
        setQuery(value);
        setActiveIndex(0);
        if (value.startsWith("/")) {
            setAiMode(true);
        }
    }, []);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Tab") {
                event.preventDefault();
                setAiMode((v) => {
                    track(ANALYTICS_EVENTS.PALETTE_AI_MODE_TOGGLED, {
                        next: !v
                    });
                    return !v;
                });
                return;
            }
            if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((i) =>
                    visible.length === 0 ? 0 : (i + 1) % visible.length
                );
                return;
            }
            if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((i) =>
                    visible.length === 0
                        ? 0
                        : (i - 1 + visible.length) % visible.length
                );
                return;
            }
            if (event.key === "Enter") {
                const entry = visible[activeIndex];
                if (entry) {
                    event.preventDefault();
                    handleEntrySelect(entry);
                }
            }
        },
        [activeIndex, handleEntrySelect, visible]
    );

    const shortcutText = isMacLike() ? "Cmd+K" : "Ctrl+K";
    const placeholder = aiMode
        ? "Ask Board Copilot…"
        : "Search projects, tasks, columns, members…";
    // Phase A: hide on small viewports per PRD §7.10. We render an explanatory
    // notice instead of nothing so the modal remains discoverable.
    const isMobile = !screens.md;

    return (
        <Modal
            destroyOnHidden
            footer={null}
            onCancel={onClose}
            open={open}
            title={
                <span
                    style={{
                        alignItems: "center",
                        display: "inline-flex",
                        gap: space.xs
                    }}
                >
                    <AiSparkleIcon aria-hidden />
                    <span style={{ fontWeight: fontWeight.semibold }}>
                        Command palette
                    </span>
                    <Typography.Text type="secondary">
                        {shortcutText}
                    </Typography.Text>
                </span>
            }
            width={560}
        >
            {isMobile ? (
                <Typography.Paragraph type="secondary">
                    The command palette is keyboard-driven and works best on a
                    larger screen. Use the navigation menu to move around.
                </Typography.Paragraph>
            ) : (
                <>
                    <HiddenLabel id={`${listboxId}-label`}>
                        Search and navigate. Use Tab to switch to AI mode.
                    </HiddenLabel>
                    <div
                        aria-controls={listboxId}
                        aria-expanded
                        aria-haspopup="listbox"
                        aria-owns={listboxId}
                        role="combobox"
                    >
                        <Input
                            aria-activedescendant={
                                visible[activeIndex]?.id
                                    ? `entry-${visible[activeIndex].id}`
                                    : undefined
                            }
                            aria-autocomplete="list"
                            aria-controls={listboxId}
                            aria-label={placeholder}
                            onChange={(event) =>
                                handleQueryChange(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            ref={(node) => {
                                inputRef.current = node?.input ?? null;
                            }}
                            size="large"
                            value={query}
                        />
                    </div>
                    {aiMode ? (
                        <ModeBanner role="status">
                            <AiSparkleIcon aria-hidden />
                            <span>
                                AI mode is coming in Phase E. For now, the
                                palette routes to projects and tasks.
                            </span>
                        </ModeBanner>
                    ) : (
                        <ListContainer
                            aria-labelledby={`${listboxId}-label`}
                            id={listboxId}
                            role="listbox"
                        >
                            {visible.length === 0 ? (
                                <Typography.Paragraph type="secondary">
                                    No matches.
                                </Typography.Paragraph>
                            ) : (
                                visible.map((entry, index) => (
                                    <Row
                                        active={index === activeIndex}
                                        aria-selected={index === activeIndex}
                                        id={`entry-${entry.id}`}
                                        key={entry.id}
                                        onClick={() => handleEntrySelect(entry)}
                                        onMouseEnter={() =>
                                            setActiveIndex(index)
                                        }
                                        role="option"
                                    >
                                        <KindTag color="default">
                                            {entry.kind}
                                        </KindTag>
                                        <span>
                                            <span
                                                style={{
                                                    fontWeight:
                                                        fontWeight.medium
                                                }}
                                            >
                                                {entry.label}
                                            </span>
                                            {entry.sublabel ? (
                                                <Typography.Text
                                                    style={{
                                                        marginInlineStart:
                                                            space.xs
                                                    }}
                                                    type="secondary"
                                                >
                                                    {entry.sublabel}
                                                </Typography.Text>
                                            ) : null}
                                        </span>
                                    </Row>
                                ))
                            )}
                        </ListContainer>
                    )}
                </>
            )}
        </Modal>
    );
};

export default CommandPalette;
