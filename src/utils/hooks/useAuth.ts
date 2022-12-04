import { useQueryClient } from "react-query";
import { useNavigate } from "react-router";

const useAuth = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = queryClient.getQueryData<IUser>("users");
    const token = localStorage.getItem("Token");
    const clear = async () => {
        queryClient.clear();
        localStorage.removeItem("Token");
    };
    const logout = () => {
        clear().then(() => navigate("login"));
    };
    const refreshUser = () => {
        if (!user && token) {
            queryClient
                .refetchQueries<IUser>("users")
                .catch(() => {
                    logout();
                })
                .then(() => {
                    queryClient.setQueryData("users", {
                        ...queryClient.getQueryData<IUser>("users"),
                        jwt: token
                    });
                });
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
