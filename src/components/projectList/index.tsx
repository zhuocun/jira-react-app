import { useEffect, useState } from "react";
import SearchPanel from "./searchPanel";
import List from "./list";

const apiUrl = process.env.REACT_APP_API_URL;
const ProjectList: React.FC = () => {
    const [param, setParam] = useState<{ name: string; personId: string }>({
        name: "",
        personId: ""
    });
    const [users, setUsers] = useState<IUser[]>([]);
    const [list, setList] = useState<IProject[]>([]);

    useEffect(() => {
        fetch(`${apiUrl}/users`).then(async (res) => {
            if (res.ok) {
                setUsers(await res.json());
            }
        });
    }, []);

    useEffect(() => {
        fetch(
            `${apiUrl}/projects?name=${param.name}&personId=${param.personId}`
        ).then(async (res) => {
            if (res.ok) {
                setList(await res.json());
            }
        });
    }, [param]);

    return (
        <>
            <SearchPanel param={param} setParam={setParam} users={users} />
            <List list={list} users={users} />
        </>
    );
};

export default ProjectList;
