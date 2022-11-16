interface Props {
    list: IProject[];
    users: IUser[];
}

const List: React.FC<Props> = ({ list, users }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Manager</th>
                </tr>
            </thead>
            <tbody>
                {list.map((project, index) => (
                    <tr key={index}>
                        <td>{project.name}</td>
                        <td>
                            {users.find((user) => user.id === project.personId)
                                ?.name || "unknown"}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default List;
