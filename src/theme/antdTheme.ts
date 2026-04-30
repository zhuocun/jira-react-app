import { theme as antdTheme, ThemeConfig } from "antd";

import {
    brand,
    fontSize,
    motion,
    radius,
    space,
    touchTargetCoarse
} from "./tokens";

/**
 * Build an AntD ThemeConfig from our token module so AntD's internal padding,
 * radii, and font-size match the rest of the app exactly.
 *
 * `algorithm` switches between light and dark; component overrides keep the
 * Jira-like compact density (small controls, dense tables) without losing the
 * 24px minimum target size mandated by WCAG 2.5.8.
 */
export const buildAntdTheme = (
    mode: "light" | "dark",
    coarsePointer = false
): ThemeConfig => ({
    algorithm:
        mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    cssVar: true,
    token: {
        borderRadius: radius.md,
        borderRadiusLG: radius.lg,
        borderRadiusSM: radius.sm,
        colorPrimary: brand.primary,
        colorPrimaryActive: brand.primaryActive,
        colorPrimaryHover: brand.primaryHover,
        controlHeight: coarsePointer ? touchTargetCoarse : 32,
        controlHeightLG: coarsePointer ? touchTargetCoarse + 8 : 40,
        controlHeightSM: coarsePointer ? touchTargetCoarse - 8 : 24,
        fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        fontSize: fontSize.base,
        fontSizeHeading1: fontSize.xxl,
        fontSizeHeading2: fontSize.xl,
        fontSizeHeading3: fontSize.lg,
        fontSizeHeading4: fontSize.md,
        fontSizeLG: fontSize.md,
        fontSizeSM: fontSize.sm,
        motionDurationFast: `${motion.short}ms`,
        motionDurationMid: `${motion.medium}ms`,
        motionDurationSlow: `${motion.long}ms`
    },
    components: {
        Card: {
            paddingLG: space.lg
        },
        Modal: {
            paddingContentHorizontalLG: space.lg
        }
    }
});
