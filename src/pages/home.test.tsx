/* eslint-disable global-require */
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import useAuth from "../utils/hooks/useAuth";
import resetRoute from "../utils/resetRoute";

import HomePage from "./home";

jest.mock("../layouts/authLayout", () => {
    const React = require("react");

    return {
        __esModule: true,
        default: () =>
            React.createElement("div", { "data-testid": "auth-layout" }, "Auth")
    };
});
jest.mock("../layouts/mainLayout", () => {
    const React = require("react");

    return {
        __esModule: true,
        default: () =>
            React.createElement("div", { "data-testid": "main-layout" }, "Main")
    };
});
jest.mock("../utils/hooks/useAuth");
jest.mock("../utils/resetRoute");

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedResetRoute = resetRoute as jest.MockedFunction<typeof resetRoute>;

const user = (overrides: Partial<IUser> = {}): IUser => ({
    _id: "u1",
    email: "alice@example.com",
    jwt: "jwt-1",
    likedProjects: [],
    username: "Alice",
    ...overrides
});

const renderHome = ({
    path,
    token,
    currentUser
}: {
    path: string;
    token: string | null;
    currentUser?: IUser;
}) => {
    const logout = jest.fn();

    mockedUseAuth.mockReturnValue({
        logout,
        refreshUser: jest.fn(),
        token,
        user: currentUser
    });

    window.history.pushState({}, "Home", path);

    render(
        <BrowserRouter>
            <HomePage />
        </BrowserRouter>
    );

    return { logout };
};

describe("HomePage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("resets authenticated users away from auth routes", async () => {
        renderHome({
            currentUser: user(),
            path: "/login",
            token: "jwt-1"
        });

        expect(screen.getByTestId("main-layout")).toBeInTheDocument();
        await waitFor(() => {
            expect(mockedResetRoute).toHaveBeenCalledTimes(1);
        });
    });

    it("logs out anonymous users from protected routes", async () => {
        const { logout } = renderHome({
            path: "/projects",
            token: null
        });

        expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
        await waitFor(() => {
            expect(logout).toHaveBeenCalledTimes(1);
        });
    });

    it("renders the main layout for authenticated protected routes", () => {
        renderHome({
            currentUser: user(),
            path: "/projects",
            token: "jwt-1"
        });

        expect(screen.getByTestId("main-layout")).toBeInTheDocument();
        expect(mockedResetRoute).not.toHaveBeenCalled();
    });

    it("renders the auth layout for anonymous auth routes", () => {
        const { logout } = renderHome({
            path: "/register",
            token: null
        });

        expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
        expect(logout).not.toHaveBeenCalled();
    });
});
