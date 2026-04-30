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
    Table,
    TableProps,
    Typography
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { microcopy } from "../../constants/microcopy";
import {
    breakpoints,
    fontSize,
    fontWeight,
    radius,
    semantic,
    space
} from "../../theme/tokens";
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

const ListSurface = styled.div`
    background: var(--ant-color-bg-container, #fff);
    border: 1px solid var(--ant-color-border-secondary, rgba(15, 23, 42, 0.06));
    border-radius: ${radius.lg}px;
    overflow: hidden;

    .ant-table {
        background: transparent;
    }

    .ant-table-thead > tr > th {
        font-weight: ${fontWeight.medium};
        letter-spacing: 0.04em;
        text-transform: uppercase;
        font-size: ${fontSize.xs}px;
    }

    .ant-table-tbody > tr > td {
        border-bottom: 1px solid
            var(--ant-color-border-secondary, rgba(15, 23, 42, 0.05));
    }

    .ant-table-tbody > tr:last-child > td {
        border-bottom: none;
    }

    /*
     * Scrollbar polish for the horizontal overflow region on phone widths,
     * so the user sees a slim affordance rather than a hidden one. The
     * table itself keeps scroll x:max-content so all columns remain
     * accessible behind a horizontal pan.
     */
    .ant-table-content,
    .ant-table-body {
        scrollbar-width: thin;
        scrollbar-color: var(--ant-color-fill-secondary, rgba(15, 23, 42, 0.08))
            transparent;
    }

    .ant-table-content::-webkit-scrollbar,
    .ant-table-body::-webkit-scrollbar {
        height: 8px;
    }
    .ant-table-content::-webkit-scrollbar-thumb,
    .ant-table-body::-webkit-scrollbar-thumb {
        background: var(--ant-color-fill-secondary, rgba(15, 23, 42, 0.08));
        border-radius: 999px;
    }

    /* Tighter cell padding so more content fits on phone. */
    @media (max-width: ${breakpoints.sm - 1}px) {
        .ant-table-tbody > tr > td,
        .ant-table-thead > tr > th {
            padding-inline: ${space.sm}px;
        }
    }
`;

const ProjectCell = styled.div`
    align-items: center;
    display: flex;
    gap: ${space.sm}px;
    min-width: 0;
`;

const ProjectMeta = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;

    a {
        color: var(--ant-color-text, rgba(15, 23, 42, 0.92));
        font-weight: ${fontWeight.semibold};
        line-height: 1.3;
        text-decoration: none;
    }

    a:hover {
        color: var(--ant-color-primary, #5e6ad2);
    }

    small {
        color: var(--ant-color-text-tertiary, rgba(15, 23, 42, 0.5));
        font-size: ${fontSize.xs}px;
    }
`;

/**
 * Deterministic per-project gradient. Hashing the project id gives every
 * board its own visual identity in the list while staying inside the
 * brand-aligned hue range (200° to 280°, indigo / violet / pink).
 */
const PROJECT_AVATAR_GRADIENTS = [
    "linear-gradient(135deg, #7C5CFF 0%, #5E6AD2 100%)",
    "linear-gradient(135deg, #C084FC 0%, #6366F1 100%)",
    "linear-gradient(135deg, #F472B6 0%, #7C5CFF 100%)",
    "linear-gradient(135deg, #38BDF8 0%, #5E6AD2 100%)",
    "linear-gradient(135deg, #34D399 0%, #5E6AD2 100%)",
    "linear-gradient(135deg, #FB923C 0%, #C084FC 100%)"
] as const;

const gradientFor = (id: string): string => {
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) {
        hash = (hash * 31 + id.charCodeAt(i)) | 0;
    }
    const index = Math.abs(hash) % PROJECT_AVATAR_GRADIENTS.length;
    return PROJECT_AVATAR_GRADIENTS[index];
};

const ProjectAvatar = styled.span<{ background: string }>`
    align-items: center;
    background: ${(props) => props.background};
    border-radius: ${radius.md}px;
    color: #fff;
    display: inline-flex;
    flex: 0 0 auto;
    font-size: ${fontSize.sm}px;
    font-weight: ${fontWeight.semibold};
    height: 36px;
    justify-content: center;
    letter-spacing: 0.02em;
    width: 36px;
`;

const ManagerPill = styled.span`
    align-items: center;
    color: var(--ant-color-text, rgba(15, 23, 42, 0.85));
    display: inline-flex;
    gap: ${space.xs}px;
    min-width: 0;
`;

const initialsOf = (name: string | undefined): string => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    const head = parts[0]?.[0] ?? "";
    const tail = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (head + tail).toUpperCase() || name[0].toUpperCase();
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

    const dataSource: ProjectIntro[] | undefined = useMemo(
        () =>
            props.dataSource?.map((p, index) => ({
                ...p,
                key: index
            })),
        [props.dataSource]
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
            title: (
                <span aria-label="Liked" role="img">
                    <HeartFilled
                        style={{ color: semantic.favorite, fontSize: 14 }}
                    />
                </span>
            ),
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
                                <HeartFilled
                                    style={{ color: semantic.favorite }}
                                />
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
                    <ProjectCell>
                        <ProjectAvatar
                            aria-hidden
                            background={gradientFor(data._id)}
                        >
                            {initialsOf(data.projectName)}
                        </ProjectAvatar>
                        <ProjectMeta>
                            <Link to={`${data._id}`}>{data.projectName}</Link>
                        </ProjectMeta>
                    </ProjectCell>
                );
            }
        },
        {
            key: "Organization",
            title: "Organization",
            dataIndex: "organization",
            render(_, data) {
                return (
                    <Typography.Text type="secondary">
                        {data.organization}
                    </Typography.Text>
                );
            }
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
                    <ManagerPill>
                        <Avatar
                            size="small"
                            style={{
                                background: gradientFor(manager._id),
                                color: "#fff",
                                fontSize: 11,
                                fontWeight: 600
                            }}
                        >
                            {initialsOf(manager.username)}
                        </Avatar>
                        <span>{manager.username}</span>
                    </ManagerPill>
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
                return (
                    <Typography.Text type="secondary">
                        {formatDate(data.createdAt)}
                    </Typography.Text>
                );
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
        <ListSurface>
            <Table<ProjectIntro>
                {...props}
                pagination={{ pageSize: 10, hideOnSinglePage: true }}
                columns={ListColumns}
                dataSource={dataSource}
                scroll={{ x: "max-content" }}
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
        </ListSurface>
    );
};

export default ProjectList;
