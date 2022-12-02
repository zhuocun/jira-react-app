interface INewTaskParams {
    taskName: string;
    projectId: string;
    kanbanId: string;
    coordinatorId: string;
    type: "Task";
    epic: "New Feature";
    storyPoints: 1;
    note: "No note yet";
}

const newTaskCallback = (target: INewTaskParams, old: ITask[]) => {
    return old.concat(target as ITask);
};

export default newTaskCallback;
