import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";

interface Props {
    list: IProject[];
    users: IUser[];
}

const List: React.FC<Props> = ({ list, users }) => {
    const columns: ColumnsType<IProject> = [
        {
            key: "Name",
            title: "Name",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        {
            key: "Manager",
            title: "Manager",
            dataIndex: "manager",
            render(index, project) {
                return (
                    <span key={index}>
                        {users.find(
                            (user) => user.id === project.personId
                        )?.name || "unknown"}
                    </span>
                );
            }
        }
    ];
    return (
        <Table<IProject>
            pagination={false}
            columns={columns}
            dataSource={list}
        />
    );
};

export default List;
