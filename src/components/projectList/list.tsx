import { Table } from "antd";

interface Props {
    list: IProject[];
    users: IUser[];
}

const List: React.FC<Props> = ({ list, users }) => {
    return (
        <Table pagination={false} columns={[{
            title: "Name",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name)
        }, {
            title: "Manager",
            dataIndex: "manager",
            render(index, project) {
                return (
                    <span key={index}>
                        {users.find((user) => user.id === project.personId)
                            ?.name || "unknown"}
                    </span>
                )
            }
        }]} dataSource={list}></Table>
    );
};

export default List;
