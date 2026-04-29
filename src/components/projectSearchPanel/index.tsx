import { SearchOutlined } from "@ant-design/icons";
import { Form, Input, Select } from "antd";
import React from "react";

export interface ProjectSearchParam {
    projectName: string;
    managerId: string;
    semanticIds?: string;
}

interface Props {
    param: ProjectSearchParam;
    setParam: (params: Partial<ProjectSearchParam>) => void;
    members: IMember[];
    loading: boolean;
    aiSearchSlot?: React.ReactNode;
}

const ProjectSearchPanel: React.FC<Props> = ({
    param,
    setParam,
    members,
    loading,
    aiSearchSlot
}) => {
    const defaultUser = members.filter((u) => u._id === param.managerId)[0];
    return (
        <Form style={{ marginBottom: "2rem" }} layout="inline">
            {aiSearchSlot}
            <Form.Item>
                <Input
                    value={param.projectName}
                    placeholder="Search this list"
                    type="text"
                    onChange={(e) =>
                        setParam({
                            ...param,
                            projectName: e.target.value
                        })
                    }
                    suffix={<SearchOutlined />}
                />
            </Form.Item>
            <Form.Item>
                <Select
                    loading={loading}
                    value={
                        loading
                            ? "Managers"
                            : defaultUser?.username || "Managers"
                    }
                    onChange={(value) =>
                        setParam({
                            ...param,
                            managerId: value
                        })
                    }
                    style={{ width: "12rem" }}
                >
                    <Select.Option value="">Managers</Select.Option>
                    {members.map((user) => (
                        <Select.Option value={user._id} key={user._id}>
                            {user.username}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
        </Form>
    );
};

export default ProjectSearchPanel;
