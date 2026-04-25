import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";

import { store } from "../../store";
import { projectActions } from "../../store/reducers/projectModalSlice";

import { useReduxDispatch, useReduxSelector } from "./useRedux";

const ReduxProbe = () => {
    const dispatch = useReduxDispatch();
    const isModalOpened = useReduxSelector(
        (state) => state.projectModal.isModalOpened
    );

    return (
        <div>
            <span data-testid="modal-state">
                {isModalOpened ? "open" : "closed"}
            </span>
            <button
                type="button"
                onClick={() => dispatch(projectActions.openModal())}
            >
                open
            </button>
            <button
                type="button"
                onClick={() => dispatch(projectActions.closeModal())}
            >
                close
            </button>
        </div>
    );
};

describe("useRedux hooks", () => {
    beforeEach(() => {
        store.dispatch(projectActions.closeModal());
    });

    afterEach(() => {
        store.dispatch(projectActions.closeModal());
    });

    it("selects typed state and dispatches typed actions through Redux provider", () => {
        render(
            <Provider store={store}>
                <ReduxProbe />
            </Provider>
        );

        expect(screen.getByTestId("modal-state")).toHaveTextContent("closed");

        fireEvent.click(screen.getByRole("button", { name: "open" }));

        expect(screen.getByTestId("modal-state")).toHaveTextContent("open");

        fireEvent.click(screen.getByRole("button", { name: "close" }));

        expect(screen.getByTestId("modal-state")).toHaveTextContent("closed");
    });
});
