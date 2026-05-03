import { PlusOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Button, message, Modal, Select } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

import { microcopy } from "../../constants/microcopy";
import {
    breakpoints,
    fontSize,
    fontWeight,
    letterSpacing,
    space
} from "../../theme/tokens";
import useAuth from "../../utils/hooks/useAuth";
import useProjectModal from "../../utils/hooks/useProjectModal";
import useReactMutation from "../../utils/hooks/useReactMutation";
import deleteProjectCallback from "../../utils/optimisticUpdate/deleteProject";
import EmptyState from "../emptyState";
import ProjectCard, { ProjectCardSkeleton } from "../projectCard";

interface Props {
    dataSource?: IProject[];
    members: IMember[];
    /**
     * When the upstream query failed, the page renders an Alert with retry
     * above the grid. Hide the in-grid "No projects yet" empty state in
     * that case so the user is not told the list is empty when we simply
     * couldn't load it.
     */
    error?: boolean;
    loading?: boolean;
}

/**
 * Re-exported for older call sites (header, login, register, popovers)
 * that still expect the project list module to expose this primitive.
 * It exists here for backwards compatibility — new code should prefer a
 * locally-styled `<Button>` instead of importing this.
 */
export const NoPaddingButton = styled(Button)`
    padding: 0;
`;

const ListSurface = styled.section`
    display: flex;
    flex-direction: column;
    gap: ${space.md}px;
`;

const Toolbar = styled.div`
    align-items: center;
    color: var(--ant-color-text-secondary, rgba(15, 23, 42, 0.6));
    display: flex;
    flex-wrap: wrap;
    font-size: ${fontSize.sm}px;
    gap: ${space.sm}px;
    justify-content: space-between;

    > * {
        min-width: 0;
    }
`;

const ResultCount = styled.span`
    font-weight: ${fontWeight.medium};
    letter-spacing: ${letterSpacing.tight};
`;

const SortRow = styled.label`
    align-items: center;
    color: var(--ant-color-text-tertiary, rgba(15, 23, 42, 0.5));
    display: inline-flex;
    font-size: ${fontSize.xs}px;
    font-weight: ${fontWeight.medium};
    gap: ${space.xs}px;
    letter-spacing: ${letterSpacing.wide};
    text-transform: uppercase;
`;

const Grid = styled.div`
    display: grid;
    gap: ${space.md}px;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));

    @media (min-width: ${breakpoints.sm}px) {
        gap: ${space.lg}px;
        grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
    }
`;

const SKELETON_KEY_PREFIX = "__skeleton__";
const SKELETON_COUNT = 6;

type SortOrder = "name-asc" | "name-desc" | "newest" | "oldest";

const SORT_OPTIONS: { label: string; value: SortOrder }[] = [
    { label: "Name (A → Z)", value: "name-asc" },
    { label: "Name (Z → A)", value: "name-desc" },
    { label: "Newest first", value: "newest" },
    { label: "Oldest first", value: "oldest" }
];

const sortProjects = (projects: IProject[], order: SortOrder): IProject[] => {
    const out = [...projects];
    switch (order) {
        case "name-desc":
            out.sort((a, b) => b.projectName.localeCompare(a.projectName));
            break;
        case "newest":
            out.sort(
                (a, b) =>
                    new Date(b.createdAt ?? 0).getTime() -
                    new Date(a.createdAt ?? 0).getTime()
            );
            break;
        case "oldest":
            out.sort(
                (a, b) =>
                    new Date(a.createdAt ?? 0).getTime() -
                    new Date(b.createdAt ?? 0).getTime()
            );
            break;
        case "name-asc":
        default:
            out.sort((a, b) => a.projectName.localeCompare(b.projectName));
    }
    return out;
};

const ProjectList: React.FC<Props> = ({
    dataSource,
    members,
    error,
    loading
}) => {
    const { user, refreshUser } = useAuth();
    const [pendingLikeId, setPendingLikeId] = useState("");
    const [sortOrder, setSortOrder] = useState<SortOrder>("name-asc");
    const showSkeleton = Boolean(loading) && !error;
    const { mutateAsync: update } = useReactMutation(
        "users/likes",
        "PUT",
        "users"
    );
    const { mutate: remove } = useReactMutation(
        "projects",
        "DELETE",
        ["projects", {}],
        deleteProjectCallback,
        // Suppress useReactMutation's auto-revert toast; we surface a
        // dedicated success/failure toast below so the user sees the
        // outcome of the explicit confirm-to-delete.
        () => {}
    );
    const { startEditing, openModal } = useProjectModal();

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const sortedProjects = useMemo(
        () => sortProjects(dataSource ?? [], sortOrder),
        [dataSource, sortOrder]
    );

    const onLike = useCallback(
        (projectId: string) => {
            setPendingLikeId(projectId);
            update({ projectId })
                .catch(() => {
                    // Without this catch the heart icon stays stuck in its
                    // optimistic flipped state because `pendingLikeId` is
                    // never cleared on rejection.
                    message.error(microcopy.feedback.likeFailed);
                })
                .finally(() => {
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
                remove(
                    { projectId },
                    {
                        onSuccess: () =>
                            message.success(microcopy.feedback.projectDeleted),
                        onError: () =>
                            message.error(microcopy.feedback.saveFailed)
                    }
                );
            }
        });
    };

    const isLiked = (projectId: string): boolean => {
        const baseLiked = Boolean(user?.likedProjects?.includes(projectId));
        if (pendingLikeId === projectId) return !baseLiked;
        return baseLiked;
    };

    if (showSkeleton) {
        return (
            <ListSurface aria-busy>
                <Grid role="list" aria-label="Loading projects">
                    {Array.from({ length: SKELETON_COUNT }, (_, idx) => (
                        <div
                            key={`${SKELETON_KEY_PREFIX}${idx}`}
                            role="listitem"
                            className="ant-skeleton"
                        >
                            <ProjectCardSkeleton />
                        </div>
                    ))}
                </Grid>
            </ListSurface>
        );
    }

    if (error) {
        // Page-level <Alert> is rendered by the calling page; render
        // nothing here so the user does not see a misleading empty state.
        return <ListSurface />;
    }

    if (sortedProjects.length === 0) {
        return (
            <ListSurface>
                <EmptyState
                    variant="projects"
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
            </ListSurface>
        );
    }

    return (
        <ListSurface>
            <Toolbar>
                <ResultCount aria-live="polite">
                    {sortedProjects.length}{" "}
                    {sortedProjects.length === 1 ? "project" : "projects"}
                </ResultCount>
                <SortRow>
                    Sort
                    <Select<SortOrder>
                        aria-label="Sort projects"
                        onChange={setSortOrder}
                        options={SORT_OPTIONS}
                        size="small"
                        style={{ minWidth: 152 }}
                        value={sortOrder}
                        variant="borderless"
                    />
                </SortRow>
            </Toolbar>
            <Grid role="list" aria-label="Projects">
                {sortedProjects.map((p) => (
                    <div key={p._id} role="listitem">
                        <ProjectCard
                            liked={isLiked(p._id)}
                            manager={members.find((m) => m._id === p.managerId)}
                            onDelete={() => onDelete(p._id)}
                            onEdit={() => startEditing(p._id)}
                            onLike={() => onLike(p._id)}
                            project={p}
                        />
                    </div>
                ))}
            </Grid>
        </ListSurface>
    );
};

export default ProjectList;
