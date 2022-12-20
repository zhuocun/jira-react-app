import { useCallback } from "react";

import useUrl from "./useUrl";

const useTaskModal = () => {
    const [{ editingTaskId }, setEditingTaskId] = useUrl(["editingTaskId"]);
    const closeModal = useCallback(() => {
        setEditingTaskId({ editingTaskId: undefined });
    }, [setEditingTaskId]);
    const startEditing = useCallback(
        (editingTaskId: string) => {
            setEditingTaskId({ editingTaskId });
        },
        [setEditingTaskId]
    );
    return {
        editingTaskId,
        closeModal,
        startEditing
    };
};

export default useTaskModal;
