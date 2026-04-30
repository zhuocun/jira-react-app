import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

import EmptyState from ".";

expect.extend(toHaveNoViolations);

describe("EmptyState", () => {
    it("renders title, description, and CTA", () => {
        render(
            <EmptyState
                cta={<button type="button">Create one</button>}
                description="Get started by creating your first project."
                title="No projects yet"
            />
        );

        expect(
            screen.getByRole("heading", { name: /no projects yet/i })
        ).toBeInTheDocument();
        expect(
            screen.getByText(/get started by creating your first project/i)
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /create one/i })
        ).toBeInTheDocument();
    });

    it("falls back to a generic Empty image when no illustration is given", () => {
        const { container } = render(<EmptyState title="Nothing here" />);
        expect(container.querySelector(".ant-empty")).toBeInTheDocument();
    });

    it("has no axe-detectable accessibility violations", async () => {
        const { container } = render(
            <EmptyState
                description="Try again later."
                title="No tasks"
            />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
