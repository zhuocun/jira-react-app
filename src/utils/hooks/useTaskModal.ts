import useUrl from "./useUrl";
import { useCallback } from "react";

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
