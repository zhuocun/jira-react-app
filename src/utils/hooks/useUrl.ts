import { useMemo, useState } from "react";
import { URLSearchParamsInit, useSearchParams } from "react-router-dom";

import filterRequest from "../filterRequest";

const useUrl = <K extends string>(keys: K[]) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [stateKeys] = useState(keys);
    return [
        useMemo(
            () =>
                stateKeys.reduce((prev, key) => {
                    return { ...prev, [key]: searchParams.get(key) };
                }, {} as { [key in K]: string }),
            [searchParams, stateKeys]
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
