import "./App.css";
import { useCallback, useEffect, useState } from "react";
import { useRoutes } from "react-router";

import CommandPalette from "./components/commandPalette";
import ErrorBoundary from "./components/errorBoundary";
import routes from "./routes";

/**
 * Global app shell: routes the page, mounts the command palette, and
 * installs the Cmd/Ctrl+K hotkey so AC-V11 holds end-to-end. The palette
 * also listens for a `commandPalette:open` custom event so other places
 * (e.g. a help menu, deep links) can open it without reaching into App
 * state. Phase A: navigation-only (PRD §7.1, OQ5).
 */
const AppShell = () => {
    const element = useRoutes(routes);
    const [paletteOpen, setPaletteOpen] = useState(false);

    const openPalette = useCallback(() => setPaletteOpen(true), []);
    const closePalette = useCallback(() => setPaletteOpen(false), []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        // Always set open to `true` from the hotkey rather than toggling.
        // Toggling breaks under React.StrictMode (which mounts effects
        // twice, so two listeners fire on the same event and net out to
        // no change). The palette closes through `onClose` (Esc / outside
        // click), which is the standard antd Modal flow.
        const onKey = (event: KeyboardEvent) => {
            const isHotkey =
                (event.metaKey || event.ctrlKey) &&
                (event.key === "k" || event.key === "K");
            if (isHotkey) {
                event.preventDefault();
                setPaletteOpen(true);
            }
        };
        const onCustomOpen = () => setPaletteOpen(true);
        window.addEventListener("keydown", onKey);
        window.addEventListener("commandPalette:open", onCustomOpen);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("commandPalette:open", onCustomOpen);
        };
    }, [openPalette]);

    return (
        <>
            {element}
            <CommandPalette onClose={closePalette} open={paletteOpen} />
        </>
    );
};

const App = () => {
    return (
        <div>
            <ErrorBoundary>
                <AppShell />
            </ErrorBoundary>
        </div>
    );
};

export default App;
