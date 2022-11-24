import SearchPanel from "../components/searchPanel";
import ProjectList from "../components/projectList";
import useDebounce from "../utils/hooks/useDebounce";
import styled from "@emotion/styled";
import { Typography } from "antd";
import useFetch from "../utils/hooks/useFetch";
import useTitle from "../utils/hooks/useTitle";
import useUrl from "../utils/hooks/useUrl";
import { useEffect } from "react";
import { useReduxDispatch } from "../utils/hooks/useRedux";
import { projectActions } from "../store/reducers/projectSlice";

const ProjectPage = () => {
    useTitle("Project List", false);
    const dispatch = useReduxDispatch();
    const [param, setParam] = useUrl(["projectName", "managerId"]);
    const debouncedParam = useDebounce(param, 1000);
    const {
        isLoading: pLoading,
        error: pError,
        data: projects
    } = useFetch("projects", debouncedParam);
    const {
        isLoading: mLoading,
        error: mError,
        data: members
    } = useFetch("users/members");

    useEffect(() => {
        dispatch(projectActions.setProjects(projects || []));
    }, [dispatch, projects]);

    return (
        <Container>
            <h1>Project List</h1>
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
