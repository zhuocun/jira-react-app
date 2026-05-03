import { theme as antdTheme, ThemeConfig } from "antd";

import {
    accent,
    aurora,
    brand,
    fontFamily,
    fontSize,
    fontWeight,
    glass,
    lineHeight,
    motion,
    radius,
    semantic,
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
    cssVar: { key: "ant" },
    token: {
        // Brand
        colorPrimary: brand.primary,
        colorPrimaryHover: brand.primaryHover,
        colorPrimaryActive: brand.primaryActive,
        colorLink: brand.primary,
        colorLinkHover: brand.primaryHover,
        colorLinkActive: brand.primaryActive,
        colorInfo: brand.primary,

        // Semantic
        colorSuccess: semantic.success,
        colorWarning: semantic.warning,
        colorError: semantic.error,

        // Surfaces — transparent so the page-level background shows through
        // every Layout. Solid fallbacks live in App.css under
        // `prefers-reduced-transparency` and `forced-colors`.
        colorBgLayout: "transparent",

        // Radii — softer corners across the system
        borderRadius: radius.md,
        borderRadiusLG: radius.lg,
        borderRadiusSM: radius.sm,
        borderRadiusXS: radius.xs,
        borderRadiusOuter: radius.md,

        // Typography
        fontFamily: fontFamily.sans,
        fontFamilyCode: fontFamily.mono,
        fontSize: fontSize.base,
        fontSizeSM: fontSize.sm,
        fontSizeLG: fontSize.md,
        fontSizeHeading1: fontSize.display,
        fontSizeHeading2: fontSize.xxl,
        fontSizeHeading3: fontSize.xl,
        fontSizeHeading4: fontSize.lg,
        fontSizeHeading5: fontSize.md,
        fontWeightStrong: fontWeight.semibold,
        lineHeight: lineHeight.normal,
        lineHeightHeading1: lineHeight.tight,
        lineHeightHeading2: lineHeight.tight,
        lineHeightHeading3: lineHeight.snug,
        lineHeightHeading4: lineHeight.snug,

        // Controls. On coarse pointers (touch) we collapse all three sizes to
        // the 44 px Apple HIG minimum so `size="small"` buttons in dropdowns,
        // banners and AI panels are still comfortably tappable. Desktop keeps
        // the dense Linear-style 36 / 44 / 28 ladder.
        controlHeight: coarsePointer ? touchTargetCoarse : 36,
        controlHeightLG: coarsePointer ? touchTargetCoarse + 8 : 44,
        controlHeightSM: coarsePointer ? touchTargetCoarse : 28,
        controlOutlineWidth: 3,
        controlOutline:
            mode === "dark"
                ? "rgba(110, 231, 183, 0.30)"
                : "rgba(4, 120, 87, 0.22)",

        // Motion
        motionDurationFast: `${motion.short}ms`,
        motionDurationMid: `${motion.medium}ms`,
        motionDurationSlow: `${motion.long}ms`,

        // Wireframe lines
        lineWidth: 1,
        wireframe: false
    },
    components: {
        Button: {
            controlHeight: coarsePointer ? touchTargetCoarse : 36,
            paddingInline: space.md,
            paddingInlineLG: space.lg,
            paddingInlineSM: space.sm,
            fontWeight: fontWeight.medium,
            primaryShadow: "none",
            defaultShadow: "none",
            dangerShadow: "none"
        },
        Card: {
            paddingLG: space.lg,
            borderRadiusLG: radius.lg
        },
        Modal: {
            paddingContentHorizontalLG: space.lg,
            borderRadiusLG: radius.lg,
            titleFontSize: fontSize.md,
            titleLineHeight: lineHeight.snug,
            // Glass content surface; backdrop-filter is applied in App.css
            // against `.ant-modal-content` because the AntD theme API has no
            // backdropFilter token.
            contentBg:
                mode === "dark" ? glass.surfaceStrongDark : glass.surfaceStrong,
            headerBg: "transparent",
            footerBg: "transparent",
            // Restrained mask: a softer dark wash without an emerald tint
            // keeps the focus on the modal content itself rather than
            // bleeding the brand color across the whole viewport.
            colorBgMask:
                mode === "dark"
                    ? "rgba(2, 18, 14, 0.62)"
                    : "rgba(15, 23, 42, 0.32)"
        },
        Drawer: {
            paddingLG: space.lg,
            // Glass body; backdrop-filter applied in App.css.
            colorBgElevated:
                mode === "dark" ? glass.surfaceStrongDark : glass.surfaceStrong
        },
        Input: {
            paddingBlock: 6,
            paddingInline: space.sm,
            borderRadius: radius.md,
            activeShadow: `0 0 0 3px ${
                mode === "dark"
                    ? "rgba(110, 231, 183, 0.30)"
                    : "rgba(4, 120, 87, 0.20)"
            }`
        },
        Select: {
            borderRadius: radius.md,
            optionPadding: `${space.xs}px ${space.sm}px`,
            optionHeight: coarsePointer ? touchTargetCoarse : 32
        },
        Table: {
            cellPaddingBlock: space.sm,
            cellPaddingInline: space.md,
            headerBg: "transparent",
            headerColor:
                mode === "dark"
                    ? "rgba(255, 255, 255, 0.55)"
                    : "rgba(15, 23, 42, 0.55)",
            headerSplitColor: "transparent",
            rowHoverBg:
                mode === "dark"
                    ? "rgba(110, 231, 183, 0.12)"
                    : "rgba(4, 120, 87, 0.06)",
            borderColor:
                mode === "dark"
                    ? "rgba(255, 255, 255, 0.06)"
                    : "rgba(15, 23, 42, 0.06)"
        },
        Tag: {
            borderRadiusSM: radius.sm,
            defaultBg:
                mode === "dark"
                    ? "rgba(255, 255, 255, 0.06)"
                    : "rgba(15, 23, 42, 0.05)",
            defaultColor:
                mode === "dark"
                    ? "rgba(255, 255, 255, 0.78)"
                    : "rgba(15, 23, 42, 0.72)"
        },
        Tabs: {
            inkBarColor: brand.primary,
            itemActiveColor: brand.primary,
            itemHoverColor: brand.primaryHover,
            itemSelectedColor: brand.primary,
            titleFontSize: fontSize.base
        },
        Tooltip: {
            colorBgSpotlight:
                mode === "dark"
                    ? "rgba(10, 15, 13, 0.94)"
                    : "rgba(15, 23, 42, 0.94)",
            colorTextLightSolid: "#FFFFFF",
            borderRadius: radius.sm
        },
        Layout: {
            headerBg: "transparent",
            bodyBg: "transparent"
        },
        Form: {
            labelFontSize: fontSize.sm,
            verticalLabelPadding: `0 0 ${space.xxs}px`,
            itemMarginBottom: space.md
        },
        Avatar: {
            colorTextLightSolid: "#FFFFFF",
            containerSize: 28,
            containerSizeLG: 36,
            containerSizeSM: 24
        },
        Badge: {
            indicatorHeight: 18,
            indicatorHeightSM: 14,
            textFontSize: fontSize.xs,
            textFontWeight: fontWeight.semibold
        },
        Alert: {
            borderRadiusLG: radius.md,
            withDescriptionPadding: `${space.sm}px ${space.md}px`
        },
        Divider: {
            colorSplit:
                mode === "dark"
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(15, 23, 42, 0.08)"
        },
        Popover: {
            borderRadiusLG: radius.md,
            titleMinWidth: 180
        },
        Dropdown: {
            borderRadiusLG: radius.md,
            paddingBlock: space.xxs
        }
    }
});

/**
 * Re-export the accent gradient as raw CSS so styled components can drop it
 * directly without re-importing the token module. Resolves to the
 * single-hue emerald gradient via the updated `accent` tokens.
 */
export const accentGradientCss = `linear-gradient(135deg, ${accent.start} 0%, ${accent.end} 100%)`;

/**
 * Linear deep → mid emerald gradient. Used for buttons, badges, and the
 * sparkle icon when a single-stripe gradient fits better than a flat fill.
 */
export const auroraGradientCss = aurora.gradLine;
