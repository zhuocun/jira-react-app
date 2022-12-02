const deleteKanbanCallback = (target: { kanbanId: string }, old: IKanban[]) => {
    let index = 0;
    for (let i = 0; i < old.length; i++) {
        if (old[i]._id === target.kanbanId) {
            index = i;
            break;
        }
    }
    old.forEach((k) => {
        if (k.index > old[index].index) {
            k.index--;
        }
    });
    old.splice(index, 1);
    return old;
};

export default deleteKanbanCallback;
