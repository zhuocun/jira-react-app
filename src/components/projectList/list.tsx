import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";

interface ProjectIntro {
    key: number;
    personId: number;
    name: string;
}

interface Props {
    list: IProject[];
    users: IUser[];
}

const List: React.FC<Props> = ({ list, users }) => {
    const dataSource: ProjectIntro[] = list.map((p, index) => ({
        key: index,
        personId: p.personId,
        name: p.name
    }));

    const columns: ColumnsType<ProjectIntro> = [
        {
            key: 0,
            title: "Project",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        {
            key: 1,
            title: "Manager",
            render(index, data) {
                return (
                    <span key={index}>
                        {users.find((user) => user.id === data.personId)
                            ?.name || "unknown"}
                    </span>
                );
            }
        }
    ];

    return (
        <Table<ProjectIntro>
            pagination={false}
            columns={columns}
            dataSource={dataSource}
        />
    );
};

export default List;
