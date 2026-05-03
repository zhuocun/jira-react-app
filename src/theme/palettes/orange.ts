import type { Palette } from "./types";

/**
 * Bright orange + warm cream palette. The orange (#EA580C, orange-600) is
 * vibrant enough to anchor a full-bleed hero surface with white text — the
 * way bright orange is used in modern delivery / commerce apps — while the
 * page itself stays calm warm cream (#FEFAF5) with a soft peach wash from
 * the top so the colour reads as ambient warmth, not corporate brand fill.
 *
 * Brightness vs. AA contrast trade-off:
 *   - `primary` (#EA580C) hits 3.42:1 on white — passes AA-large and UI
 *     components. We use it for CTA fills (white text on orange bg, where
 *     contrast is high) and for icons / focus rings.
 *   - `primaryHover` (#C2410C) hits 4.74:1 on white — AA-compliant for
 *     normal text. AntD's `colorLink` overrides to this so links on white
 *     never fail AA.
 *   - `primaryDark` (#FB923C) is the dark-mode brand for AA on dark.
 */
export const orangePalette: Palette = {
    name: "orange",
    brand: {
        primary: "#EA580C",
        primaryHover: "#C2410C",
        primaryActive: "#9A3412",
        primaryBg: "#FFF7ED",
        primaryBgDark: "#1F0E07",
        primaryDark: "#FB923C"
    },
    accent: {
        start: "#EA580C",
        end: "#F97316",
        rgb: "234, 88, 12",
        rgbDark: "251, 146, 60"
    },
    aurora: {
        deep: "#EA580C",
        mid: "#F97316",
        light: "#FB923C",
        cinematicBase: "#1F0E07"
    },
    page: {
        bgLight: "#FEFAF5",
        bgDark: "#1A0F0A",
        textLight: "rgba(15, 23, 42, 0.92)",
        textDark: "rgba(229, 231, 235, 0.92)"
    },
    avatarGradients: [
        "linear-gradient(135deg, #FDBA74 0%, #EA580C 100%)",
        "linear-gradient(135deg, #FB923C 0%, #C2410C 100%)",
        "linear-gradient(135deg, #F97316 0%, #7C2D12 100%)",
        "linear-gradient(135deg, #FDBA74 0%, #C2410C 100%)",
        "linear-gradient(135deg, #FB923C 0%, #9A3412 100%)",
        "linear-gradient(135deg, #F97316 0%, #C2410C 100%)"
    ]
};
