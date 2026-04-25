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

    it("renders nothing when no supported error is present", () => {
        const { container, rerender } = render(<ErrorBox error={null} />);

        expect(container).toBeEmptyDOMElement();

        rerender(<ErrorBox error={{}} />);

        expect(container).toBeEmptyDOMElement();
    });
});
