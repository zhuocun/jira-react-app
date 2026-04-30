import { render, screen } from "@testing-library/react";

import ErrorBox from ".";

describe("ErrorBox", () => {
    it("renders Error messages and falls back for empty Error messages", () => {
        const { rerender } = render(
            <ErrorBox error={new Error("Unable to save")} />
        );

        expect(screen.getByText("Unable to save")).toBeInTheDocument();

        rerender(<ErrorBox error={new Error()} />);

        expect(screen.getByText("Operation failed")).toBeInTheDocument();
    });

    it("renders string API error responses", () => {
        render(<ErrorBox error={{ error: "Permission denied" }} />);

        expect(screen.getByText("Permission denied")).toBeInTheDocument();
    });

    it("renders the first validation error and falls back for empty messages", () => {
        const { rerender } = render(
            <ErrorBox
                error={{ error: [{ msg: "Project name is required" }] }}
            />
        );

        expect(
            screen.getByText("Project name is required")
        ).toBeInTheDocument();

        rerender(<ErrorBox error={{ error: [{ msg: "" }] }} />);

        expect(screen.getByText("Operation failed")).toBeInTheDocument();
    });

    it("falls back safely when the API error payload is malformed", () => {
        render(<ErrorBox error={{ error: [{}] } as unknown as IError} />);

        expect(screen.getByText("Operation failed")).toBeInTheDocument();
    });

    it("renders an empty live region placeholder when no error is present", () => {
        const { rerender } = render(<ErrorBox error={null} />);

        // Placeholder div remains in the DOM so the surrounding layout
        // doesn't shift when an error appears, and the live region is
        // already attached for screen readers.
        expect(screen.getByRole("alert")).toBeEmptyDOMElement();

        rerender(<ErrorBox error={{} as unknown} />);

        expect(screen.getByRole("alert")).toBeEmptyDOMElement();
    });
});
