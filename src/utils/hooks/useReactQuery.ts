import { useQuery } from "react-query";

import filterRequest from "../filterRequest";
import getError from "../getError";

import useApi from "./useApi";

const useReactQuery = <D>(
    endPoint: string,
    queryParam?: { [key: string]: unknown },
    specialQueryKey?: string,
    onSuccess?: (data: D) => void,
    onError?: (err: Error) => void,
    enabled = true
) => {
    const api = useApi();
    return useQuery<D>(
        queryParam
            ? [specialQueryKey || endPoint, filterRequest(queryParam)]
            : endPoint,
        () =>
            api(endPoint, {
                data: filterRequest(queryParam || {}),
                method: "GET"
            }),
        {
            onSuccess,
            onError: onError
                ? (err: unknown) => {
                      onError(getError(err));
                  }
                : undefined,
            enabled
        }
    );
};

export default useReactQuery;
