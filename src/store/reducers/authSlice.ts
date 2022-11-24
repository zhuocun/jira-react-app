import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthForm } from "../../utils/context/authContext";
import { ReduxDispatch } from "../index";
import * as auth from "../../utils/authApis";
import { useNavigate } from "react-router";

interface State {
    user: IUser | null;
}

const initialState: State = {
    user: null
};

export const authSlice = createSlice({
    name: "authSlice",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<IUser | null>) {
            state.user = action.payload;
        }
    }
});

export const { setUser } = authSlice.actions;

export const reduxLogin = (form: AuthForm) => (dispatch: ReduxDispatch) =>
    auth.login(form).then((user) => dispatch(setUser(user)));


export const reduxLogout = (path = "/") => (dispatch: ReduxDispatch) => {
    const navigate = useNavigate();
    auth.logout().then(() => {
        dispatch(setUser(null));
        navigate(path);
    });
};

export const refreshUser = (user: IUser) => (dispatch: ReduxDispatch) => {
    dispatch(setUser({ ...user, jwt: auth.getToken() || "" }));
};
