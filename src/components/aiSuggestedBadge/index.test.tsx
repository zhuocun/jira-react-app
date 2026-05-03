import { fireEvent, render, screen } from "@testing-library/react";

import { microcopy } from "../../constants/microcopy";
import AiSuggestedBadge from "./index";

describe("AiSuggestedBadge", () => {
    it("renders the full label by default", () => {
        render(<AiSuggestedBadge />);
        expect(
            screen.getByText(microcopy.ai.appliedSuggestion)
        ).toBeInTheDocument();
    });

    it("renders the compact label in dense layouts", () => {
        render(<AiSuggestedBadge compact />);
        expect(
            screen.getByText(microcopy.ai.appliedSuggestionShort)
        ).toBeInTheDocument();
    });

    it("opens a popover on click and exposes the revert affordance", () => {
        const onRevert = jest.fn();
        render(<AiSuggestedBadge onRevert={onRevert} />);
        const badge = screen.getByRole("button", {
            name: microcopy.ai.appliedSuggestion
        });
        fireEvent.click(badge);
        const revert = screen.getByText(microcopy.ai.revertToPrevious);
        fireEvent.click(revert);
        expect(onRevert).toHaveBeenCalledTimes(1);
    });

    it("falls back to the generic suggestionPopover copy when no rationale is provided", () => {
        render(<AiSuggestedBadge />);
        const badge = screen.getByRole("button", {
            name: microcopy.ai.appliedSuggestion
        });
        fireEvent.click(badge);
        expect(
            screen.getByText(microcopy.ai.suggestionPopover)
        ).toBeInTheDocument();
    });
});
