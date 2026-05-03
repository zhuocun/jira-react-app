import { clampToFibonacci, FIBONACCI_POINTS } from "./storyPoints";

export interface ValidateContext {
    columns: IColumn[];
    members: IMember[];
    tasks: ITask[];
    fallbackColumnId?: string;
    fallbackCoordinatorId?: string;
}

const isStoryPoints = (value: unknown): value is StoryPoints =>
    typeof value === "number" &&
    FIBONACCI_POINTS.includes(value as StoryPoints);

export const validateDraft = (
    raw: IDraftTaskSuggestion,
    context: ValidateContext
): IDraftTaskSuggestion => {
    const columnIds = new Set(context.columns.map((column) => column._id));
    const memberIds = new Set(context.members.map((member) => member._id));
    const columnId = columnIds.has(raw.columnId)
        ? raw.columnId
        : context.fallbackColumnId && columnIds.has(context.fallbackColumnId)
          ? context.fallbackColumnId
          : (context.columns[0]?._id ?? raw.columnId);
    const coordinatorId = memberIds.has(raw.coordinatorId)
        ? raw.coordinatorId
        : context.fallbackCoordinatorId &&
            memberIds.has(context.fallbackCoordinatorId)
          ? context.fallbackCoordinatorId
          : (context.members[0]?._id ?? raw.coordinatorId);
    const storyPoints = isStoryPoints(raw.storyPoints)
        ? raw.storyPoints
        : clampToFibonacci(Number(raw.storyPoints) || 1);
    const confidence = Math.min(
        1,
        Math.max(0, Number.isFinite(raw.confidence) ? raw.confidence : 0.5)
    );
    return {
        ...raw,
        columnId,
        coordinatorId,
        storyPoints,
        confidence,
        type: raw.type || "Task",
        epic: raw.epic || "New Feature",
        taskName: (raw.taskName || "").trim() || "Untitled task"
    };
};

export const validateBreakdown = (
    raw: ITaskBreakdownSuggestion,
    context: ValidateContext
): ITaskBreakdownSuggestion => {
    const items = (raw.items || [])
        .slice(0, 6)
        .map((item) => validateDraft(item, context));
    return { items };
};

export const validateEstimate = (
    raw: IEstimateSuggestion,
    context: ValidateContext
): IEstimateSuggestion => {
    const taskIds = new Set(context.tasks.map((task) => task._id));
    const storyPoints = isStoryPoints(raw.storyPoints)
        ? raw.storyPoints
        : clampToFibonacci(Number(raw.storyPoints) || 1);
    const confidence = Math.min(
        1,
        Math.max(0, Number.isFinite(raw.confidence) ? raw.confidence : 0.5)
    );
    const similar = (raw.similar || [])
        .filter((entry) => entry && taskIds.has(entry._id))
        .slice(0, 3);
    return {
        storyPoints,
        confidence,
        rationale: raw.rationale || "",
        similar
    };
};

const RECOMMENDATION_STRENGTHS = new Set([
    "strong",
    "moderate",
    "low",
    "none"
] as const);

const normalizeBoardBriefSourceEntry = (
    entry: unknown,
    taskIds: Set<string>
): IBoardBriefTaskRef | null => {
    if (!entry || typeof entry !== "object") return null;
    const o = entry as Record<string, unknown>;
    const taskId =
        typeof o.taskId === "string" && o.taskId
            ? o.taskId
            : typeof o._id === "string" && o._id
              ? o._id
              : null;
    if (!taskId || !taskIds.has(taskId)) return null;
    const taskName =
        typeof o.taskName === "string" && o.taskName.trim().length > 0
            ? o.taskName
            : taskId;
    const storyPoints =
        typeof o.storyPoints === "number" && Number.isFinite(o.storyPoints)
            ? o.storyPoints
            : undefined;
    return storyPoints !== undefined
        ? { taskId, taskName, storyPoints }
        : { taskId, taskName };
};

const validateRecommendationDetail = (
    raw: IBoardBrief["recommendationDetail"],
    fallbackText: string,
    taskIds: Set<string>
): IBoardBriefRecommendation | undefined => {
    if (!raw || typeof raw !== "object") return undefined;
    const strength = RECOMMENDATION_STRENGTHS.has(
        raw.strength as BoardBriefRecommendationStrength
    )
        ? raw.strength
        : "none";
    const sources = Array.isArray(raw.sources)
        ? raw.sources
              .map((entry) => normalizeBoardBriefSourceEntry(entry, taskIds))
              .filter((ref): ref is IBoardBriefTaskRef => ref !== null)
              .slice(0, 5)
        : [];
    return {
        text:
            typeof raw.text === "string" && raw.text ? raw.text : fallbackText,
        strength,
        basis: typeof raw.basis === "string" ? raw.basis : "",
        sources
    };
};

export const validateBoardBrief = (
    raw: IBoardBrief,
    context: ValidateContext
): IBoardBrief => {
    const columnIds = new Set(context.columns.map((column) => column._id));
    const taskIds = new Set(context.tasks.map((task) => task._id));
    const memberIds = new Set(context.members.map((member) => member._id));
    const recommendation = raw.recommendation || "";
    return {
        headline: raw.headline || "",
        counts: (raw.counts || []).filter((entry) =>
            columnIds.has(entry.columnId)
        ),
        largestUnstarted: (raw.largestUnstarted || []).filter((entry) =>
            taskIds.has(entry.taskId)
        ),
        unowned: (raw.unowned || []).filter((entry) =>
            taskIds.has(entry.taskId)
        ),
        workload: (raw.workload || []).filter((entry) =>
            memberIds.has(entry.memberId)
        ),
        recommendation,
        recommendationDetail: validateRecommendationDetail(
            raw.recommendationDetail,
            recommendation,
            taskIds
        )
    };
};

export const validateReadiness = (raw: IReadinessReport): IReadinessReport => ({
    issues: (raw.issues || []).filter(
        (issue) =>
            issue &&
            ["taskName", "note", "epic", "type", "coordinatorId"].includes(
                issue.field
            )
    )
});

export const validateSearch = (
    raw: ISearchResult,
    validIds: Set<string>
): ISearchResult => ({
    ids: (raw.ids || []).filter((id) => validIds.has(id)),
    rationale: typeof raw.rationale === "string" ? raw.rationale : ""
});
