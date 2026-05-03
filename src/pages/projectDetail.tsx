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
    /*
     * Sticky-opaque secondary chrome. Mirrors the main header's pattern:
     * the surface uses --page-background with background-attachment:
     * fixed, so the bar reads as a continuous extension of the page
     * gradient when at rest, but the layer is fully opaque — content
     * scrolling under it is cleanly hidden. The bar pins itself just
     * below the main header by sticking at top: var(--header-height),
     * which the main header publishes via a ResizeObserver.
     *
     * z-index 10 matches the main header. The bar is later in DOM order
     * so it stacks above the main header's fade strip in the area
     * between the chrome layers, which is what we want — the strip is
     * decorative, the breadcrumb / tabs are content.
     *
     * Vertical padding tracks the main header's compact rhythm: now
     * that the main chrome lives in ~54 px (2 + 44 + 8 fade), the old
     * symmetric 12 / 12 / 24-fade here added another ~80 px of chrome
     * on top, which read as a heavy stacked band. Trimmed to
     * space.xs / space.xs / 8-fade so both chrome layers feel cut from
     * the same cloth.
     */
    background: var(--page-background);
    background-attachment: fixed;
    display: flex;
    flex-wrap: wrap;
    gap: ${space.xxs}px;
    justify-content: space-between;
    min-width: 0;
    padding: ${space.xs}px ${space.sm}px;
    padding-inline-start: max(${space.sm}px, env(safe-area-inset-left));
    padding-inline-end: max(${space.sm}px, env(safe-area-inset-right));
    position: sticky;
    top: var(--header-height, 44px);
    z-index: 10;

    @media (min-width: ${breakpoints.sm}px) {
        gap: ${space.xs}px;
        padding: ${space.xs}px ${space.md}px;
        padding-inline-start: max(${space.md}px, env(safe-area-inset-left));
        padding-inline-end: max(${space.md}px, env(safe-area-inset-right));
    }

    @media (min-width: ${breakpoints.md}px) {
        gap: ${space.md}px;
        padding: ${space.xs}px ${space.lg}px;
        padding-inline-start: max(${space.lg}px, env(safe-area-inset-left));
        padding-inline-end: max(${space.lg}px, env(safe-area-inset-right));
    }

    /*
     * Soft fade strip below TopBar — same recipe as the main header's
     * ::after, now matched to the main header's 8 px floor so both
     * chrome layers end with the same fade weight rather than the old
     * 24 px strip that read as another full row of header.
     */
    &::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        height: 8px;
        background: var(--page-background);
        background-attachment: fixed;
        mask-image: linear-gradient(to bottom, black, transparent);
        -webkit-mask-image: linear-gradient(to bottom, black, transparent);
        pointer-events: none;
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
        min-width: 0;
    }
    /* AntD draws a 1 px rail under the tab list (.ant-tabs-nav::before)
     * that the orange ink-bar slides on. With the surrounding TopBar
     * now using the page gradient as a surface, that gray rail would
     * print a hard line over the peach. Hide it — the orange ink-bar
     * alone is enough to mark the active tab. AntD's nav also has a
     * default margin-bottom we drop to keep the row centered. */
    && .ant-tabs-nav {
        margin: 0;
    }
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
