import useAsync from "./useAsync";
import filterRequest from "../filterRequest";
import useApi from "./useApi";
import { useEffect } from "react";

const useFetch = <D>(endPoint: string, param?: Partial<D>) => {
    const api = useApi();
    const { run, ...result } = useAsync<D[] | any>(undefined, {
        throwOnError: true
    });
    useEffect(() => {
        run(api(endPoint, { data: filterRequest(param || {}) }));
    }, [param]);

    return result;
};

export default useFetch;
