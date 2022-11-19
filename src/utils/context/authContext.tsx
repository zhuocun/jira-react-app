import { ReactNode } from "react";
import * as auth from "../../utils/authProvider";
import React from "react";
import { api } from "../hooks/useApi";
import useAsync from "../hooks/useAsync";
import useMount from "../hooks/useMount";
import { PageError, PageSpin } from "../../components/status";
import { useNavigate } from "react-router";

interface AuthForm {
    email: string;
    password: string;
}

const AuthContext = React.createContext<
    | {
          user: IUser | null;
          login: (form: AuthForm) => Promise<void>;
          logout: () => void;
      }
    | undefined
>(undefined);
AuthContext.displayName = "AuthContext";

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const {
        run,
        data: user,
        error,
        isLoading,
        isIdle,
        isError,
        setData: setUser
    } = useAsync<IUser | null>(undefined, { throwOnError: true });
    useMount(() => {
        const token = auth.getToken();
        if (token) {
            run(api("userInfo", { token })).then(setUser);
        } else {
            setUser(null);
        }
    });

    const login = (form: AuthForm) => auth.login(form).then(setUser);
    const logout = () => {
        auth.logout().then(() => {
            setUser(null);
            navigate("/login");
        });
    };

    if (isIdle || isLoading) {
        return <PageSpin />;
    }

    if (isError) {
        return <PageError error={error} />;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context)
        throw new Error("useAuth mush be used within the AuthProvider");
    return context;
};

export { AuthProvider, useAuth };
