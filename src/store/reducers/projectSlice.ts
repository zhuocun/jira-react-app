import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxDispatch } from "../index";

interface State {
    isModalOpened: boolean;
    projects: IProject[];
    user: IUser | null;
}

const initialState: State = {
    isModalOpened: false,
    projects: [],
    user: null
};

export const projectSlice = createSlice({
    name: "projectSlice",
    initialState,
    reducers: {
        openModal(state) {
            state.isModalOpened = true;
        },
        closeModal(state) {
            state.isModalOpened = false;
        },
        setProjects(state, action: PayloadAction<IProject[]>) {
            state.projects = action.payload;
        },
        setUser(state, action: PayloadAction<IUser>) {
            state.user = action.payload;
        }
    }
});

export const projectActions = projectSlice.actions;

export const refreshProjects =
    (promise: Promise<IProject[]>) => (dispatch: ReduxDispatch) => {
        promise.then((projects) =>
            dispatch(projectActions.setProjects(projects))
        );
    };
