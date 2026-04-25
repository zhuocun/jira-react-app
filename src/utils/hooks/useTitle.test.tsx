import { renderHook } from "@testing-library/react";

import useTitle from "./useTitle";

describe("useTitle", () => {
    const originalTitle = document.title;

    afterEach(() => {
        document.title = originalTitle;
    });

    it("sets the document title and restores the old title on unmount when requested", () => {
        document.title = "Old title";

        const { rerender, unmount } = renderHook(
            ({ title }) => useTitle(title, false),
            {
                initialProps: {
                    title: "Project board"
                }
            }
        );

        expect(document.title).toBe("Project board");

        rerender({ title: "Projects" });

        expect(document.title).toBe("Projects");

        unmount();

        expect(document.title).toBe("Old title");
    });

    it("keeps the new title after unmount by default", () => {
        document.title = "Old title";

        const { unmount } = renderHook(() => useTitle("Project board"));

        expect(document.title).toBe("Project board");

        unmount();

        expect(document.title).toBe("Project board");
    });
});
