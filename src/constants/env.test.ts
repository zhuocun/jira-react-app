/* eslint-disable global-require */
describe("environment", () => {
    const originalApiUrl = process.env.REACT_APP_API_URL;

    afterEach(() => {
        jest.resetModules();
        process.env.REACT_APP_API_URL = originalApiUrl;
    });

    it("builds the API base URL from the React app API URL", () => {
        process.env.REACT_APP_API_URL = "https://jira-api.example";

        jest.resetModules();
        const environment = require("./env").default;

        expect(environment.apiBaseUrl).toBe("https://jira-api.example/api/v1");
    });

    it("reflects the environment value at module load time", () => {
        process.env.REACT_APP_API_URL = "http://localhost:8080";

        jest.resetModules();
        const environment = require("./env").default;

        expect(environment.apiBaseUrl).toBe("http://localhost:8080/api/v1");
    });
});
