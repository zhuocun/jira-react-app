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
    } else {
        const [err] = (await res.json()).error;
        return Promise.reject(new Error(err.msg));
    }
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
        return await res.json();
    } else {
        const [err] = (await res.json()).error;
        return Promise.reject(new Error(err.msg));
    }
};

const logout = async () => {
    localStorage.removeItem("Token");
};

const getToken = () => {
    return localStorage.getItem("Token");
};

export { login, register, logout, getToken };
