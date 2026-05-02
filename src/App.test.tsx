/* eslint-disable global-require */
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
    });

    render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </QueryClientProvider>
    );
};

beforeEach(() => {
    localStorage.clear();
});

describe("App", () => {
    it("redirects the root route to login", async () => {
        renderAppAt("/");

        await waitFor(() => {
            expect(window.location.pathname).toBe("/login");
        });
        expect(await screen.findByTestId("home-route")).toBeInTheDocument();
        expect(await screen.findByText("Login Route")).toBeInTheDocument();
    });

    it("renders a known auth route through the route tree", async () => {
        renderAppAt("/register");

        expect(await screen.findByTestId("home-route")).toBeInTheDocument();
        expect(await screen.findByText("Register Route")).toBeInTheDocument();
    });

    it("renders nested project board routes", async () => {
        renderAppAt("/projects/p1/board");

        expect(await screen.findByTestId("home-route")).toBeInTheDocument();
        expect(
            await screen.findByTestId("project-detail-route")
        ).toBeInTheDocument();
        expect(await screen.findByText("Board Route")).toBeInTheDocument();
    });
});
