import { Form, Input, Select } from "antd";

interface Props {
    param: { name: string; personId: string };
    setParam: React.Dispatch<
        React.SetStateAction<{ name: string; personId: string }>
    >;
    users: IUser[];
}

const SearchPanel: React.FC<Props> = ({ param, setParam, users }) => {
    return (
        <Form style={{ marginBottom: "2rem" }} layout={"inline"}>
            <Form.Item>
                <Input
                    placeholder={"Project name"}
                    type={"text"}
                    onChange={(e) =>
                        setParam({
                            ...param,
                            name: e.target.value
                        })
                    }
                />
            </Form.Item>
            <Form.Item>
                <Select
                    onChange={(value) =>
                        setParam({
                            ...param,
                            personId: value
                        })
                    }
                    defaultValue={"Manager"}
                    style={{ width: "11rem" }}
                >
                    <Select.Option value={""}>Manager</Select.Option>
                    {users.map((user, index) => (
                        <Select.Option value={user.id} key={index}>
                            {user.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
        </Form>
    );
};

export default SearchPanel;
