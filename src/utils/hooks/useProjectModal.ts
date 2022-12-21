import { useEffect } from "react";

import { projectActions } from "../../store/reducers/projectModalSlice";

import useReactQuery from "./useReactQuery";
import { useReduxDispatch, useReduxSelector } from "./useRedux";
import useUrl from "./useUrl";

const useProjectModal = () => {
    const [{ modal }, setModal] = useUrl(["modal"]);
    const [{ editingProjectId }, setEditingProjectId] = useUrl([
        "editingProjectId"
    ]);
    const { data: editingProject, isLoading } = useReactQuery<IProject>(
        "projects",
        { projectId: editingProjectId },
        "editingProject",
        undefined,
        undefined,
        Boolean(editingProjectId)
    );
    const isModalOpened = useReduxSelector((s) => s.projectModal.isModalOpened);
    const dispatch = useReduxDispatch();
    const openModal = () => {
        setModal({ modal: "on" });
    };
    const closeModal = () => {
        setModal({ modal: undefined });
        setEditingProjectId({ editingProjectId: undefined });
    };
    const startEditing = (id: string) => {
        setEditingProjectId({ editingProjectId: id });
    };

    useEffect(() => {
        if (modal === "on" || Boolean(editingProjectId)) {
            dispatch(projectActions.openModal());
        } else {
            dispatch(projectActions.closeModal());
        }
    }, [dispatch, modal, editingProjectId]);

    return {
        isModalOpened,
        openModal,
        closeModal,
        startEditing,
        editingProject,
        isLoading
    };
};

export default useProjectModal;
