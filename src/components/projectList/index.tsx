import {
    HeartFilled,
    HeartOutlined,
    MoreOutlined,
    PlusOutlined
} from "@ant-design/icons";
import styled from "@emotion/styled";
import {
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
    letterSpacing,
    radius,
    semantic,
    space
} from "../../theme/tokens";
import useAuth from "../../utils/hooks/useAuth";
import useProjectModal from "../../utils/hooks/useProjectModal";
import useReactMutation from "../../utils/hooks/useReactMutation";
import deleteTaskCallback from "../../utils/optimisticUpdate/deleteProject";
import EmptyState from "../emptyState";
import UserAvatar, { gradientFor, initialsOf } from "../userAvatar";

interface ProjectIntro extends IProject {
    key?: number;
}

interface Props extends TableProps<ProjectIntro> {
    members: IMember[];
    /**
     * When the upstream query failed, the page renders an Alert with retry
     * above the table. Hide the in-table "No projects yet" empty state in
     * that case so the user is not told the list is empty when we simply
     * couldn't load it.
     */
    error?: boolean;
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

    /*
     * Phone widths: hide secondary columns (Organization, Created) so the
     * row fits without horizontal scroll on a 320 px viewport. The Project,
     * Like, Manager, and Actions columns carry the primary affordances and
     * stay visible. The columns are hidden via CSS rather than the AntD
     * "responsive" prop because we still want the underlying data in the
     * accessibility tree for assistive tech that ignores "display: none".
     */
    @media (max-width: ${breakpoints.sm - 1}px) {
        .ant-table-tbody > tr > td,
        .ant-table-thead > tr > th {
            padding-block: ${space.sm}px;
            padding-inline: ${space.xs}px;
        }

        /* Drop the Organization (col 3) and Created (col 5) cells. */
        .ant-table-tbody > tr > td:nth-of-type(3),
        .ant-table-thead > tr > th:nth-of-type(3),
        .ant-table-tbody > tr > td:nth-of-type(5),
        .ant-table-thead > tr > th:nth-of-type(5) {
            display: none;
        }
    }

    /* Lift table icon buttons to a 44 × 44 hit target on coarse pointers
     * (WCAG 2.5.5 AAA, level AA recommends 24 × 24 minimum). The icon
     * itself stays small; only the surrounding click region grows. */
    @media (pointer: coarse) {
        .ant-table-tbody .ant-btn-sm {
            min-height: 44px;
            min-width: 44px;
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
    gap: ${space.xxs / 2}px;
    min-width: 0;

    a {
        color: var(--ant-color-text, rgba(15, 23, 42, 0.92));
        font-weight: ${fontWeight.semibold};
        line-height: 1.3;
        text-decoration: none;
        /* AntD's auto-layout table lets a single 200-char project name
         * grow the cell past the row, hiding Organization / Manager /
         * Created. break-word splits the run mid-character so the cell
         * stays bounded and other columns remain visible. */
        word-break: break-word;
    }

    a:hover {
        color: var(--ant-color-primary, #5e6ad2);
    }

    a:focus-visible {
        color: var(--ant-color-primary, #5e6ad2);
        outline-offset: 2px;
    }

    small {
        color: var(--ant-color-text-tertiary, rgba(15, 23, 42, 0.5));
        font-size: ${fontSize.xs}px;
    }
`;

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
    letter-spacing: ${letterSpacing.normal};
    width: 36px;
`;

const ManagerPill = styled.span`
    align-items: center;
    color: var(--ant-color-text, rgba(15, 23, 42, 0.85));
    display: inline-flex;
    gap: ${space.xs}px;
    min-width: 0;
`;

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

const ProjectList: React.FC<Props> = ({ members, error, ...props }) => {
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
                            {microcopy.feedback.noManager}
                        </Typography.Text>
                    );
                }
                return (
                    <ManagerPill>
                        <UserAvatar
                            id={manager._id}
                            name={manager.username}
                            size="small"
                        />
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
                        <Typography.Text type="secondary">
                            {microcopy.feedback.noDate}
                        </Typography.Text>
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
                    emptyText: error ? (
                        <span />
                    ) : (
                        <EmptyState
                            title={microcopy.empty.projects.title}
                            description={microcopy.empty.projects.description}
                            cta={
                                <Button
                                    aria-label={microcopy.actions.createProject}
                                    icon={<PlusOutlined aria-hidden />}
                                    onClick={openModal}
                                    type="primary"
                                >
                                    {microcopy.actions.createProject}
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
