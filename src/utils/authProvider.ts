import environment from "../constants/env";

const login = async (param: { email: string; password: string }) => {
    const res = await fetch(`${environment.apiBaseUrl}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(param)
    });
    if (res.ok) {
        const user: IUser = await res.json();
        localStorage.setItem("Token", user.token);
        return user;
    } else {
        return Promise.reject(param);
    }
};

const register = async (param: { email: string; password: string }) => {
    return await fetch(`${environment.apiBaseUrl}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(param)
    });
};

const logout = async () => {
    localStorage.removeItem("Token");
};

const getToken = () => {
    return localStorage.getItem("Token");
};

export { login, register, logout, getToken };
