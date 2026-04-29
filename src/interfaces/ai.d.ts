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

interface IBoardBrief {
    headline: string;
    counts: IBoardBriefCount[];
    largestUnstarted: IBoardBriefTaskRef[];
    unowned: IBoardBriefTaskRef[];
    workload: IBoardBriefWorkload[];
    recommendation: string;
}

interface ITaskBreakdownSuggestion {
    items: IDraftTaskSuggestion[];
}
