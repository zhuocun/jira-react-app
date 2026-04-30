import { useEffect } from "react";

import { projectActions } from "../../store/reducers/projectModalSlice";

import useReactQuery from "./useReactQuery";
import { useReduxDispatch, useReduxSelector } from "./useRedux";
import useUrl from "./useUrl";

const useProjectModal = () => {
    const dispatch = useReduxDispatch();
    // Use a single useUrl so closeModal can clear both keys atomically. Two
    // separate setSearchParams calls would each close over the same URL
    // snapshot and the second would clobber the first.
    const [{ modal, editingProjectId }, setUrl] = useUrl([
        "modal",
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
    const openModal = () => {
        setUrl({ modal: "on" });
    };
    const closeModal = () => {
        setUrl({ modal: undefined, editingProjectId: undefined });
    };
    const startEditing = (id: string) => {
        setUrl({ editingProjectId: id });
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
