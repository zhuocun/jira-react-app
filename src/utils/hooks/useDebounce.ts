import { useEffect, useState } from "react";

const useDebounce = <P>(param: P, delay: number): P => {
    const [debouncedParam, setDebouncedParam] = useState(param);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedParam(param), delay);
        // after the param or delay is changed, a new useEffect will be scheduled to run, at the same time,
        // the return below of the old useEffect will execute to clean the old timeout.
        // this makes sure that, during the continuously input of the user, the timeout will always be reset,
        // so, the setDebouncedParam(param) won't fire, and the re-render of this component won't fire,
        // so that the 'return debouncedParam' won't fire
        // until the user finishes the input.
        return () => clearTimeout(timeout);
    }, [param, delay]);

    return debouncedParam;
};

export default useDebounce;
