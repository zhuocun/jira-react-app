import { PlusOutlined } from "@ant-design/icons";
import { Alert, Button, Space } from "antd";
import { useState } from "react";

import AiChatDrawer from "../components/aiChatDrawer";
import AiSearchInput from "../components/aiSearchInput";
import AiSparkleIcon from "../components/aiSparkleIcon";
import PageContainer from "../components/pageContainer";
import ProjectList from "../components/projectList";
import ProjectSearchPanel from "../components/projectSearchPanel";
import Row from "../components/row";
import { microcopy } from "../constants/microcopy";
import useAiEnabled from "../utils/hooks/useAiEnabled";
import useDebounce from "../utils/hooks/useDebounce";
import useProjectModal from "../utils/hooks/useProjectModal";
import useReactQuery from "../utils/hooks/useReactQuery";
import useTitle from "../utils/hooks/useTitle";
import useUrl from "../utils/hooks/useUrl";

const ProjectPage = () => {
    useTitle("Project List", false);
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

    return (
        <PageContainer>
            <Row marginBottom={2} between>
                <h1>Project List</h1>
                <Space>
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
                        aria-label="Create Project"
                        icon={<PlusOutlined aria-hidden />}
                        onClick={openModal}
                        type="primary"
                    >
                        Create Project
                    </Button>
                </Space>
            </Row>
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
                                marginBottom: "0.75rem"
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
                    style={{ marginBottom: 12 }}
                    title="Data fetching failed, please try again later."
                    type="error"
                />
            ) : null}
            <ProjectList
                dataSource={
                    param.semanticIds
                        ? (projects ?? []).filter((p) =>
                              param
                                  .semanticIds!.split(",")
                                  .filter(Boolean)
                                  .includes(p._id)
                          )
                        : (projects ?? [])
                }
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
