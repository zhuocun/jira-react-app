/* eslint-disable global-require */
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./mainLayout";

jest.mock("../components/header", () => {
    const React = require("react");

    return {
        __esModule: true,
        default: () => React.createElement("header", null, "App Header")
    };
});
jest.mock("../components/projectModal", () => {
    const React = require("react");

    return {
        __esModule: true,
        default: () => React.createElement("div", null, "Project Modal")
    };
});

describe("MainLayout", () => {
    it("renders the header, main outlet, and project modal", () => {
        const { container } = render(
            <MemoryRouter initialEntries={["/projects"]}>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route
                            path="/projects"
                            element={<div>Project workspace</div>}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("App Header")).toBeInTheDocument();
        expect(screen.getByText("Project workspace")).toBeInTheDocument();
        expect(screen.getByText("Project Modal")).toBeInTheDocument();
        expect(container.firstElementChild).toHaveStyle({
            display: "grid"
        });
        expect(container.firstElementChild?.tagName.toLowerCase()).toBe("div");
        expect(container.querySelector("main")).toHaveStyle({
            display: "flex"
        });
    });
});
