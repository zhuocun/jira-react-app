import useUrl from "./useUrl";
import { useReduxDispatch, useReduxSelector } from "./useRedux";
import { projectActions } from "../../store/reducers/projectSlice";
import { useEffect } from "react";

const useProjectModal = () => {
    const [modal, setModal] = useUrl(["modal"]);
    const isModalOpened = useReduxSelector((s) => s.project.isModalOpened);
    const dispatch = useReduxDispatch();
    const openModal = () => {
        setModal({ modal: "on" });
    };
    const closeModal = () => {
        setModal({ modal: "off" });
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
