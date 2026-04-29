import { Navigate, Outlet } from "react-router";

import BoardPage from "../pages/board";
import HomePage from "../pages/home";
import LoginPage from "../pages/login";
import ProjectPage from "../pages/project";
import ProjectDetailPage from "../pages/projectDetail";
import RegisterPage from "../pages/register";

/**
 * Single "/" match: index redirects to login; sibling branch renders the auth/main shell.
 * Nested paths use relative segments (e.g. projects/:projectId/board).
 */
const routes = [
    {
        path: "/",
        element: <Outlet />,
        children: [
            { index: true, element: <Navigate to="/login" replace /> },
            {
                element: <HomePage />,
                children: [
                    {
                        path: "register",
                        element: <RegisterPage />
                    },
                    {
                        path: "login",
                        element: <LoginPage />
                    },
                    {
                        path: "projects",
                        element: <ProjectPage />
                    },
                    {
                        path: "projects/:projectId",
                        element: <ProjectDetailPage />,
                        children: [
                            {
                                path: "board",
                                element: <BoardPage />
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

export default routes;
