import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { ReduxDispatch, RootState } from "../../store";

export const useReduxSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useReduxDispatch = () => useDispatch<ReduxDispatch>();
