import { Table, TableProps } from "antd";
import { ColumnsType } from "antd/lib/table";
import dayjs from "dayjs";

interface ProjectIntro extends IProject {
    key?: number;
}

interface Props extends TableProps<ProjectIntro> {
    users: IUser[];
}

const List: React.FC<Props> = ({ users, ...props }) => {
    const dataSource: ProjectIntro[] | undefined = props.dataSource?.map(
        (p, index) => ({
            ...p,
            key: index
        })
    );

    const columns: ColumnsType<ProjectIntro> = [
        {
            key: 0,
            title: "Project",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        {
            key: 1,
            title: "Department",
            dataIndex: "department"
        },
        {
            key: 2,
            title: "Manager",
            render(index, data) {
                return (
                    <span key={index}>
                        {users.find((user) => user.id === data.personId)
                            ?.name || "unknown"}
                    </span>
                );
            }
        },
        {
            key: 3,
            title: "Created At",
            render(index, data) {
                return (
                    <span>
                        {data.createdAt
                            ? dayjs(data.createdAt).format("YYYY-MM-DD")
                            : "Null"}
                    </span>
                );
            }
        }
    ];

    return (
        <Table<ProjectIntro>
            {...props}
            pagination={false}
            columns={columns}
            dataSource={dataSource}
        />
    );
};

export default List;
