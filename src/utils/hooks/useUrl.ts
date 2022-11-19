import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";

const useUrl = <K extends string>(keys: K[]) => {
    const [searchParams, setSearchParams] = useSearchParams();
    return [
        useMemo(
            () =>
                keys.reduce((prev, key) => {
                    return { ...prev, [key]: searchParams.get(key) };
                }, {} as { [key in K]: string }),
            [searchParams]
        ),
        setSearchParams
    ] as const;
};

export default useUrl;
