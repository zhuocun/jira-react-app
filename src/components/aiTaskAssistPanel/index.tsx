import { Alert, Button, Card, Spin, Tag, Typography } from "antd";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import useAi from "../../utils/hooks/useAi";
import useCachedQueryData from "../../utils/hooks/useCachedQueryData";
import useDebounce from "../../utils/hooks/useDebounce";
import useDelayedFlag from "../../utils/hooks/useDelayedFlag";
import AiSparkleIcon from "../aiSparkleIcon";

/**
 * Map a 0–1 confidence to a plain-language band. Threshold values mirror
 * standard product-analytics buckets and are paired with the percentage
 * so users without a probability intuition can still act.
 */
const confidenceBand = (confidence: number): "Low" | "Moderate" | "High" => {
    if (confidence >= 0.75) return "High";
    if (confidence >= 0.45) return "Moderate";
    return "Low";
};

// Stable fallbacks: avoid producing a new `[]` reference on every render, which
// otherwise re-fires the suggestion effect endlessly when the cache is empty.
const EMPTY_TASKS: ITask[] = [];
const EMPTY_MEMBERS: IMember[] = [];
const EMPTY_COLUMNS: IColumn[] = [];

interface AiTaskAssistPanelProps {
    values: {
        taskName?: string;
        note?: string;
        type?: string;
        epic?: string;
        coordinatorId?: string;
        storyPoints?: number;
    };
    excludeTaskId?: string;
    onApplyStoryPoints: (value: StoryPoints) => void;
    onApplySuggestion: (
        field: IReadinessIssue["field"],
        suggestion: string
    ) => void;
    onOpenSimilarTask: (taskId: string) => void;
}

