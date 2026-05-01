import { useEffect, useState } from "react";

import { pingAgent } from "../ai/agentHealth";

export type AgentHealthStatus = "ok" | "degraded" | "offline";

export interface UseAgentHealthState {
    status: AgentHealthStatus;
    latencyMs: number;
    lastChecked: number | null;
}

const DEFAULT_INTERVAL_MS = 30_000;
/** Latency above this is "degraded" even when the response was OK. */
const DEGRADED_THRESHOLD_MS = 1500;

const classify = (ok: boolean, latencyMs: number): AgentHealthStatus => {
    if (!ok) return "offline";
    if (latencyMs < 0 || latencyMs > DEGRADED_THRESHOLD_MS) return "degraded";
    return "ok";
};

/**
 * Poll `/api/v1/health` and expose a coarse `ok / degraded / offline` status
 * (PRD §6.2). The hook is a no-op when `baseUrl` is empty (v1 fallback). It
 * cleans up on unmount and respects an optional polling interval.
 */
const useAgentHealth = (
    baseUrl: string,
    opts: { intervalMs?: number; enabled?: boolean } = {}
): UseAgentHealthState => {
    const interval = opts.intervalMs ?? DEFAULT_INTERVAL_MS;
    const enabled = opts.enabled !== false && baseUrl.length > 0;
    const [state, setState] = useState<UseAgentHealthState>({
        status: enabled ? "degraded" : "offline",
        latencyMs: -1,
        lastChecked: null
    });

    useEffect(() => {
        if (!enabled) return;
        let cancelled = false;
        const controller = new AbortController();
        const tick = async () => {
            try {
                const { ok, latencyMs } = await pingAgent(
                    baseUrl,
                    controller.signal
                );
                if (cancelled) return;
                setState({
                    status: classify(ok, latencyMs),
                    latencyMs,
                    lastChecked: Date.now()
                });
            } catch (err) {
                if (cancelled) return;
                if (err instanceof Error && err.name === "AbortError") return;
                setState({
                    status: "offline",
                    latencyMs: -1,
                    lastChecked: Date.now()
                });
            }
        };
        void tick();
        const handle = setInterval(tick, interval);
        return () => {
            cancelled = true;
            controller.abort();
            clearInterval(handle);
        };
    }, [baseUrl, enabled, interval]);

    return state;
};

export default useAgentHealth;
