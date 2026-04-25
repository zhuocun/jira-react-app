import { waitFor } from "@testing-library/react";
import { getCLS, getFCP, getFID, getLCP, getTTFB } from "web-vitals";

import reportWebVitals from "./reportWebVitals";

jest.mock("web-vitals", () => ({
    getCLS: jest.fn(),
    getFCP: jest.fn(),
    getFID: jest.fn(),
    getLCP: jest.fn(),
    getTTFB: jest.fn()
}));

const vitals = [getCLS, getFID, getFCP, getLCP, getTTFB] as jest.Mock[];

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
