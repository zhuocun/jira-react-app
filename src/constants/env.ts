const readEnv = (key: string): string | undefined => {
    if (typeof process !== "undefined" && process.env && key in process.env) {
        return process.env[key];
    }
    return undefined;
};

const apiBaseUrl = `${readEnv("REACT_APP_API_URL") ?? ""}/api/v1`;
const aiBaseUrl = readEnv("REACT_APP_AI_BASE_URL") ?? "";
const aiEnabledFlag = readEnv("REACT_APP_AI_ENABLED");

const environment = {
    apiBaseUrl,
    aiBaseUrl,
    aiEnabled: aiEnabledFlag === "false" ? false : true,
    aiUseLocalEngine: aiBaseUrl.length === 0
};

export default environment;
