import { useEffect, useState } from "react";
import SearchPanel from "./searchPanel";
import List from "./list";
import qs from "qs";
import filterRequest from "../../utils/filterRequest";
import environment from "../../constants/env";

const ProjectList: React.FC = () => {
    const apiBaseUrl = environment.apiBaseUrl;
    const [param, setParam] = useState<{ name: string; personId: string }>({
        name: "",
        personId: ""
    });
    const [users, setUsers] = useState<IUser[]>([]);
    const [list, setList] = useState<IProject[]>([]);

    useEffect(() => {
        fetch(`${apiBaseUrl}/users`).then(async (res) => {
            if (res.ok) {
                setUsers(await res.json());
            }
        });
    }, [apiBaseUrl]);

    useEffect(() => {
        fetch(
            `${apiBaseUrl}/projects?${qs.stringify(filterRequest(param))}`
        ).then(async (res) => {
            if (res.ok) {
                setList(await res.json());
            }
        });
    }, [apiBaseUrl, param]);

    return (
        <>
            <SearchPanel param={param} setParam={setParam} users={users} />
            <List list={list} users={users} />
        </>
    );
};

export default ProjectList;
