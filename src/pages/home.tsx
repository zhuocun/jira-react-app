import useAuth from "../utils/hooks/useAuth";
import MainLayout from "../layouts/mainLayout";
import AuthLayout from "../layouts/authLayout";
import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import resetRoute from "../utils/resetRoute";

const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, logout } = useAuth();
    const path = location.pathname;

    useEffect(() => {
        if (user && (path === "/login" || path === "/register")) {
            resetRoute();
        }
        if (!user && !token && path !== "/login" && path !== "/register") {
            logout();
        }
    }, [logout, navigate, path, token, user]);

    return <>{user && token ? <MainLayout /> : <AuthLayout />}</>;
};

export default HomePage;
