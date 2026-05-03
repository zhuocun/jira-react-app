import { Tag, Tooltip } from "antd";
import React from "react";

import environment from "../../constants/env";
import { microcopy } from "../../constants/microcopy";

/**
 * Shows whether the current AI surface is running through the local
 * deterministic engine or a configured remote AI service (Optimization
 * Plan §3 P2-6). Pairs with `CopilotPrivacyPopover` so the user sees both
 * "what is sent" and "where it runs" before sending a message.
 *
 * The tooltip explains the capability difference plainly — local mode
 * users should not blame "AI" for rule-based mistakes, and remote mode
 * users should know they're getting language-model output (review first).
 */
const EngineModeTag: React.FC = () => {
    const isLocal = environment.aiUseLocalEngine;
    const label = isLocal
        ? microcopy.ai.processingModeLocalLabel
        : microcopy.ai.processingModeRemoteLabel;
    const tooltip = isLocal
        ? microcopy.ai.engineCapabilityLocal
        : microcopy.ai.engineCapabilityRemote;
    return (
        <Tooltip title={tooltip}>
            <Tag
                color={isLocal ? "default" : "purple"}
                style={{ marginInlineEnd: 0 }}
            >
                {label}
            </Tag>
        </Tooltip>
    );
};

export default EngineModeTag;
