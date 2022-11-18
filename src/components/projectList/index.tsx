import { useState } from "react";
import SearchPanel from "./searchPanel";
import List from "./list";
import useDebounce from "../../utils/hooks/useDebounce";
import styled from "@emotion/styled";
import { Typography } from "antd";
import useFetch from "../../utils/hooks/useFetch";

const ProjectList: React.FC = () => {
    const [param, setParam] = useState<Partial<IProject>>({});
    const debouncedParam = useDebounce(param, 1000);
    const { isLoading: pLoading, error: pError, data: list } = useFetch("projects", debouncedParam);
    const { isLoading: uLoading, error: uError, data: users } = useFetch("users");

    return (
        <Container>
            <h1>Project List</h1>
            <SearchPanel param={param} setParam={setParam} users={users || []} />
            {pError || uError ? (
                <Typography.Text type={"danger"}>
                    {"Operation failed, please try again later."}
                </Typography.Text>
            ) : null}
            <List dataSource={list || []} users={users || []} loading={pLoading || uLoading} />
        </Container>
    );
};

export default ProjectList;

const Container = styled.div`
  padding: 3.2rem;
`;
