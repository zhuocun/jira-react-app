import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";

import {
    ProjectModalStoreContext,
    projectModalStore
} from "../../store/projectModalStore";

import useProjectModal from "./useProjectModal";
import useReactQuery from "./useReactQuery";

jest.mock("./useReactQuery");

const mockedUseReactQuery = useReactQuery as jest.MockedFunction<
    typeof useReactQuery
>;

const project = (overrides: Partial<IProject> = {}): IProject => ({
    _id: "p1",
    createdAt: "2026-04-25T00:00:00.000Z",
    managerId: "u1",
    organization: "Product",
    projectName: "Roadmap",
    ...overrides
});

const queryResult = (overrides: Record<string, unknown> = {}) =>
    ({
        data: undefined,
        isLoading: false,
        ...overrides
    } as any);

const ProjectModalProbe = () => {
    const { closeModal, editingProject, isLoading, openModal, startEditing } =
        useProjectModal();
    const location = useLocation();

    return (
        <div>
            <span data-testid="search">{location.search}</span>
            <span data-testid="project">
                {editingProject?.projectName ?? "none"}
            </span>
            <span data-testid="loading">
                {isLoading ? "loading" : "loaded"}
            </span>
            <button type="button" onClick={openModal}>
                open
            </button>
            <button type="button" onClick={() => startEditing("p2")}>
                edit
            </button>
            <button type="button" onClick={closeModal}>
                close
            </button>
        </div>
    );
};

const renderProjectModalProbe = (route: string) =>
    render(
        <ProjectModalStoreContext.Provider value={projectModalStore}>
            <MemoryRouter initialEntries={[route]}>
                <ProjectModalProbe />
            </MemoryRouter>
        </ProjectModalStoreContext.Provider>
    );

describe("useProjectModal", () => {
    beforeEach(() => {
        projectModalStore.closeModalMobX();
        mockedUseReactQuery.mockReset();
        mockedUseReactQuery.mockReturnValue(queryResult());
    });

    afterEach(() => {
        projectModalStore.closeModalMobX();
    });

    it("opens the MobX modal store when modal=on is present", async () => {
        renderProjectModalProbe("/projects?modal=on");

        await waitFor(() => expect(projectModalStore.isModalOpened).toBe(true));
    });

    it("opens the MobX modal store and fetches the editing project when editingProjectId is present", async () => {
        mockedUseReactQuery.mockReturnValue(
            queryResult({
                data: project(),
                isLoading: true
            })
        );

        renderProjectModalProbe("/projects?editingProjectId=p1");

        await waitFor(() => expect(projectModalStore.isModalOpened).toBe(true));
        expect(mockedUseReactQuery).toHaveBeenCalledWith(
            "projects",
            { projectId: "p1" },
            "editingProject",
            undefined,
            undefined,
            true
        );
        expect(screen.getByTestId("project")).toHaveTextContent("Roadmap");
        expect(screen.getByTestId("loading")).toHaveTextContent("loading");
    });

    it("closes the MobX modal store when neither modal param is present", async () => {
        projectModalStore.openModalMobX();

        renderProjectModalProbe("/projects");

        await waitFor(() =>
            expect(projectModalStore.isModalOpened).toBe(false)
        );
        expect(mockedUseReactQuery).toHaveBeenCalledWith(
            "projects",
            { projectId: null },
            "editingProject",
            undefined,
            undefined,
            false
        );
    });

    it("writes modal and editing params and removes them on close", async () => {
        renderProjectModalProbe("/projects");

        fireEvent.click(screen.getByRole("button", { name: "open" }));

        await waitFor(() =>
            expect(screen.getByTestId("search")).toHaveTextContent("?modal=on")
        );

        fireEvent.click(screen.getByRole("button", { name: "edit" }));

        await waitFor(() =>
            expect(screen.getByTestId("search")).toHaveTextContent(
                "?editingProjectId=p2"
            )
        );

        fireEvent.click(screen.getByRole("button", { name: "close" }));

        await waitFor(() =>
            expect(screen.getByTestId("search")).toHaveTextContent("")
        );
        await waitFor(() =>
            expect(projectModalStore.isModalOpened).toBe(false)
        );
    });
});
