import { configureStore } from "@reduxjs/toolkit";

import { projectModalSlice } from "./reducers/projectModalSlice";

export const rootReducer = {
    projectModal: projectModalSlice.reducer
};

export const store = configureStore({
    reducer: rootReducer
});

export type ReduxDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
