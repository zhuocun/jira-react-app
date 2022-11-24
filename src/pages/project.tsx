import SearchPanel from "../components/searchPanel";
import ProjectList from "../components/projectList";
import useDebounce from "../utils/hooks/useDebounce";
import styled from "@emotion/styled";
import { Typography } from "antd";
import useFetch from "../utils/hooks/useFetch";
import useTitle from "../utils/hooks/useTitle";
import useUrl from "../utils/hooks/useUrl";

const ProjectPage = () => {
    useTitle("Project List", false);
    const [param, setParam] = useUrl(["projectName", "managerId"]);
    const debouncedParam = useDebounce(param, 1000);
    const {
        isLoading: pLoading,
        error: pError,
        data: list
    } = useFetch("projects", debouncedParam);
    const {
        isLoading: uLoading,
        error: uError,
        data: members
    } = useFetch("users/members");

    return (
        <Container>
            <h1>Project List</h1>
            <SearchPanel
                param={param}
                setParam={setParam}
                members={members || []}
                loading={uLoading}
            />
            {pError || uError ? (
                <Typography.Text type={"danger"}>
                    {"Data fetching failed, please try again later."}
                </Typography.Text>
            ) : null}
            <ProjectList
                dataSource={list || []}
                members={members || []}
                loading={pLoading || uLoading}
            />
        </Container>
    );
};

export default ProjectPage;

const Container = styled.div`
    padding: 3.2rem;
`;
