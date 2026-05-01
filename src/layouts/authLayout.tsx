import styled from "@emotion/styled";
import { Button, Card } from "antd";
import { Outlet } from "react-router";

import {
    accent,
    brand,
    breakpoints,
    fontSize,
    fontWeight,
    letterSpacing,
    lineHeight,
    radius,
    shadow,
    space
} from "../theme/tokens";

const Page = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    min-height: 100vh;
    min-height: 100dvh;
    background:
        radial-gradient(
            1200px 600px at 0% 0%,
            ${accent.bgMedium},
            transparent 60%
        ),
        radial-gradient(
            900px 500px at 100% 100%,
            ${accent.bgMedium},
            transparent 60%
        ),
        var(--pulse-bg-page);

    /*
     * Show the marketing rail on tablet+ instead of waiting for desktop —
     * a 768 × 1024 iPad in portrait has plenty of room to read the hero
     * copy alongside the form. Below "md" the rail collapses so the form
     * gets the full viewport (no wasted space, no awkward 50/50 split).
     */
    @media (min-width: ${breakpoints.md}px) {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }

    @media (min-width: ${breakpoints.lg}px) {
        grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    }
`;

/**
 * Marketing rail. Sits on the left at tablet widths and disappears below
 * `md` so the auth card has the full viewport. The visual treatment is a
 * soft indigo gradient with a subtle dot pattern overlay — no heavy
 * decorative SVGs, no raster images, just CSS so it scales perfectly.
 */
const HeroRail = styled.aside`
    display: none;

    @media (min-width: ${breakpoints.md}px) {
        align-items: center;
        background:
            radial-gradient(
                700px 700px at 30% 30%,
                ${accent.bgStrong},
                transparent 70%
            ),
            radial-gradient(
                500px 500px at 80% 80%,
                ${accent.secondaryStrong},
                transparent 70%
            ),
            ${brand.primaryBgDark};
        color: #fff;
        display: flex;
        justify-content: center;
        padding: ${space.xxl}px ${space.xl}px;
        position: relative;
    }

    @media (min-width: ${breakpoints.lg}px) {
        padding: ${space.xxxl}px ${space.xxl}px;
    }

    /* Subtle grid texture so the gradient does not feel empty. */
    &::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.04) 1px,
                transparent 1px
            );
        background-size: 32px 32px;
        mask-image: radial-gradient(closest-side, black 0%, transparent 100%);
        pointer-events: none;
    }
`;

const HeroInner = styled.div`
    max-width: 32rem;
    position: relative;
    z-index: 1;
    text-align: left;
`;

const HeroBadge = styled.div`
    align-items: center;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: ${radius.pill}px;
    color: rgba(255, 255, 255, 0.9);
    display: inline-flex;
    font-size: ${fontSize.sm}px;
    font-weight: ${fontWeight.medium};
    gap: ${space.xs}px;
    padding: ${space.xxs}px ${space.sm}px;
`;

const HeroBadgeDot = styled.span`
    background: ${accent.start};
    border-radius: 50%;
    box-shadow: 0 0 12px ${accent.start};
    display: inline-block;
    height: 6px;
    width: 6px;
`;

const HeroTitle = styled.h2`
    color: #fff;
    /* xxl (28 px) on tablet, display (36 px) on desktop. The smaller value
     * keeps the headline within the rail's available width on a portrait
     * iPad without overflowing the rail's left padding. */
    font-size: ${fontSize.xxl}px;
    font-weight: ${fontWeight.semibold};
    letter-spacing: ${letterSpacing.tight};
    line-height: ${lineHeight.tight};
    margin: ${space.lg}px 0 ${space.md}px;

    @media (min-width: ${breakpoints.lg}px) {
        font-size: ${fontSize.display}px;
    }
`;

const HeroSubtitle = styled.p`
    color: rgba(255, 255, 255, 0.72);
    font-size: ${fontSize.md}px;
    line-height: ${lineHeight.relaxed};
    margin: 0 0 ${space.xl}px;
    max-width: 28rem;
`;

const HeroFeatureList = styled.ul`
    display: grid;
    gap: ${space.md}px;
    list-style: none;
    margin: 0;
    padding: 0;
`;

const HeroFeature = styled.li`
    align-items: center;
    color: rgba(255, 255, 255, 0.92);
    display: flex;
    font-size: ${fontSize.base}px;
    gap: ${space.sm}px;
`;

const HeroFeatureIcon = styled.span`
    align-items: center;
    background: ${accent.border};
    border-radius: ${radius.md}px;
    color: ${accent.end};
    display: inline-flex;
    flex: 0 0 auto;
    height: 32px;
    justify-content: center;
    width: 32px;
`;

/**
 * Main auth canvas. Holds the brand mark and the form card.
 *
 * Rendered as a real `<main>` landmark so keyboard / screen-reader users
 * can jump straight to the form via the standard "main content" pattern
 * (WCAG 2.4.1 Bypass Blocks). The previous `<div>` left auth pages
 * without any top-level landmark.
 */
const Canvas = styled.main`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: ${space.md}px;
    padding-block-start: max(${space.lg}px, env(safe-area-inset-top));
    padding-block-end: max(${space.md}px, env(safe-area-inset-bottom));
    padding-inline-start: max(${space.md}px, env(safe-area-inset-left));
    padding-inline-end: max(${space.md}px, env(safe-area-inset-right));
    width: 100%;

    @media (min-width: ${breakpoints.sm}px) {
        padding: ${space.lg}px;
        padding-block-start: max(${space.xl}px, env(safe-area-inset-top));
        padding-block-end: max(${space.lg}px, env(safe-area-inset-bottom));
        padding-inline-start: max(${space.lg}px, env(safe-area-inset-left));
        padding-inline-end: max(${space.lg}px, env(safe-area-inset-right));
    }
