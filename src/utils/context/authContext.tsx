import { ReactNode, useCallback, useEffect } from "react";
import * as auth from "../authApis";
import React from "react";
import { api } from "../hooks/useApi";
import useAsync from "../hooks/useAsync";
import { PageError, PageSpin } from "../../components/status";
import { useReduxDispatch, useReduxSelector } from "../hooks/useRedux";
import { reduxLogin, reduxLogout, setUser } from "../../store/reducers/authSlice";

export interface AuthForm {
    email: string;
    password: string;
}

const AuthContext = React.createContext<| {
    user: IUser | null;
    refreshUser: (user: IUser) => void;
    login: (form: AuthForm) => Promise<void>;
    logout: (path?: string) => void;
}
    | undefined>(undefined);
AuthContext.displayName = "AuthContext";

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const dispatch = useReduxDispatch();
    const {
        run,
        error,
        isLoading,
        isIdle,
        isError
    } = useAsync<IUser | null>(undefined, { throwOnError: true });
    useEffect(() => {
        const token = auth.getToken();
        token
            ? run(api("users", { token })).then((res) => {
                dispatch(setUser({
                    username: res?.username,
                    likedProjects: res?.likedProjects,
                    jwt: token
                }));
            })
            : dispatch(setUser(null));
    }, [dispatch, run]);


    if (isIdle || isLoading) {
        return <PageSpin />;
    }

    if (isError) {
        return <PageError error={error} />;
    }

    return <>{children}</>;
};

const useAuth = () => {
    const dispatch = useReduxDispatch();
    const user = useReduxSelector(s => s.auth.user);
    const login = useCallback((form: AuthForm) => dispatch(reduxLogin(form)), [dispatch]);
    const logout = useCallback((path?: string) => dispatch(reduxLogout(path)), [dispatch]);
    return {
        user, login, logout
    };
};

export { AuthProvider, useAuth };
