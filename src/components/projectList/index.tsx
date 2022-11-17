import { useState } from "react";
import SearchPanel from "./searchPanel";
import List from "./list";
import useDebounce from "../../utils/hooks/useDebounce";
import filterRequest from "../../utils/filterRequest";
import useApi from "../../utils/hooks/useApi";
import useMount from "../../utils/hooks/useMount";
import styled from "@emotion/styled";
import { Typography } from "antd";

const ProjectList: React.FC = () => {
    const api = useApi();
    const [param, setParam] = useState<{ name: string; personId: string }>({
        name: "",
        personId: ""
    });
    const [users, setUsers] = useState<IUser[]>([]);
    const [list, setList] = useState<IProject[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<null | Error>(null);
    const debounceParam = useDebounce(param, 1000);

    useMount(() => {
        setLoading(true);
        api("users")
            .then(setUsers)
            .finally(() => setLoading(false));
    });

    useMount(() => {
        setLoading(true);
        setError(null);
        api("projects", { data: filterRequest(debounceParam) })
            .then(setList)
            .catch((err) => {
                setList([]);
                setError(err);
            })
            .finally(() => setLoading(false));
    }, debounceParam);

    return (
        <Container>
            <h1>Project List</h1>
            <SearchPanel param={param} setParam={setParam} users={users} />
            {error ? (
                <Typography.Text type={"danger"}>
                    {"Operation failed, please try again later."}
                </Typography.Text>
            ) : null}
            <List dataSource={list} users={users} loading={loading} />
        </Container>
    );
};

export default ProjectList;

const Container = styled.div`
    padding: 3.2rem;
`;
