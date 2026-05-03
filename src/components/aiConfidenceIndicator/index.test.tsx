import { render, screen } from "@testing-library/react";

import AiConfidenceIndicator from "./index";

describe("AiConfidenceIndicator", () => {
    it("renders the band and percentage when not compact", () => {
        render(<AiConfidenceIndicator confidence={0.83} />);
        expect(screen.getByText("High (83%)")).toBeInTheDocument();
    });

    it("renders the band only in compact mode", () => {
        render(<AiConfidenceIndicator compact confidence={0.4} />);
        expect(screen.getByText("Low")).toBeInTheDocument();
        expect(screen.queryByText(/%/)).toBeNull();
    });

    it("includes a screen-reader-friendly label that pairs band and percent", () => {
        render(<AiConfidenceIndicator confidence={0.55} />);
        expect(
            screen.getByLabelText("Confidence moderate, 55%")
        ).toBeInTheDocument();
    });
});
