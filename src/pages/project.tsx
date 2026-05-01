import { PlusOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Alert, Button, Typography } from "antd";
import { useMemo, useState } from "react";

import AiChatDrawer from "../components/aiChatDrawer";
import AiSearchInput from "../components/aiSearchInput";
import AiSparkleIcon from "../components/aiSparkleIcon";
import PageContainer from "../components/pageContainer";
import ProjectList from "../components/projectList";
import ProjectSearchPanel from "../components/projectSearchPanel";
import { microcopy } from "../constants/microcopy";
import {
    breakpoints,
    fontSize,
    fontWeight,
    letterSpacing,
    lineHeight,
    space
} from "../theme/tokens";
import useAiEnabled from "../utils/hooks/useAiEnabled";
import useDebounce from "../utils/hooks/useDebounce";
import useProjectModal from "../utils/hooks/useProjectModal";
import useReactQuery from "../utils/hooks/useReactQuery";
import useTitle from "../utils/hooks/useTitle";
import useUrl from "../utils/hooks/useUrl";

const PageHeader = styled.header`
    align-items: flex-end;
    display: flex;
    flex-wrap: wrap;
    gap: ${space.sm}px;
    justify-content: space-between;
    margin-bottom: ${space.lg}px;
    row-gap: ${space.xs}px;

    @media (min-width: ${breakpoints.md}px) {
        margin-bottom: ${space.xl}px;
    }
`;

const PageHeading = styled(Typography.Title)`
    && {
        font-size: ${fontSize.xl}px;
        font-weight: ${fontWeight.semibold};
        letter-spacing: ${letterSpacing.tight};
        line-height: ${lineHeight.tight};
        margin: 0;
        min-width: 0;
    }

    @media (min-width: ${breakpoints.md}px) {
        && {
            font-size: ${fontSize.xxl}px;
        }
    }
`;

const PageSubheading = styled.p`
    color: var(--ant-color-text-secondary, rgba(15, 23, 42, 0.6));
    font-size: ${fontSize.base}px;
    line-height: ${lineHeight.normal};
    margin: ${space.xxs}px 0 0;
    max-width: 56ch;
`;

const PageHeadingGroup = styled.div`
    flex: 1 1 auto;
    min-width: 0;
`;

const Toolbar = styled.div`
    align-items: center;
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: ${space.xs}px;

    @media (max-width: ${breakpoints.sm - 1}px) {
        flex-basis: 100%;
        > .ant-btn {
            flex: 1 1 0;
        }
    }
`;

const StatRail = styled.div`
    display: grid;
    gap: ${space.xs}px;
    /*
     * On the narrowest viewports (≤ 360 px) three columns leave each card
     * around 95 px, which crowds the labels and clips the values. Drop to a
     * single horizontal row of three smaller cards instead, then expand to
     * three full columns at sm+. The grid-template-columns at base width
     * uses minmax(0, 1fr) so labels stay fully visible on every Android
     * width down to 320 px.
     */
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-bottom: ${space.md}px;

    @media (min-width: ${breakpoints.sm}px) {
        gap: ${space.sm}px;
        margin-bottom: ${space.lg}px;
    }
`;

const StatCard = styled.div`
    align-items: flex-start;
    background: var(--ant-color-bg-container, #fff);
    border: 1px solid var(--ant-color-border-secondary, rgba(15, 23, 42, 0.06));
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    padding: ${space.xs}px ${space.sm}px;

    @media (min-width: ${breakpoints.sm}px) {
        gap: ${space.xxs}px;
        padding: ${space.md}px ${space.lg}px;
    }
`;

const StatLabel = styled.span`
    color: var(--ant-color-text-tertiary, rgba(15, 23, 42, 0.55));
    /* 11 px label keeps three columns readable at 320 px viewport width. */
    font-size: 11px;
    font-weight: ${fontWeight.medium};
    letter-spacing: ${letterSpacing.wide};
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;

    @media (min-width: ${breakpoints.sm}px) {
        font-size: ${fontSize.xs}px;
    }
`;

const StatValue = styled.span`
    color: var(--ant-color-text, rgba(15, 23, 42, 0.92));
    font-size: ${fontSize.md}px;
    font-weight: ${fontWeight.semibold};
    letter-spacing: ${letterSpacing.tight};

    @media (min-width: ${breakpoints.sm}px) {
        font-size: ${fontSize.xl}px;
    }
`;

