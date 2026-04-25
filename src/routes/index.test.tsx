import { ReactElement } from "react";
import { Navigate } from "react-router";

import routes from ".";

jest.mock("../pages/home", () => ({
    __esModule: true,
    default: () => null
}));
jest.mock("../pages/login", () => ({
    __esModule: true,
    default: () => null
}));
jest.mock("../pages/register", () => ({
    __esModule: true,
    default: () => null
}));
jest.mock("../pages/project", () => ({
    __esModule: true,
    default: () => null
}));
jest.mock("../pages/projectDetail", () => ({
    __esModule: true,
    default: () => null
}));
jest.mock("../pages/board", () => ({
    __esModule: true,
    default: () => null
}));

const element = (route: { element: ReactElement }) => route.element;

describe("routes", () => {
    it("redirects the bare root route to login", () => {
        expect(routes[0].path).toBe("/");
        expect(element(routes[0]).type).toBe(Navigate);
        expect(element(routes[0]).props.to).toBe("/login");
    });

    it("contains auth and project child routes under the home route", () => {
        const homeRoute = routes[1];

        expect(homeRoute.path).toBe("/");
        expect(homeRoute.children?.map((route) => route.path)).toEqual([
            "/register",
            "/login",
            "/projects",
            "/projects/:projectId"
        ]);
    });

    it("nests the board route below project detail", () => {
        const projectDetailRoute = routes[1].children?.find(
            (route) => route.path === "/projects/:projectId"
        );

        expect(
            projectDetailRoute?.children?.map((route) => route.path)
        ).toEqual(["/projects/:projectId/board"]);
    });
});
