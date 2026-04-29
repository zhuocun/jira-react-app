import { fireEvent, render, screen } from "@testing-library/react";

import useAiEnabled from "../../utils/hooks/useAiEnabled";

import AiSearchInput from ".";

jest.mock("../../utils/hooks/useAiEnabled");
jest.mock("../../utils/hooks/useAi", () => ({
    __esModule: true,
    default: jest.fn()
}));

// eslint-disable-next-line simple-import-sort/imports
import useAi from "../../utils/hooks/useAi";

const mockedUseAiEnabled = useAiEnabled as jest.MockedFunction<
    typeof useAiEnabled
>;
const mockedUseAi = useAi as jest.MockedFunction<typeof useAi>;

const projectContext = {
    project: { _id: "p1", projectName: "Roadmap" },
    columns: [{ _id: "c1", columnName: "Todo", index: 0, projectId: "p1" }],
    members: [{ _id: "m1", email: "a@b.c", username: "Alice" }],
    tasks: [
        {
            _id: "t-login",
            columnId: "c1",
            coordinatorId: "m1",
            epic: "Auth",
            index: 0,
            note: "",
            projectId: "p1",
            storyPoints: 3,
            taskName: "Fix flaky login",
            type: "Bug"
        }
    ]
};

describe("AiSearchInput useAi error state", () => {
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
        mockedUseAiEnabled.mockReturnValue({
            available: true,
            enabled: true,
            setEnabled: jest.fn()
        });
        localStorage.removeItem("boardCopilot:disabledProjectIds");
    });

    it("shows the warning alert when useAi exposes an error", () => {
        const reset = jest.fn();
        mockedUseAi.mockReturnValue({
            abort: jest.fn(),
            data: undefined,
            error: new Error("AI offline"),
            isLoading: false,
            reset,
            run: jest.fn()
        });

        render(
            <AiSearchInput
                kind="tasks"
                projectContext={projectContext}
                semanticIds={undefined}
                setSemanticIds={jest.fn()}
            />
        );

        expect(screen.getByText("AI offline")).toBeInTheDocument();
        const close = document.querySelector(
            ".ant-alert-warning .ant-alert-close-icon"
        ) as HTMLElement | null;
        expect(close).toBeTruthy();
        fireEvent.click(close!);
        expect(reset).toHaveBeenCalled();
    });
});
