import {
    Alert,
    Button,
    Card,
    Skeleton,
    Space,
    Tag,
    Tooltip,
    Typography
} from "antd";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { microcopy } from "../../constants/microcopy";
import { accent, fontSize, fontWeight, space } from "../../theme/tokens";
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

    const debouncedValues = useDebounce(values, 1000);
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

    const SectionHeading: React.FC<{ children: React.ReactNode }> = ({
        children
    }) => (
        <Typography.Title
            level={5}
            style={{
                fontSize: fontSize.base,
                marginBottom: space.xxs,
                marginTop: 0
            }}
        >
            {children}
        </Typography.Title>
    );

    return (
        <Card
            size="small"
            style={{
                background: `linear-gradient(180deg, ${accent.bgSubtle} 0%, transparent 100%)`,
                borderColor: accent.bgMedium,
                marginTop: space.md
            }}
            title={
                <Space align="center" size={space.xs} wrap>
                    <AiSparkleIcon aria-hidden />
                    <span style={{ fontWeight: fontWeight.semibold }}>
                        Board Copilot
                    </span>
                    <Tag variant="filled" color="purple">
                        {microcopy.a11y.aiBadge}
                    </Tag>
                </Space>
            }
        >
            <SectionHeading>Suggested story points</SectionHeading>
            {showEstimateSpinner && (
                <Skeleton
                    active
                    aria-label="Estimating story points"
                    paragraph={{ rows: 2 }}
                    title={false}
                />
            )}
            {estimateAi.error && (
                <Alert
                    showIcon
                    style={{ marginBottom: space.xs }}
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
                            gap: space.xs,
                            flexWrap: "wrap"
                        }}
                    >
                        <span
                            aria-label={`Suggested story points: ${estimateAi.data.storyPoints}`}
                            style={{
                                fontSize: fontSize.xxl,
                                fontWeight: 600
                            }}
                        >
                            {estimateAi.data.storyPoints}
                        </span>
                        <Tooltip title="Board Copilot's confidence in this estimate, based on similar tasks on this board.">
                            <Tag color="blue">
                                {`AI confidence: ${confidenceBand(
                                    estimateAi.data.confidence
                                )} (${(
                                    estimateAi.data.confidence * 100
                                ).toFixed(0)}%)`}
                            </Tag>
                        </Tooltip>
                        <Button
                            aria-label="Apply suggested story points"
                            onClick={() =>
                                onApplyStoryPoints(estimateAi.data!.storyPoints)
                            }
                            size="small"
                            type="primary"
                        >
                            {microcopy.actions.apply}
                        </Button>
                    </div>
                    <Typography.Paragraph
                        style={{ margin: `${space.xxs}px 0` }}
                        type="secondary"
                    >
                        {estimateAi.data.rationale}
                    </Typography.Paragraph>
                    {estimateAi.data.similar.length > 0 && (
                        <div>
                            <strong>Similar tasks:</strong>
                            <ul style={{ paddingLeft: space.lg }}>
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

            <div style={{ marginTop: space.md }}>
                <SectionHeading>Readiness check</SectionHeading>
            </div>
            {showReadinessSpinner && (
                <Skeleton
                    active
                    aria-label="Running readiness check"
                    paragraph={{ rows: 1 }}
                    title={false}
                />
            )}
            {readinessAi.error && (
                <Alert
                    showIcon
                    style={{ marginBottom: space.xs }}
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
                                    {microcopy.actions.apply}
                                </Button>
                            ) : null
                        }
                        description={issue.suggestion}
                        key={`${issue.field}-${issue.message}`}
                        showIcon
                        style={{ marginBottom: space.xxs }}
                        title={`${microcopy.a11y.aiSuggestion}: ${issue.message}`}
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
