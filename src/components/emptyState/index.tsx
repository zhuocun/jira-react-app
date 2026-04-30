import styled from "@emotion/styled";
import { Empty, Typography } from "antd";
import React from "react";

import { space } from "../../theme/tokens";

interface EmptyStateProps {
    title: string;
    description?: React.ReactNode;
    cta?: React.ReactNode;
    illustration?: React.ReactNode;
    "data-testid"?: string;
}

const Container = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: ${space.sm}px;
    padding: ${space.xl}px ${space.md}px;
    text-align: center;
`;

/**
 * Reusable empty state used by project list, board, members popover, chat
 * drawer, brief drawer (Phase 3.6). Keeps the visual treatment, copy density,
 * and CTA placement consistent.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    cta,
    illustration,
    "data-testid": testId
}) => (
    <Container data-testid={testId} role="status">
        {illustration ?? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null} />}
        <Typography.Title level={5} style={{ margin: 0 }}>
            {title}
        </Typography.Title>
        {description ? (
            <Typography.Text type="secondary">{description}</Typography.Text>
        ) : null}
        {cta ? <div style={{ marginTop: space.xs }}>{cta}</div> : null}
    </Container>
);

export default EmptyState;
