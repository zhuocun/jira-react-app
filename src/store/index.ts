import { projectSlice } from "./reducers/projectSlice";
import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./reducers/authSlice";

export const rootReducer = {
    project: projectSlice.reducer,
    auth: authSlice.reducer
};

export const store = configureStore({
    reducer: rootReducer
});

export type ReduxDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
