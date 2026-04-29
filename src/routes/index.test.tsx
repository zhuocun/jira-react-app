import { ReactElement } from "react";
import { Navigate, Outlet } from "react-router";

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

const element = <Props,>(route: { element?: unknown }) =>
    route.element as ReactElement<Props>;

describe("routes", () => {
    it("wraps the app in an outlet with an index redirect to login", () => {
        const root = routes[0];
        expect(root.path).toBe("/");
        expect(element(root).type).toBe(Outlet);

        const indexRedirect = root.children?.[0];
        expect(
            indexRedirect && "index" in indexRedirect && indexRedirect.index
        ).toBe(true);
        expect(
            element<{ to: string }>(indexRedirect as { element?: unknown }).type
        ).toBe(Navigate);
        expect(
            element<{ to: string }>(indexRedirect as { element?: unknown })
                .props.to
        ).toBe("/login");
    });

    it("contains auth and project child routes under the home shell", () => {
        const homeShell = routes[0].children?.[1];
        expect(
            homeShell && "path" in homeShell ? homeShell.path : undefined
        ).toBe(undefined);
        expect(homeShell?.children?.map((route) => route.path)).toEqual([
            "register",
            "login",
            "projects",
            "projects/:projectId"
        ]);
    });

    it("nests the board route below project detail", () => {
        const projectDetailRoute = routes[0].children?.[1]?.children?.find(
            (route) => route.path === "projects/:projectId"
        );

        expect(
            projectDetailRoute?.children?.map((route) => route.path)
        ).toEqual(["board"]);
    });
});
