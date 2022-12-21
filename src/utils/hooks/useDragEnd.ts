import { useCallback } from "react";
import { DropResult } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";

import { columnCallback, taskCallback } from "../optimisticUpdate/reorder";

import useReactMutation from "./useReactMutation";
import useReactQuery from "./useReactQuery";

const useDragEnd = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { data: boards } = useReactQuery<IColumn[]>("boards", {
        projectId
    });
    const { data: tasks } = useReactQuery<ITask[]>("tasks", {
        projectId
    });

    const { mutate: reorderColumn, isLoading: bLoading } = useReactMutation(
        "boards/orders",
        "PUT",
        ["boards", { projectId }],
        columnCallback
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
                const fromId = boards?.[source.index]._id;
                const referenceId = boards?.[destination.index]._id;
                if (!fromId || !referenceId || fromId === referenceId) {
                    return;
                }
                const reorderType =
                    destination.index > source.index ? "after" : "before";
                reorderColumn({ fromId, referenceId, type: reorderType });
            }
            if (type === "ROW") {
                const fromColumnId = source.droppableId;
                const referenceColumnId = destination.droppableId;
                const fromTask = tasks?.filter(
                    (t) => t.columnId === fromColumnId
                )[source.index];
                const referenceTask = tasks?.filter(
                    (t) => t.columnId === referenceColumnId
                )[destination.index];
                if (fromTask?._id === referenceTask?._id) {
                    return;
                }
                reorderTask({
                    fromId: fromTask?._id,
                    referenceId: referenceTask?._id,
                    fromColumnId,
                    referenceColumnId,
                    type:
                        fromColumnId === referenceColumnId &&
                        destination.index > source.index
                            ? "after"
                            : "before"
                });
            }
        },
        [boards, reorderColumn, reorderTask, tasks]
    );
    return {
        onDragEnd,
        isColumnDragDisabled: bLoading,
        isTaskDragDisabled: rLoading
    };
};

export default useDragEnd;
