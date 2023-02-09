import { useEffect, useRef } from "react";

/**
 * This is a React Hook that allows you to dynamically change the title of a web page.
 * The hook uses two useEffect hooks to manage the title of the web page:
    1. The first useEffect hook sets the title of the web page to the value passed in as the title argument, every time title changes.
    2. The second useEffect hook is used to restore the old title when the component using this hook unmounts. 
       It does this by returning a cleanup function that sets the title back to the old title if keepOnMount is false.
 * @param title a string that represents the new title for the web page.
 * @param keepOnMount a boolean value that determines whether the title should be kept after the component using this hook unmounts. 
                      If keepOnMount is set to true, the title will not change back to the old title after the component unmounts. 
                      If it's set to false, the title will change back to the old title.
 */
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
