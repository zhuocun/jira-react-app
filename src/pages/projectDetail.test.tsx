import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import ProjectDetailPage from "./projectDetail";

jest.mock("../components/projectPopover", () => ({
    __esModule: true,
    default: () => <span>Projects</span>
}));

const LocationProbe = () => {
    const location = useLocation();

    return <div data-testid="location">{location.pathname}</div>;
};

const renderDetail = (route: string) =>
    render(
        <MemoryRouter initialEntries={[route]}>
            <Routes>
                <Route
                    path="/projects/:projectId"
                    element={<ProjectDetailPage />}
                >
                    <Route path="board" element={<div>Board outlet</div>} />
                </Route>
                <Route path="*" element={<LocationProbe />} />
            </Routes>
            <LocationProbe />
        </MemoryRouter>
    );

describe("ProjectDetailPage", () => {
    it("redirects a project detail route to the board child route", async () => {
        renderDetail("/projects/project-1");

        await waitFor(() =>
            expect(screen.getByTestId("location")).toHaveTextContent(
                "/projects/project-1/board"
            )
        );
        expect(screen.getByText("Board outlet")).toBeInTheDocument();
    });

    it("renders the board and projects menu entries with the current board selected", () => {
        renderDetail("/projects/project-1/board");

        expect(screen.getByRole("link", { name: "Board" })).toHaveAttribute(
            "href",
            "/projects/project-1/board"
        );
        expect(screen.getByText("Projects")).toBeInTheDocument();
        expect(screen.getByText("Board").closest(".ant-menu-item")).toHaveClass(
            "ant-menu-item-selected"
        );
    });
});
