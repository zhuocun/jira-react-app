import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import useApi from "./useApi";
import useReactQuery from "./useReactQuery";

jest.mock("./useApi");

const mockedUseApi = useApi as jest.MockedFunction<typeof useApi>;

const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                gcTime: Infinity,
                retry: false
            }
        }
    });

const createWrapper = (queryClient: QueryClient) =>
    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    };

describe("useReactQuery", () => {
    let apiMock: jest.MockedFunction<ReturnType<typeof useApi>>;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        apiMock = jest.fn() as jest.MockedFunction<ReturnType<typeof useApi>>;
        mockedUseApi.mockReturnValue(apiMock);
        consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it("uses the endpoint as the query key when no params are supplied", async () => {
        const queryClient = createQueryClient();
        apiMock.mockResolvedValue([{ _id: "u1", username: "Alice" }]);

        const { result } = renderHook(() => useReactQuery<IMember[]>("users"), {
            wrapper: createWrapper(queryClient)
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(apiMock).toHaveBeenCalledWith("users", {
            data: {},
            method: "GET"
        });
        expect(queryClient.getQueryData(["users"])).toEqual([
            { _id: "u1", username: "Alice" }
        ]);
    });

    it("filters params and uses a special query key when params are supplied", async () => {
        const queryClient = createQueryClient();
        const params = {
            managerId: "",
            page: 0,
            projectName: "Roadmap"
        };
        const projects = [{ _id: "p1", projectName: "Roadmap" }];
        apiMock.mockResolvedValue(projects);

        const { result } = renderHook(
            () => useReactQuery<IProject[]>("projects", params, "projectList"),
            {
                wrapper: createWrapper(queryClient)
            }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(apiMock).toHaveBeenCalledWith("projects", {
            data: {
                page: 0,
                projectName: "Roadmap"
            },
            method: "GET"
        });
        expect(
            queryClient.getQueryData([
                "projectList",
                {
                    page: 0,
                    projectName: "Roadmap"
                }
            ])
        ).toEqual(projects);
    });

    it("uses the endpoint in the query key when params exist without a special key", async () => {
        const queryClient = createQueryClient();
        const projects = [{ _id: "p1", projectName: "Roadmap" }];
        apiMock.mockResolvedValue(projects);

        const { result } = renderHook(
            () =>
                useReactQuery<IProject[]>("projects", {
                    managerId: "u1",
                    projectName: ""
                }),
            {
                wrapper: createWrapper(queryClient)
            }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(
            queryClient.getQueryData([
                "projects",
                {
                    managerId: "u1"
                }
            ])
        ).toEqual(projects);
    });

    it("does not call the API when disabled", async () => {
        const queryClient = createQueryClient();

        const { result } = renderHook(
            () =>
                useReactQuery<IUser>(
                    "users",
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    false
                ),
            {
                wrapper: createWrapper(queryClient)
            }
        );

        expect(result.current.isIdle).toBe(true);
        expect(apiMock).not.toHaveBeenCalled();
    });

    it("calls onSuccess with returned data", async () => {
        const queryClient = createQueryClient();
        const onSuccess = jest.fn();
        const projects = [{ _id: "p1", projectName: "Roadmap" }];
        apiMock.mockResolvedValue(projects);

        renderHook(
            () =>
                useReactQuery<IProject[]>(
                    "projects",
                    undefined,
                    undefined,
                    onSuccess
                ),
            {
                wrapper: createWrapper(queryClient)
            }
        );

        await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(projects));
    });

    it("converts query errors before calling onError", async () => {
        const queryClient = createQueryClient();
        const onError = jest.fn();
        apiMock.mockRejectedValue("plain failure");

        renderHook(
            () =>
                useReactQuery<IProject[]>(
                    "projects",
                    undefined,
                    undefined,
                    undefined,
                    onError
                ),
            {
                wrapper: createWrapper(queryClient)
            }
        );

        await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
        expect(onError).toHaveBeenCalledWith(new Error("plain failure"));
    });
});
