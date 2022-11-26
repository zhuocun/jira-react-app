import React, { ReactNode, useEffect } from "react";
import { PageError, PageSpin } from "../components/status";
import useReactQuery from "./hooks/useReactQuery";
import getError from "./getError";
import { useQueryClient } from "react-query";
import useAuth from "./hooks/useAuth";

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const { error, isLoading, isIdle, isError } = token
        ? useReactQuery<IUser>("users", undefined)
        : {
              error: null,
              isLoading: false,
              isError: false,
              isIdle: false
          };
    useEffect(() => {
        queryClient.refetchQueries<IUser>("users").then(() => {
            queryClient.setQueryData("users", {
                ...queryClient.getQueryData<IUser>("users"),
                jwt: token
            });
        });
    }, [queryClient, token]);

    if ((isIdle || isLoading) && token) {
        return <PageSpin />;
    }

    if (isError) {
        return <PageError error={getError(error)} />;
    }

    return <>{children}</>;
};

export default AuthProvider;
