import { useAuth } from "../utils/context/authContext";
import MainLayout from "../layouts/mainLayout";
import AuthLayout from "../layouts/authLayout";
import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";

const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const path = location.pathname;

    useEffect(() => {
        if (path === "/login" || path === "/register") {
            logout(path);
        }
        if (!user) {
            navigate("/login");
        }
    }, [user, path]);

    return <>{user ? <MainLayout /> : <AuthLayout />}</>;
};

export default HomePage;
