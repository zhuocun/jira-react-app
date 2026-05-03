/**
 * Module-level cache of per-result match strengths from the most recent
 * AI semantic search (Optimization Plan §3 P1-2 — per-result indicator).
 *
 * Why a module-level Map and not React state: threading strength through
 * every consumer (column, search panel, project list) would force a
 * prop drill across unrelated layers. AiSearchInput already calls
 * `setSemanticIds(...)` immediately *after* updating this cache, and the
 * resulting URL state cascade re-renders consumers — so by the time
 * cards call `getAiSearchStrength`, the cache is already up to date.
 * Callers must keep that ordering (cache update → state update) intact.
 *
 * Keyed by `kind:id` so a project and a task with the same id can't
 * collide. Strength is `null` when the engine didn't return one (older
 * remote engine, project search without strength) — callers should treat
 * `null` as "unknown" and hide any strength chip.
 */
type Kind = "tasks" | "projects";

const cache = new Map<string, AiSearchMatchStrength>();

const keyOf = (kind: Kind, id: string): string => `${kind}:${id}`;

const dropEntriesOfKind = (kind: Kind): void => {
    const prefix = `${kind}:`;
    // Map iterators are live, but `Map.prototype.delete` during a `for…of`
    // over `.keys()` is safe per the spec — the visit set is captured at
    // iterator-creation time and skipped entries don't trip a "modified
    // during iteration" guard. Avoiding `Array.from(...)` saves an O(n)
    // intermediate allocation on every clear.
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) cache.delete(key);
    }
};

/**
 * Replace the cache with the strengths from a fresh search. The clear is
 * scoped by `kind` so the projects list and the board can carry filters
 * simultaneously without one wiping the other.
 */
export const setAiSearchStrengths = (
    kind: Kind,
    matches: ReadonlyArray<IAiSearchMatch> | undefined
): void => {
    dropEntriesOfKind(kind);
    if (!matches) return;
    for (const match of matches) {
        cache.set(keyOf(kind, match.id), match.strength);
    }
};

/** Drop every entry for a kind. Used when the user clears the filter. */
export const clearAiSearchStrengths = (kind: Kind): void => {
    dropEntriesOfKind(kind);
};

/**
 * Read the strength band for a single id, or `null` if the engine did
 * not classify it (e.g. an older remote response, or no active search).
 */
export const getAiSearchStrength = (
    kind: Kind,
    id: string
): AiSearchMatchStrength | null => {
    return cache.get(keyOf(kind, id)) ?? null;
};

/** Test-only escape hatch — tests can wipe the entire cache between cases. */
export const resetAiSearchStrengthsForTests = (): void => {
    cache.clear();
};
