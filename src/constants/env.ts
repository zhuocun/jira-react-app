const DEFAULT_API_ORIGIN = "https://jira-python-server.vercel.app";

const readEnv = (key: string): string | undefined => {
    if (typeof process !== "undefined" && process.env && key in process.env) {
        return process.env[key];
    }
    return undefined;
};

const apiOrigin = readEnv("REACT_APP_API_URL")?.trim() || DEFAULT_API_ORIGIN;
const apiBaseUrl = `${apiOrigin}/api/v1`;
// `REACT_APP_AI_BASE_URL` selects the AI / agent proxy origin. Leave it
// unset to use the deterministic local engine (no network); set it to
// the REST origin (or any reverse-proxy that forwards to it) to flip the
// AI hooks onto the modern `/api/v1/ai/*` and `/api/v1/agents/*` routes.
const aiBaseUrl = readEnv("REACT_APP_AI_BASE_URL")?.trim() ?? "";
const aiEnabledFlag = readEnv("REACT_APP_AI_ENABLED");

const environment = {
    apiBaseUrl,
    apiOrigin,
    aiBaseUrl,
    aiEnabled: aiEnabledFlag === "false" ? false : true,
    aiUseLocalEngine: aiBaseUrl.length === 0
};

export default environment;
