import { render, screen } from "@testing-library/react";
import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

import { RootState } from "../store";

import AppProviders from "./appProviders";

jest.mock("./authProvider", () => ({
    __esModule: true,
    default: ({ children }: { children: ReactNode }) => (
        <div data-testid="auth-provider">{children}</div>
    )
}));

const ProviderProbe = () => {
    const queryClient = useQueryClient();
    const location = useLocation();
    const modalOpen = useSelector(
        (s: RootState) => s.projectModal.isModalOpened
    );

    return (
        <div>
            <span data-testid="has-query-client">
                {String(Boolean(queryClient))}
            </span>
            <span data-testid="path">{location.pathname}</span>
            <span data-testid="redux-modal">{String(modalOpen)}</span>
        </div>
    );
};

describe("AppProviders", () => {
    beforeEach(() => {
        localStorage.clear();
        window.history.pushState({}, "Projects", "/projects");
    });

    it("renders children under Redux, query, router, and auth providers", () => {
        render(
            <AppProviders>
                <ProviderProbe />
            </AppProviders>
        );

        expect(screen.getByTestId("has-query-client")).toHaveTextContent(
            "true"
        );
        expect(screen.getByTestId("path")).toHaveTextContent("/projects");
        expect(screen.getByTestId("redux-modal")).toHaveTextContent("false");
        expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    });
});
