import type { Palette } from "./types";

/**
 * Deep emerald + warm off-white palette. The classic Hermès / Tiffany /
 * Rolex green-on-white pairing. Kept here so a future revert is one line.
 */
export const emeraldPalette: Palette = {
    name: "emerald",
    brand: {
        primary: "#047857",
        primaryHover: "#065F46",
        primaryActive: "#064E3B",
        primaryBg: "#ECFDF5",
        primaryBgDark: "#022C22",
        primaryDark: "#6EE7B7"
    },
    accent: {
        start: "#047857",
        end: "#10B981",
        rgb: "4, 120, 87",
        rgbDark: "110, 231, 183"
    },
    aurora: {
        deep: "#047857",
        mid: "#10B981",
        light: "#6EE7B7",
        cinematicBase: "#022C22"
    },
    page: {
        bgLight: "#FBFAF8",
        bgDark: "#0A0F0D",
        textLight: "rgba(15, 23, 42, 0.92)",
        textDark: "rgba(229, 231, 235, 0.92)"
    },
    avatarGradients: [
        "linear-gradient(135deg, #6EE7B7 0%, #10B981 100%)",
        "linear-gradient(135deg, #34D399 0%, #047857 100%)",
        "linear-gradient(135deg, #10B981 0%, #022C22 100%)",
        "linear-gradient(135deg, #6EE7B7 0%, #047857 100%)",
        "linear-gradient(135deg, #34D399 0%, #065F46 100%)",
        "linear-gradient(135deg, #10B981 0%, #047857 100%)"
    ]
};
