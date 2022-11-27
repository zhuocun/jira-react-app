import useApi from "./useApi";
import { useMutation, useQueryClient } from "react-query";
import filterRequest from "../filterRequest";
import getError from "../getError";

const useReactMutation = <D>(
    endPoint: string,
    method = "POST",
    queryKey = endPoint,
    onSuccess?: (data: D) => void,
    onError?: (err: Error) => void,
    setCache?: boolean
) => {
    const api = useApi();
    const queryClient = useQueryClient();
    return useMutation(
        (param: { [key: string]: unknown }) =>
            api(endPoint, {
                data: filterRequest(param || {}),
                method: method
            }),
        {
            onSuccess: onSuccess
                ? setCache
                    ? (data: D) => {
                          queryClient.setQueryData(queryKey, data);
                          onSuccess(data);
                      }
                    : onSuccess
                : setCache
                ? async (data: D) =>
                      await queryClient.setQueryData(queryKey, data)
                : () => queryClient.invalidateQueries(queryKey),
            onError: onError
                ? (err: unknown) => {
                      onError(getError(err));
                  }
                : undefined
        }
    );
};

export default useReactMutation;
