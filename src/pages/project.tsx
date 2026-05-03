import { PlusOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Alert, Button, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";

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
    radius,
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
    border-radius: ${radius.lg}px;
    display: flex;
    flex-direction: column;
    gap: ${space.xxs / 2}px;
    min-width: 0;
    padding: ${space.xs}px ${space.sm}px;

    @media (min-width: ${breakpoints.sm}px) {
        gap: ${space.xxs}px;
        padding: ${space.md}px ${space.lg}px;
    }
`;

const StatLabel = styled.span`
    color: var(--ant-color-text-tertiary, rgba(15, 23, 42, 0.55));
    font-size: ${fontSize.xs}px;
    font-weight: ${fontWeight.medium};
    letter-spacing: ${letterSpacing.wide};
    /* The card uses align-items: flex-start (so values don't stretch),
     * which sizes children to their content on the cross axis. Without
     * this cap, "TEAM MEMBERS" sizes to its 103 px max-content and
     * spills past the card on narrow viewports — the
     * text-overflow: ellipsis below only fires when the element is
     * actually narrower than its content. */
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;

    /* Below sm (480 px) three columns leave ~90 px per label.
     * "TOTAL PROJECTS" / "ORGANIZATIONS" / "TEAM MEMBERS" run ~105–115 px
     * with the wide tracking, so the ellipsis was clipping mid-word
     * ("TOTAL PRO…", "TEAM MEM…"). Drop the tracking, shrink the size
     * a notch, and allow break-anywhere so the single-token
     * "ORGANIZATIONS" wraps cleanly inside its card. */
    @media (max-width: ${breakpoints.sm - 1}px) {
        font-size: 11px;
        letter-spacing: ${letterSpacing.normal};
        line-height: ${lineHeight.tight};
        overflow-wrap: anywhere;
        white-space: normal;
        text-overflow: clip;
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
    const [chatInitialPrompt, setChatInitialPrompt] = useState<
        string | undefined
    >(undefined);
    /**
     * Listen for `boardCopilot:openChat` from the command palette so the
     * project list (no board context) still surfaces AI mode submissions
     * (PRD CP-R6).
     */
    useEffect(() => {
        if (!aiEnabled) return;
        const onOpenChat = (event: Event) => {
            const detail = (event as CustomEvent<{ prompt?: string }>).detail;
            setChatInitialPrompt(detail?.prompt);
            setChatOpen(true);
        };
        window.addEventListener("boardCopilot:openChat", onOpenChat);
        return () =>
            window.removeEventListener("boardCopilot:openChat", onOpenChat);
    }, [aiEnabled]);
    const [param, setParam] = useUrl([
        "projectName",
        "managerId",
        "semanticIds"
    ]);
    /*
     * Only the API-triggering params (projectName, managerId) are debounced;
     * the client-side semanticIds filter applies immediately so users see
     * keystroke-rate feedback. 300 ms is the sweet spot between perceived
     * snappiness and avoiding a request per keystroke.
     */
    const debouncedParam = useDebounce(param, 300);
    const { projectName, managerId } = debouncedParam;
    const fetchParam = { projectName, managerId };
    const {
        isLoading: pLoading,
        error: pError,
        data: projects,
        refetch: refetchProjects
    } = useReactQuery<IProject[]>("projects", fetchParam);
    const {
        isLoading: mLoading,
        error: mError,
        data: members,
        refetch: refetchMembers
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
                    action={
                        <Button
                            onClick={() => {
                                if (pError) refetchProjects();
                                if (mError) refetchMembers();
                            }}
                            size="small"
                            type="primary"
                        >
                            {microcopy.actions.retry}
                        </Button>
                    }
                    description={microcopy.feedback.retryHint}
                    showIcon
                    style={{ marginBottom: space.sm }}
                    title={microcopy.feedback.loadFailed}
                    type="error"
                />
            ) : null}
            <ProjectList
                dataSource={filteredProjects}
                error={Boolean(pError || mError)}
                members={members ?? []}
                loading={pLoading || mLoading}
            />
            {aiEnabled && (
                <AiChatDrawer
                    columns={[]}
                    initialPrompt={chatInitialPrompt}
                    knownProjectIds={(projects ?? []).map((p) => p._id)}
                    members={members ?? []}
                    onClose={() => {
                        setChatOpen(false);
                        setChatInitialPrompt(undefined);
                    }}
                    open={chatOpen}
                    project={null}
                    tasks={[]}
                />
            )}
        </PageContainer>
    );
};

export default ProjectPage;
