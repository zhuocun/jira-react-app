import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";

import useUrl from "./useUrl";

const UrlProbe = () => {
    const [{ managerId, projectName }, setParams] = useUrl([
        "projectName",
        "managerId"
    ]);
    const location = useLocation();

    return (
        <div>
            <span data-testid="projectName">{projectName ?? "null"}</span>
            <span data-testid="managerId">{managerId ?? "null"}</span>
            <span data-testid="search">{location.search}</span>
            <button
                type="button"
                onClick={() =>
                    setParams({
                        managerId: "u2",
                        projectName: "Billing"
                    })
                }
            >
                update
            </button>
            <button
                type="button"
                onClick={() =>
                    setParams({
                        managerId: "u2",
                        projectName: undefined
                    })
                }
            >
                clear project
            </button>
        </div>
    );
};

const renderUrlProbe = (route: string) =>
    render(
        <MemoryRouter initialEntries={[route]}>
            <UrlProbe />
        </MemoryRouter>
    );

describe("useUrl", () => {
    it("returns requested keys from the current URL search params", () => {
        renderUrlProbe("/projects?projectName=Roadmap&managerId=u1");

        expect(screen.getByTestId("projectName")).toHaveTextContent("Roadmap");
        expect(screen.getByTestId("managerId")).toHaveTextContent("u1");
    });

    it("updates one or more search params", async () => {
        renderUrlProbe("/projects?projectName=Roadmap&managerId=u1&extra=keep");

        fireEvent.click(screen.getByRole("button", { name: "update" }));

        await waitFor(() =>
            expect(screen.getByTestId("projectName")).toHaveTextContent(
                "Billing"
            )
        );
        expect(screen.getByTestId("managerId")).toHaveTextContent("u2");
        expect(screen.getByTestId("search")).toHaveTextContent(
            "projectName=Billing"
        );
        expect(screen.getByTestId("search")).toHaveTextContent("managerId=u2");
        expect(screen.getByTestId("search")).toHaveTextContent("extra=keep");
    });

    it("removes void params before writing the URL", async () => {
        renderUrlProbe("/projects?projectName=Roadmap&managerId=u1");

        fireEvent.click(screen.getByRole("button", { name: "clear project" }));

        await waitFor(() =>
            expect(screen.getByTestId("projectName")).toHaveTextContent("null")
        );
        expect(screen.getByTestId("managerId")).toHaveTextContent("u2");
        expect(screen.getByTestId("search")).toHaveTextContent("?managerId=u2");
    });

    it("preserves unrelated search params when multiple useUrl hooks update independently", async () => {
        const MultiHookProbe = () => {
            const [{ modal }, setModal] = useUrl(["modal"]);
            const [{ editingProjectId }, setEditingProjectId] = useUrl([
                "editingProjectId"
            ]);
            const location = useLocation();

            return (
                <div>
                    <span data-testid="modal">{modal ?? "null"}</span>
                    <span data-testid="editingProjectId">
                        {editingProjectId ?? "null"}
                    </span>
                    <span data-testid="search">{location.search}</span>
                    <button
                        type="button"
                        onClick={() => setModal({ modal: "on" })}
                    >
                        open modal
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            setEditingProjectId({ editingProjectId: "p2" })
                        }
                    >
                        start editing
                    </button>
                </div>
            );
        };

        render(
            <MemoryRouter initialEntries={["/projects?extra=keep"]}>
                <MultiHookProbe />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole("button", { name: "open modal" }));
        await waitFor(() =>
            expect(screen.getByTestId("search")).toHaveTextContent(
                "?extra=keep"
            )
        );

        fireEvent.click(screen.getByRole("button", { name: "start editing" }));

        await waitFor(() =>
            expect(screen.getByTestId("modal")).toHaveTextContent("on")
        );
        expect(screen.getByTestId("editingProjectId")).toHaveTextContent("p2");
        expect(screen.getByTestId("search")).toHaveTextContent("modal=on");
        expect(screen.getByTestId("search")).toHaveTextContent(
            "editingProjectId=p2"
        );
        expect(screen.getByTestId("search")).toHaveTextContent("extra=keep");
    });
});
