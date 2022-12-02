const newKanbanCallback = (
    target: {
        kanbanName: string;
        projectId: string;
    },
    old: IKanban[]
) => {
    return old.concat({ ...target, index: old.length } as IKanban);
};

export default newKanbanCallback;
