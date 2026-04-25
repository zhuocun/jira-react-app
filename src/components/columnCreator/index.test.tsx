import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ColumnCreator from ".";

const response = (body: unknown, ok = true) =>
    ({
        json: jest.fn().mockResolvedValue(body),
        ok,
        status: ok ? 200 : 400
    } as unknown as Response);

const renderCreator = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            mutations: { retry: false },
            queries: { retry: false }
        }
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/projects/project-1/board"]}>
                <Routes>
                    <Route
                        path="/projects/:projectId/board"
                        element={<ColumnCreator />}
                    />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    );
};

describe("ColumnCreator", () => {
    const fetchMock = jest.spyOn(global, "fetch");

    beforeEach(() => {
        fetchMock.mockReset();
        fetchMock.mockResolvedValue(
            response({
                _id: "column-1",
                columnName: "Todo",
                index: 0,
                projectId: "project-1"
            })
        );
    });

    afterAll(() => {
        fetchMock.mockRestore();
    });

    it("creates a column for the current project and clears the input", async () => {
        renderCreator();
        const input = screen.getByPlaceholderText(/Create column/);

        fireEvent.change(input, { target: { value: "QA" } });
        fireEvent.keyDown(input, {
            charCode: 13,
            code: "Enter",
            key: "Enter"
        });

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        expect(fetchMock.mock.calls[0][0]).toContain("/api/v1/boards");
        expect(fetchMock.mock.calls[0][1]).toEqual(
            expect.objectContaining({
                body: JSON.stringify({
                    columnName: "QA",
                    projectId: "project-1"
                }),
                method: "POST"
            })
        );
        expect(input).toHaveValue("");
    });

    it("disables the input while the create mutation is pending", async () => {
        let resolveFetch: (value: Response) => void = () => undefined;
        fetchMock.mockReturnValue(
            new Promise<Response>((resolve) => {
                resolveFetch = resolve;
            })
        );
        renderCreator();
        const input = screen.getByPlaceholderText(/Create column/);

        fireEvent.change(input, { target: { value: "Doing" } });
        fireEvent.keyDown(input, {
            charCode: 13,
            code: "Enter",
            key: "Enter"
        });

        await waitFor(() => expect(input).toBeDisabled());
        resolveFetch(response({ _id: "column-2", columnName: "Doing" }));
        await waitFor(() => expect(input).not.toBeDisabled());
    });
});
