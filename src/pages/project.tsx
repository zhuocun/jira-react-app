import { Button, Space, Typography } from "antd";
import { useState } from "react";

import AiChatDrawer from "../components/aiChatDrawer";
import AiSparkleIcon from "../components/aiSparkleIcon";
import PageContainer from "../components/pageContainer";
import ProjectList from "../components/projectList";
import ProjectSearchPanel from "../components/projectSearchPanel";
import Row from "../components/row";
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
    const [param, setParam] = useUrl(["projectName", "managerId"]);
    const debouncedParam = useDebounce(param, 1000);
    const {
        isLoading: pLoading,
        error: pError,
        data: projects
    } = useReactQuery<IProject[]>("projects", debouncedParam);
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
                    <Button type="link" onClick={openModal}>
                        Create Project
                    </Button>
                </Space>
            </Row>
            <ProjectSearchPanel
                param={param}
                setParam={setParam}
                members={members ?? []}
                loading={mLoading}
            />
            {pError || mError ? (
                <Typography.Text type="danger">
                    Data fetching failed, please try again later.
                </Typography.Text>
            ) : null}
            <ProjectList
                dataSource={projects ?? []}
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
