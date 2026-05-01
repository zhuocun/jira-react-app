import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("../../constants/env", () => ({
    __esModule: true,
    default: {
        aiBaseUrl: "https://copilot.example",
        aiEnabled: true,
        aiUseLocalEngine: false,
        apiBaseUrl: "/api/v1"
    }
}));

import { microcopy } from "../../constants/microcopy";

import AiSearchInput from ".";

jest.mock("../../utils/hooks/useAiEnabled", () => ({
    __esModule: true,
    default: () => ({
        available: true,
        enabled: true,
        setEnabled: jest.fn()
    })
}));

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

describe("AiSearchInput remote search transport", () => {
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
        fetchSpy = jest.spyOn(global, "fetch");
    });

    afterEach(() => {
        fetchSpy.mockRestore();
        jest.clearAllMocks();
    });

    it("shows a failure hint when the remote search rejects", async () => {
        fetchSpy.mockRejectedValue(new Error("network"));

        const setSemanticIds = jest.fn();
        render(
            <AiSearchInput
                kind="tasks"
                projectContext={projectContext}
                semanticIds={undefined}
                setSemanticIds={setSemanticIds}
            />
        );

        fireEvent.change(
            screen.getByRole("textbox", { name: /Ask Board Copilot/i }),
            {
                target: { value: "login flaky" }
            }
        );
        fireEvent.click(
            screen.getByRole("button", { name: microcopy.actions.search })
        );

        await waitFor(() => {
            expect(
                screen.getAllByText(/Search failed/i).length
            ).toBeGreaterThan(0);
        });
    });

    it("dismisses the remote search failure alert", async () => {
        fetchSpy.mockRejectedValue(new Error("network"));
        const setSemanticIds = jest.fn();
        render(
            <AiSearchInput
                kind="tasks"
                projectContext={projectContext}
                semanticIds={undefined}
                setSemanticIds={setSemanticIds}
            />
        );

        fireEvent.change(
            screen.getByRole("textbox", { name: /Ask Board Copilot/i }),
            {
                target: { value: "login" }
            }
        );
        fireEvent.click(
            screen.getByRole("button", { name: microcopy.actions.search })
        );

        await waitFor(() => {
            expect(
                screen.getAllByText(/Search failed/i).length
            ).toBeGreaterThan(0);
        });

        const alerts = screen.getAllByRole("alert");
        const failureAlert = alerts.find((el) =>
            el.textContent?.includes("Search failed")
        );
        expect(failureAlert).toBeTruthy();
        fireEvent.click(
            failureAlert!.querySelector(".ant-alert-close-icon") as HTMLElement
        );

        await waitFor(() => {
            expect(
                screen.queryByText(/Search failed\. Try again\./i)
            ).not.toBeInTheDocument();
        });
    });
});
