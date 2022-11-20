import HomePage from "../pages/home";
import ProjectListPage from "../pages/projectList";
import ProjectPage from "../pages/project";
import KanbanPage from "../pages/kanban";
import EpicPage from "../pages/epic";
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
                element: <ProjectListPage />
            },
            {
                path: "/projects/:projectId/*",
                element: <ProjectPage />
            },
            {
                path: "/projects/:projectId/kanban",
                element: <KanbanPage />
            },
            {
                path: "/projects/:projectId/epic",
                element: <EpicPage />
            }
        ]
    }
];

export default routes;