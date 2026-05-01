/**
 * Calibrated confidence bands for AI surfaces (PRD v3 §3, X-R6).
 *
 * Confidence is shown to users as `[Band] (percentage%)` so people without
 * a probability intuition can still calibrate trust. Thresholds match the
 * PRD glossary: High ≥75%, Moderate 45–74%, Low <45%.
 *
 * The band label is paired with a semantic color (see {@link confidenceColor})
 * — green / orange / red — so screen readers and sighted users get the same
 * signal. Down-stream surfaces should never show a raw 0–1 number.
 */

export type ConfidenceBand = "Low" | "Moderate" | "High";

export const confidenceBand = (confidence: number): ConfidenceBand => {
    if (!Number.isFinite(confidence)) return "Low";
    if (confidence >= 0.75) return "High";
    if (confidence >= 0.45) return "Moderate";
    return "Low";
};

/** AntD Tag color for each band. Aligned with the global semantic palette. */
export const confidenceColor = (
    band: ConfidenceBand
): "green" | "orange" | "red" => {
    if (band === "High") return "green";
    if (band === "Moderate") return "orange";
    return "red";
};

/** Two-decimal percentage string. Returns `"82%"` for `0.823`. */
export const confidencePercent = (confidence: number): string => {
    if (!Number.isFinite(confidence)) return "0%";
    const clamped = Math.max(0, Math.min(1, confidence));
    return `${Math.round(clamped * 100)}%`;
};

/** Compound display string: `"High (87%)"`. */
export const confidenceLabel = (confidence: number): string => {
    return `${confidenceBand(confidence)} (${confidencePercent(confidence)})`;
};
