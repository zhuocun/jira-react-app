/** Bearer header for optional AI proxy auth (same token as REST API). */
export const getStoredBearerAuthHeader = (): string => {
    if (typeof localStorage === "undefined") {
        return "";
    }
    const token = localStorage.getItem("Token");
    return token ? `Bearer ${token}` : "";
};
