const deleteTaskCallback = (
    target: { taskId: string },
    old: ITask[] | undefined
) => {
    if (!old) return undefined;
    let index = 0;
    for (let i = 0; i < old.length; i++) {
        if (old[i]._id === target.taskId) {
            index = i;
            break;
        }
    }
    old.splice(index, 1);
    return old;
};

export default deleteTaskCallback;
