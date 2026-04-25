import { render, screen, waitFor } from "@testing-library/react";

import AuthProvider from "./authProvider";
import useAuth from "./hooks/useAuth";
import useReactQuery from "./hooks/useReactQuery";

jest.mock("./hooks/useAuth");
jest.mock("./hooks/useReactQuery");

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseReactQuery = useReactQuery as jest.MockedFunction<
    typeof useReactQuery
>;

const queryResult = (overrides: Record<string, unknown> = {}) =>
    ({
        error: null,
        isError: false,
        isIdle: false,
        isLoading: false,
        ...overrides
    } as any);

describe("AuthProvider", () => {
    beforeEach(() => {
        mockedUseAuth.mockReturnValue({
            logout: jest.fn(),
            refreshUser: jest.fn(),
            token: null,
            user: undefined
        });
        mockedUseReactQuery.mockReturnValue(queryResult());
    });

    it("refreshes user state on mount and renders children when auth is not blocking", async () => {
        const refreshUser = jest.fn();
        mockedUseAuth.mockReturnValue({
            logout: jest.fn(),
            refreshUser,
            token: null,
            user: undefined
        });

        render(
            <AuthProvider>
                <div>Project content</div>
            </AuthProvider>
        );

        expect(screen.getByText("Project content")).toBeInTheDocument();
        expect(mockedUseReactQuery).toHaveBeenCalledWith(
            "users",
            undefined,
            undefined,
            undefined,
            undefined,
            false
        );
        await waitFor(() => expect(refreshUser).toHaveBeenCalledTimes(1));
    });

    it("shows a full-page spinner while a token-backed user query is idle", () => {
        mockedUseAuth.mockReturnValue({
            logout: jest.fn(),
            refreshUser: jest.fn(),
            token: "stored-token",
            user: undefined
        });
        mockedUseReactQuery.mockReturnValue(
            queryResult({
                isIdle: true
            })
        );

        const { container } = render(
            <AuthProvider>
                <div>Hidden content</div>
            </AuthProvider>
        );

        expect(container.querySelector(".ant-spin")).toBeInTheDocument();
        expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
    });

    it("shows a full-page spinner while a token-backed user query is loading", () => {
        mockedUseAuth.mockReturnValue({
            logout: jest.fn(),
            refreshUser: jest.fn(),
            token: "stored-token",
            user: undefined
        });
        mockedUseReactQuery.mockReturnValue(
            queryResult({
                isLoading: true
            })
        );

        const { container } = render(
            <AuthProvider>
                <div>Hidden content</div>
            </AuthProvider>
        );

        expect(container.querySelector(".ant-spin")).toBeInTheDocument();
        expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
    });

    it("shows the page error when the user query fails", () => {
        mockedUseAuth.mockReturnValue({
            logout: jest.fn(),
            refreshUser: jest.fn(),
            token: "stored-token",
            user: undefined
        });
        mockedUseReactQuery.mockReturnValue(
            queryResult({
                error: new Error("Session refresh failed"),
                isError: true
            })
        );

        render(
            <AuthProvider>
                <div>Hidden content</div>
            </AuthProvider>
        );

        expect(screen.getByText("Session refresh failed")).toBeInTheDocument();
        expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
    });
});
