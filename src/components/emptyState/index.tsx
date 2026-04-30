import styled from "@emotion/styled";
import { Empty, Typography } from "antd";
import React from "react";

import { fontSize, fontWeight, lineHeight, space } from "../../theme/tokens";

interface EmptyStateProps {
    title: string;
    description?: React.ReactNode;
    cta?: React.ReactNode;
    illustration?: React.ReactNode;
    "data-testid"?: string;
}

const Container = styled.div`
    align-items: center;
    color: var(--ant-color-text, rgba(15, 23, 42, 0.85));
    display: flex;
    flex-direction: column;
    gap: ${space.sm}px;
    padding: ${space.xxl}px ${space.lg}px;
    text-align: center;
`;

const StyledEmpty = styled(Empty)`
    && {
        margin: 0;
    }

    && .ant-empty-image {
        align-items: center;
        background:
            radial-gradient(
                circle at 30% 30%,
                rgba(124, 92, 255, 0.18),
                transparent 65%
            ),
            radial-gradient(
                circle at 70% 70%,
                rgba(94, 106, 210, 0.16),
                transparent 60%
            ),
            var(--ant-color-fill-quaternary, rgba(15, 23, 42, 0.04));
        border: 1px solid
            var(--ant-color-border-secondary, rgba(15, 23, 42, 0.06));
        border-radius: 999px;
        color: var(--ant-color-primary, #5e6ad2);
        display: inline-flex;
        height: 72px;
        justify-content: center;
        margin-bottom: 0;
        width: 72px;
    }

    && .ant-empty-image svg {
        height: 32px;
        width: 32px;
    }
`;

const Title = styled(Typography.Title)`
    && {
        font-size: ${fontSize.md}px;
        font-weight: ${fontWeight.semibold};
        line-height: ${lineHeight.snug};
        margin: 0;
    }
`;

const Description = styled(Typography.Text)`
    && {
        color: var(--ant-color-text-secondary, rgba(15, 23, 42, 0.6));
        line-height: ${lineHeight.normal};
        max-width: 36rem;
    }
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
        {illustration ?? (
            <StyledEmpty
                description={null}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        )}
        <Title level={5}>{title}</Title>
        {description ? <Description>{description}</Description> : null}
        {cta ? <div style={{ marginTop: space.xs }}>{cta}</div> : null}
    </Container>
);

export default EmptyState;
