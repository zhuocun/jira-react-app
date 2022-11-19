import { ReactNode } from "react";
import { AuthProvider } from "./context/authContext";
import { BrowserRouter } from "react-router-dom";

const AppProviders = ({ children }: { children: ReactNode }) => {
    return (
        <BrowserRouter>
            <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
    );
};

export default AppProviders;
