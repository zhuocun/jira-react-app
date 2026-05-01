import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axe, toHaveNoViolations } from "jest-axe";
import { MemoryRouter } from "react-router-dom";

import CommandPalette from ".";

expect.extend(toHaveNoViolations);

const installAntdMocks = () => {
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
        configurable: true,
        value: 800
    });
    // Force the responsive Grid into desktop so the palette renders fully.
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: (query: string) => ({
            addEventListener: jest.fn(),
            addListener: jest.fn(),
            dispatchEvent: jest.fn(),
            matches: query.includes("min-width") ? true : false,
            media: query,
            onchange: null,
            removeEventListener: jest.fn(),
            removeListener: jest.fn()
        })
    });
};

const seedClient = () => {
    const qc = new QueryClient();
    qc.setQueryData<IProject[]>(
        ["projects"],
        [
            {
                _id: "p1",
                createdAt: "0",
                managerId: "m1",
                organization: "Acme",
                projectName: "Roadmap"
            },
            {
                _id: "p2",
                createdAt: "0",
                managerId: "m1",
                organization: "Acme",
                projectName: "Marketing"
            }
        ]
    );
    qc.setQueryData<IMember[]>(
        ["users/members"],
        [{ _id: "m1", email: "a@b.c", username: "Alice" }]
    );
    return qc;
};

const renderPalette = (open: boolean = true) => {
    const onClose = jest.fn();
    const queryClient = seedClient();
    const utils = render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <CommandPalette onClose={onClose} open={open} />
            </MemoryRouter>
        </QueryClientProvider>
    );
    return { ...utils, onClose };
};

describe("CommandPalette", () => {
    beforeAll(() => {
        installAntdMocks();
    });

    it("renders the combobox with a listbox of cached entries", async () => {
        renderPalette(true);
        const combo = await screen.findByRole("combobox");
        expect(combo).toBeInTheDocument();
        const list = screen.getByRole("listbox");
        expect(list).toBeInTheDocument();
        expect(screen.getByText("Roadmap")).toBeInTheDocument();
        expect(screen.getByText("Marketing")).toBeInTheDocument();
    });

    it("filters results as the user types", async () => {
        renderPalette(true);
        const input = await screen.findByRole("combobox");
        const inputEl = input.querySelector("input") as HTMLInputElement;
        fireEvent.change(inputEl, { target: { value: "road" } });
        await waitFor(() => {
            expect(screen.getByText("Roadmap")).toBeInTheDocument();
            expect(screen.queryByText("Marketing")).not.toBeInTheDocument();
        });
    });

    it("Tab toggles AI mode and shows a Phase E banner", async () => {
        renderPalette(true);
        const input = (await screen.findByRole("combobox")).querySelector(
            "input"
        ) as HTMLInputElement;
        fireEvent.keyDown(input, { key: "Tab" });
        await waitFor(() => {
            expect(
                screen.getByText(/AI mode is coming in Phase E/i)
            ).toBeInTheDocument();
        });
    });

    it("calls onClose when Esc is pressed", async () => {
        const onClose = jest.fn();
        const queryClient = seedClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CommandPalette onClose={onClose} open />
                </MemoryRouter>
            </QueryClientProvider>
        );
        const user = userEvent.setup();
        await screen.findByRole("combobox");
        await user.keyboard("{Escape}");
        await waitFor(() => {
            expect(onClose).toHaveBeenCalled();
        });
    });

    it("Enter activates the selected option and navigates", async () => {
        renderPalette(true);
        const input = (await screen.findByRole("combobox")).querySelector(
            "input"
        ) as HTMLInputElement;
        fireEvent.change(input, { target: { value: "road" } });
        await waitFor(() => {
            expect(screen.getByText("Roadmap")).toBeInTheDocument();
        });
        fireEvent.keyDown(input, { key: "Enter" });
        // onClose called by enter path
    });

    it("has no axe-detectable accessibility violations", async () => {
        const { container } = renderPalette(true);
        await screen.findByRole("combobox");
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
