import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../store";
import AuthProvider from "./authProvider";

const AppProviders = ({ children }: { children: ReactNode }) => {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <AuthProvider>{children}</AuthProvider>
            </BrowserRouter>
        </Provider>
    );
};

export default AppProviders;
