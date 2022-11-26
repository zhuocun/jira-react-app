import useUrl from "./useUrl";
import { useReduxDispatch, useReduxSelector } from "./useRedux";
import { projectActions } from "../../store/reducers/projectModalSlice";
import { useEffect } from "react";

const useProjectModal = () => {
    const [modal, setModal] = useUrl(["modal"]);
    const isModalOpened = useReduxSelector((s) => s.projectModal.isModalOpened);
    const dispatch = useReduxDispatch();
    const openModal = () => {
        setModal({ modal: "on" });
    };
    const closeModal = () => {
        setModal({ modal: undefined });
    };

    useEffect(() => {
        modal.modal === "on"
            ? dispatch(projectActions.openModal())
            : dispatch(projectActions.closeModal());
    }, [dispatch, modal]);

    return {
        isModalOpened,
        openModal,
        closeModal
    };
};

export default useProjectModal;
