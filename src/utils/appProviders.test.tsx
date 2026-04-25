import { render, screen } from "@testing-library/react";
import { ReactNode, useContext } from "react";
import { useQueryClient } from "react-query";
import { useLocation } from "react-router-dom";

import {
    ProjectModalStoreContext,
    projectModalStore
} from "../store/projectModalStore";

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
    const modalStore = useContext(ProjectModalStoreContext);

    return (
        <div>
            <span data-testid="has-query-client">
                {String(Boolean(queryClient))}
            </span>
            <span data-testid="path">{location.pathname}</span>
            <span data-testid="has-modal-store">
                {String(modalStore === projectModalStore)}
            </span>
        </div>
    );
};

describe("AppProviders", () => {
    beforeEach(() => {
        localStorage.clear();
        window.history.pushState({}, "Projects", "/projects");
    });

    it("renders children under query, router, auth, and modal providers", () => {
        render(
            <AppProviders>
                <ProviderProbe />
            </AppProviders>
        );

        expect(screen.getByTestId("has-query-client")).toHaveTextContent(
            "true"
        );
        expect(screen.getByTestId("path")).toHaveTextContent("/projects");
        expect(screen.getByTestId("has-modal-store")).toHaveTextContent("true");
        expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    });
});
