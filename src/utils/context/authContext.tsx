import { ReactNode, useEffect, useState } from "react";
import * as auth from "../../utils/authProvider";
import React from "react";
import { api } from "../hooks/useApi";

interface AuthForm {
    username: string;
    password: string;
}

const AuthContext = React.createContext<| {
    user: IUser | null;
    login: (form: AuthForm) => void;
    logout: () => void;
}
    | undefined>(undefined);
AuthContext.displayName = "AuthContext";

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<IUser | null>(null);

    useEffect(() => {
        const token = auth.getToken();
        if (token) {
            api("userInfo").then(setUser);
        }
    }, []);

    const login = (form: AuthForm) => {
        auth.login(form).then(setUser);
    };
    const logout = () => {
        auth.logout().then(() => setUser(null));
    };

    return (
        <AuthContext.Provider
            children={children}
            value={{ user, login, logout }}
        />
    );
};

const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context)
        throw new Error("useAuth mush be used within the AuthProvider");
    return context;
};

export { AuthProvider, useAuth };
