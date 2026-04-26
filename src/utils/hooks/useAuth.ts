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
        clear().then(() => navigate("login"));
    };
    const refreshUser = () => {
        if (!user && token) {
            queryClient
                .refetchQueries({ queryKey: userQueryKey })
                .catch(() => {
                    logout();
                })
                .then(() => {
                    queryClient.setQueryData<IUser>(userQueryKey, {
                        ...queryClient.getQueryData<IUser>(userQueryKey),
                        jwt: token
                    } as IUser);
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
