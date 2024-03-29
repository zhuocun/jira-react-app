import { useEffect, useState } from "react";

const useDebounce = <P>(param: P, delay: number): P => {
    const [debouncedParam, setDebouncedParam] = useState(param);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedParam(param), delay);
        // after the param or delay is changed, a new useEffect will be scheduled to run, at the same time,
        // the return below of the old useEffect will execute to clean the old timeout.
        // this makes sure that, during the continuous input of the user, the timeout will always be reset,
        // so, the setDebouncedParam(param) won't fire, and the re-render of this component won't fire,
        // so that the 'return debouncedParam' won't fire
        // until the user finishes the input.
        return () => clearTimeout(timeout);
    }, [param, delay]);

    // the return debouncedParam will fire for the first time when the component that uses the useDebounced hook is initially rendered,
    // and it will return the initial value of the debouncedParam state, which is equal to the param value passed to the useDebounced hook.
    return debouncedParam;
};

export default useDebounce;
