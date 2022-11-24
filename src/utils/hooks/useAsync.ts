import { useCallback, useState } from "react";

interface State<D> {
    error: Error | null;
    data: D | null;
    status: "idle" | "loading" | "error" | "success";
}

const defaultState: State<null> = {
    status: "idle",
    data: null,
    error: null
};

const defaultConfig = {
    throwOnError: false
};

const useAsync = <D>(
    initialState?: State<D>,
    initialConfig?: typeof defaultConfig
) => {
    const config = { ...defaultConfig, ...initialConfig };
    const [state, setState] = useState<State<D>>({
        ...defaultState,
        ...initialState
    });

    const setData = useCallback((data: D) => {
        setState({
            data,
            status: "success",
            error: null
        });
    }, []);

    const setError = useCallback((error: Error) =>
        setState({
            error,
            status: "error",
            data: null
        }), []);

    const run = useCallback((promise: Promise<D>) => {
        if (!promise || !promise.then) {
            throw new Error("Please pass data of type 'Promise'");
        }
        setState((prevState)=>({ ...prevState, status: "loading" }));
        return promise
            .then((data) => {
                setData(data);
                return data;
            })
            .catch((err) => {
                setError(err);
                if (config.throwOnError) return Promise.reject(err);
                return err;
            });
    }, [config.throwOnError, setData, setError]);

    return {
        isIdle: state.status === "idle",
        isLoading: state.status === "loading",
        isError: state.status === "error",
        isSuccess: state.status === "success",
        run,
        setData,
        setError,
        ...state
    };
};

export default useAsync;
