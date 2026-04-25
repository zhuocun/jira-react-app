import {
    act,
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import useReactMutation from "../../utils/hooks/useReactMutation";

import RegisterForm from ".";

jest.mock("../../utils/hooks/useReactMutation");

const mockedUseReactMutation = useReactMutation as jest.MockedFunction<
    typeof useReactMutation
>;

const mutateAsync = jest.fn();

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

const renderRegisterForm = ({
    isLoading = false,
    onError = jest.fn()
}: {
    isLoading?: boolean;
    onError?: jest.Mock;
} = {}) => {
    mockedUseReactMutation.mockReturnValue({
        isLoading,
        mutateAsync
    } as unknown as ReturnType<typeof useReactMutation<unknown>>);

    window.history.pushState({}, "Register", "/register");

    render(
        <BrowserRouter>
            <RegisterForm onError={onError} />
        </BrowserRouter>
    );

    return { onError };
};

const changeField = async (placeholder: string, value: string) => {
    await act(async () => {
        fireEvent.change(screen.getByPlaceholderText(placeholder), {
            target: { value }
        });
    });
};

const submitRegister = async () => {
    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /register/i }));
    });
};

describe("RegisterForm", () => {
    beforeAll(() => {
        installAntdBrowserMocks();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mutateAsync.mockResolvedValue({});
    });

    it("wires the register mutation with error handling", () => {
        const onError = jest.fn();

        renderRegisterForm({ onError });

        expect(mockedUseReactMutation).toHaveBeenCalledWith(
            "auth/register",
            "POST",
            undefined,
            undefined,
            onError,
            false
        );
    });

    it("validates required registration fields", async () => {
        renderRegisterForm();

        await submitRegister();

        expect(
            await screen.findByText("Please enter an email")
        ).toBeInTheDocument();
        expect(
            await screen.findByText("Enter your username")
        ).toBeInTheDocument();
        expect(
            await screen.findByText("Enter your password")
        ).toBeInTheDocument();
        expect(mutateAsync).not.toHaveBeenCalled();
    });

    it("validates email format", async () => {
        renderRegisterForm();

        await changeField("Email", "not-an-email");
        await changeField("Username", "Alice");
        await changeField("Password", "secret");
        await submitRegister();

        expect(
            await screen.findByText("Please enter a valid email address")
        ).toBeInTheDocument();
        expect(mutateAsync).not.toHaveBeenCalled();
    });

    it("clears the parent error as fields change", async () => {
        const { onError } = renderRegisterForm();

        await changeField("Email", "alice@example.com");
        await changeField("Username", "Alice");
        await changeField("Password", "secret");

        expect(onError).toHaveBeenCalledTimes(3);
        expect(onError).toHaveBeenCalledWith(null);
    });

    it("submits registration data and navigates to login", async () => {
        renderRegisterForm();

        await changeField("Email", "alice@example.com");
        await changeField("Username", "Alice");
        await changeField("Password", "secret");
        await submitRegister();

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith({
                email: "alice@example.com",
                password: "secret",
                username: "Alice"
            });
        });
        await waitFor(() => {
            expect(window.location.pathname).toBe("/login");
        });
    });

    it("keeps registration failures on the current page for inline error handling", async () => {
        mutateAsync.mockRejectedValue(new Error("Register failed"));
        renderRegisterForm();

        await changeField("Email", "alice@example.com");
        await changeField("Username", "Alice");
        await changeField("Password", "secret");
        await submitRegister();

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith({
                email: "alice@example.com",
                password: "secret",
                username: "Alice"
            });
        });
        expect(window.location.pathname).toBe("/register");
    });

    it("shows the submitting state from the mutation", () => {
        renderRegisterForm({ isLoading: true });

        expect(screen.getByRole("button", { name: /register/i })).toHaveClass(
            "ant-btn-loading"
        );
    });
});
