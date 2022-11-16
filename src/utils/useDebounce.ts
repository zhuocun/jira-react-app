import { useEffect, useState } from "react";

const useDebounce = <P>(param: P, delay: number): P => {
    const [debounceParam, setDebounceParam] = useState(param);

    useEffect(() => {
        const timeout = setTimeout(() => setDebounceParam(param), delay);
        // execute after the execution of the previous useEffect
        return () => clearTimeout(timeout);
    }, [param, delay]);

    return debounceParam;
};

export default useDebounce;