`;

const BrandHeader = styled.header`
    align-items: center;
    color: var(--ant-color-text, rgba(15, 23, 42, 0.92));
    display: inline-flex;
    gap: ${space.sm}px;
    margin-bottom: ${space.xl}px;
`;

const BrandIcon = styled.span`
    align-items: center;
    background: linear-gradient(
        135deg,
        ${accent.start} 0%,
        ${brand.primary} 100%
    );
    border-radius: ${radius.md}px;
    box-shadow: ${shadow.md};
    color: #fff;
    display: inline-flex;
    height: 36px;
    justify-content: center;
    width: 36px;

    svg {
        height: 20px;
        width: 20px;
    }
`;

const BrandWordmark = styled.span`
    font-size: ${fontSize.lg}px;
    font-weight: ${fontWeight.semibold};
    letter-spacing: ${letterSpacing.tight};
`;

/**
 * Page-level heading for auth screens. Rendered as an `h1` for correct
 * document outline (login/register are top-level pages); we override
 * AntD typography here for closer kerning and a heavier weight.
 */
export const AuthTitle = styled.h1`
    color: var(--ant-color-text, rgba(15, 23, 42, 0.92));
    font-size: ${fontSize.lg}px;
    font-weight: ${fontWeight.semibold};
    letter-spacing: ${letterSpacing.tight};
    line-height: ${lineHeight.snug};
    margin: 0 0 ${space.xxs}px;
    text-align: left;

    @media (min-width: ${breakpoints.sm}px) {
        font-size: ${fontSize.xl}px;
    }
`;

/**
 * Subhead under the auth title. Optional — pages that don't render one
 * still have AuthTitle take the full available height.
 */
export const AuthSubtitle = styled.p`
    color: var(--ant-color-text-secondary, rgba(15, 23, 42, 0.6));
    font-size: ${fontSize.base}px;
    line-height: ${lineHeight.normal};
    margin: 0 0 ${space.lg}px;
    text-align: left;
`;

/**
 * AntD `Card` is retained as the form shell so the existing test contract
 * (`.ant-card` selector) keeps passing while we deliver a refined surface
 * treatment via the `box-shadow` / `border` / `border-radius` overrides.
 */
const FormCard = styled(Card)`
    && {
        background: var(--ant-color-bg-container, #fff);
        border: 1px solid
            var(--ant-color-border-secondary, rgba(15, 23, 42, 0.06));
        border-radius: ${radius.lg}px;
        box-shadow: ${shadow.lg};
        box-sizing: border-box;
        max-width: 28rem;
        text-align: left;
        width: 100%;
    }

    && .ant-card-body {
        padding: ${space.lg}px;

        @media (min-width: ${breakpoints.sm}px) {
            padding: ${space.xxl}px;
        }
    }
`;

/**
 * Auth submit button. Full width on mobile (single dominant CTA),
 * with the same minimum height for predictable alignment with the
 * rest of the form.
 */
export const AuthButton = styled(Button)`
    && {
        font-weight: 500;
        height: 44px;
        width: 100%;
    }
`;

const AuthLayout = () => {
    return (
        <Page>
            <HeroRail aria-hidden="true">
                <HeroInner>
                    <HeroBadge>
                        <HeroBadgeDot />
                        New: Board Copilot
                    </HeroBadge>
                    <HeroTitle>Ship work with calm focus.</HeroTitle>
                    <HeroSubtitle>
                        A focused project board that turns work into momentum.
                        Drag, drop, draft with AI, and keep your team in flow.
                    </HeroSubtitle>
                    <HeroFeatureList>
                        <HeroFeature>
                            <HeroFeatureIcon aria-hidden>✦</HeroFeatureIcon>
                            Draft tasks and standup briefs with AI.
                        </HeroFeature>
                        <HeroFeature>
                            <HeroFeatureIcon aria-hidden>↹</HeroFeatureIcon>
                            Drag-and-drop columns and cards.
                        </HeroFeature>
                        <HeroFeature>
                            <HeroFeatureIcon aria-hidden>◐</HeroFeatureIcon>
                            Light, dark, and system color modes.
                        </HeroFeature>
                    </HeroFeatureList>
                </HeroInner>
            </HeroRail>
            <Canvas>
                <BrandHeader>
                    <BrandIcon aria-hidden>
                        <svg
                            viewBox="0 0 32 32"
                            xmlns="http://www.w3.org/2000/svg"
                            focusable="false"
                        >
                            <path
                                d="M9 10.5 L9 21.5 M14 14.5 L14 17.5 M19 10.5 L19 21.5 M24 14.5 L24 17.5"
                                stroke="#FFFFFF"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                            />
                        </svg>
                    </BrandIcon>
                    <BrandWordmark>Pulse</BrandWordmark>
                </BrandHeader>
                <FormCard>
                    <Outlet />
                </FormCard>
            </Canvas>
        </Page>
    );
};

export default AuthLayout;
