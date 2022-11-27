import SearchPanel from "../components/searchPanel";
import ProjectList from "../components/projectList";
import useDebounce from "../utils/hooks/useDebounce";
import styled from "@emotion/styled";
import { Button, Typography } from "antd";
import useReactQuery from "../utils/hooks/useReactQuery";
import useTitle from "../utils/hooks/useTitle";
import useUrl from "../utils/hooks/useUrl";
import useProjectModal from "../utils/hooks/useProjectModal";
import Row from "../components/row";

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
        <Container>
            <Row marginBottom={2} between={true}>
                <h1>Project List</h1>
                <Button type={"link"} onClick={openModal}>
                    Create Project
                </Button>
            </Row>
            <SearchPanel
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
        </Container>
    );
};

export default ProjectPage;

const Container = styled.div`
    padding: 3.2rem;
`;
