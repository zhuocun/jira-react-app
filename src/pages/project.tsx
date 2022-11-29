import ProjectSearchPanel from "../components/projectSearchPanel";
import ProjectList from "../components/projectList";
import useDebounce from "../utils/hooks/useDebounce";
import { Button, Typography } from "antd";
import useReactQuery from "../utils/hooks/useReactQuery";
import useTitle from "../utils/hooks/useTitle";
import useUrl from "../utils/hooks/useUrl";
import useProjectModal from "../utils/hooks/useProjectModal";
import Row from "../components/row";
import PageContainer from "../components/pageContainer";

const ProjectPage = () => {
    useTitle("Project List", false);
    const { openModal } = useProjectModal();
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
            <Row marginBottom={2} between={true}>
                <h1>Project List</h1>
                <Button type={"link"} onClick={openModal}>
                    Create Project
                </Button>
            </Row>
            <ProjectSearchPanel
                param={param}
                setParam={setParam}
                members={members || []}
                loading={mLoading}
            />
            {pError || mError ? (
                <Typography.Text type={"danger"}>
                    {"Data fetching failed, please try again later."}
                </Typography.Text>
            ) : null}
            <ProjectList
                dataSource={projects || []}
                members={members || []}
                loading={pLoading || mLoading}
            />
        </PageContainer>
    );
};

export default ProjectPage;
