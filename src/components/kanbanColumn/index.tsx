import useReactQuery from "../../utils/hooks/useReactQuery";

const KanbanColumn: React.FC<{ kanban: IKanban }> = ({ kanban }) => {
    const { data: tasks } = useReactQuery<ITask[]>("tasks", { kanbanId: kanban._id });
    return (
        <div>
            <h3>{kanban.kanbanName}</h3>
            {tasks?.map((task, index) => (
                <div key={index}>{task.taskName}</div>
            ))}
        </div>);
};

export default KanbanColumn;
