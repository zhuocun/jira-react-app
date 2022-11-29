import taskIcon from "../../assets/task.svg";
import bugIcon from "../../assets/bug.svg";
import styled from "@emotion/styled";
import { Card } from "antd";
import { TaskSearchParam } from "../taskSearchPanel";

const KanbanColumn: React.FC<{
    tasks: ITask[];
    kanban: IKanban;
    param: TaskSearchParam;
}> = ({ kanban, param, tasks }) => {
    return (
        <Container>
            <h3>{kanban.kanbanName}</h3>
            <TaskContainer>
                {tasks?.map((task, index) =>
                    (!param.type || task.type === param.type) &&
                    (!param.coordinatorId ||
                        task.coordinatorId === param.coordinatorId) &&
                    (!param.taskName || task.taskName === param.taskName) ? (
                        <Card key={index} style={{ marginBottom: "0.5rem" }}>
                            <div>{task.taskName}</div>
                            <img
                                src={task.type === "Task" ? taskIcon : bugIcon}
                            />
                        </Card>
                    ) : null
                )}
            </TaskContainer>
        </Container>
    );
};

export default KanbanColumn;

const Container = styled.div`
    min-width: 27rem;
    border-radius: 6px;
    background-color: rgb(244, 245, 247);
    display: flex;
    flex-direction: column;
    padding: 0.7rem;
    margin-right: 1.5rem;
`;

const TaskContainer = styled.div`
    overflow: scroll;
    flex: 1;

    ::-webkit-scrollbar {
        display: none;
    }
`;