const AiTaskAssistPanel: React.FC<AiTaskAssistPanelProps> = ({
    values,
    excludeTaskId,
    onApplyStoryPoints,
    onApplySuggestion,
    onOpenSimilarTask
}) => {
    const { projectId } = useParams<{ projectId: string }>();
    const tasks =
        useCachedQueryData<ITask[]>(["tasks", { projectId }]) ?? EMPTY_TASKS;
    const members =
        useCachedQueryData<IMember[]>(["users/members"]) ?? EMPTY_MEMBERS;
    const columns =
        useCachedQueryData<IColumn[]>(["boards", { projectId }]) ??
        EMPTY_COLUMNS;

    const debouncedValues = useDebounce(values, 600);
    const taskName = debouncedValues.taskName ?? "";

    const estimateAi = useAi<IEstimateSuggestion>({ route: "estimate" });
    const readinessAi = useAi<IReadinessReport>({ route: "readiness" });
    const runEstimate = estimateAi.run;
    const runReadiness = readinessAi.run;
    // Throttle the spinner — local-engine responses resolve in <250ms and a
    // bare Spin causes a visible flash. useDelayedFlag suppresses it unless
    // the request is actually slow.
    const showEstimateSpinner = useDelayedFlag(
        estimateAi.isLoading && !estimateAi.data,
        250
    );
    const showReadinessSpinner = useDelayedFlag(
        readinessAi.isLoading && !readinessAi.data,
        250
    );

    useEffect(() => {
        if (!taskName.trim()) return;
        runEstimate({
            estimate: {
                taskName,
                note: debouncedValues.note,
                epic: debouncedValues.epic,
                type: debouncedValues.type,
                tasks,
                excludeTaskId,
                context: {
                    project: { _id: projectId ?? "", projectName: "" },
                    columns,
                    tasks,
                    members
                }
            }
        }).catch(() => undefined);
        runReadiness({
            readiness: {
                taskName,
                note: debouncedValues.note,
                epic: debouncedValues.epic,
                type: debouncedValues.type,
                coordinatorId: debouncedValues.coordinatorId,
                context: {
                    project: { _id: projectId ?? "", projectName: "" },
                    columns,
                    tasks,
                    members
                }
            }
        }).catch(() => undefined);
    }, [
        taskName,
        debouncedValues.note,
        debouncedValues.epic,
        debouncedValues.type,
        debouncedValues.coordinatorId,
        excludeTaskId,
        projectId,
        columns,
        tasks,
        members,
        runEstimate,
        runReadiness
    ]);

    const taskById = (id: string) => tasks.find((task) => task._id === id);

    return (
        <Card
            size="small"
            style={{ marginTop: 16 }}
            title={
                <span>
                    <AiSparkleIcon style={{ marginRight: 8 }} />
                    Board Copilot
                </span>
            }
        >
            <h4 style={{ marginBottom: 4 }}>Suggested story points</h4>
            {showEstimateSpinner && <Spin size="small" />}
            {estimateAi.error && (
                <Alert
                    showIcon
                    style={{ marginBottom: 8 }}
                    title={
                        estimateAi.error.message || "Failed to estimate task"
                    }
                    type="warning"
                />
            )}
            {estimateAi.data && (
                <div>
                    <div
                        style={{
                            alignItems: "center",
                            display: "flex",
                            gap: 8
                        }}
                    >
                        <span style={{ fontSize: "2rem", fontWeight: 600 }}>
                            {estimateAi.data.storyPoints}
                        </span>
                        <Tag color="blue">
                            {confidenceBand(estimateAi.data.confidence)} ·{" "}
                            {(estimateAi.data.confidence * 100).toFixed(0)}%
                        </Tag>
                        <Button
                            aria-label="Apply suggested story points"
                            onClick={() =>
                                onApplyStoryPoints(estimateAi.data!.storyPoints)
                            }
                            size="small"
                            type="primary"
                        >
                            Apply
                        </Button>
                    </div>
                    <Typography.Paragraph
                        style={{ margin: "6px 0" }}
                        type="secondary"
                    >
                        {estimateAi.data.rationale}
                    </Typography.Paragraph>
                    {estimateAi.data.similar.length > 0 && (
                        <div>
                            <strong>Similar tasks:</strong>
                            <ul style={{ paddingLeft: 18 }}>
                                {estimateAi.data.similar.map((entry) => {
                                    const task = taskById(entry._id);
                                    return (
                                        <li key={entry._id}>
                                            <Button
                                                onClick={() =>
                                                    onOpenSimilarTask(entry._id)
                                                }
                                                size="small"
                                                style={{
                                                    height: "auto",
                                                    padding: 0
                                                }}
                                                type="link"
                                            >
                                                {task?.taskName ?? entry._id}
                                            </Button>{" "}
                                            <Typography.Text type="secondary">
                                                — {entry.reason}
                                            </Typography.Text>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <h4 style={{ marginBottom: 4, marginTop: 16 }}>Readiness check</h4>
            {showReadinessSpinner && <Spin size="small" />}
            {readinessAi.error && (
                <Alert
                    showIcon
                    style={{ marginBottom: 8 }}
                    title={
                        readinessAi.error.message ||
                        "Failed to run readiness check"
                    }
                    type="warning"
                />
            )}
            {readinessAi.data && readinessAi.data.issues.length === 0 && (
                <Alert
                    showIcon
                    title="Looks ready to work on."
                    type="success"
                />
            )}
            {readinessAi.data &&
                readinessAi.data.issues.map((issue) => (
                    <Alert
                        action={
                            issue.suggestion ? (
                                <Button
                                    aria-label={`Apply readiness suggestion for ${issue.field}`}
                                    onClick={() =>
                                        onApplySuggestion(
                                            issue.field,
                                            issue.suggestion!
                                        )
                                    }
                                    size="small"
                                    type="link"
                                >
                                    Apply
                                </Button>
                            ) : null
                        }
                        description={issue.suggestion}
                        key={`${issue.field}-${issue.message}`}
                        showIcon
                        style={{ marginBottom: 6 }}
                        title={issue.message}
                        type={
                            issue.severity === "error"
                                ? "error"
                                : issue.severity === "warn"
                                  ? "warning"
                                  : "info"
                        }
                    />
                ))}
        </Card>
    );
};

export default AiTaskAssistPanel;
