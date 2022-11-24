import { Link } from "react-router-dom";

const ProjectDetailPage = () => {
    return (
        <>
            <Link to={"kanban"}>Kanban</Link>
            <Link to={"epic"}>Epic</Link>
        </>
    );
};

export default ProjectDetailPage;
