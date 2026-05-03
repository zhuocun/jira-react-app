import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { LanguageProvider, useTranslation } from "../../i18n";

import LanguageSwitcher from ".";

const SpyTranslationReadout = () => {
    const t = useTranslation();
    return <span data-testid="active-save">{t.actions.save}</span>;
};

const renderSwitcher = () =>
    render(
        <LanguageProvider>
            <LanguageSwitcher />
            <SpyTranslationReadout />
        </LanguageProvider>
    );

describe("LanguageSwitcher", () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute("lang");
    });

    it("persists zh-CN, updates html lang, and switches dictionary copy", async () => {
        renderSwitcher();

        expect(screen.getByTestId("active-save")).toHaveTextContent("Save");
        expect(document.documentElement.getAttribute("lang")).toBe("en");

        fireEvent.click(screen.getByTitle("Chinese (Simplified)"));

        await waitFor(() => {
            expect(screen.getByTestId("active-save")).toHaveTextContent("保存");
        });
        expect(document.documentElement.getAttribute("lang")).toBe("zh-CN");
        expect(localStorage.getItem("pulse.locale")).toBe("zh-CN");
    });
});
