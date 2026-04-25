import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import AuthLayout, { AuthButton } from "./authLayout";

describe("AuthLayout", () => {
    it("renders the auth shell with outlet content", () => {
        const { container } = render(
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route element={<AuthLayout />}>
                        <Route
                            path="/login"
                            element={<div>Login outlet content</div>}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Login outlet content")).toBeInTheDocument();
        expect(container.querySelector("header")).toBeInTheDocument();
        expect(container.querySelector(".ant-card")).toBeInTheDocument();
    });

    it("exports a full-width auth button", () => {
        render(<AuthButton>Continue</AuthButton>);

        expect(screen.getByRole("button", { name: /continue/i })).toHaveStyle({
            width: "100%"
        });
    });
});
