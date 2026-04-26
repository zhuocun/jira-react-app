import resetRoute from "./resetRoute";

describe("resetRoute", () => {
    it("sets the browser location to the projects route on the current origin", () => {
        const location = {
            href: "https://jira.example/login",
            origin: "https://jira.example"
        };

        resetRoute(location);

        expect(location.href).toBe("https://jira.example/projects");
    });
});
