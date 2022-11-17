import { Input, Select } from "antd";

interface Props {
    param: { name: string; personId: string };
    setParam: React.Dispatch<
        React.SetStateAction<{ name: string; personId: string }>
    >;
    users: IUser[];
}

const SearchPanel: React.FC<Props> = ({ param, setParam, users }) => {
    return (
        <form>
            <div>
                <Input
                    type={"text"}
                    onChange={(e) =>
                        setParam({
                            ...param,
                            name: e.target.value
                        })
                    }
                />
                <Select
                    onChange={(value) =>
                        setParam({
                            ...param,
                            personId: value
                        })
                    }
                >
                    <Select.Option value={""}>Manager</Select.Option>
                    {users.map((user, index) => (
                        <Select.Option value={user.id} key={index}>
                            {user.name}
                        </Select.Option>
                    ))}
                </Select>
            </div>
        </form>
    );
};

export default SearchPanel;
