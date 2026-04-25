import deleteProjectCallback from "./deleteProject";

const project = (overrides: Partial<IProject> = {}): IProject => ({
    _id: "project-1",
    projectName: "Jira clone",
    managerId: "member-1",
    organization: "Product",
    createdAt: "2026-04-25T00:00:00.000Z",
    ...overrides
});

describe("deleteProjectCallback", () => {
    it("returns undefined when there is no existing project cache", () => {
        expect(
            deleteProjectCallback({ projectId: "project-1" }, undefined)
        ).toBeUndefined();
    });

    it("removes the matching project from the existing cache", () => {
        const oldProjects = [
            project({ _id: "project-1", projectName: "Alpha" }),
            project({ _id: "project-2", projectName: "Beta" }),
            project({ _id: "project-3", projectName: "Gamma" })
        ];

        const result = deleteProjectCallback(
            { projectId: "project-2" },
            oldProjects
        );

        expect(result).toBe(oldProjects);
        expect(result?.map((item) => item._id)).toEqual([
            "project-1",
            "project-3"
        ]);
    });

    it("documents current missing-target behavior by removing the first project", () => {
        const oldProjects = [
            project({ _id: "project-1", projectName: "Alpha" }),
            project({ _id: "project-2", projectName: "Beta" })
        ];

        const result = deleteProjectCallback(
            { projectId: "missing" },
            oldProjects
        );

        expect(result?.map((item) => item._id)).toEqual(["project-2"]);
    });
});
