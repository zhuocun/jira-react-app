import { Navigate } from "react-router";

import BoardPage from "../pages/board";
import HomePage from "../pages/home";
import LoginPage from "../pages/login";
import ProjectPage from "../pages/project";
import ProjectDetailPage from "../pages/projectDetail";
import RegisterPage from "../pages/register";

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
