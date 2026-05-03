type StoryPoints = 1 | 2 | 3 | 5 | 8 | 13;

interface IDraftTaskSuggestion {
    taskName: string;
    type: string;
    epic: string;
    storyPoints: StoryPoints;
    note: string;
    columnId: string;
    coordinatorId: string;
    confidence: number;
    rationale: string;
}

interface IEstimateSimilar {
    _id: string;
    reason: string;
}

interface IEstimateSuggestion {
    storyPoints: StoryPoints;
    confidence: number;
    rationale: string;
    similar: IEstimateSimilar[];
}

interface IReadinessIssue {
    field: "taskName" | "note" | "epic" | "type" | "coordinatorId";
    severity: "info" | "warn" | "error";
    message: string;
    suggestion?: string;
}

interface IReadinessReport {
    issues: IReadinessIssue[];
}

interface IBoardBriefCount {
    columnId: string;
    columnName: string;
    count: number;
}

interface IBoardBriefTaskRef {
    taskId: string;
    taskName: string;
    storyPoints?: number;
}

interface IBoardBriefWorkload {
    memberId: string;
    username: string;
    openTasks: number;
    openPoints: number;
}

/**
 * Strength of a board-brief recommendation. Surfaces in the brief drawer as
 * a Tag adjacent to the recommendation so users can calibrate trust before
 * acting (Optimization Plan §3 P1-1).
 *
 * `none` means the brief did not produce an actionable recommendation —
 * shown as informational guidance rather than a "do this" prompt.
 */
type BoardBriefRecommendationStrength = "strong" | "moderate" | "low" | "none";

interface IBoardBriefRecommendation {
    /** Primary, action-oriented sentence shown to the user. */
    text: string;
    strength: BoardBriefRecommendationStrength;
    /** Plain-language explanation of which signals drove this recommendation. */
    basis: string;
    /**
     * Tasks/members the recommendation is grounded in. Empty when the brief
     * is heuristic ("Board looks balanced") so the UI can hide the source row.
     */
    sources: IBoardBriefTaskRef[];
}

interface IBoardBrief {
    headline: string;
    counts: IBoardBriefCount[];
    largestUnstarted: IBoardBriefTaskRef[];
    unowned: IBoardBriefTaskRef[];
    workload: IBoardBriefWorkload[];
    /**
     * Compact recommendation string (kept for backwards compatibility with
     * remote engines, markdown export, and existing tests). Newer surfaces
     * should prefer {@link IBoardBrief.recommendationDetail}.
     */
    recommendation: string;
    recommendationDetail?: IBoardBriefRecommendation;
}

interface ITaskBreakdownSuggestion {
    items: IDraftTaskSuggestion[];
}

interface ISearchResult {
    ids: string[];
    rationale: string;
}
