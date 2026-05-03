import {
    validateBoardBrief,
    validateBreakdown,
    validateDraft,
    validateEstimate,
    validateReadiness,
    validateSearch,
    ValidateContext
} from "./validate";

const buildContext = (
    overrides: Partial<ValidateContext> = {}
): ValidateContext => ({
    columns: [
        { _id: "col-1", columnName: "Todo", index: 0, projectId: "p1" },
        { _id: "col-2", columnName: "Done", index: 1, projectId: "p1" }
    ],
    members: [
        { _id: "m1", email: "a@b.c", username: "Alice" },
        { _id: "m2", email: "b@b.c", username: "Bob" }
    ],
    tasks: [
        {
            _id: "t1",
            columnId: "col-1",
            coordinatorId: "m1",
            epic: "x",
            index: 0,
            note: "",
            projectId: "p1",
            storyPoints: 3,
            taskName: "T1",
            type: "Task"
        }
    ],
    ...overrides
});

const draft = (
    overrides: Partial<IDraftTaskSuggestion> = {}
): IDraftTaskSuggestion => ({
    columnId: "col-1",
    confidence: 0.5,
    coordinatorId: "m1",
    epic: "Epic",
    note: "Note",
    rationale: "r",
    storyPoints: 3,
    taskName: "Task",
    type: "Task",
    ...overrides
});

describe("validateDraft", () => {
    it("keeps valid suggestions intact", () => {
        const out = validateDraft(draft(), buildContext());
        expect(out.columnId).toBe("col-1");
        expect(out.coordinatorId).toBe("m1");
    });

    it("falls back to fallback ids for unknown column or coordinator", () => {
        const out = validateDraft(
            draft({ columnId: "missing", coordinatorId: "ghost" }),
            buildContext({
                fallbackColumnId: "col-2",
                fallbackCoordinatorId: "m2"
            })
        );
        expect(out.columnId).toBe("col-2");
        expect(out.coordinatorId).toBe("m2");
    });

    it("falls back to first column/member when fallback ids are also unknown", () => {
        const out = validateDraft(
            draft({ columnId: "missing", coordinatorId: "ghost" }),
            buildContext({
                fallbackColumnId: "still-missing",
                fallbackCoordinatorId: "still-ghost"
            })
        );
        expect(out.columnId).toBe("col-1");
        expect(out.coordinatorId).toBe("m1");
    });

    it("clamps story points and confidence, supplies safe defaults", () => {
        const out = validateDraft(
            draft({
                storyPoints: 7 as StoryPoints,
                confidence: Number.NaN,
                taskName: "  ",
                epic: "",
                type: ""
            }),
            buildContext()
        );
        expect([1, 2, 3, 5, 8, 13]).toContain(out.storyPoints);
        expect(out.confidence).toBeGreaterThanOrEqual(0);
        expect(out.confidence).toBeLessThanOrEqual(1);
        expect(out.taskName).toBe("Untitled task");
        expect(out.epic).toBe("New Feature");
        expect(out.type).toBe("Task");
    });

    it("preserves the original column/coordinator when context is empty", () => {
        const out = validateDraft(
            draft({ columnId: "x", coordinatorId: "y" }),
            { columns: [], members: [], tasks: [] }
        );
        expect(out.columnId).toBe("x");
        expect(out.coordinatorId).toBe("y");
    });
});

describe("validateBreakdown", () => {
    it("validates each item and caps to six", () => {
        const items = Array.from({ length: 10 }, () =>
            draft({ columnId: "missing" })
        );
        const out = validateBreakdown({ items }, buildContext());
        expect(out.items.length).toBe(6);
        out.items.forEach((item) => {
            expect(item.columnId).toBe("col-1");
        });
    });

    it("handles missing items array", () => {
        const out = validateBreakdown(
            {} as ITaskBreakdownSuggestion,
            buildContext()
        );
        expect(out.items).toEqual([]);
    });
});

describe("validateEstimate", () => {
    it("keeps similar references that exist", () => {
        const out = validateEstimate(
            {
                confidence: 0.8,
                rationale: "r",
                similar: [
                    { _id: "t1", reason: "match" },
                    { _id: "ghost", reason: "noop" },
                    null as unknown as IEstimateSimilar
                ],
                storyPoints: 5
            },
            buildContext()
        );
        expect(out.similar.map((entry) => entry._id)).toEqual(["t1"]);
    });

    it("clamps invalid story points and missing optionals", () => {
        const out = validateEstimate(
            {
                confidence: 5,
                rationale: undefined as unknown as string,
                similar: undefined as unknown as IEstimateSimilar[],
                storyPoints: 100 as StoryPoints
            },
            buildContext()
        );
        expect(out.storyPoints).toBe(13);
        expect(out.confidence).toBe(1);
        expect(out.rationale).toBe("");
        expect(out.similar).toEqual([]);
    });
});

