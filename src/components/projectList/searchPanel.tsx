import { Form, Input, Select } from "antd";
import { ISearchParam } from "../../pages/projectList";

interface Props {
    param: ISearchParam;
    setParam: React.Dispatch<React.SetStateAction<ISearchParam>>;
    users: IUser[];
    loading: boolean;
}

const SearchPanel: React.FC<Props> = ({ param, setParam, users, loading }) => {
    const defaultUser = users.filter(
        (u) => u.id === parseInt(param.personId)
    )[0];
    return (
        <Form style={{ marginBottom: "2rem" }} layout={"inline"}>
            <Form.Item>
                <Input
                    value={param.name}
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
                    loading={loading}
                    value={
                        loading ? "loading..." : defaultUser?.name || "Manager"
                    }
                    onChange={(value) =>
                        setParam({
                            ...param,
                            personId: value
                        })
                    }
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
