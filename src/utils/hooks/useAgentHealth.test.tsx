import { renderHook, waitFor } from "@testing-library/react";

import useAgentHealth from "./useAgentHealth";

const okResponse = (data: unknown) =>
    ({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(data),
        text: jest.fn().mockResolvedValue(JSON.stringify(data)),
        headers: { get: () => null, has: () => false }
    }) as unknown as Response;

describe("useAgentHealth", () => {
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
        fetchSpy = jest.spyOn(global, "fetch");
    });

    afterEach(() => {
        fetchSpy.mockRestore();
        jest.useRealTimers();
    });

    it("reports offline when baseUrl is empty (does not fetch)", () => {
        const { result } = renderHook(() => useAgentHealth(""));
        expect(result.current.status).toBe("offline");
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("reports ok after a successful health probe", async () => {
        fetchSpy.mockResolvedValue(
            okResponse({ ok: true, agentsLoaded: 1, latencyMs: 50 })
        );
        const { result } = renderHook(() =>
            useAgentHealth("https://agents.example", { intervalMs: 60_000 })
        );
        await waitFor(() => {
            expect(result.current.status).toBe("ok");
        });
        expect(result.current.latencyMs).toBeLessThanOrEqual(1500);
        expect(result.current.lastChecked).not.toBeNull();
    });

    it("reports offline on a network error", async () => {
        fetchSpy.mockRejectedValue(new TypeError("net down"));
        const { result } = renderHook(() =>
            useAgentHealth("https://agents.example", { intervalMs: 60_000 })
        );
        await waitFor(() => {
            expect(result.current.status).toBe("offline");
        });
    });
});
