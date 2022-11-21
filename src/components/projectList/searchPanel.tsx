import { Form, Input, Select } from "antd";

interface Props {
    param: {
        projectName: string;
        managerId: string;
    };
    setParam: (
        params: Partial<{ projectName: unknown; managerId: unknown }>
    ) => void;
    members: IMember[];
    loading: boolean;
}

const SearchPanel: React.FC<Props> = ({
    param,
    setParam,
    members,
    loading
}) => {
    const defaultUser = members.filter((u) => u._id === param.managerId)[0];
    return (
        <Form style={{ marginBottom: "2rem" }} layout={"inline"}>
            <Form.Item>
                <Input
                    value={param.projectName}
                    placeholder={"Project name"}
                    type={"text"}
                    onChange={(e) =>
                        setParam({
                            ...param,
                            projectName: e.target.value
                        })
                    }
                />
            </Form.Item>
            <Form.Item>
                <Select
                    loading={loading}
                    value={
                        loading
                            ? "loading..."
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
                    <Select.Option value={""}>Managers</Select.Option>
                    {members.map((user, index) => (
                        <Select.Option value={user._id} key={index}>
                            {user.username}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
        </Form>
    );
};

export default SearchPanel;
