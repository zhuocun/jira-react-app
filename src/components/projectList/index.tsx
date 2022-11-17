/* eslint-disable */
import { useEffect, useState } from "react";
import SearchPanel from "./searchPanel";
import List from "./list";
import useDebounce from "../../utils/hooks/useDebounce";
import filterRequest from "../../utils/filterRequest";
import useApi from "../../utils/hooks/useApi";

const ProjectList: React.FC = () => {
    const api = useApi();
    const [param, setParam] = useState<{ name: string; personId: string }>({
        name: "",
        personId: ""
    });
    const [users, setUsers] = useState<IUser[]>([]);
    const [list, setList] = useState<IProject[]>([]);

    const debounceParam = useDebounce(param, 2000);

    useEffect(() => {
        api("users").then(setUsers);
    }, []);

    useEffect(() => {
        api("projects", {data: filterRequest(debounceParam)}).then(setList);
    }, [debounceParam]);

    return (
        <>
            <SearchPanel param={param} setParam={setParam} users={users} />
            <List list={list} users={users} />
        </>
    );
};

export default ProjectList;
