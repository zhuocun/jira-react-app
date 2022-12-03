import { useParams } from "react-router-dom";
import useReactQuery from "./useReactQuery";
import useReactMutation from "./useReactMutation";
import { useCallback } from "react";
import { DropResult } from "react-beautiful-dnd";
import { kanbanCallback, taskCallback } from "../optimisticUpdate/reorder";

const useDragEnd = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { data: kanbans } = useReactQuery<IKanban[]>("kanbans", {
        projectId
    });
    const { data: tasks } = useReactQuery<ITask[]>("tasks", {
        projectId
    });

    const { mutate: reorderKanban, isLoading: kLoading } = useReactMutation(
        "kanbans/orders",
        "PUT",
        ["kanbans", { projectId }],
        kanbanCallback
    );
    const { mutate: reorderTask, isLoading: rLoading } = useReactMutation(
        "tasks/orders",
        "PUT",
        ["tasks", { projectId }],
        taskCallback
    );
    const onDragEnd = useCallback(
        ({ source, destination, type }: DropResult) => {
            if (!destination) {
                return;
            }
            if (type === "COLUMN") {
                const fromId = kanbans?.[source.index]._id;
                const referenceId = kanbans?.[destination.index]._id;
                if (!fromId || !referenceId || fromId === referenceId) {
                    return;
                }
                const type =
                    destination.index > source.index ? "after" : "before";
                reorderKanban({ fromId, referenceId, type });
            }
            if (type === "ROW") {
                const fromKanbanId = source.droppableId;
                const referenceKanbanId = destination.droppableId;
                const fromTask = tasks?.filter(
                    (t) => t.kanbanId === fromKanbanId
                )[source.index];
                const referenceTask = tasks?.filter(
                    (t) => t.kanbanId === referenceKanbanId
                )[destination.index];
                if (fromTask?._id === referenceTask?._id) {
                    return;
                }
                reorderTask({
                    fromId: fromTask?._id,
                    referenceId: referenceTask?._id,
                    fromKanbanId,
                    referenceKanbanId,
                    type:
                        fromKanbanId === referenceKanbanId &&
                        destination.index > source.index
                            ? "after"
                            : "before"
                });
            }
        },
        [kanbans, reorderKanban, reorderTask, tasks]
    );
    return {
        onDragEnd,
        isKanbanDragDisabled: kLoading,
        isTaskDragDisabled: rLoading
    };
};

export default useDragEnd;
