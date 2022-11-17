import ProjectList from "../components/projectList";
import { useAuth } from "../utils/context/authContext";

const MainLayout = () => {
    const { logout } = useAuth();
    return (
        <>
            <button onClick={logout}>Logout</button>
            <ProjectList />
        </>
    );
};

export default MainLayout;
