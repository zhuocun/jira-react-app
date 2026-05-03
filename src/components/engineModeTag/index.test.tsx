/* eslint-disable global-require */
import { render, screen } from "@testing-library/react";

describe("EngineModeTag", () => {
    const originalAiBase = process.env.REACT_APP_AI_BASE_URL;

    afterEach(() => {
        jest.resetModules();
        process.env.REACT_APP_AI_BASE_URL = originalAiBase;
    });

    it("shows local engine label when no remote AI base URL is configured", () => {
        delete process.env.REACT_APP_AI_BASE_URL;
        jest.resetModules();
        jest.doMock("../../constants/env", () => ({
            __esModule: true,
            default: {
                aiBaseUrl: "",
                aiEnabled: true,
                aiUseLocalEngine: true,
                apiBaseUrl: "/api/v1"
            }
        }));
        const EngineModeTag = require(".").default;
        render(<EngineModeTag />);
        expect(screen.getByText("Local engine")).toBeInTheDocument();
    });

    it("shows remote AI label when a remote base URL is configured", () => {
        process.env.REACT_APP_AI_BASE_URL = "https://copilot.example";
        jest.resetModules();
        jest.doMock("../../constants/env", () => ({
            __esModule: true,
            default: {
                aiBaseUrl: "https://copilot.example",
                aiEnabled: true,
                aiUseLocalEngine: false,
                apiBaseUrl: "/api/v1"
            }
        }));
        const EngineModeTag = require(".").default;
        render(<EngineModeTag />);
        expect(screen.getByText("Remote AI service")).toBeInTheDocument();
    });
});
