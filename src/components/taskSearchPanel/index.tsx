import { Button, Form, Input, Select } from "antd";
import { useQueryClient } from "react-query";
import { FormInstance } from "antd/lib/form/Form";
import React from "react";

export interface TaskSearchParam {
    taskName: string;
    coordinatorId: string;
    type: string;
}

interface Props {
    tasks: ITask[];
    param: TaskSearchParam;
    setParam: (params: Partial<TaskSearchParam>) => void;
    members: IMember[] | undefined;
    loading: boolean;
}

const TaskSearchPanel: React.FC<Props> = ({
    tasks,
    param,
    setParam,
    members,
    loading
}) => {
    const types: string[] = [];
    const coordinators: IMember[] = [];
    tasks?.map((t) => {
        if (!types.includes(t.type)) types.push(t.type);
        const coordinator = members?.filter(
            (m) => m._id === t.coordinatorId
        )[0];
        if (coordinator && !coordinators.includes(coordinator))
            coordinators.push(coordinator);
    });
    const queryClient = useQueryClient();
    const user = queryClient.getQueryData<IUser>("users");
    if (user) {
        coordinators.push({
            username: user.username,
            email: user.email,
            _id: user._id
        });
    }
    const formRef = React.createRef<FormInstance>();
    const resetParams = () => {
        setParam({
            taskName: undefined,
            coordinatorId: undefined,
            type: undefined
        });
        formRef.current?.setFieldsValue({
            taskName: null,
            coordinators: "Coordinators",
            types: "Types"
        });
    };

    return (
        <Form ref={formRef} style={{ marginBottom: "2rem" }} layout={"inline"}>
            <Form.Item name={"taskName"}>
                <Input
                    style={{ width: "20rem" }}
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
            <Form.Item
                name={"coordinators"}
                initialValue={
                    coordinators.filter((c) => c._id === param.coordinatorId)[0]
                        ?.username || "Coordinators"
                }
            >
                <Select
                    loading={loading}
                    onChange={(value) =>
                        setParam({
                            ...param,
                            coordinatorId: value
                        })
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
            <Form.Item name={"types"} initialValue={param.type || "Types"}>
                <Select
                    loading={loading}
                    onChange={(value) =>
                        setParam({
                            ...param,
                            type: value
                        })
                    }
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
            <Button onClick={resetParams}>Reset Filter</Button>
        </Form>
    );
};

export default TaskSearchPanel;
