import { SearchOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select } from "antd";
import { FormInstance } from "antd/lib/form/Form";
import React from "react";

import useAuth from "../../utils/hooks/useAuth";

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
    const { user } = useAuth();
    const types: string[] = [];
    const coordinators: IMember[] = [];
    tasks?.map((task) => {
        if (!types.includes(task.type)) types.push(task.type);
        const coordinator = members?.filter(
            (member) => member._id === task.coordinatorId
        )[0];
        if (coordinator && !coordinators.includes(coordinator)) {
            coordinators.push(coordinator);
        }
    });

    if (user) {
        if (!coordinators.length) {
            coordinators.push(user);
        }
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
                    placeholder={"Search this board"}
                    type={"text"}
                    onChange={(e) =>
                        setParam({
                            ...param,
                            taskName: e.target.value
                        })
                    }
                    suffix={<SearchOutlined />}
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
                    {coordinators.map((member) => (
                        <Select.Option value={member._id} key={member._id}>
                            {member.username}
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
                    {types.length > 1 ? (
                        types.map((type) => (
                            <Select.Option value={type} key={type}>
                                {type}
                            </Select.Option>
                        ))
                    ) : (
                        <>
                            <Select.Option value={"Task"} key={"task"}>
                                Task
                            </Select.Option>
                            <Select.Option value={"Bug"} key={"bug"}>
                                Bug
                            </Select.Option>
                        </>
                    )}
                </Select>
            </Form.Item>
            <Button onClick={resetParams}>Reset filter</Button>
        </Form>
    );
};

export default TaskSearchPanel;
