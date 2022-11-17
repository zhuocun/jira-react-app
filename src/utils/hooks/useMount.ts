/* eslint-disable */
import { useEffect } from "react";

const useMount = (callback: () => void, dependency?: any) => {
    useEffect(() => {
        callback();
    }, [dependency]);
};

export default useMount;
