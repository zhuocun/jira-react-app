interface ITaskOrderParams {
    fromId: string;
    referenceId: string;
    fromColumnId: string;
    referenceColumnId: string;
    type: "after" | "before";
}

interface IColumnOrderParams {
    fromId: string;
    referenceId: string;
    type: "after" | "before";
}

const reorder = ({
    fromId,
    type,
    referenceId,
    objArray
}: {
    objArray: ITask[] | IColumn[];
    fromId: string;
    type: "after" | "before";
    referenceId: string;
}) => {
    const copiedArray: (IColumn | ITask)[] = [...objArray];
    const movingItemIndex = copiedArray.findIndex(
        (item) => item._id === fromId
    );
    if (!referenceId) {
        if (movingItemIndex < copiedArray.length - 1) {
            return insertAfter(
                [...copiedArray],
                movingItemIndex,
                copiedArray.length - 1
            );
        } else return copiedArray;
    }
    const targetIndex = copiedArray.findIndex(
        (item) => item._id === referenceId
    );
    const insert = type === "after" ? insertAfter : insertBefore;
    return insert([...copiedArray], movingItemIndex, targetIndex);
};

const insertBefore = (
    objArray: (ITask | IColumn)[],
    from: number,
    to: number
) => {
    const toItem = objArray[to];
    const removedItem = objArray.splice(from, 1)[0];
    const toIndex = objArray.indexOf(toItem);
    objArray.splice(toIndex, 0, removedItem);
    return objArray;
};

const insertAfter = (
    objArray: (ITask | IColumn)[],
    from: number,
    to: number
) => {
    const toItem = objArray[to];
    const removedItem = objArray.splice(from, 1)[0];
    const toIndex = objArray.indexOf(toItem);
    objArray.splice(toIndex + 1, 0, removedItem);
    return objArray;
};

export const taskCallback = (target: ITaskOrderParams, old: ITask[]) => {
    const orderedList = reorder({ objArray: old, ...target }) as ITask[];
    const result: ITask[] = orderedList.map((item) =>
        item._id === target.fromId
            ? { ...item, columnId: target.referenceColumnId }
            : item
    );
    return result;
};

export const columnCallback = (target: IColumnOrderParams, old: IColumn[]) =>
    reorder({ objArray: old, ...target });
