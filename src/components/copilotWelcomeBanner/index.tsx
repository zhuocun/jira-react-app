import { CloseOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Button, Space, Typography } from "antd";
import React from "react";

import { ANALYTICS_EVENTS, track } from "../../constants/analytics";
import { microcopy } from "../../constants/microcopy";
import { blur, fontSize, fontWeight, radius, space } from "../../theme/tokens";
import AiSparkleIcon from "../aiSparkleIcon";

/**
 * First-time AI welcome banner (PRD v3 §8.1). Renders once per browser
 * (`localStorage` flag) and dismisses forever — both the CTA and the
 * close button mark the banner as seen so the next reload skips it.
 *
 * The banner intentionally lives in the page chrome, not as a modal: we
 * never block the user from doing real work on the board.
 */
const Wrap = styled.div`
    align-items: flex-start;
    position: relative;
    overflow: hidden;
    /* Aurora mesh + glass: teal bleeds in from the top-left, amber from
     * the bottom-right (the warm corner that keeps the banner from
     * reading as a single-hue cool tint). Sits on the strong glass
     * surface so the whole panel reads as a frosted aurora pane. */
    background:
        radial-gradient(
            120% 200% at 0% 0%,
            rgba(13, 148, 136, 0.2) 0%,
            transparent 60%
        ),
        radial-gradient(
            120% 200% at 100% 100%,
            rgba(245, 158, 11, 0.16) 0%,
            transparent 60%
        ),
        var(--glass-surface-strong);
    backdrop-filter: blur(${blur.md}px) saturate(170%);
    -webkit-backdrop-filter: blur(${blur.md}px) saturate(170%);
    border: 1px solid var(--glass-border-strong);
    border-radius: ${radius.md}px;
    box-shadow:
        0 8px 28px -12px rgba(13, 148, 136, 0.3),
        var(--glass-shine);
    display: flex;
    gap: ${space.sm}px;
    margin-bottom: ${space.md}px;
    padding: ${space.sm}px ${space.md}px;
`;

const Body = styled.div`
    flex: 1 1 auto;
    min-width: 0;
`;

interface CopilotWelcomeBannerProps {
    /** Override the storage key for tests / multi-tenant boards. */
    storageKey?: string;
    /** Called when the user clicks the primary CTA. */
    onCta?: () => void;
}

const CopilotWelcomeBanner: React.FC<CopilotWelcomeBannerProps> = ({
    storageKey = "boardCopilot:onboarded",
    onCta
}) => {
    const [shown, setShown] = React.useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        try {
            return window.localStorage.getItem(storageKey) === "1";
        } catch {
            return false;
        }
    });
    const dismiss = React.useCallback(() => {
        try {
            window.localStorage.setItem(storageKey, "1");
        } catch {
            /* private mode — no persistence, but the user still can't see it */
        }
        setShown(true);
    }, [storageKey]);
    if (shown) return null;
    const handleCta = () => {
        track(ANALYTICS_EVENTS.COPILOT_ONBOARDING_CTA);
        dismiss();
        onCta?.();
    };
    return (
        <Wrap role="region" aria-label="Board Copilot welcome">
            <AiSparkleIcon size="lg" aria-hidden style={{ marginTop: 2 }} />
            <Body>
                <Typography.Text
                    style={{
                        display: "block",
                        fontSize: fontSize.md,
                        fontWeight: fontWeight.semibold
                    }}
                >
                    {microcopy.ai.welcomeBannerTitle}
                </Typography.Text>
                <Typography.Paragraph
                    style={{ marginBottom: space.xs, marginTop: 4 }}
                    type="secondary"
                >
                    {microcopy.ai.welcomeBannerBody}
                </Typography.Paragraph>
                <Space size={space.xs}>
                    <Button onClick={handleCta} size="small" type="primary">
                        {microcopy.ai.welcomeBannerCta}
                    </Button>
                    <Button onClick={dismiss} size="small" type="text">
                        {microcopy.ai.welcomeBannerDismiss}
                    </Button>
                </Space>
            </Body>
            <Button
                aria-label={microcopy.ai.welcomeBannerDismiss}
                icon={<CloseOutlined />}
                onClick={dismiss}
                size="small"
                type="text"
            />
        </Wrap>
    );
};

export default CopilotWelcomeBanner;
