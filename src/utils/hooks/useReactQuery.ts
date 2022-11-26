import filterRequest from "../filterRequest";
import useApi from "./useApi";
import { useQuery } from "react-query";
import getError from "../getError";

const useReactQuery = <D>(
    endPoint: string,
    queryParam?: { [key: string]: unknown },
    enabled = true,
    specialQueryKey?: string,
    onSuccess?: (data: D) => void,
    onError?: (err: Error) => void
) => {
    const api = useApi();
    return useQuery<D>(
        queryParam
            ? [
                  specialQueryKey ? specialQueryKey : endPoint,
                  filterRequest(queryParam)
              ]
            : endPoint,
        () =>
            api(endPoint, {
                data: filterRequest(queryParam || {}),
                method: "GET"
            }),
        {
            onSuccess: onSuccess,
            onError: onError
                ? (err: unknown) => {
                      onError(getError(err));
                  }
                : undefined,
            enabled: enabled
        }
    );
};

export default useReactQuery;
