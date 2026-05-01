import { getAgentHealth } from "./agentClient";

/**
 * Best-effort health probe for the agent server. Returns an `ok` flag and
 * the round-trip latency in milliseconds; on any error we surface
 * `{ ok: false, latencyMs: -1 }` so callers can render a "degraded" badge
 * without re-implementing error mapping.
 */
export const pingAgent = async (
    baseUrl: string,
    signal?: AbortSignal
): Promise<{ ok: boolean; latencyMs: number }> => {
    if (!baseUrl) return { ok: false, latencyMs: -1 };
    const started = Date.now();
    try {
        const result = await getAgentHealth({ baseUrl, signal });
        return {
            ok: result.ok,
            latencyMs: result.latencyMs ?? Date.now() - started
        };
    } catch (err) {
        if (err instanceof Error && err.name === "AbortError") throw err;
        return { ok: false, latencyMs: -1 };
    }
};
