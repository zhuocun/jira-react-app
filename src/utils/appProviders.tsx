import { App as AntdApp, ConfigProvider } from "antd";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { store } from "../store";
import { buildAntdTheme } from "../theme/antdTheme";

import AuthProvider from "./authProvider";
import useColorScheme from "./hooks/useColorScheme";

const usePointerCoarse = () => {
    const [coarse, setCoarse] = useState<boolean>(() => {
        if (
            typeof window === "undefined" ||
            typeof window.matchMedia !== "function"
        ) {
            return false;
        }
        return window.matchMedia("(pointer: coarse)").matches;
    });

    useEffect(() => {
        if (
            typeof window === "undefined" ||
            typeof window.matchMedia !== "function"
        ) {
            return;
        }
        const media = window.matchMedia("(pointer: coarse)");
        const handler = (event: MediaQueryListEvent) => setCoarse(event.matches);
        if (typeof media.addEventListener === "function") {
            media.addEventListener("change", handler);
            return () => media.removeEventListener("change", handler);
        }
        media.addListener(handler);
        return () => media.removeListener(handler);
    }, []);

    return coarse;
};

const ThemedShell = ({ children }: { children: ReactNode }) => {
    const { scheme } = useColorScheme();
    const coarse = usePointerCoarse();
    const themeConfig = useMemo(
        () => buildAntdTheme(scheme, coarse),
        [scheme, coarse]
    );

    useEffect(() => {
        if (typeof document === "undefined") return;
        document.documentElement.dataset.colorScheme = scheme;
        document.documentElement.style.colorScheme = scheme;
    }, [scheme]);

    return (
        <ConfigProvider theme={themeConfig}>
            <AntdApp
                component={false}
                notification={{ placement: "topRight" }}
                message={{ maxCount: 3 }}
            >
                {children}
            </AntdApp>
        </ConfigProvider>
    );
};

const AppProviders = ({ children }: { children: ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient());
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <ThemedShell>
                        <AuthProvider>{children}</AuthProvider>
                    </ThemedShell>
                </BrowserRouter>
            </QueryClientProvider>
        </Provider>
    );
};

export default AppProviders;
