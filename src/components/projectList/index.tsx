import {
    HeartFilled,
    HeartOutlined,
    MoreOutlined,
    PlusOutlined
} from "@ant-design/icons";
import styled from "@emotion/styled";
import {
    Avatar,
    Button,
    Dropdown,
    MenuProps,
    Modal,
    Space,
    Table,
    TableProps,
    Typography
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { microcopy } from "../../constants/microcopy";
import { brand, space } from "../../theme/tokens";
import useAuth from "../../utils/hooks/useAuth";
import useProjectModal from "../../utils/hooks/useProjectModal";
import useReactMutation from "../../utils/hooks/useReactMutation";
import deleteTaskCallback from "../../utils/optimisticUpdate/deleteProject";
import EmptyState from "../emptyState";

interface ProjectIntro extends IProject {
    key?: number;
}

interface Props extends TableProps<ProjectIntro> {
    members: IMember[];
}

export const NoPaddingButton = styled(Button)`
    padding: 0;
`;

const initialsOf = (username: string | undefined): string => {
    if (!username) return "?";
    const parts = username.trim().split(/\s+/);
    const head = parts[0]?.[0] ?? "";
    const tail = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (head + tail).toUpperCase() || username[0].toUpperCase();
};

const formatDate = (raw?: string): string => {
    if (!raw) return "—";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit"
    }).format(date);
};

const ProjectList: React.FC<Props> = ({ members, ...props }) => {
    const { user, refreshUser } = useAuth();
    const [pendingLikeId, setPendingLikeId] = useState("");
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
    const { startEditing, openModal } = useProjectModal();
    const onEdit = (projectId: string) => {
        startEditing(projectId);
    };

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const dataSource: ProjectIntro[] | undefined = props.dataSource?.map(
        (p, index) => ({
            ...p,
            key: index
        })
    );

    const onLike = useCallback(
        (projectId: string) => {
            setPendingLikeId(projectId);
            update({ projectId }).then(() => {
                setPendingLikeId("");
            });
        },
        [update]
    );

    const onDelete = (projectId: string) => {
        Modal.confirm({
            centered: true,
            okText: microcopy.confirm.deleteProject.confirmLabel,
            cancelText: microcopy.actions.cancel,
            okButtonProps: { danger: true },
            title: microcopy.confirm.deleteProject.title,
            content: microcopy.confirm.deleteProject.description,
            onOk() {
                remove({ projectId });
            }
        });
    };

    const isLiked = (projectId: string): boolean => {
        const baseLiked = Boolean(user?.likedProjects?.includes(projectId));
        if (pendingLikeId === projectId) {
            return !baseLiked;
        }
        return baseLiked;
    };

    const ListColumns: ColumnsType<ProjectIntro> = [
        {
            key: "Liked",
            title: <HeartFilled aria-label="Liked" style={{ color: brand.primary }} />,
            width: 56,
            render(_, data) {
                const liked = isLiked(data._id);
                return (
                    <Button
                        aria-label={
                            liked
                                ? `Unlike ${data.projectName}`
                                : `Like ${data.projectName}`
                        }
                        aria-pressed={liked}
                        icon={
                            liked ? (
                                <HeartFilled style={{ color: "#eb2f96" }} />
                            ) : (
                                <HeartOutlined />
                            )
                        }
                        onClick={() => onLike(data._id)}
                        size="small"
                        type="text"
                    />
                );
            }
        },
        {
            key: "Project",
            title: "Project",
            sorter: (a, b) => a.projectName.localeCompare(b.projectName),
            render(_, data) {
                return (
                    <Link to={`${data._id}`}>
                        <Typography.Text strong>
                            {data.projectName}
                        </Typography.Text>
                    </Link>
                );
            }
        },
        {
            key: "Organization",
            title: "Organization",
            dataIndex: "organization"
        },
        {
            key: "Manager",
            title: microcopy.fields.manager,
            render(_, data) {
                const manager = members.find(
                    (member) => member._id === data.managerId
                );
                if (!manager) {
                    return (
                        <Typography.Text type="secondary">
                            unknown
                        </Typography.Text>
                    );
                }
                return (
                    <Space size={space.xs}>
                        <Avatar
                            size="small"
                            style={{ backgroundColor: brand.primary }}
                        >
                            {initialsOf(manager.username)}
                        </Avatar>
                        <span>{manager.username}</span>
                    </Space>
                );
            }
        },
        {
            key: "Created At",
            title: "Created",
            render(_, data) {
                if (!data.createdAt) {
                    return (
                        <Typography.Text type="secondary">Null</Typography.Text>
                    );
                }
                return <span>{formatDate(data.createdAt)}</span>;
            }
        },
        {
            key: "Actions",
            width: 56,
            align: "right",
            render(_, data) {
                const items: MenuProps["items"] = [
                    {
                        key: "edit",
                        label: (
                            <NoPaddingButton
                                aria-label={`Edit ${data.projectName}`}
                                onClick={() => onEdit(data._id)}
                                type="link"
                            >
                                {microcopy.actions.edit}
                            </NoPaddingButton>
                        )
                    },
                    {
                        key: "delete",
                        label: (
                            <NoPaddingButton
                                aria-label={`Delete ${data.projectName}`}
                                danger
                                onClick={() => onDelete(data._id)}
                                type="link"
                            >
                                {microcopy.actions.delete}
                            </NoPaddingButton>
                        )
                    }
                ];
                return (
                    <Dropdown menu={{ items }}>
                        <Button
                            aria-label={`More actions for ${data.projectName}`}
                            icon={<MoreOutlined />}
                            size="small"
                            type="text"
                        />
                    </Dropdown>
                );
            }
        }
    ];

    return (
        <Table<ProjectIntro>
            {...props}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            columns={ListColumns}
            dataSource={dataSource}
            locale={{
                emptyText: (
                    <EmptyState
                        title={microcopy.empty.projects.title}
                        description={microcopy.empty.projects.description}
                        cta={
                            <Button
                                icon={<PlusOutlined />}
                                onClick={openModal}
                                type="primary"
                            >
                                {microcopy.actions.create} project
                            </Button>
                        }
                    />
                )
            }}
        />
    );
};

export default ProjectList;
