import { useEffect } from "react";
import { useLocation } from "react-router";

import AuthLayout from "../layouts/authLayout";
import MainLayout from "../layouts/mainLayout";
import useAuth from "../utils/hooks/useAuth";
import resetRoute from "../utils/resetRoute";

const HomePage = () => {
    const { user, token, logout } = useAuth();
    const path = useLocation().pathname;

    useEffect(() => {
        if (user && (path === "/login" || path === "/register")) {
            resetRoute();
        }
        if (!user && !token && path !== "/login" && path !== "/register") {
            logout();
        }
    }, [logout, path, token, user]);

    return <div>{user && token ? <MainLayout /> : <AuthLayout />}</div>;
};

export default HomePage;
