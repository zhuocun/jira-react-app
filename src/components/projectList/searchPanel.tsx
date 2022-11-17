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
                <input
                    type={"text"}
                    onChange={(e) =>
                        setParam({
                            ...param,
                            name: e.target.value
                        })
                    }
                />
                <select
                    onChange={(e) =>
                        setParam({
                            ...param,
                            personId: e.target.value
                        })
                    }
                >
                    <option value={""}>Manager</option>
                    {users.map((user, index) => (
                        <option value={user.id} key={index}>
                            {user.name}
                        </option>
                    ))}
                </select>
            </div>
        </form>
    );
};

export default SearchPanel;
