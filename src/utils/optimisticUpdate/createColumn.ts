const newColumnCallback = (
    target: {
        columnName: string;
        projectId: string;
    },
    old: IColumn[] | undefined
) => {
    if (!old) return undefined;
    return old.concat({ ...target, index: old.length, _id: "mock" });
};

export default newColumnCallback;
