interface ITask {
    _id: string;
    taskName: string;
    coordinatorId: string;
    epic: string;
    kanbanId: string;
    type: string;
    note: string;
    storyPoints: number;
}
