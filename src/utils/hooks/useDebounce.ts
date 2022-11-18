import { useEffect, useState } from "react";

const useDebounce = <P>(param: P, delay: number): P => {
    const [debouncedParam, setDebouncedParam] = useState(param);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedParam(param), delay);
        // execute after the execution of the previous useEffect
        return () => clearTimeout(timeout);
    }, [param, delay]);

    return debouncedParam;
};

export default useDebounce;
