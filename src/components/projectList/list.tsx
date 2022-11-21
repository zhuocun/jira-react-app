import { Table, TableProps } from "antd";
import { ColumnsType } from "antd/lib/table";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

interface ProjectIntro extends IProject {
    key?: number;
}

interface Props extends TableProps<ProjectIntro> {
    members: IMember[];
}

const List: React.FC<Props> = ({ members, ...props }) => {
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
            sorter: (a, b) => a.projectName.localeCompare(b.projectName),
            render(index, data) {
                return <Link to={`${data._id}`}>{data.projectName}</Link>;
            }
        },
        {
            key: 1,
            title: "Organization",
            dataIndex: "organization"
        },
        {
            key: 2,
            title: "Manager",
            render(index, data) {
                return (
                    <span key={index}>
                        {members.find((user) => user._id === data.managerId)
                            ?.username || "unknown"}
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
