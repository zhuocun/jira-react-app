const deleteTaskCallback = (
    target: { projectId: string },
    old: IProject[] | undefined
) => {
    if (!old) return undefined;
    const index = old.findIndex((project) => project._id === target.projectId);
    if (index === -1) {
        return old;
    }
    return old.filter((project) => project._id !== target.projectId);
};

export default deleteTaskCallback;
