
import { useEffect } from "react";

const useMount = (callback: () => void, dependency?: any) => {
    useEffect(() => {
        callback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dependency]);
};

export default useMount;
