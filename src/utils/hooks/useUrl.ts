import { URLSearchParamsInit, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import filterRequest from "../filterRequest";

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
        (params: Partial<{ [key in K]: unknown }>) => {
            const obj = filterRequest({
                ...searchParams,
                ...params
            }) as URLSearchParamsInit;
            setSearchParams(obj);
        }
    ] as const;
};

export default useUrl;
