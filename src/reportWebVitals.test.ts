import { waitFor } from "@testing-library/react";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

import reportWebVitals from "./reportWebVitals";

jest.mock("web-vitals", () => ({
    onCLS: jest.fn(),
    onFCP: jest.fn(),
    onINP: jest.fn(),
    onLCP: jest.fn(),
    onTTFB: jest.fn()
}));

const vitals = [onCLS, onFCP, onINP, onLCP, onTTFB] as jest.Mock[];

describe("reportWebVitals", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("does nothing when no performance callback is supplied", async () => {
        reportWebVitals();

        await Promise.resolve();

        vitals.forEach((metric) => {
            expect(metric).not.toHaveBeenCalled();
        });
    });

    it("passes the performance callback to each web-vitals metric", async () => {
        const onPerfEntry = jest.fn();

        reportWebVitals(onPerfEntry);

        await waitFor(() => {
            vitals.forEach((metric) => {
                expect(metric).toHaveBeenCalledWith(onPerfEntry);
            });
        });
    });
});
