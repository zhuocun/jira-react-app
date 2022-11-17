import environment from "constants/env";

const login = async (param: { username: string; password: string }) => {
    const res = await fetch(`${environment.apiBaseUrl}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(param)
    });
    if (res.ok) {
        return await res.json();
    } else {
        return Promise.reject(param);
    }
};

const register = (param: { username: string; password: string }) => {
    fetch(`${environment.apiBaseUrl}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(param)
    });
};

const logout = async () => {

}

export { login, register, logout };
