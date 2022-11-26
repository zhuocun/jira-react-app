import useAuth from "../utils/hooks/useAuth";
import MainLayout from "../layouts/mainLayout";
import AuthLayout from "../layouts/authLayout";
import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import resetRoute from "../utils/resetRoute";

const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const path = location.pathname;

    useEffect(() => {
        if (user && (path === "/login" || path === "/register")) {
            resetRoute();
        }
        if (!user && path !== "/login" && path !== "/register") {
            navigate("/login");
        }
    }, [logout, navigate, path, user]);

    return <>{user ? <MainLayout /> : <AuthLayout />}</>;
};

export default HomePage;
