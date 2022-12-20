import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import { store } from "../store";

import AuthProvider from "./authProvider";

const AppProviders = ({ children }: { children: ReactNode }) => {
    const queryClient = new QueryClient();
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
