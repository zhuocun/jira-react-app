import {
    confidenceBand,
    confidenceColor,
    confidenceLabel,
    confidencePercent
} from "./confidenceBand";

describe("confidenceBand", () => {
    it("maps probabilities into the PRD bands", () => {
        expect(confidenceBand(1)).toBe("High");
        expect(confidenceBand(0.9)).toBe("High");
        expect(confidenceBand(0.75)).toBe("High");
        expect(confidenceBand(0.74)).toBe("Moderate");
        expect(confidenceBand(0.45)).toBe("Moderate");
        expect(confidenceBand(0.44)).toBe("Low");
        expect(confidenceBand(0)).toBe("Low");
    });

    it("treats NaN as low confidence", () => {
        expect(confidenceBand(Number.NaN)).toBe("Low");
    });
});

describe("confidenceColor", () => {
    it("paints green / orange / red", () => {
        expect(confidenceColor("High")).toBe("green");
        expect(confidenceColor("Moderate")).toBe("orange");
        expect(confidenceColor("Low")).toBe("red");
    });
});

describe("confidencePercent", () => {
    it("rounds and clamps", () => {
        expect(confidencePercent(0.823)).toBe("82%");
        expect(confidencePercent(0.875)).toBe("88%");
        expect(confidencePercent(-0.2)).toBe("0%");
        expect(confidencePercent(1.4)).toBe("100%");
    });
});

describe("confidenceLabel", () => {
    it("combines band and percent", () => {
        expect(confidenceLabel(0.87)).toBe("High (87%)");
        expect(confidenceLabel(0.5)).toBe("Moderate (50%)");
        expect(confidenceLabel(0.2)).toBe("Low (20%)");
    });
});
