import { useCallback } from "react";
import { useReduxDispatch, useReduxSelector } from "./useRedux";
import {
    reduxLogin,
    reduxLogout
} from "../../store/reducers/authSlice";

export interface AuthForm {
    email: string;
    password: string;
}

const useAuth = () => {
    const dispatch = useReduxDispatch();
    const user = useReduxSelector((s) => s.auth.user);
    const login = useCallback(
        (form: AuthForm) => dispatch(reduxLogin(form)),
        [dispatch]
    );
    const logout = useCallback(async () => dispatch(reduxLogout()), [dispatch]);
    return {
        user,
        login,
        logout
    };
};

export default useAuth;
