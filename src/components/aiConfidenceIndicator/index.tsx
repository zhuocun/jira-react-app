import { Tag, Tooltip } from "antd";
import React from "react";

import { microcopy } from "../../constants/microcopy";
import {
    confidenceBand,
    confidenceColor,
    confidencePercent,
    type ConfidenceBand
} from "../../utils/ai/confidenceBand";

/**
 * Shared confidence indicator (Optimization Plan §3 P2-1).
 *
 * Surfaces the same band + percentage + tooltip everywhere AI emits a
 * structured suggestion (draft, estimate, brief, search, future
 * proposals). Centralizing the component keeps the band thresholds, color
 * map, and accessible label in one place — adding a new band only
 * requires editing `confidenceBand.ts` and the band copy below, not every
 * caller.
 *
 * The numeric percentage is intentionally *paired* with the qualitative
 * band per the AI UX best practices doc: NN/g and PAIR research shows
 * users underweight bare numbers (e.g. "82%") and overweight bare bands
 * ("High"). Showing both lets each audience read what they trust.
 */
interface AiConfidenceIndicatorProps {
    /** Raw 0–1 confidence value, typically from a model. */
    confidence: number;
    /**
     * Optional, plain-language tooltip override. Defaults to a generic
     * "Based on similar items" phrase; surfaces with a richer rationale
     * (the estimate panel cites similar tasks) should pass their own.
     */
    tooltip?: string;
    /** Render the band only, no percentage. Useful in dense layouts. */
    compact?: boolean;
}

const BAND_LABEL: Record<ConfidenceBand, string> = {
    High: microcopy.ai.confidenceBands.high,
    Moderate: microcopy.ai.confidenceBands.moderate,
    Low: microcopy.ai.confidenceBands.low
};

const AiConfidenceIndicator: React.FC<AiConfidenceIndicatorProps> = ({
    confidence,
    tooltip,
    compact = false
}) => {
    const band = confidenceBand(confidence);
    const percent = confidencePercent(confidence);
    const color = confidenceColor(band);
    const text = compact
        ? BAND_LABEL[band]
        : `${BAND_LABEL[band]} (${percent})`;
    const ariaLabel = `Confidence ${BAND_LABEL[band].toLowerCase()}, ${percent}`;
    const node = (
        <Tag
            aria-label={ariaLabel}
            color={color}
            style={{ marginInlineEnd: 0 }}
        >
            {text}
        </Tag>
    );
    if (!tooltip) return node;
    return <Tooltip title={tooltip}>{node}</Tooltip>;
};

export default AiConfidenceIndicator;
