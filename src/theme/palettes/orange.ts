import type { Palette } from "./types";

/**
 * Orange + warm white palette. Burnt-orange brand (#C2410C, orange-700)
 * paired with a warm cream page (#FEFAF5) — a Hermès-adjacent combination
 * that reads as confident and editorial without the energy of a saturated
 * orange-500. AA contrast on white (4.74:1 normal text), AA on dark.
 *
 * The brand colour appears only where earned (CTAs, focus rings, AI
 * surfaces, hover affordances); modals stay opaque so the colour never
 * bleeds across the whole viewport.
 */
export const orangePalette: Palette = {
    name: "orange",
    brand: {
        primary: "#C2410C",
        primaryHover: "#9A3412",
        primaryActive: "#7C2D12",
        primaryBg: "#FFF7ED",
        primaryBgDark: "#1F0E07",
        primaryDark: "#FB923C"
    },
    accent: {
        start: "#C2410C",
        end: "#F97316",
        rgb: "194, 65, 12",
        rgbDark: "251, 146, 60"
    },
    aurora: {
        deep: "#C2410C",
        mid: "#EA580C",
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
