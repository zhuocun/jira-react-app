import styled from "@emotion/styled";
import {
    Button,
    Dropdown,
    MenuProps,
    Modal,
    Rate,
    Table,
    TableProps
} from "antd";
import { ColumnsType } from "antd/lib/table";
import dayjs from "dayjs";
import { useState } from "react";
import { Link } from "react-router-dom";

import useAuth from "../../utils/hooks/useAuth";
import useProjectModal from "../../utils/hooks/useProjectModal";
import useReactMutation from "../../utils/hooks/useReactMutation";
import deleteTaskCallback from "../../utils/optimisticUpdate/deleteProject";

interface ProjectIntro extends IProject {
    key?: number;
}

interface Props extends TableProps<ProjectIntro> {
    members: IMember[];
}

export const NoPaddingButton = styled(Button)`
    padding: 0;
`;

const ProjectList: React.FC<Props> = ({ members, ...props }) => {
    const { user, refreshUser } = useAuth();
    refreshUser();
    const [currentProjectId, setCurrentProjectId] = useState("");
    const { mutateAsync: update } = useReactMutation(
        "users/likes",
        "PUT",
        "users"
    );
    const { mutate: remove } = useReactMutation(
        "projects",
        "DELETE",
        ["projects", {}],
        deleteTaskCallback
    );
    const { startEditing } = useProjectModal();
    const onEdit = (projectId: string) => {
        startEditing(projectId);
    };

    const dataSource: ProjectIntro[] | undefined = props.dataSource?.map(
        (p, index) => ({
            ...p,
            key: index
        })
    );

    const onLike = (projectId: string) => {
        setCurrentProjectId(projectId);
        update({ projectId }).then(() => {
            setCurrentProjectId("");
        });
    };

    const onDelete = (projectId: string) => {
        Modal.confirm({
            centered: true,
            okText: "Confirm",
            cancelText: "Cancel",
            title: "Are you sure to delete this project?",
            content: "This action cannot be undone",
            onOk() {
                remove({ projectId });
            }
        });
    };

    const ListColumns: ColumnsType<ProjectIntro> = [
        {
            key: "Liked",
            title: <Rate value={1} count={1} disabled />,
            render(value, data) {
                return (
                    <Rate
                        value={
                            currentProjectId === data._id
                                ? user?.likedProjects.includes(data._id)
                                    ? 0
                                    : 1
                                : user?.likedProjects.includes(data._id)
                                ? 1
                                : 0
                        }
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
            render(value, data) {
                return (
                    <span key={data._id}>
                        {members.find((member) => member._id === data.managerId)
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
                        key: "edit",
                        label: (
                            <NoPaddingButton onClick={() => onEdit(data._id)}>
                                Edit
                            </NoPaddingButton>
                        )
                    },
                    {
                        key: "delete",
                        label: (
                            <NoPaddingButton onClick={() => onDelete(data._id)}>
                                Delete
                            </NoPaddingButton>
                        )
                    }
                ];
                return (
                    <Dropdown menu={{ items }}>
                        <NoPaddingButton type="link">...</NoPaddingButton>
                    </Dropdown>
                );
            }
        }
    ];

    return (
        <Table<ProjectIntro>
            {...props}
            pagination={false}
            columns={ListColumns}
            dataSource={dataSource}
        />
    );
};

export default ProjectList;
