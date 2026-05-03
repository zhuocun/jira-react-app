import { fireEvent, render, screen } from "@testing-library/react";

import environment from "../../constants/env";
import { microcopy } from "../../constants/microcopy";
import { resetRemoteAiConsentForTests } from "../../utils/ai/remoteAiConsent";
import CopilotRemoteConsentNotice from "./index";

const setRemoteMode = (baseUrl: string) => {
    Object.defineProperty(environment, "aiUseLocalEngine", {
        configurable: true,
        value: baseUrl.length === 0,
        writable: true
    });
    Object.defineProperty(environment, "aiBaseUrl", {
        configurable: true,
        value: baseUrl,
        writable: true
    });
};

describe("CopilotRemoteConsentNotice", () => {
    const originalLocal = environment.aiUseLocalEngine;
    const originalUrl = environment.aiBaseUrl;

    afterEach(() => {
        resetRemoteAiConsentForTests();
        Object.defineProperty(environment, "aiUseLocalEngine", {
            configurable: true,
            value: originalLocal,
            writable: true
        });
        Object.defineProperty(environment, "aiBaseUrl", {
            configurable: true,
            value: originalUrl,
            writable: true
        });
    });

    it("renders nothing in local mode", () => {
        setRemoteMode("");
        const { container } = render(<CopilotRemoteConsentNotice />);
        expect(container.firstChild).toBeNull();
    });

    it("renders the consent banner when remote mode is active and not acknowledged", () => {
        setRemoteMode("https://copilot.example.com");
        render(<CopilotRemoteConsentNotice />);
        expect(
            screen.getByText(microcopy.ai.remoteConsentTitle)
        ).toBeInTheDocument();
        // Body interpolates the origin so the user sees where data goes.
        expect(screen.getByText(/copilot\.example\.com/i)).toBeInTheDocument();
    });

    it("disappears once the user accepts the consent", () => {
        setRemoteMode("https://copilot.example.com");
        render(<CopilotRemoteConsentNotice />);
        fireEvent.click(
            screen.getByRole("button", {
                name: microcopy.ai.remoteConsentAccept
            })
        );
        expect(
            screen.queryByText(microcopy.ai.remoteConsentTitle)
        ).not.toBeInTheDocument();
    });

    it("falls back to a generic body when the base URL has no parsable origin", () => {
        setRemoteMode("not-a-url");
        render(<CopilotRemoteConsentNotice />);
        expect(
            screen.getByText(microcopy.ai.remoteConsentBodyGeneric)
        ).toBeInTheDocument();
    });
});
