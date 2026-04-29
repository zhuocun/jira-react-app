import { ReactNode, useState } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { store } from "../store";

import AuthProvider from "./authProvider";

const AppProviders = ({ children }: { children: ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient());
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <AuthProvider>{children}</AuthProvider>
                </BrowserRouter>
            </QueryClientProvider>
        </Provider>
    );
};

export default AppProviders;