describe("validateBoardBrief", () => {
    it("filters references to unknown ids", () => {
        const out = validateBoardBrief(
            {
                counts: [
                    { columnId: "col-1", columnName: "Todo", count: 1 },
                    { columnId: "ghost", columnName: "Ghost", count: 9 }
                ],
                headline: "h",
                largestUnstarted: [
                    { taskId: "t1", taskName: "k" },
                    { taskId: "ghost", taskName: "g" }
                ],
                recommendation: "r",
                unowned: [
                    { taskId: "t1", taskName: "u" },
                    { taskId: "ghost", taskName: "g" }
                ],
                workload: [
                    {
                        memberId: "m1",
                        openPoints: 5,
                        openTasks: 1,
                        username: "Alice"
                    },
                    {
                        memberId: "ghost",
                        openPoints: 1,
                        openTasks: 1,
                        username: "Ghost"
                    }
                ]
            },
            buildContext()
        );
        expect(out.counts).toHaveLength(1);
        expect(out.largestUnstarted).toHaveLength(1);
        expect(out.unowned).toHaveLength(1);
        expect(out.workload).toHaveLength(1);
    });

    it("normalises missing arrays and strings", () => {
        const out = validateBoardBrief({} as IBoardBrief, buildContext());
        expect(out).toEqual({
            counts: [],
            headline: "",
            largestUnstarted: [],
            recommendation: "",
            unowned: [],
            workload: []
        });
    });

    it("normalises recommendationDetail strength, text, sources, and basis", () => {
        const ctx = buildContext();
        const out = validateBoardBrief(
            {
                recommendation: "Ship the sprint scope.",
                recommendationDetail: {
                    basis: "Signals from workload.",
                    sources: [
                        { taskId: "t1", taskName: "Known" },
                        { taskId: "ghost", taskName: "Bad" }
                    ],
                    strength: "invalid" as BoardBriefRecommendationStrength,
                    text: ""
                }
            },
            ctx
        );
        expect(out.recommendationDetail?.strength).toBe("none");
        expect(out.recommendationDetail?.text).toBe("Ship the sprint scope.");
        expect(out.recommendationDetail?.basis).toBe("Signals from workload.");
        expect(out.recommendationDetail?.sources).toEqual([
            { taskId: "t1", taskName: "Known" }
        ]);
    });

    it("drops recommendationDetail when payload is not an object", () => {
        const out = validateBoardBrief(
            {
                recommendation: "Stay the course.",
                recommendationDetail: "bogus" as unknown as IBoardBriefRecommendation
            },
            buildContext()
        );
        expect(out.recommendationDetail).toBeUndefined();
    });

    it("caps recommendationDetail sources at five known tasks", () => {
        const sources = Array.from({ length: 8 }, (_, i) => ({
            taskId: "t1",
            taskName: `Dup ${i}`
        }));
        const out = validateBoardBrief(
            {
                recommendation: "r",
                recommendationDetail: {
                    basis: "b",
                    sources,
                    strength: "moderate",
                    text: "Act now."
                }
            },
            buildContext()
        );
        expect(out.recommendationDetail?.sources).toHaveLength(5);
    });
});

describe("validateReadiness", () => {
    it("filters issues with unknown fields", () => {
        const out = validateReadiness({
            issues: [
                {
                    field: "note",
                    message: "ok",
                    severity: "info"
                },
                {
                    field: "ghost" as IReadinessIssue["field"],
                    message: "x",
                    severity: "info"
                }
            ]
        });
        expect(out.issues.map((issue) => issue.field)).toEqual(["note"]);
    });

    it("handles missing issues array", () => {
        expect(validateReadiness({} as IReadinessReport).issues).toEqual([]);
    });
});

describe("validateSearch", () => {
    it("keeps only ids present in the valid set", () => {
        const valid = new Set(["a", "b"]);
        expect(
            validateSearch({ ids: ["a", "ghost", "b"], rationale: "r" }, valid)
        ).toEqual({ ids: ["a", "b"], rationale: "r" });
    });

    it("normalises missing fields", () => {
        expect(validateSearch({} as ISearchResult, new Set(["x"]))).toEqual({
            ids: [],
            rationale: ""
        });
    });

    it("normalises non-string rationale", () => {
        expect(
            validateSearch(
                { ids: ["x"], rationale: 123 as unknown as string },
                new Set(["x"])
            )
        ).toEqual({ ids: ["x"], rationale: "" });
    });
});
