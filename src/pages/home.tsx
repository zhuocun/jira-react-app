import { useAuth } from "../utils/context/authContext";
import MainLayout from "../layouts/mainLayout";
import AuthLayout from "../layouts/authLayout";
import useMount from "../utils/hooks/useMount";
import { useNavigate } from "react-router";

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    useMount(() => {
        if (!user) {
            navigate("/login");
        } else {
            navigate("/projects");
        }
    }, user);

    return <>{user ? <MainLayout /> : <AuthLayout />}</>;
};

export default HomePage;
