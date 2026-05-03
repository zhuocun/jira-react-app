import styled from "@emotion/styled";
import { Typography } from "antd";
import React from "react";

import {
    accent,
    breakpoints,
    fontSize,
    fontWeight,
    lineHeight,
    radius,
    space
} from "../../theme/tokens";
import EmptyIllustration from "../emptyIllustration";

interface EmptyStateProps {
    title: string;
    description?: React.ReactNode;
    cta?: React.ReactNode;
    illustration?: React.ReactNode;
    /** Selects which branded illustration to show when no override is passed. */
    variant?: "tasks" | "projects" | "search" | "members";
    /**
     * Heading level for the title (1-5). Defaults to 5 for backwards
     * compatibility, but callers should pass the level that keeps their
     * page outline contiguous (h1 → h2 on the project list, h2 → h3
     * inside a column).
     */
    headingLevel?: 1 | 2 | 3 | 4 | 5;
    "data-testid"?: string;
}

const Container = styled.div`
    align-items: center;
    color: var(--ant-color-text, rgba(15, 23, 42, 0.85));
    display: flex;
    flex-direction: column;
    gap: ${space.sm}px;
    padding: ${space.xl}px ${space.md}px;
    text-align: center;

    @media (min-width: ${breakpoints.sm}px) {
        padding: ${space.xxl}px ${space.lg}px;
    }
`;

const IllustrationFrame = styled.div`
    align-items: center;
    background:
        radial-gradient(circle at 30% 30%, ${accent.bgMedium}, transparent 65%),
        radial-gradient(
            circle at 70% 70%,
            rgba(4, 120, 87, 0.16),
            transparent 60%
        ),
        var(--ant-color-fill-quaternary, rgba(15, 23, 42, 0.04));
    border: 1px solid var(--ant-color-border-secondary, rgba(15, 23, 42, 0.06));
    border-radius: ${radius.pill}px;
    color: var(--ant-color-primary, #047857);
    display: inline-flex;
    height: 88px;
    justify-content: center;
    margin-bottom: 0;
    width: 88px;
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
    variant = "tasks",
    headingLevel = 5,
    "data-testid": testId
}) => (
    <Container data-testid={testId} role="status">
        {illustration ?? (
            <IllustrationFrame>
                <EmptyIllustration size={44} variant={variant} />
            </IllustrationFrame>
        )}
        <Title level={headingLevel}>{title}</Title>
        {description ? <Description>{description}</Description> : null}
        {cta ? <div style={{ marginTop: space.xs }}>{cta}</div> : null}
    </Container>
);

export default EmptyState;
