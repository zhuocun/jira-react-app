/* eslint-disable global-require */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import useAuth from "../../utils/hooks/useAuth";
import useAiEnabled from "../../utils/hooks/useAiEnabled";
import resetRoute from "../../utils/resetRoute";

import Header from ".";

jest.mock("../../assets/logo-software.svg?react", () => {
    const React = require("react");

    return {
        __esModule: true,
        default: (props: Record<string, unknown>) =>
            React.createElement("svg", {
                "aria-label": "Jira Software",
                ...props
            })
    };
});
jest.mock("../../utils/hooks/useAuth");
jest.mock("../../utils/hooks/useAiEnabled");
jest.mock("../../utils/resetRoute");
jest.mock("../memberPopover", () => {
    const React = require("react");

    return {
        __esModule: true,
        default: () => React.createElement("span", null, "Members")
    };
});

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseAiEnabled = useAiEnabled as jest.MockedFunction<
    typeof useAiEnabled
>;
const mockedResetRoute = resetRoute as jest.MockedFunction<typeof resetRoute>;

const user = (overrides: Partial<IUser> = {}): IUser => ({
    _id: "u1",
    email: "alice@example.com",
    jwt: "jwt-1",
    likedProjects: [],
    username: "Alice",
    ...overrides
});

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

const renderHeader = (
    path = "/projects/p1/board",
    ai?: Partial<{
        available: boolean;
        enabled: boolean;
        setEnabled: (next: boolean) => void;
    }>
) => {
    const logout = jest.fn();

    mockedUseAuth.mockReturnValue({
        logout,
        refreshUser: jest.fn(),
        token: "jwt-1",
        user: user()
    });
    mockedUseAiEnabled.mockReturnValue({
        available: true,
        enabled: true,
        setEnabled: jest.fn(),
        ...ai
    });

    window.history.pushState({}, "Header", path);

    render(
        <BrowserRouter>
            <Header />
        </BrowserRouter>
    );

    return { logout };
};

describe("Header", () => {
    beforeAll(() => {
        installAntdBrowserMocks();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders logo, member navigation, and the current user greeting", () => {
        renderHeader();

        expect(
            screen.getByRole("button", { name: /jira software/i })
        ).toBeInTheDocument();
        expect(screen.getByText("Members")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /hi, alice/i })
        ).toBeInTheDocument();
    });

    it("resets to projects when the logo is clicked outside the projects list", () => {
        renderHeader("/projects/p1/board");

        fireEvent.click(screen.getByRole("button", { name: /jira software/i }));

        expect(mockedResetRoute).toHaveBeenCalledTimes(1);
    });

    it("does not reset when already on the projects list", () => {
        renderHeader("/projects");

        fireEvent.click(screen.getByRole("button", { name: /jira software/i }));

        expect(mockedResetRoute).not.toHaveBeenCalled();
    });

    it("prevents default navigation from the account trigger", () => {
        renderHeader();

        expect(
            fireEvent.click(screen.getByRole("button", { name: /hi, alice/i }))
        ).toBe(false);
    });

    it("calls logout from the account dropdown", async () => {
        const { logout } = renderHeader();

        fireEvent.mouseEnter(
            screen.getByRole("button", { name: /hi, alice/i })
        );

        fireEvent.click(await screen.findByRole("button", { name: /logout/i }));

        await waitFor(() => {
            expect(logout).toHaveBeenCalledTimes(1);
        });
    });

    it("renders the Board Copilot toggle when AI is available at build time", () => {
        renderHeader();
        expect(
            screen.getByRole("switch", { name: /enable board copilot/i })
        ).toBeInTheDocument();
    });

    it("does not render the Board Copilot toggle when AI is disabled at build time", () => {
        renderHeader("/projects/p1/board", {
            available: false,
            enabled: false,
            setEnabled: jest.fn()
        });
        expect(
            screen.queryByRole("switch", { name: /enable board copilot/i })
        ).not.toBeInTheDocument();
    });

    it("persists Board Copilot off when the switch is turned off", () => {
        const setEnabled = jest.fn();
        renderHeader("/projects/p1/board", {
            available: true,
            enabled: true,
            setEnabled
        });
        fireEvent.click(
            screen.getByRole("switch", { name: /enable board copilot/i })
        );
        expect(setEnabled.mock.calls[0][0]).toBe(false);
    });
});
