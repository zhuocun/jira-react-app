import { useEffect, useState } from "react";

const useDebounce = <P>(param: P, delay: number): P => {
    const [debouncedParam, setDebouncedParam] = useState(param);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedParam(param), delay);
        return () => clearTimeout(timeout);
    }, [param, delay]);

    return debouncedParam;
};

export default useDebounce;
