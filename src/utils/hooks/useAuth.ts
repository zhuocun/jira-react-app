import { useQueryClient } from "react-query";

const useAuth = () => {
    const queryClient = useQueryClient();
    const user = queryClient.getQueryData<IUser>("users");
    const token = localStorage.getItem("Token");
    const logout = async () => {
        queryClient.clear();
        localStorage.removeItem("Token");
    };
    return {
        user,
        logout,
        token
    };
};

export default useAuth;
