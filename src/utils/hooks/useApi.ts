import qs from "qs";
import { useCallback } from "react";

import environment from "../../constants/env";

import useAuth from "./useAuth";

interface IConfig extends RequestInit {
    data?: object;
    token?: string | null;
}

export const api = async (
    endpoint: string,
    { data, token, ...customConfig }: IConfig = {}
) => {
    let apiEndpoint = endpoint;
    const config = {
        method: "GET",
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": data ? "application/json" : ""
        },
        ...customConfig
    };

    if (
        config.method.toUpperCase() === "GET" ||
        config.method.toUpperCase() === "DELETE"
    ) {
        apiEndpoint += `?${qs.stringify(data)}`;
    } else {
        config.body = JSON.stringify(data);
    }

    return fetch(`${environment.apiBaseUrl}/${apiEndpoint}`, config).then(
        async (res) => {
            const resData = await res.json();
            const errorObj = resData.error;
            if (res.ok) {
                return resData;
            }
            if (errorObj) {
                if (typeof errorObj === "string") {
                    return Promise.reject(new Error(errorObj));
                }
                return Promise.reject(new Error(errorObj[0].msg));
            }
            return Promise.reject(new Error(resData));
        }
    );
};

const useApi = () => {
    const { user, token } = useAuth();
    return useCallback(
        (...[endpoint, config]: Parameters<typeof api>) =>
            api(endpoint, {
                ...config,
                token: user?.jwt ?? token
            }),
        [token, user?.jwt]
    );
};

export default useApi;
