import { useCallback } from "react";

import useUrl from "./useUrl";

const useTaskModal = () => {
    const [{ editingTaskId }, setEditingTaskId] = useUrl(["editingTaskId"]);
    const closeModal = useCallback(() => {
        setEditingTaskId({ editingTaskId: undefined });
    }, [setEditingTaskId]);
    const startEditing = useCallback(
        (id: string) => {
            setEditingTaskId({ editingTaskId: id });
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
