import { Link } from "react-router-dom";

const ProjectPage = () => {
    return (
        <>
            <Link to={"kanban"}>Kanban</Link>
            <Link to={"epic"}>Epic</Link>
        </>
    );
};

export default ProjectPage;
