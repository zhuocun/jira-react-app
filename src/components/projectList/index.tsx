import { Rate, Table, TableProps } from "antd";
import { ColumnsType } from "antd/lib/table";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { useAuth } from "../../utils/context/authContext";
import useApi from "../../utils/hooks/useApi";
import { refreshUser } from "../../store/reducers/authSlice";
import { useReduxDispatch } from "../../utils/hooks/useRedux";

interface ProjectIntro extends IProject {
    key?: number;
}

interface Props extends TableProps<ProjectIntro> {
    members: IMember[];
}

const ProjectList: React.FC<Props> = ({ members, ...props }) => {
    const dispatch = useReduxDispatch();
    const api = useApi();
    const { user } = useAuth();

    const dataSource: ProjectIntro[] | undefined = props.dataSource?.map(
        (p, index) => ({
            ...p,
            key: index
        })
    );

    const onLike = (projectId: string) => {
        api("users/likes", { data: { projectId }, method: "PUT" })
            .then((user) => dispatch(refreshUser(user)));
    };

    const columns: ColumnsType<ProjectIntro> = [
        {
            key: "Liked",
            title: <Rate value={1} count={1} disabled={true} />,
            render(index, data) {
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
            render(index, data) {
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
