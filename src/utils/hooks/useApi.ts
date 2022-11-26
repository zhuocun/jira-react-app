import qs from "qs";
import environment from "../../constants/env";
import * as auth from "../authApis";
import useAuth from "./useAuth";
import { useCallback } from "react";

interface IConfig extends RequestInit {
    data?: object;
    token?: string | null;
}

export const api = async (
    endpoint: string,
    { data, token, ...customConfig }: IConfig = {}
) => {
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
        endpoint += `?${qs.stringify(data)}`;
    } else {
        config.body = JSON.stringify(data);
    }

    return fetch(`${environment.apiBaseUrl}/${endpoint}`, config).then(
        async (res) => {
            if (res.status === 401) {
                await auth.logout();
                window.location.reload();
                return Promise.reject({
                    message: "Login expired, please login again"
                });
            }
            const data = await res.json();
            if (res.ok) {
                return data;
            } else {
                return Promise.reject(data);
            }
        }
    );
};

const useApi = () => {
    const { user } = useAuth();
    return useCallback(
        (...[endpoint, config]: Parameters<typeof api>) =>
            api(endpoint, {
                ...config,
                token: user?.jwt
            }),
        [user?.jwt]
    );
};

export default useApi;
