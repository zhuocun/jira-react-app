import { useEffect, useRef } from "react";

const useTitle = (title: string, keepOnMount = true) => {
    const oldTitle = useRef(document.title).current;

    useEffect(() => {
        document.title = title;
    }, [title]);

    useEffect(() => {
        return () => {
            if (!keepOnMount) {
                document.title = oldTitle;
            }
        };
    }, [keepOnMount, oldTitle]);
};

export default useTitle;
