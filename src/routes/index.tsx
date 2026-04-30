import { Navigate, Outlet } from "react-router";

import BoardPage from "../pages/board";
import HomePage from "../pages/home";
import LoginPage from "../pages/login";
import ProjectPage from "../pages/project";
import ProjectDetailPage from "../pages/projectDetail";
import RegisterPage from "../pages/register";
import useAuth from "../utils/hooks/useAuth";

/**
 * Resolves the root URL by consulting authentication once, at the route
 * level. Authenticated visitors land on `/projects` directly; unauthenticated
 * visitors go to `/login`. The previous setup always redirected to `/login`
 * and let `HomePage` redirect a second time, which produced a brief
 * login-screen flash for users who already had a session.
 */
const RootRedirect = () => {
    const { user, token } = useAuth();
    return user && token ? (
        <Navigate to="/projects" replace />
    ) : (
        <Navigate to="/login" replace />
    );
};

/**
 * Single "/" match: index redirects to login; sibling branch renders the auth/main shell.
 * Nested paths use relative segments (e.g. projects/:projectId/board).
 *
 * Note: route-level code splitting (React.lazy) is intentionally deferred —
 * landing it would force an audit of every page-mount test (Suspense boundaries
 * defer first paint, breaking synchronous getBy* queries).
 */
const routes = [
    {
        path: "/",
        element: <Outlet />,
        children: [
            { index: true, element: <RootRedirect /> },
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

export { RootRedirect };
export default routes;
