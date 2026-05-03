import { render, screen } from "@testing-library/react";

import environment from "../../constants/env";
import { microcopy } from "../../constants/microcopy";
import EngineModeTag from "./index";

describe("EngineModeTag", () => {
    const originalUseLocal = environment.aiUseLocalEngine;

    afterEach(() => {
        // Reset the env mutation between tests so the suite stays
        // independent of execution order.
        Object.defineProperty(environment, "aiUseLocalEngine", {
            configurable: true,
            value: originalUseLocal,
            writable: true
        });
    });

    it("renders the local label when the engine runs locally", () => {
        Object.defineProperty(environment, "aiUseLocalEngine", {
            configurable: true,
            value: true,
            writable: true
        });
        render(<EngineModeTag />);
        expect(
            screen.getByText(microcopy.ai.processingModeLocalLabel)
        ).toBeInTheDocument();
    });

    it("renders the remote label when an AI base URL is configured", () => {
        Object.defineProperty(environment, "aiUseLocalEngine", {
            configurable: true,
            value: false,
            writable: true
        });
        render(<EngineModeTag />);
        expect(
            screen.getByText(microcopy.ai.processingModeRemoteLabel)
        ).toBeInTheDocument();
    });
});
