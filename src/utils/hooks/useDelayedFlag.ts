import { useEffect, useState } from "react";

/**
 * Returns `true` only if `flag` has been continuously truthy for at least
 * `delay` ms. Used to suppress flash-of-spinner UI: a 250 ms delay means
 * fast local-engine responses never paint a spinner at all.
 */
const useDelayedFlag = (flag: boolean, delay = 250): boolean => {
    const [delayed, setDelayed] = useState(false);

    useEffect(() => {
        if (!flag) {
            setDelayed(false);
            return;
        }
        const timer = window.setTimeout(() => setDelayed(true), delay);
        return () => {
            window.clearTimeout(timer);
        };
    }, [flag, delay]);

    return delayed;
};

export default useDelayedFlag;
