/* eslint-disable global-require */
describe("environment", () => {
    const originalApiUrl = process.env.REACT_APP_API_URL;
    const originalAiBase = process.env.REACT_APP_AI_BASE_URL;
    const originalAiEnabled = process.env.REACT_APP_AI_ENABLED;

    afterEach(() => {
        jest.resetModules();
        process.env.REACT_APP_API_URL = originalApiUrl;
        process.env.REACT_APP_AI_BASE_URL = originalAiBase;
        process.env.REACT_APP_AI_ENABLED = originalAiEnabled;
    });

    it("builds the API base URL from the React app API URL", () => {
        process.env.REACT_APP_API_URL = "https://jira-api.example";
        delete process.env.REACT_APP_AI_BASE_URL;
        delete process.env.REACT_APP_AI_ENABLED;

        jest.resetModules();
        const environment = require("./env").default;

        expect(environment.apiBaseUrl).toBe("https://jira-api.example/api/v1");
    });

    it("defaults the API origin when REACT_APP_API_URL is unset", () => {
        delete process.env.REACT_APP_API_URL;
        delete process.env.REACT_APP_AI_BASE_URL;
        delete process.env.REACT_APP_AI_ENABLED;

        jest.resetModules();
        const environment = require("./env").default;

        expect(environment.apiBaseUrl).toBe(
            "https://jira-python-server.vercel.app/api/v1"
        );
    });

    it("reflects the environment value at module load time", () => {
        process.env.REACT_APP_API_URL = "http://localhost:8080";
        delete process.env.REACT_APP_AI_BASE_URL;
        delete process.env.REACT_APP_AI_ENABLED;

        jest.resetModules();
        const environment = require("./env").default;

        expect(environment.apiBaseUrl).toBe("http://localhost:8080/api/v1");
    });

    it("defaults AI to enabled with the local engine when no flags are set", () => {
        delete process.env.REACT_APP_AI_BASE_URL;
        delete process.env.REACT_APP_AI_ENABLED;

        jest.resetModules();
        const environment = require("./env").default;

        expect(environment.aiEnabled).toBe(true);
        expect(environment.aiBaseUrl).toBe("");
        expect(environment.aiUseLocalEngine).toBe(true);
    });

    it("turns AI off when the flag is set to false", () => {
        process.env.REACT_APP_AI_ENABLED = "false";

        jest.resetModules();
        const environment = require("./env").default;

        expect(environment.aiEnabled).toBe(false);
    });

    it("uses the remote proxy when an AI base URL is provided", () => {
        process.env.REACT_APP_AI_BASE_URL = "https://copilot.example";

        jest.resetModules();
        const environment = require("./env").default;

        expect(environment.aiBaseUrl).toBe("https://copilot.example");
        expect(environment.aiUseLocalEngine).toBe(false);
    });
});

export {};
