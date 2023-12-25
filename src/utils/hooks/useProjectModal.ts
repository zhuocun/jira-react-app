import { useContext, useEffect } from "react";

import { ProjectModalStoreContext } from "../../store/projectModalStore";
// import { projectActions } from "../../store/reducers/projectModalSlice";

import useReactQuery from "./useReactQuery";
// import { useReduxDispatch, useReduxSelector } from "./useRedux";
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
    const projectModalStore = useContext(ProjectModalStoreContext);
    const { isModalOpened, openModalMobX, closeModalMobX } = projectModalStore;
    // const isModalOpened = useReduxSelector((s) => s.projectModal.isModalOpened);
    // const dispatch = useReduxDispatch();
    const openModal = () => {
        setModal({ modal: "on" });
        // openModalMobX();
    };
    const closeModal = () => {
        setModal({ modal: undefined });
        setEditingProjectId({ editingProjectId: undefined });
        // closeModalMobX();
    };
    const startEditing = (id: string) => {
        setEditingProjectId({ editingProjectId: id });
    };

    useEffect(() => {
        if (modal === "on" || Boolean(editingProjectId)) {
            openModalMobX();
            // dispatch(projectActions.openModal());
        } else {
            closeModalMobX();
            // dispatch(projectActions.closeModal());
        }
    }, [modal, editingProjectId]);

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
