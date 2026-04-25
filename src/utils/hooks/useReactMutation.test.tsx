import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import useApi from "./useApi";
import useReactMutation from "./useReactMutation";

jest.mock("./useApi");

const mockedUseApi = useApi as jest.MockedFunction<typeof useApi>;

const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            mutations: {
                cacheTime: Infinity,
                retry: false
            },
            queries: {
                cacheTime: Infinity,
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

describe("useReactMutation", () => {
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

    it("calls the API with filtered mutation data and invalidates the query key", async () => {
        const queryClient = createQueryClient();
        const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
        apiMock.mockResolvedValue({ _id: "p1", projectName: "Roadmap" });

        const { result } = renderHook(
            () => useReactMutation<IProject>("projects", "POST", ["projects"]),
            {
                wrapper: createWrapper(queryClient)
            }
        );

        await act(async () => {
            await result.current.mutateAsync({
                managerId: "u1",
                organization: "",
                projectName: "Roadmap"
            });
        });

        expect(apiMock).toHaveBeenCalledWith("projects", {
            data: {
                managerId: "u1",
                projectName: "Roadmap"
            },
            method: "POST"
        });
        await waitFor(() =>
            expect(invalidateSpy).toHaveBeenCalledWith(["projects"])
        );
    });

    it("writes returned data directly to the query cache when setCache is true", async () => {
        const queryClient = createQueryClient();
        const returnedUser = {
            _id: "u1",
            email: "alice@example.com",
            jwt: "jwt-1",
            likedProjects: ["p1"],
            username: "Alice"
        };
        apiMock.mockResolvedValue(returnedUser);

        const { result } = renderHook(
            () =>
                useReactMutation<IUser>(
                    "users/likes",
                    "PUT",
                    "users",
                    undefined,
                    undefined,
                    true
                ),
            {
                wrapper: createWrapper(queryClient)
            }
        );

        await act(async () => {
            await result.current.mutateAsync({ projectId: "p1" });
        });

        expect(queryClient.getQueryData("users")).toEqual(returnedUser);
    });

    it("writes returned data to the endpoint cache when setCache is true without a query key", async () => {
        const queryClient = createQueryClient();
        const response = { theme: "dark" };
        apiMock.mockResolvedValue(response);

        const { result } = renderHook(
            () =>
                useReactMutation<{ theme: string }>(
                    "profile",
                    "PUT",
                    undefined,
                    undefined,
                    undefined,
                    true
                ),
            {
                wrapper: createWrapper(queryClient)
            }
        );

        await act(async () => {
            await result.current.mutateAsync({ theme: "dark" });
        });

        expect(queryClient.getQueryData("profile")).toEqual(response);
    });

    it("applies optimistic callbacks and stores the previous cache in mutation context", async () => {
        const queryClient = createQueryClient();
        const previousItems = [{ _id: "old" }];
        const target = { _id: "new", name: "New item" };
        const callback = jest.fn((item, old?: unknown[]) => [
            ...(old ?? []),
            item
        ]);
        queryClient.setQueryData(["items"], previousItems);
        apiMock.mockResolvedValue(target);

        const { result } = renderHook(
            () => useReactMutation("items", "POST", ["items"], callback),
            {
                wrapper: createWrapper(queryClient)
            }
        );

        await act(async () => {
            await result.current.mutateAsync(target);
        });

        expect(callback).toHaveBeenCalledWith(target, previousItems);
        expect(queryClient.getQueryData(["items"])).toEqual([
            ...previousItems,
            target
        ]);
        expect(
            queryClient.getMutationCache().getAll()[0].state.context
        ).toEqual({
            previousItems
        });
    });

    it("uses fallback cache keys for optimistic updates when queryKey is omitted", async () => {
        const queryClient = createQueryClient();
        const target = { _id: "new" };
        const callback = jest.fn((item, old?: unknown[]) => [
            ...(old ?? []),
            item
        ]);
        apiMock.mockResolvedValue(target);

        const { result } = renderHook(
            () => useReactMutation("items", "POST", undefined, callback),
            {
                wrapper: createWrapper(queryClient)
            }
        );

        await act(async () => {
            await result.current.mutateAsync(target);
        });

        expect(callback).toHaveBeenCalledWith(target, undefined);
        expect(queryClient.getQueryData("items")).toEqual([target]);
        expect(
            queryClient.getMutationCache().getAll()[0].state.context
        ).toEqual({
            previousItems: undefined
        });
    });

    it("sends an empty object when mutateAsync is called without params", async () => {
        const queryClient = createQueryClient();
        apiMock.mockResolvedValue({ ok: true });

        const { result } = renderHook(
            () => useReactMutation("profile", "PUT"),
            {
                wrapper: createWrapper(queryClient)
            }
        );

        await act(async () => {
            await result.current.mutateAsync(undefined as any);
        });

        expect(apiMock).toHaveBeenCalledWith("profile", {
            data: {},
            method: "PUT"
        });
    });

    it("converts mutation errors before calling onError", async () => {
        const queryClient = createQueryClient();
        const onError = jest.fn();
        apiMock.mockRejectedValue("mutation failed");

        const { result } = renderHook(
            () =>
                useReactMutation<IProject>(
                    "projects",
                    "POST",
                    ["projects"],
                    undefined,
                    onError
                ),
            {
                wrapper: createWrapper(queryClient)
            }
        );

        await act(async () => {
            await expect(
                result.current.mutateAsync({ projectName: "Roadmap" })
            ).rejects.toBe("mutation failed");
        });

        await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
        expect(onError.mock.calls[0][0].valueOf()).toBe("mutation failed");
    });

    it("supports omitted query keys by invalidating the default query scope", async () => {
        const queryClient = createQueryClient();
        const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
        apiMock.mockResolvedValue({ ok: true });

        const { result } = renderHook(
            () => useReactMutation("profile", "PUT"),
            {
                wrapper: createWrapper(queryClient)
            }
        );

        await act(async () => {
            await result.current.mutateAsync({ username: "Alice" });
        });

        expect(invalidateSpy).toHaveBeenCalledWith(undefined);
    });
});
