import React, { ReactNode, useEffect } from "react";
import { useReduxDispatch } from "./hooks/useRedux";
import * as auth from "./authApis";
import useAsync from "./hooks/useAsync";
import { api } from "./hooks/useApi";
import { setUser } from "../store/reducers/authSlice";
import { PageError, PageSpin } from "../components/status";

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const dispatch = useReduxDispatch();
    const token = auth.getToken();
    const { run, error, isLoading, isIdle, isError } = useAsync<IUser | null>(
        undefined,
        { throwOnError: true }
    );
    useEffect(() => {
        token
            ? run(api("users", { token })).then((res) => {
                  dispatch(
                      setUser({
                          username: res?.username,
                          likedProjects: res?.likedProjects,
                          jwt: token
                      })
                  );
              })
            : dispatch(setUser(null));
    }, [dispatch, run, token]);

    if ((isIdle || isLoading) && token) {
        return <PageSpin />;
    }

    if (isError) {
        return <PageError error={error} />;
    }

    return <>{children}</>;
};

export default AuthProvider;
