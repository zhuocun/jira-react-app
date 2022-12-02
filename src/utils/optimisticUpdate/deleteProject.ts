const deleteTaskCallback = (target: { projectId: string }, old: IProject[]) => {
    let index = 0;
    for (let i = 0; i < old.length; i++) {
        if (old[i]._id === target.projectId) {
            index = i;
            break;
        }
    }
    old.splice(index, 1);
    return old;
};

export default deleteTaskCallback;
