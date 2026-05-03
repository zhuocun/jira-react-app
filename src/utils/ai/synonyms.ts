/**
 * Project-management synonym map (Optimization Plan §3 P1-2).
 *
 * The local AI search engine ranks by token-overlap, so a query for
 * "backlog" never matches a column literally named "todo". Expanding the
 * tokenized query with a small, curated set of PM synonyms gets us most of
 * the practical benefit of an embedding model without the latency or
 * privacy cost of one.
 *
 * Synonym sets are intentionally small and scoped to the vocabulary the
 * app already uses (column names, task types, common jargon). Adding too
 * many synonyms makes the result set noisy and erodes trust — keep this
 * list focused on terms users actually mistype or mix up.
 *
 * Each term maps to the *additional* tokens it should pull in. Tokens are
 * lowercase and >=3 chars to align with `tokenize()` in `keywords.ts`.
 */
const SYNONYMS: Record<string, readonly string[]> = {
    // Column / status synonyms
    backlog: ["todo", "inbox", "queue"],
    todo: ["backlog", "inbox", "queue"],
    inbox: ["backlog", "todo", "triage"],
    queue: ["backlog", "todo", "inbox"],
    triage: ["inbox", "intake"],
    progress: ["doing", "wip", "active"],
    doing: ["progress", "wip", "active"],
    wip: ["progress", "doing"],
    review: ["qa", "testing", "verify"],
    qa: ["review", "testing", "verify"],
    testing: ["qa", "review"],
    done: ["complete", "shipped", "closed"],
    complete: ["done", "shipped", "closed"],
    shipped: ["done", "complete", "released"],

    // Task / type synonyms
    bug: ["defect", "issue", "regression"],
    defect: ["bug", "issue"],
    feature: ["enhancement", "story"],
    story: ["feature", "ticket"],
    ticket: ["task", "issue", "story"],
    task: ["ticket", "story"],
    spike: ["research", "investigation"],
    research: ["spike", "investigation"],

    // Team / role synonyms
    owner: ["coordinator", "assignee"],
    coordinator: ["owner", "assignee", "lead"],
    assignee: ["owner", "coordinator"],
    member: ["teammate", "user"],

    // Estimation / planning
    points: ["estimate", "size", "effort"],
    estimate: ["points", "size", "effort"],
    sprint: ["iteration", "cycle"],
    iteration: ["sprint", "cycle"],

    // Common jargon / abbreviations
    auth: ["login", "signin", "session"],
    login: ["auth", "signin"],
    perf: ["performance", "latency", "throughput"],
    performance: ["perf", "latency"],
    docs: ["documentation", "readme"],
    documentation: ["docs"]
} as const;

/**
 * Expand a token set with curated PM synonyms.
 *
 * Returns `{ expanded, additions }` so callers can show users which
 * synonyms were applied (the UI surfaces this as "Expanded 'todo' to
 * include backlog, inbox, queue") — the explainability matters more than
 * the recall lift. Only the *first three* originating terms with synonyms
 * are reported so the helper text doesn't grow into a paragraph for
 * synonym-heavy queries.
 */
export const expandWithSynonyms = (
    tokens: ReadonlySet<string>
): { expanded: Set<string>; additions: Map<string, string[]> } => {
    const expanded = new Set<string>(tokens);
    const additions = new Map<string, string[]>();
    for (const token of tokens) {
        const synonyms = SYNONYMS[token];
        if (!synonyms || synonyms.length === 0) continue;
        const added: string[] = [];
        for (const synonym of synonyms) {
            if (expanded.has(synonym)) continue;
            expanded.add(synonym);
            added.push(synonym);
        }
        if (added.length > 0) {
            additions.set(token, added);
        }
    }
    return { expanded, additions };
};

/**
 * Convert the additions map into a flat list of human-readable lines for
 * UI display, e.g. ["todo → backlog, inbox"]. Returns at most three lines
 * so the helper text stays scannable.
 */
export const describeExpansions = (
    additions: ReadonlyMap<string, string[]>
): string[] => {
    const lines: string[] = [];
    for (const [token, synonyms] of additions) {
        lines.push(`${token} → ${synonyms.join(", ")}`);
        if (lines.length >= 3) break;
    }
    return lines;
};
