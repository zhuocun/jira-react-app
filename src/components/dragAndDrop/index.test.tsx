import { render, screen } from "@testing-library/react";

import { Drag, Drop, DropChild } from ".";

jest.mock("@hello-pangea/dnd", () => {
    const mockReact = jest.requireActual<typeof import("react")>("react");

    return {
        Draggable: ({
            children,
            draggableId,
            index
        }: {
            children: (provided: {
                dragHandleProps: Record<string, string>;
                draggableProps: Record<string, number | string>;
                innerRef: jest.Mock;
            }) => unknown;
            draggableId: string;
            index: number;
        }) =>
            children({
                dragHandleProps: {
                    "data-drag-handle-id": draggableId
                },
                draggableProps: {
                    "data-draggable-id": draggableId,
                    "data-draggable-index": index
                },
                innerRef: jest.fn()
            }),
        Droppable: ({
            children,
            droppableId
        }: {
            children: (provided: {
                droppableProps: Record<string, string>;
                innerRef: jest.Mock;
                placeholder: unknown;
            }) => unknown;
            droppableId: string;
        }) =>
            children({
                droppableProps: {
                    "data-droppable-id": droppableId
                },
                innerRef: jest.fn(),
                placeholder: mockReact.createElement("span", {
                    "data-testid": `placeholder-${droppableId}`
                })
            })
    };
});

describe("drag and drop wrappers", () => {
    it("Drop clones a valid child with droppable props and provided placeholder", () => {
        render(
            <Drop droppableId="todo">
                <DropChild data-testid="drop-child">Todo</DropChild>
            </Drop>
        );

        expect(screen.getByTestId("drop-child")).toHaveAttribute(
            "data-droppable-id",
            "todo"
        );
        expect(screen.getByText("Todo")).toBeInTheDocument();
        expect(screen.getByTestId("placeholder-todo")).toBeInTheDocument();
    });

    it("Drop renders an empty div for invalid children", () => {
        const { container } = render(
            <Drop droppableId="todo">plain text</Drop>
        );

        expect(container.firstElementChild).toBeEmptyDOMElement();
    });

    it("Drag clones a valid child with draggable and handle props", () => {
        render(
            <Drag draggableId="task-1" index={2}>
                <div data-testid="drag-child">Task card</div>
            </Drag>
        );

        expect(screen.getByTestId("drag-child")).toHaveAttribute(
            "data-draggable-id",
            "task-1"
        );
        expect(screen.getByTestId("drag-child")).toHaveAttribute(
            "data-drag-handle-id",
            "task-1"
        );
        expect(screen.getByTestId("drag-child")).toHaveAttribute(
            "data-draggable-index",
            "2"
        );
    });

    it("Drag renders an empty div for invalid children", () => {
        const { container } = render(
            <Drag draggableId="task-1" index={0}>
                plain text
            </Drag>
        );

        expect(container.firstElementChild).toBeEmptyDOMElement();
    });
});
