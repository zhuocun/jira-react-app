import React, { ReactNode, RefAttributes } from "react";
import {
    Draggable,
    DraggableProps,
    Droppable,
    DroppableProps,
    DroppableProvided,
    DroppableProvidedProps
} from "react-beautiful-dnd";

type DropProps = Omit<DroppableProps, "children"> & { children: ReactNode };

export const Drop = ({ children, ...props }: DropProps) => {
    return (
        <Droppable {...props}>
            {(provided) => {
                if (React.isValidElement(children)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return React.cloneElement<RefAttributes<unknown> | any>(
                        children,
                        {
                            ...provided.droppableProps,
                            ref: provided.innerRef,
                            provided
                        }
                    );
                }
                return <div />;
            }}
        </Droppable>
    );
};

type DropChildProps = Partial<
    { provided: DroppableProvided } & DroppableProvidedProps
> &
    React.HTMLAttributes<HTMLDivElement>;

export const DropChild = React.forwardRef<HTMLDivElement, DropChildProps>(
    ({ children, ...props }, ref) => (
        <div ref={ref} {...props}>
            {children}
            {props.provided?.placeholder}
        </div>
    )
);

DropChild.displayName = "Drop Child";

type DragProps = Omit<DraggableProps, "children"> & { children: ReactNode };
export const Drag = ({ children, ...props }: DragProps) => {
    return (
        <Draggable {...props}>
            {(provided) => {
                if (React.isValidElement(children)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return React.cloneElement<RefAttributes<unknown> | any>(
                        children,
                        {
                            ...provided.draggableProps,
                            ...provided.dragHandleProps,
                            ref: provided.innerRef
                        }
                    );
                }
                return <div />;
            }}
        </Draggable>
    );
};
