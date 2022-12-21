import { QueryKey, useMutation, useQueryClient } from "react-query";

import filterRequest from "../filterRequest";
import getError from "../getError";

import useApi from "./useApi";

const useReactMutation = <D>(
    endPoint: string,
    method: string,
    queryKey?: QueryKey,
    callback?: any,
    onError?: (err: Error) => void,
    setCache?: boolean
) => {
    const api = useApi();
    const queryClient = useQueryClient();
    return useMutation(
        (param: { [key: string]: unknown }) =>
            api(endPoint, {
                data: filterRequest(param || {}),
                method
            }),
        {
            onSuccess: setCache
                ? async (data: D) =>
                      queryClient.setQueryData(queryKey || endPoint, data)
                : () => queryClient.invalidateQueries(queryKey),
            onError: onError
                ? (err: unknown) => {
                      onError(getError(err));
                  }
                : undefined,
            onMutate: callback
                ? async (target: any) => {
                      const previousItems = queryClient.getQueryData(
                          queryKey || ""
                      );
                      queryClient.setQueryData(
                          queryKey || endPoint,
                          (old?: any[]) => {
                              return callback(target, old);
                          }
                      );
                      return { previousItems };
                  }
                : undefined
        }
    );
};

export default useReactMutation;
