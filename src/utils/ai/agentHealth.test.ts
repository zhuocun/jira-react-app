import { pingAgent } from "./agentHealth";

const okResponse = (data: unknown) =>
    ({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(data),
        text: jest.fn().mockResolvedValue(JSON.stringify(data)),
        headers: { get: () => null, has: () => false }
    }) as unknown as Response;

describe("pingAgent", () => {
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
        fetchSpy = jest.spyOn(global, "fetch");
    });

    afterEach(() => {
        fetchSpy.mockRestore();
    });

    it("returns ok=false when no baseUrl is provided", async () => {
        const result = await pingAgent("");
        expect(result.ok).toBe(false);
        expect(result.latencyMs).toBe(-1);
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("returns ok=true and a latency for a healthy server", async () => {
        fetchSpy.mockResolvedValueOnce(
            okResponse({ ok: true, agentsLoaded: 2 })
        );
        const result = await pingAgent("https://agents.example");
        expect(result.ok).toBe(true);
        expect(typeof result.latencyMs).toBe("number");
    });

    it("returns ok=false on network failure (degraded)", async () => {
        fetchSpy.mockRejectedValueOnce(new TypeError("net down"));
        const result = await pingAgent("https://agents.example");
        expect(result.ok).toBe(false);
        expect(result.latencyMs).toBe(-1);
    });

    it("propagates AbortError when the signal is aborted", async () => {
        const ctrl = new AbortController();
        ctrl.abort();
        await expect(
            pingAgent("https://agents.example", ctrl.signal)
        ).rejects.toMatchObject({ name: "AbortError" });
    });
});
