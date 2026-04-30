import styled from "@emotion/styled";
import { Breadcrumb, Skeleton, Tabs } from "antd";
import { useEffect } from "react";
import {
    Link,
    Outlet,
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";

import ProjectPopover from "../components/projectPopover";
import { breakpoints, space } from "../theme/tokens";
import useReactQuery from "../utils/hooks/useReactQuery";

const Container = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    width: 100%;
`;

const TopBar = styled.div`
    align-items: center;
    background: var(--ant-color-bg-container, #fff);
    border-bottom: 1px solid var(--ant-color-split, rgba(5, 5, 5, 0.06));
    display: flex;
    flex-wrap: wrap;
    gap: ${space.xs}px;
    justify-content: space-between;
    padding: ${space.sm}px ${space.md}px 0;
    padding-inline-start: max(${space.md}px, env(safe-area-inset-left));
    padding-inline-end: max(${space.md}px, env(safe-area-inset-right));

    @media (min-width: ${breakpoints.md}px) {
        gap: ${space.md}px;
        padding: ${space.sm}px ${space.lg}px 0;
        padding-inline-start: max(${space.lg}px, env(safe-area-inset-left));
        padding-inline-end: max(${space.lg}px, env(safe-area-inset-right));
    }
`;

const TabsRow = styled(Tabs)`
    && {
        margin-bottom: -1px;
    }
`;

const Body = styled.div`
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: auto;
`;

const tabItems = [{ key: "board", label: <Link to="board">Board</Link> }];

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

    const { data: project, isLoading: pLoading } = useReactQuery<IProject>(
        "projects",
        { projectId }
    );

    useEffect(() => {
        if (!pathname.endsWith("/board")) {
            navigate("board");
        }
    }, [navigate, pathname]);

    return (
        <Container>
            <TopBar>
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
                <TabsRow activeKey={activeTab} items={tabItems} size="small" />
            </TopBar>
            <Body>
                <Outlet />
            </Body>
        </Container>
    );
};

export default ProjectDetailPage;
