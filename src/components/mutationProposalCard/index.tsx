import styled from "@emotion/styled";
import { Button, Space, Table, Tag, Typography } from "antd";
import React from "react";

import { ANALYTICS_EVENTS, track } from "../../constants/analytics";
import { microcopy } from "../../constants/microcopy";
import type { MutationProposal, TaskUpdate } from "../../interfaces/agent";
import { fontSize, fontWeight, radius, space } from "../../theme/tokens";

/**
 * Mutation preview card (PRD v3 §10.1, §7.4, C-R9). Renders the proposed
 * diff with old → new field values, a risk band chip, and Accept/Reject
 * buttons. Lives inline (chat drawer) or in a modal dialog (review-each
 * flow). The component is render-only — surfaces wire up the actual
 * `agent.resume({ accepted })` call so they can also clear local state
 * (e.g. close the drawer or focus the next pending proposal).
 */
const Wrap = styled.div`
    background: var(--color-copilot-bg-subtle);
    border: 1px solid var(--color-copilot-bg-medium);
    border-radius: ${radius.md}px;
    margin: ${space.xs}px 0;
    padding: ${space.sm}px;
`;

const Heading = styled.div`
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: ${space.xs}px;
    margin-bottom: ${space.xs}px;
`;

interface MutationProposalCardProps {
    proposal: MutationProposal;
    onAccept: () => void;
    onReject: () => void;
    /** Disables the buttons while a previous click is in flight. */
    isLoading?: boolean;
    /**
     * Override the default verb. The default extracts a verb from
     * `proposal.description`; pass a string when the surface knows the
     * exact action label (e.g. "Reassign 2 tasks").
     */
    title?: string;
}

const riskColor = (risk: MutationProposal["risk"]) => {
    if (risk === "high") return "red";
    if (risk === "med") return "orange";
    return "green";
};

const riskLabel = (risk: MutationProposal["risk"]) => {
    if (risk === "high") return "High risk";
    if (risk === "med") return "Medium risk";
    return "Low risk";
};

interface DiffRow {
    key: string;
    field: string;
    from: React.ReactNode;
    to: React.ReactNode;
}

const formatValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "string" && value.length === 0) return "—";
    if (typeof value === "number" || typeof value === "boolean")
        return String(value);
    if (typeof value === "string") return value;
    return JSON.stringify(value);
};

const fieldLabel: Record<TaskUpdate["field"], string> = {
    coordinatorId: "Coordinator",
    columnId: "Column",
    epic: "Epic",
    type: "Type",
    storyPoints: "Story points",
    taskName: "Task name",
    note: "Notes"
};

const buildRows = (proposal: MutationProposal): DiffRow[] => {
    const rows: DiffRow[] = [];
    proposal.diff.task_updates?.forEach((update, index) => {
        rows.push({
            key: `task-${update.task_id}-${update.field}-${index}`,
            field: `${fieldLabel[update.field] ?? update.field}`,
            from: formatValue(update.from),
            to: formatValue(update.to)
        });
    });
    proposal.diff.column_updates?.forEach((update, index) => {
        rows.push({
            key: `column-${update.column_id}-${update.field}-${index}`,
            field: `Column ${update.field}`,
            from: formatValue(update.from),
            to: formatValue(update.to)
        });
    });
    proposal.diff.bulk_apply?.forEach((bulk, index) => {
        rows.push({
            key: `bulk-${bulk.operation}-${index}`,
            field: bulk.operation,
            from: `${bulk.targets.length} target${bulk.targets.length === 1 ? "" : "s"}`,
            to: formatValue(bulk.payload)
        });
    });
    return rows;
};

const MutationProposalCard: React.FC<MutationProposalCardProps> = ({
    proposal,
    onAccept,
    onReject,
    isLoading,
    title
}) => {
    const rows = buildRows(proposal);
    const handleAccept = () => {
        track(ANALYTICS_EVENTS.AGENT_PROPOSAL_ACCEPTED, {
            id: proposal.proposal_id,
            risk: proposal.risk
        });
        onAccept();
    };
    const handleReject = () => {
        track(ANALYTICS_EVENTS.AGENT_PROPOSAL_REJECTED, {
            id: proposal.proposal_id,
            risk: proposal.risk
        });
        onReject();
    };
    const heading = title ?? `Copilot proposes: ${proposal.description}`;
    return (
        <Wrap role="alertdialog" aria-label={heading}>
            <Heading>
                <Typography.Text strong style={{ fontSize: fontSize.base }}>
                    {heading}
                </Typography.Text>
                <Tag color={riskColor(proposal.risk)}>
                    {riskLabel(proposal.risk)}
                </Tag>
                {proposal.undoable && (
                    <Tag
                        color="default"
                        style={{ fontWeight: fontWeight.medium }}
                    >
                        Undoable
                    </Tag>
                )}
            </Heading>
            {rows.length > 0 && (
                <Table
                    columns={[
                        {
                            dataIndex: "field",
                            key: "field",
                            title: "Field",
                            width: 140
                        },
                        {
                            dataIndex: "from",
                            key: "from",
                            title: "Current",
                            render: (value) => (
                                <span
                                    style={{
                                        color: "var(--ant-color-error, #EF4444)"
                                    }}
                                >
                                    {value}
                                </span>
                            )
                        },
                        {
                            dataIndex: "to",
                            key: "to",
                            title: "Proposed",
                            render: (value) => (
                                <span
                                    style={{
                                        color: "var(--ant-color-success, #10B981)"
                                    }}
                                >
                                    {value}
                                </span>
                            )
                        }
                    ]}
                    dataSource={rows}
                    pagination={false}
                    size="small"
                />
            )}
            <Space
                size={space.xs}
                style={{ justifyContent: "flex-end", marginTop: space.sm }}
                wrap
            >
                <Button
                    aria-label="Reject proposal"
                    disabled={isLoading}
                    onClick={handleReject}
                >
                    {microcopy.actions.cancel}
                </Button>
                <Button
                    aria-label="Accept proposal"
                    loading={isLoading}
                    onClick={handleAccept}
                    type="primary"
                >
                    {microcopy.actions.apply}
                </Button>
            </Space>
        </Wrap>
    );
};

export default MutationProposalCard;
