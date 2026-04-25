/* eslint-disable global-require */
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

jest.mock("./pages/home", () => {
    const React = require("react");
    const { Outlet: RouterOutlet } = require("react-router");

    return {
        __esModule: true,
        default: () =>
            React.createElement(
                "section",
                { "data-testid": "home-route" },
                React.createElement(RouterOutlet)
            )
    };
});
jest.mock("./pages/login", () => {
    const React = require("react");

    return {
        __esModule: true,
        default: () => React.createElement("div", null, "Login Route")
    };
});
jest.mock("./pages/register", () => {
    const React = require("react");

    return {
        __esModule: true,
        default: () => React.createElement("div", null, "Register Route")
    };
});
jest.mock("./pages/project", () => {
    const React = require("react");

    return {
        __esModule: true,
        default: () => React.createElement("div", null, "Projects Route")
    };
});
jest.mock("./pages/projectDetail", () => {
    const React = require("react");
    const { Outlet: RouterOutlet } = require("react-router");

    return {
        __esModule: true,
        default: () =>
            React.createElement(
                "section",
                { "data-testid": "project-detail-route" },
                React.createElement(RouterOutlet)
            )
    };
});
jest.mock("./pages/board", () => {
    const React = require("react");

    return {
        __esModule: true,
        default: () => React.createElement("div", null, "Board Route")
    };
});

const renderAppAt = (path: string) => {
    window.history.pushState({}, "App", path);

    render(
        <BrowserRouter>
            <App />
        </BrowserRouter>
    );
};

describe("App", () => {
    it("redirects the root route to login", async () => {
        renderAppAt("/");

        await waitFor(() => {
            expect(window.location.pathname).toBe("/login");
        });
        expect(screen.getByTestId("home-route")).toBeInTheDocument();
        expect(screen.getByText("Login Route")).toBeInTheDocument();
    });

    it("renders a known auth route through the route tree", () => {
        renderAppAt("/register");

        expect(screen.getByTestId("home-route")).toBeInTheDocument();
        expect(screen.getByText("Register Route")).toBeInTheDocument();
    });

    it("renders nested project board routes", () => {
        renderAppAt("/projects/p1/board");

        expect(screen.getByTestId("home-route")).toBeInTheDocument();
        expect(screen.getByTestId("project-detail-route")).toBeInTheDocument();
        expect(screen.getByText("Board Route")).toBeInTheDocument();
    });
});
