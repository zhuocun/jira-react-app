import environment from "../constants/env";

const login = async (param: { email: string; password: string }) => {
    const res = await fetch(`${environment.apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(param)
    });
    if (res.ok) {
        const user = await res.json();
        localStorage.setItem("Token", user.jwt);
        return user;
    }
    const errMsg = res.status === 404 ? "Failed to connect" : await res.json();
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
    if (res.ok) {
        return res.json();
    }
    const errMsg =
        res.status === 404
            ? "Failed to connect"
            : res.status === 400
            ? (await res.json()).error[0].msg
            : await res.json();
    return Promise.reject(new Error(errMsg));
};

export { login, register };
