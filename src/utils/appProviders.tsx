import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../store";
import AuthProvider from "./authProvider";
import { QueryClient, QueryClientProvider } from "react-query";

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
