import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import useTaskModal from "../../utils/hooks/useTaskModal";

jest.mock("../../utils/hooks/useAi", () => ({
    __esModule: true,
    default: jest.fn()
}));

// eslint-disable-next-line simple-import-sort/imports
import useAi from "../../utils/hooks/useAi";

import BoardBriefDrawer from ".";

jest.mock("../../utils/hooks/useTaskModal");

const mockedUseAi = useAi as jest.MockedFunction<typeof useAi>;
const mockedUseTaskModal = useTaskModal as jest.MockedFunction<
    typeof useTaskModal
>;

const project: IProject = {
    _id: "p1",
    createdAt: "0",
    managerId: "m1",
    organization: "Org",
    projectName: "Roadmap"
};

const columns: IColumn[] = [
    { _id: "c1", columnName: "Todo", index: 0, projectId: "p1" }
];

const members: IMember[] = [{ _id: "m1", email: "a@b.c", username: "Alice" }];

const tasks: ITask[] = [];

describe("BoardBriefDrawer largest-unstarted meta", () => {
    const startEditing = jest.fn();

    beforeAll(() => {
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: () => ({
                addEventListener: jest.fn(),
                addListener: jest.fn(),
                dispatchEvent: jest.fn(),
                matches: false,
                media: "",
                onchange: null,
                removeEventListener: jest.fn(),
                removeListener: jest.fn()
            })
        });
    });

    beforeEach(() => {
        startEditing.mockClear();
        mockedUseTaskModal.mockReturnValue({
            closeModal: jest.fn(),
            editingTaskId: undefined,
            isLoading: false,
            startEditing
        } as unknown as ReturnType<typeof useTaskModal>);
        mockedUseAi.mockReturnValue({
            data: {
                counts: [{ columnId: "c1", columnName: "Todo", count: 0 }],
                headline: "Brief",
                largestUnstarted: [
                    {
                        storyPoints: undefined,
                        taskId: "t1",
                        taskName: "Large without points metadata"
                    }
                ],
                recommendation: "Rec",
                unowned: [],
                workload: []
            },
            error: null,
            isLoading: false,
            reset: jest.fn(),
            run: jest.fn().mockRejectedValue(new Error("brief failed"))
        } as unknown as ReturnType<typeof useAi>);
    });

    it("omits the points tag when story points are absent", () => {
        render(
            <QueryClientProvider client={new QueryClient()}>
                <MemoryRouter>
                    <BoardBriefDrawer
                        columns={columns}
                        members={members}
                        onClose={jest.fn()}
                        open
                        project={project}
                        tasks={tasks}
                    />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(
            screen.getByText("Large without points metadata")
        ).toBeInTheDocument();
        expect(screen.queryByText(/pts/)).not.toBeInTheDocument();
        fireEvent.click(screen.getByText("Large without points metadata"));
        expect(startEditing).toHaveBeenCalledWith("t1");
    });
});
