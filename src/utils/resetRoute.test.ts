import resetRoute from "./resetRoute";

describe("resetRoute", () => {
    const originalLocation = window.location;

    afterEach(() => {
        Object.defineProperty(window, "location", {
            configurable: true,
            value: originalLocation
        });
    });

    it("sets the browser location to the projects route on the current origin", () => {
        const location = {
            href: "https://jira.example/login",
            origin: "https://jira.example"
        };

        Object.defineProperty(window, "location", {
            configurable: true,
            value: location
        });

        resetRoute();

        expect(window.location.href).toBe("https://jira.example/projects");
    });
});
