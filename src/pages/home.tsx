import { useAuth } from "../utils/context/authContext";
import MainLayout from "../layouts/mainLayout";
import AuthLayout from "../layouts/authLayout";
import useMount from "../utils/hooks/useMount";
import { useLocation, useNavigate } from "react-router";

const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const path = location.pathname;

    useMount(() => {
        if (path === "/login" || path === "/register") {
            logout(path);
        }
        if (!user) {
            navigate("/login");
        }
    }, user);

    return <>{user ? <MainLayout /> : <AuthLayout />}</>;
};

export default HomePage;
