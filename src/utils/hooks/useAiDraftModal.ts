import { useCallback } from "react";

import useUrl from "./useUrl";

/**
 * URL-driven open/close state for the AI Task Draft modal so the system back
 * button (iOS swipe-back, Android hardware back) dismisses the overlay
 * instead of exiting the page entirely. The query value is the column id the
 * draft is being created against, which lets multiple per-column triggers
 * coexist on the board without cross-talk: each TaskCreator only renders the
 * modal when `aiDraft === its columnId`.
 */
const useAiDraftModal = () => {
    const [{ aiDraft }, setUrl] = useUrl(["aiDraft"]);
    const openModal = useCallback(
        (columnId: string) => {
            setUrl({ aiDraft: columnId });
        },
        [setUrl]
    );
    const closeModal = useCallback(() => {
        setUrl({ aiDraft: undefined });
    }, [setUrl]);
    return {
        activeColumnId: aiDraft ?? undefined,
        openModal,
        closeModal
    };
};

export default useAiDraftModal;
