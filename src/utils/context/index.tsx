import { ReactNode } from "react";
import { AuthProvider } from "./authContext";

const AppProviders = ({ children }: { children: ReactNode }) => {
    return <AuthProvider>{children}</AuthProvider>;
};

export default AppProviders;
