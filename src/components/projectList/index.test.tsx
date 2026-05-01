import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Modal } from "antd";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import useAuth from "../../utils/hooks/useAuth";
import useProjectModal from "../../utils/hooks/useProjectModal";
import useReactMutation from "../../utils/hooks/useReactMutation";

import ProjectList from ".";

jest.mock("../../utils/hooks/useAuth");
jest.mock("../../utils/hooks/useProjectModal");
jest.mock("../../utils/hooks/useReactMutation");

type DropdownMenuItem = {
    key?: string | number;
    label?: ReactNode;
};

type DropdownMockProps = {
    children: ReactNode;
    menu?: {
        items?: DropdownMenuItem[];
    };
};

jest.mock("antd", () => {
    const actual = jest.requireActual("antd");
    const React = jest.requireActual("react");

    return {
        ...actual,
        Dropdown: ({ children, menu }: DropdownMockProps) =>
            React.createElement(
                "div",
                null,
                children,
                React.createElement(
                    "div",
                    { "data-testid": "dropdown-menu" },
                    menu?.items?.map((item) =>
                        React.createElement(
                            "div",
                            { key: item.key },
                            item.label
                        )
                    )
                )
            )
    };
});

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseProjectModal = useProjectModal as jest.Mock;
const mockedUseReactMutation = useReactMutation as jest.Mock;

const member = (overrides: Partial<IMember> = {}): IMember => ({
    _id: "member-1",
    email: "alice@example.com",
    username: "Alice",
    ...overrides
});

const user = (overrides: Partial<IUser> = {}): IUser => ({
    ...member(),
    jwt: "token",
    likedProjects: [],
    ...overrides
});

const project = (overrides: Partial<IProject> = {}): IProject => ({
    _id: "project-1",
    createdAt: "2026-04-25T00:00:00.000Z",
    managerId: "member-1",
    organization: "Product",
    projectName: "Roadmap",
    ...overrides
});

const members = [
    member(),
    member({
        _id: "member-2",
        email: "bob@example.com",
        username: "Bob"
    })
];

const likeProject = jest.fn();
const removeProject = jest.fn();
const refreshUser = jest.fn();
const startEditing = jest.fn();

const installAntdBrowserMocks = () => {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: (query: string) => ({
            addEventListener: jest.fn(),
            addListener: jest.fn(),
            dispatchEvent: jest.fn(),
            matches: false,
            media: query,
            onchange: null,
            removeEventListener: jest.fn(),
            removeListener: jest.fn()
        })
    });
};

const renderList = ({
    dataSource = [
        project(),
        project({
            _id: "project-2",
            createdAt: "",
            managerId: "missing-member",
            organization: "Design",
            projectName: "Design System"
        })
    ],
    currentUser = user(),
    loading = false
}: {
    dataSource?: IProject[];
    currentUser?: IUser;
    loading?: boolean;
} = {}) => {
    window.history.pushState({}, "Projects", "/projects");
    mockedUseAuth.mockReturnValue({
        logout: jest.fn(),
        refreshUser,
        token: "token",
        user: currentUser
    });
    mockedUseProjectModal.mockReturnValue({
        openModal: jest.fn(),
        startEditing
    });
    mockedUseReactMutation.mockImplementation((endpoint: string) =>
        endpoint === "users/likes"
            ? { mutateAsync: likeProject }
            : { mutate: removeProject }
    );

    return render(
        <MemoryRouter initialEntries={["/projects"]}>
            <Routes>
                <Route
                    path="/projects"
                    element={
                        <ProjectList
                            dataSource={dataSource}
                            loading={loading}
                            members={members}
                        />
                    }
                />
            </Routes>
        </MemoryRouter>
    );
};

describe("ProjectList", () => {
    beforeAll(() => {
        installAntdBrowserMocks();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        likeProject.mockResolvedValue({});
    });

    it("renders project rows with manager, fallback, date, and relative links", async () => {
        renderList();

        expect(screen.getByRole("link", { name: /Roadmap/i })).toHaveAttribute(
            "href",
            "/projects/project-1"
        );
        expect(screen.getByText("Product")).toBeInTheDocument();
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Apr 25, 2026")).toBeInTheDocument();
        expect(screen.getByText("Design System")).toBeInTheDocument();
        expect(screen.getByText("No manager")).toBeInTheDocument();
        expect(screen.getByText("No date")).toBeInTheDocument();
        await waitFor(() => expect(refreshUser).toHaveBeenCalledTimes(1));
    });

    it("shows the empty state when there are no projects", () => {
        renderList({
            dataSource: [],
            loading: false
        });

        expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /create project/i })
        ).toBeInTheDocument();
    });

    it("calls the like mutation and flips the visible heart while pending", async () => {
        likeProject.mockReturnValue(
            new Promise(() => {
                // Keep the mutation pending so the optimistic heart state remains visible.
            })
        );
        renderList({
            currentUser: user({ likedProjects: ["project-1"] })
        });

        const unlikeButton = screen.getByRole("button", {
            name: /unlike roadmap/i
        });
        expect(unlikeButton).toHaveAttribute("aria-pressed", "true");

        fireEvent.click(unlikeButton);

        expect(likeProject).toHaveBeenCalledWith({ projectId: "project-1" });
        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: /like roadmap/i })
            ).toHaveAttribute("aria-pressed", "false");
        });
    });

    it("clears the optimistic liked project when the like mutation resolves", async () => {
        likeProject.mockResolvedValue({});
        renderList();
        const likeButton = screen.getByRole("button", {
            name: /like roadmap/i
        });

        fireEvent.click(likeButton);

        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: /like roadmap/i })
            ).toHaveAttribute("aria-pressed", "false");
        });
    });

    it("sorts project links by name from the Project header", async () => {
        renderList({
            dataSource: [
                project({ _id: "project-z", projectName: "Zulu" }),
                project({ _id: "project-a", projectName: "Alpha" })
            ]
        });

        fireEvent.click(screen.getByRole("columnheader", { name: /Project/ }));

        await waitFor(() => {
            expect(
                screen.getAllByRole("link").map((link) => link.textContent)
            ).toEqual(["Alpha", "Zulu"]);
        });
    });

    it("opens the edit flow from row actions", () => {
        renderList();

        fireEvent.click(
            screen.getByRole("button", { name: /^edit roadmap$/i })
        );

        expect(startEditing).toHaveBeenCalledWith("project-1");
    });

    it("confirms project deletion before calling the delete mutation", () => {
        const confirmSpy = jest
            .spyOn(Modal, "confirm")
            .mockImplementation((config) => {
                config.onOk?.();
                return {
                    destroy: jest.fn(),
                    update: jest.fn()
                } as ReturnType<typeof Modal.confirm>;
            });
        renderList();

        fireEvent.click(
            screen.getByRole("button", { name: /^delete roadmap$/i })
        );

        expect(confirmSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                content: "This action cannot be undone.",
                title: "Delete this project?"
            })
        );
        expect(removeProject).toHaveBeenCalledWith({
            projectId: "project-1"
        });

        confirmSpy.mockRestore();
    });
});
