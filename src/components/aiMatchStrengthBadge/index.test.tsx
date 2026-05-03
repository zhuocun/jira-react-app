import { render, screen } from "@testing-library/react";

import AiMatchStrengthBadge from "./index";

describe("AiMatchStrengthBadge", () => {
    it("renders nothing when strength is null", () => {
        const { container } = render(<AiMatchStrengthBadge strength={null} />);
        expect(container.firstChild).toBeNull();
    });

    it("renders the band label in default mode", () => {
        render(<AiMatchStrengthBadge strength="strong" />);
        expect(screen.getByText("Strong match")).toBeInTheDocument();
    });

    it("renders an aria-label that calls out the strength for screen readers", () => {
        render(<AiMatchStrengthBadge strength="moderate" />);
        expect(
            screen.getByLabelText(/Match strength Partial match/i)
        ).toBeInTheDocument();
    });

    it("hides the visible label in compact mode but keeps the aria-label", () => {
        render(<AiMatchStrengthBadge compact strength="weak" />);
        expect(screen.queryByText("Weak match")).toBeNull();
        expect(
            screen.getByLabelText(/Match strength Weak match/i)
        ).toBeInTheDocument();
    });
});
