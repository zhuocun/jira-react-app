# Agent notes

Short, durable gotchas for anyone (human or AI) editing this repo. Add an entry
when a fix is non-obvious from the code alone.

## Drag-and-drop (`@hello-pangea/dnd`)

- The library blocks drags whose event target is a native interactive element
  (`<input>`, `<button>`, `<textarea>`, `<select>`, `<option>`, `<optgroup>`,
  `<video>`, `<audio>`). If a `Draggable`'s root is one of these — or a
  `<Drag>` wraps a component whose root renders one — pass
  `disableInteractiveElementBlocking` on the `<Drag>` (or `<Draggable>`) to
  opt out, otherwise the card will look draggable but never start a drag.
  See `src/components/column/index.tsx` for the task-card case.
- `<DragDropContext onDragEnd>` is wired up in `src/pages/board.tsx` via
  `useDragEnd` (`src/utils/hooks/useDragEnd.ts`). Reorder mutations are
  optimistic — see `src/utils/optimisticUpdate/reorder.ts`.
