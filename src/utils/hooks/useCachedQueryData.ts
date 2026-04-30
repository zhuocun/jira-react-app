import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { useCallback, useSyncExternalStore } from "react";

const useCachedQueryData = <T>(queryKey: QueryKey): T | undefined => {
    const queryClient = useQueryClient();
    const subscribe = useCallback(
        (onStoreChange: () => void) =>
            queryClient.getQueryCache().subscribe(() => onStoreChange()),
        [queryClient]
    );
    const getSnapshot = useCallback(
        () => queryClient.getQueryData<T>(queryKey),
        [queryClient, queryKey]
    );

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

export default useCachedQueryData;
