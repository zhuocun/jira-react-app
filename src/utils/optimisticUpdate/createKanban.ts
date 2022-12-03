const newKanbanCallback = (
    target: {
        kanbanName: string;
        projectId: string;
    },
    old: IKanban[] | undefined
) => {
    if (!old) return undefined;
    return old.concat({ ...target, index: old.length, _id: "mock" });
};

export default newKanbanCallback;
