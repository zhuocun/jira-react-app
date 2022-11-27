import { Button, Dropdown, MenuProps, Rate, Table, TableProps } from "antd";
import { ColumnsType } from "antd/lib/table";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import useAuth from "../../utils/hooks/useAuth";
import useReactMutation from "../../utils/hooks/useReactMutation";
import useProjectModal from "../../utils/hooks/useProjectModal";

interface ProjectIntro extends IProject {
    key?: number;
}

interface Props extends TableProps<ProjectIntro> {
    members: IMember[];
}

const ProjectList: React.FC<Props> = ({ members, ...props }) => {
    const { user } = useAuth();
    const { mutate } = useReactMutation("users/likes", "PUT", "users");
    const { startEditing } = useProjectModal();
    const onEdit = (id: string) => {
        startEditing(id);
    };

    const dataSource: ProjectIntro[] | undefined = props.dataSource?.map(
        (p, index) => ({
            ...p,
            key: index
        })
    );

    const onLike = (projectId: string) => {
        mutate({ projectId });
    };

    const columns: ColumnsType<ProjectIntro> = [
        {
            key: "Liked",
            title: <Rate value={1} count={1} disabled={true} />,
            render(value, data) {
                return (
                    <Rate
                        value={user?.likedProjects.includes(data._id) ? 1 : 0}
                        count={1}
                        onChange={() => onLike(data._id)}
                    />
                );
            }
        },
        {
            key: "Project",
            title: "Project",
            sorter: (a, b) => a.projectName.localeCompare(b.projectName),
            render(value, data) {
                return <Link to={`${data._id}`}>{data.projectName}</Link>;
            }
        },
        {
            key: "Organization",
            title: "Organization",
            dataIndex: "organization"
        },
        {
            key: "Manager",
            title: "Manager",
            render(value, data, index) {
                return (
                    <span key={index}>
                        {members.find((user) => user._id === data.managerId)
                            ?.username || "unknown"}
                    </span>
                );
            }
        },
        {
            key: "Created At",
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
        },
        {
            render(value, data) {
                const items: MenuProps["items"] = [
                    {
                        key: "Edit",
                        label: (
                            <a key={"Edit"} onClick={() => onEdit(data._id)}>Edit</a>
                        )
                    },
                    {
                        key: "Delete",
                        label: (
                            <a key={"Delete"}>Delete</a>
                        )
                    }
                ];
                return (
                    <Dropdown menu={{ items }}>
                        <Button style={{ padding: 0 }} type={"link"}>...</Button>
                    </Dropdown>
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

export default ProjectList;
