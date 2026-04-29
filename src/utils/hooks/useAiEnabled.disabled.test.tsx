import { renderHook } from "@testing-library/react";

jest.mock("../../constants/env", () => ({
    __esModule: true,
    default: {
        aiBaseUrl: "",
        aiEnabled: false,
        aiUseLocalEngine: true,
        apiBaseUrl: "/api/v1"
    }
}));

// eslint-disable-next-line simple-import-sort/imports
import useAiEnabled from "./useAiEnabled";

describe("useAiEnabled with the env disabled", () => {
    it("returns available=false and enabled=false even with localStorage on", () => {
        localStorage.setItem("boardCopilot:enabled", "true");
        const { result } = renderHook(() => useAiEnabled());
        expect(result.current.available).toBe(false);
        expect(result.current.enabled).toBe(false);
    });
});
