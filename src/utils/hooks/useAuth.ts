import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

const useAuth = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const userQueryKey = ["users"];
    const user = queryClient.getQueryData<IUser>(userQueryKey);
    const token = localStorage.getItem("Token");
    const clear = async () => {
        queryClient.clear();
        localStorage.removeItem("Token");
    };
    const logout = () => {
        clear().then(() => navigate("/login"));
    };
    const refreshUser = async () => {
        if (!user && token) {
            try {
                await queryClient.refetchQueries({ queryKey: userQueryKey });
                const refreshed = queryClient.getQueryData<IUser>(userQueryKey);
                if (refreshed) {
                    queryClient.setQueryData<IUser>(userQueryKey, {
                        ...refreshed,
                        jwt: token
                    });
                }
            } catch {
                await clear();
                navigate("/login");
            }
        }
    };
    return {
        user,
        logout,
        token,
        refreshUser
    };
};

export default useAuth;
