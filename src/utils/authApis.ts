import environment from "../constants/env";

import getAuthErrorMessage from "./getAuthErrorMessage";
import { parseFetchBody } from "./parseFetchBody";

const login = async (param: { email: string; password: string }) => {
    const res = await fetch(`${environment.apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(param)
    });
    const body = await parseFetchBody(res);
    if (res.ok) {
        const user = body as IUser;
        localStorage.setItem("Token", user.jwt);
        return user;
    }
    const errMsg =
        res.status === 404 ? "Failed to connect" : getAuthErrorMessage(body);
    return Promise.reject(new Error(errMsg));
};

const register = async (param: {
    username: string;
    email: string;
    password: string;
}) => {
    const res = await fetch(`${environment.apiBaseUrl}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(param)
    });
    const body = await parseFetchBody(res);
    if (res.ok) {
        return body;
    }
    const errMsg =
        res.status === 404 ? "Failed to connect" : getAuthErrorMessage(body);
    return Promise.reject(new Error(errMsg));
};

export { login, register };
