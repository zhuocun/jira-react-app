import { Form, Input, Select } from "antd";
import useReactQuery from "../../utils/hooks/useReactQuery";
import { useQueryClient } from "react-query";

export interface TaskSearchParam {
    taskName: string;
    coordinatorId: string;
    type: string;
}

interface Props {
    kanbans: IKanban[] | undefined;
    param: TaskSearchParam;
    setParam: (params: Partial<TaskSearchParam>) => void;
    members: IMember[] | undefined;
    loading: boolean;
}

const ProjectSearchPanel: React.FC<Props> = ({
    kanbans,
    param,
    setParam,
    members,
    loading
}) => {
    const allTasks: ITask[] = [];
    if (kanbans) {
        for (const k of kanbans) {
            const tasks = useReactQuery<ITask[]>("tasks", {
                kanbanId: k._id
            }).data;
            if (tasks) {
                for (const t of tasks) {
                    allTasks.push(t);
                }
            }
        }
    }
    const types: string[] = [];
    const coordinators: IMember[] = [];
    allTasks.map((t) => {
        if (!types.includes(t.type)) types.push(t.type);
        const coordinator = members?.filter(
            (m) => m._id === t.coordinatorId
        )[0];
        if (coordinator && !coordinators.includes(coordinator))
            coordinators.push(coordinator);
    });
    const queryClient = useQueryClient();
    const user = queryClient.getQueryData<IUser>("users");
    if (user)
        coordinators.push({
            username: user.username,
            email: user.email,
            _id: user._id
        });

    return (
        <Form style={{ marginBottom: "2rem" }} layout={"inline"}>
            <Form.Item>
                <Input
                    value={param.taskName}
                    placeholder={"Task name"}
                    type={"text"}
                    onChange={(e) =>
                        setParam({
                            ...param,
                            taskName: e.target.value
                        })
                    }
                />
            </Form.Item>
            <Form.Item>
                <Select
                    loading={loading}
                    onChange={(value) =>
                        setParam({
                            ...param,
                            coordinatorId: value
                        })
                    }
                    defaultValue={
                        coordinators.filter(
                            (c) => c._id === param.coordinatorId
                        )[0]?.username || "Coordinators"
                    }
                    style={{ width: "14rem" }}
                >
                    <Select.Option value={""}>Coordinators</Select.Option>
                    {coordinators.map((c, index) => (
                        <Select.Option value={c._id} key={index}>
                            {c.username}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item>
                <Select
                    loading={loading}
                    onChange={(value) =>
                        setParam({
                            ...param,
                            type: value
                        })
                    }
                    defaultValue={param.type || "Types"}
                    style={{ width: "12rem" }}
                >
                    <Select.Option value={""}>Types</Select.Option>
                    {types.map((t, index) => (
                        <Select.Option value={t} key={index}>
                            {t}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
        </Form>
    );
};

export default ProjectSearchPanel;
