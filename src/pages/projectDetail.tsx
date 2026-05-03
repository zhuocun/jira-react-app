import styled from "@emotion/styled";
import { Alert, Breadcrumb, Button, Skeleton, Tabs } from "antd";
import { useEffect } from "react";
import {
    Link,
    Outlet,
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";

import EmptyState from "../components/emptyState";
import ProjectPopover from "../components/projectPopover";
import { microcopy } from "../constants/microcopy";
import { breakpoints, fontSize, fontWeight, space } from "../theme/tokens";
import useReactQuery from "../utils/hooks/useReactQuery";
import useTitle from "../utils/hooks/useTitle";

const Container = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    width: 100%;
`;

const TopBar = styled.div`
    align-items: center;
    /* Transparent so the page-level peach gradient flows continuously
     * from the main header's fade strip through this breadcrumb / tabs
     * row into the board content below. The previous solid white +
     * bottom border created a hard white band that interrupted the
     * gradient and clashed with the iOS-native fade above it. */
    background: transparent;
    display: flex;
    flex-wrap: wrap;
    gap: ${space.xxs}px;
    justify-content: space-between;
    min-width: 0;
    padding: ${space.xs}px ${space.sm}px 0;
    padding-inline-start: max(${space.sm}px, env(safe-area-inset-left));
    padding-inline-end: max(${space.sm}px, env(safe-area-inset-right));

    @media (min-width: ${breakpoints.sm}px) {
        gap: ${space.xs}px;
        padding: ${space.sm}px ${space.md}px 0;
        padding-inline-start: max(${space.md}px, env(safe-area-inset-left));
        padding-inline-end: max(${space.md}px, env(safe-area-inset-right));
    }

    @media (min-width: ${breakpoints.md}px) {
        gap: ${space.md}px;
        padding: ${space.sm}px ${space.lg}px 0;
        padding-inline-start: max(${space.lg}px, env(safe-area-inset-left));
        padding-inline-end: max(${space.lg}px, env(safe-area-inset-right));
    }
`;

/*
 * flex-basis: auto reads as the breadcrumb's max-content width, which for a
 * 200-char project name is wider than the row, pushing the Board tab onto
 * its own line below. Pin the basis to 0 so the wrapper starts empty and
 * grows into whatever space the tabs leave behind; the inner ellipsis takes
 * care of the visual truncation.
 *
 * AntD Breadcrumb's inner <ol> is a flex container with flex-wrap: wrap, so
 * once the wrapper stops growing past max-content the long item wraps onto
 * a second row instead of getting truncated. Force nowrap on the ol and
 * pin the last item with min-width: 0 + overflow: hidden so it can shrink
 * and ellipsize in place.
 */
const BreadcrumbWrapper = styled.div`
    flex: 1 1 0;
    min-width: 0;

    && .ant-breadcrumb {
        font-size: ${fontSize.sm}px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    && .ant-breadcrumb ol {
        flex-wrap: nowrap;
    }
    && .ant-breadcrumb li:last-child {
        color: var(--ant-color-text, rgba(15, 23, 42, 0.92));
        font-weight: ${fontWeight.semibold};
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

const TabsRow = styled(Tabs)`
    && {
        flex: 0 0 auto;
        margin-bottom: -1px;
        min-width: 0;
    }
    /* AntD draws a 1 px rail under the tab list (.ant-tabs-nav::before)
     * that the orange ink-bar slides on. With the surrounding TopBar now
     * transparent, that gray rail would print a hard line over the peach
     * gradient. Hide it — the orange ink-bar alone is enough to mark the
     * active tab. */
    && .ant-tabs-nav::before {
        border-bottom-color: transparent;
    }
    && .ant-tabs-tab {
        font-weight: ${fontWeight.medium};
        padding: ${space.xs}px ${space.sm}px;
    }
    && .ant-tabs-ink-bar {
        height: 2px;
    }
`;

const Body = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: auto;
`;

const tabItems = [
    {
        key: "board",
        label: (
            <Link to="board" viewTransition>
                Board
            </Link>
        )
    }
];

/**
 * Replaces the previous duplicated grid + sidebar shell with a breadcrumb +
 * tabs header (Phase 2.5). Also drops the broken `5 px` shadow rule.
 */
const ProjectDetailPage = () => {
    const { pathname } = useLocation();
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const segments = pathname.split("/").filter(Boolean);
    const activeTab = segments[segments.length - 1] || "board";

    const {
        data: project,
        isLoading: pLoading,
        isSuccess: pSuccess,
        error: pError,
        refetch: refetchProject
    } = useReactQuery<IProject>("projects", { projectId });
    /*
     * Browser tab title mirrors the current project. Until the query resolves
     * we keep a generic "Project" so the previous page's title (likely
     * "Projects") is replaced with something accurate to this shell.
     */
    useTitle(project?.projectName ?? "Project");

    /*
     * A successful query that returns a falsy body is treated as not-found —
     * the JSON-server mock can return `null` / empty for an unknown id, and
     * we should surface a friendly 404 rather than render the board outlet
     * against a phantom project.
     */
    const isNotFound = pSuccess && !project;

    useEffect(() => {
        if (pError || isNotFound) return;
        if (!pathname.endsWith("/board")) {
            navigate("board");
        }
    }, [navigate, pathname, pError, isNotFound]);

    return (
        <Container>
            <TopBar>
                <BreadcrumbWrapper>
                    <Breadcrumb
                        items={[
                            {
                                title: <ProjectPopover />
                            },
                            {
                                title:
                                    pLoading && !project ? (
                                        <Skeleton.Input
                                            active
                                            size="small"
                                            style={{ width: 160 }}
                                        />
                                    ) : (
                                        (project?.projectName ?? "Project")
                                    )
                            }
                        ]}
                    />
                </BreadcrumbWrapper>
                <TabsRow activeKey={activeTab} items={tabItems} size="small" />
            </TopBar>
            <Body>
                {pError ? (
                    <Alert
                        action={
                            <Button
                                onClick={() => refetchProject()}
                                size="small"
                                type="primary"
                            >
                                {microcopy.actions.retry}
                            </Button>
                        }
                        description={microcopy.feedback.retryHint}
                        message={microcopy.feedback.loadFailed}
                        showIcon
                        style={{ margin: space.md }}
                        type="error"
                    />
                ) : isNotFound ? (
                    <EmptyState
                        title={microcopy.empty.notFound.title}
                        description={microcopy.empty.notFound.description}
                        cta={
                            <Button
                                onClick={() =>
                                    navigate("/projects", {
                                        viewTransition: true
                                    })
                                }
                                type="primary"
                            >
                                {microcopy.empty.notFound.cta}
                            </Button>
                        }
                    />
                ) : (
                    <Outlet />
                )}
            </Body>
        </Container>
    );
};

export default ProjectDetailPage;
