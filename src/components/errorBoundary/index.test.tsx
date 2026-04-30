import { fireEvent, render, screen } from "@testing-library/react";

import ErrorBoundary from ".";

const Boom: React.FC<{ message?: string }> = ({ message = "kaboom" }) => {
    throw new Error(message);
};

const installAntdBrowserMocks = () => {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: () => ({
            addEventListener: jest.fn(),
            addListener: jest.fn(),
            dispatchEvent: jest.fn(),
            matches: false,
            media: "",
            onchange: null,
            removeEventListener: jest.fn(),
            removeListener: jest.fn()
        })
    });
};

describe("ErrorBoundary", () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeAll(() => {
        installAntdBrowserMocks();
    });

    beforeEach(() => {
        // React always logs caught errors at console.error; silence to keep
        // the suite clean.
        consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it("renders children when no error is thrown", () => {
        render(
            <ErrorBoundary>
                <span>OK</span>
            </ErrorBoundary>
        );
        expect(screen.getByText("OK")).toBeInTheDocument();
    });

    it("renders the default fallback with the error message and a Retry button", () => {
        render(
            <ErrorBoundary>
                <Boom message="Network down" />
            </ErrorBoundary>
        );

        expect(
            screen.getByText(/something went wrong/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/network down/i)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /retry/i })
        ).toBeInTheDocument();
    });

    it("calls a custom fallback when provided", () => {
        const fallback = jest.fn(
            (error: Error, retry: () => void) => (
                <button onClick={retry} type="button">
                    custom: {error.message}
                </button>
            )
        );

        render(
            <ErrorBoundary fallback={fallback}>
                <Boom message="boom-1" />
            </ErrorBoundary>
        );

        expect(fallback).toHaveBeenCalled();
        expect(
            screen.getByRole("button", { name: /custom: boom-1/i })
        ).toBeInTheDocument();
    });

    it("clears the error when Retry is pressed and remounts children", () => {
        let shouldThrow = true;
        const Maybe = () => {
            if (shouldThrow) throw new Error("first try");
            return <span>recovered</span>;
        };

        render(
            <ErrorBoundary>
                <Maybe />
            </ErrorBoundary>
        );

        expect(screen.getByText(/first try/i)).toBeInTheDocument();
        shouldThrow = false;
        fireEvent.click(screen.getByRole("button", { name: /retry/i }));
        expect(screen.getByText("recovered")).toBeInTheDocument();
    });
});
