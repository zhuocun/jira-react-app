import qs from "qs";
import { useCallback } from "react";

import environment from "../../constants/env";

import { parseFetchBody } from "../parseFetchBody";

import useAuth from "./useAuth";

interface IConfig extends RequestInit {
    data?: object;
    token?: string | null;
}

const getApiErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    if (Array.isArray(error)) {
        return getApiErrorMessage(error[0]);
    }
    if (error && typeof error === "object") {
        const {
            error: nestedError,
            message,
            msg
        } = error as {
            error?: unknown;
            message?: unknown;
            msg?: unknown;
        };

        return getApiErrorMessage(nestedError ?? message ?? msg);
    }

    return "Operation failed";
};

export const api = async (
    endpoint: string,
    { data, token, ...customConfig }: IConfig = {}
) => {
    let apiEndpoint = endpoint;
    const headers: Record<string, string> = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    if (data) {
        headers["Content-Type"] = "application/json";
    }
    const config = {
        method: "GET",
        headers,
        ...customConfig
    };

    if (
        config.method.toUpperCase() === "GET" ||
        config.method.toUpperCase() === "DELETE"
    ) {
        const qsString = qs.stringify(data ?? {});
        if (qsString) {
            apiEndpoint += `?${qsString}`;
        }
    } else {
        config.body = JSON.stringify(data);
    }

    return fetch(`${environment.apiBaseUrl}/${apiEndpoint}`, config).then(
        async (res) => {
            const resData = await parseFetchBody(res);
            if (res.ok) {
                return resData;
            }
            return Promise.reject(new Error(getApiErrorMessage(resData)));
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