const ProjectPage = () => {
    useTitle("Projects", false);
    const { openModal } = useProjectModal();
    const { enabled: aiEnabled } = useAiEnabled();
    const [chatOpen, setChatOpen] = useState(false);
    const [param, setParam] = useUrl([
        "projectName",
        "managerId",
        "semanticIds"
    ]);
    const debouncedParam = useDebounce(param, 1000);
    const { projectName, managerId } = debouncedParam;
    const fetchParam = { projectName, managerId };
    const {
        isLoading: pLoading,
        error: pError,
        data: projects
    } = useReactQuery<IProject[]>("projects", fetchParam);
    const {
        isLoading: mLoading,
        error: mError,
        data: members
    } = useReactQuery<IMember[]>("users/members");

    const stats = useMemo(() => {
        const total = projects?.length ?? 0;
        const liked = (projects ?? []).filter((p) =>
            (members ?? []).some((m) => m._id === p.managerId)
        ).length;
        const orgs = new Set(
            (projects ?? []).map((p) => p.organization).filter(Boolean)
        ).size;
        return { total, withManager: liked, organizations: orgs };
    }, [projects, members]);

    const filteredProjects = param.semanticIds
        ? (projects ?? []).filter((p) =>
              param.semanticIds!.split(",").filter(Boolean).includes(p._id)
          )
        : (projects ?? []);

    return (
        <PageContainer>
            <PageHeader>
                <PageHeadingGroup>
                    <PageHeading level={1}>Projects</PageHeading>
                    <PageSubheading>
                        Browse the boards your team is shipping. Filter, search,
                        or create a new project to start tracking work.
                    </PageSubheading>
                </PageHeadingGroup>
                <Toolbar>
                    {aiEnabled && (
                        <Button
                            aria-label="Ask Board Copilot"
                            icon={<AiSparkleIcon />}
                            onClick={() => setChatOpen(true)}
                            type="default"
                        >
                            Ask
                        </Button>
                    )}
                    <Button
                        aria-label="Create project"
                        icon={<PlusOutlined aria-hidden />}
                        onClick={openModal}
                        type="primary"
                    >
                        Create project
                    </Button>
                </Toolbar>
            </PageHeader>
            <StatRail aria-hidden={pLoading}>
                <StatCard>
                    <StatLabel>Total projects</StatLabel>
                    <StatValue>{pLoading ? "—" : stats.total}</StatValue>
                </StatCard>
                <StatCard>
                    <StatLabel>Organizations</StatLabel>
                    <StatValue>
                        {pLoading ? "—" : stats.organizations}
                    </StatValue>
                </StatCard>
                <StatCard>
                    <StatLabel>Team members</StatLabel>
                    <StatValue>
                        {mLoading ? "—" : (members?.length ?? 0)}
                    </StatValue>
                </StatCard>
            </StatRail>
            <ProjectSearchPanel
                param={param}
                setParam={setParam}
                members={members ?? []}
                loading={mLoading}
                aiSearchSlot={
                    aiEnabled ? (
                        <div
                            style={{
                                flexBasis: "100%",
                                marginBottom: space.sm
                            }}
                        >
                            <AiSearchInput
                                kind="projects"
                                projectsContext={{
                                    projects: projects ?? [],
                                    members: members ?? []
                                }}
                                semanticIds={param.semanticIds}
                                setSemanticIds={(value) =>
                                    setParam({ semanticIds: value })
                                }
                            />
                        </div>
                    ) : undefined
                }
            />
            {pError || mError ? (
                <Alert
                    description={microcopy.feedback.retryHint}
                    showIcon
                    style={{ marginBottom: space.sm }}
                    title="Data fetching failed, please try again later."
                    type="error"
                />
            ) : null}
            <ProjectList
                dataSource={filteredProjects}
                members={members ?? []}
                loading={pLoading || mLoading}
            />
            {aiEnabled && (
                <AiChatDrawer
                    columns={[]}
                    knownProjectIds={(projects ?? []).map((p) => p._id)}
                    members={members ?? []}
                    onClose={() => setChatOpen(false)}
                    open={chatOpen}
                    project={null}
                    tasks={[]}
                />
            )}
        </PageContainer>
    );
};

export default ProjectPage;
