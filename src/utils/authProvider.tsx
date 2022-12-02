import React, { ReactNode, useEffect } from "react";
import { PageError, PageSpin } from "../components/status";
import useReactQuery from "./hooks/useReactQuery";
import getError from "./getError";
import useAuth from "./hooks/useAuth";

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { token, refreshUser } = useAuth();
    const { error, isLoading, isIdle, isError } = useReactQuery<IUser>(
        "users",
        undefined,
        Boolean(token)
    );

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    if ((isIdle || isLoading) && token) {
        return <PageSpin />;
    }

    if (isError) {
        return <PageError error={getError(error)} />;
    }

    return <>{children}</>;
};

export default AuthProvider;
