import { Alert, Button, Card, Spin, Tag } from "antd";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import useAi from "../../utils/hooks/useAi";
import useCachedQueryData from "../../utils/hooks/useCachedQueryData";
import useDebounce from "../../utils/hooks/useDebounce";
import AiSparkleIcon from "../aiSparkleIcon";

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
    const tasks = useCachedQueryData<ITask[]>(["tasks", { projectId }]) ?? [];
    const members = useCachedQueryData<IMember[]>(["users/members"]) ?? [];
    const columns =
        useCachedQueryData<IColumn[]>(["boards", { projectId }]) ?? [];

    const debouncedValues = useDebounce(values, 600);
    const taskName = debouncedValues.taskName ?? "";

    const estimateAi = useAi<IEstimateSuggestion>({ route: "estimate" });
    const readinessAi = useAi<IReadinessReport>({ route: "readiness" });
    const runEstimate = estimateAi.run;
    const runReadiness = readinessAi.run;

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
            })
            .catch(() => undefined);
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
        })
            .catch(() => undefined);
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
            {estimateAi.isLoading && !estimateAi.data && <Spin size="small" />}
            {estimateAi.error && (
                <Alert
                    message={estimateAi.error.message || "Failed to estimate task"}
                    showIcon
                    style={{ marginBottom: 8 }}
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
                            {(estimateAi.data.confidence * 100).toFixed(0)}%
                            confidence
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
                    <p style={{ color: "rgba(0,0,0,0.6)", margin: "6px 0" }}>
                        {estimateAi.data.rationale}
                    </p>
                    {estimateAi.data.similar.length > 0 && (
                        <div>
                            <strong>Similar tasks:</strong>
                            <ul style={{ paddingLeft: 18 }}>
                                {estimateAi.data.similar.map((entry) => {
                                    const task = taskById(entry._id);
                                    return (
                                        <li key={entry._id}>
                                            {/* eslint-disable-next-line */}
                                            <a
                                                onClick={() =>
                                                    onOpenSimilarTask(entry._id)
                                                }
                                            >
                                                {task?.taskName ?? entry._id}
                                            </a>{" "}
                                            <span
                                                style={{
                                                    color: "rgba(0,0,0,0.5)"
                                                }}
                                            >
                                                — {entry.reason}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <h4 style={{ marginBottom: 4, marginTop: 16 }}>Readiness check</h4>
            {readinessAi.isLoading && !readinessAi.data && (
                <Spin size="small" />
            )}
            {readinessAi.error && (
                <Alert
                    message={
                        readinessAi.error.message ||
                        "Failed to run readiness check"
                    }
                    showIcon
                    style={{ marginBottom: 8 }}
                    type="warning"
                />
            )}
            {readinessAi.data && readinessAi.data.issues.length === 0 && (
                <Alert
                    message="Looks ready to work on."
                    showIcon
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
                        message={issue.message}
                        showIcon
                        style={{ marginBottom: 6 }}
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
