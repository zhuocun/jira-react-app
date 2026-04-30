import React, { ReactNode, useEffect } from "react";

import { PageSpin } from "../components/status";

import useAuth from "./hooks/useAuth";
import useReactQuery from "./hooks/useReactQuery";

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { token, refreshUser } = useAuth();
    const { isLoading, isIdle } = useReactQuery<IUser>(
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

    return <div>{children}</div>;
};

export default AuthProvider;
