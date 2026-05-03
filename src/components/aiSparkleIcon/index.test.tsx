import { render, screen } from "@testing-library/react";

import AiSparkleIcon from "./index";

describe("AiSparkleIcon", () => {
    it("renders an accessible label by default", () => {
        render(<AiSparkleIcon />);
        // Default accessible name is "Board Copilot" via aria-label.
        expect(screen.getByLabelText("Board Copilot")).toBeInTheDocument();
        expect(screen.getByRole("img")).toBeInTheDocument();
    });

    it("uses the provided title as the accessible name", () => {
        render(<AiSparkleIcon title="Copilot brief" />);
        expect(screen.getByLabelText("Copilot brief")).toBeInTheDocument();
    });

    it("contributes nothing to the AX tree when aria-hidden", () => {
        render(<AiSparkleIcon aria-hidden />);
        // Decorative icons have no role of img and no name in the AX tree.
        expect(screen.queryByRole("img")).toBeNull();
        expect(screen.queryByLabelText("Board Copilot")).toBeNull();
    });
});
