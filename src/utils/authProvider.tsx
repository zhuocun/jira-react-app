import React, { ReactNode, useEffect } from "react";

import { PageError, PageSpin } from "../components/status";

import getError from "./getError";
import useAuth from "./hooks/useAuth";
import useReactQuery from "./hooks/useReactQuery";

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { token, refreshUser } = useAuth();
    const { error, isLoading, isIdle, isError } = useReactQuery<IUser>(
        "users",
        undefined,
        undefined,
        undefined,
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

    return <div>{children}</div>;
};

export default AuthProvider;
