import useAsync from "./useAsync";
import useMount from "./useMount";
import filterRequest from "../filterRequest";
import useApi from "./useApi";

const useFetch = <D>(endPoint: string, param?: Partial<D>) => {
    const api = useApi();
    const { run, ...result } = useAsync<D[] | any>(undefined, { throwOnError: true });
    useMount(() => {
        run(api(endPoint, { data: filterRequest(param || {}) }));
    }, param);

    return result;
};

export default useFetch;
