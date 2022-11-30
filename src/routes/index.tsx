import HomePage from "../pages/home";
import ProjectPage from "../pages/project";
import ProjectDetailPage from "../pages/projectDetail";
import BoardPage from "../pages/board";
import LoginPage from "../pages/login";
import RegisterPage from "../pages/register";
import { Navigate } from "react-router";

const routes = [
    {
        path: "/",
        element: <Navigate to="/login" />
    },
    {
        path: "/",
        element: <HomePage />,
        children: [
            {
                path: "/register",
                element: <RegisterPage />
            },
            {
                path: "/login",
                element: <LoginPage />
            },
            {
                path: "/projects",
                element: <ProjectPage />
            },
            {
                path: "/projects/:projectId",
                element: <ProjectDetailPage />,
                children: [
                    {
                        path: "/projects/:projectId/board",
                        element: <BoardPage />
                    }
                ]
            }
        ]
    }
];

export default routes;
