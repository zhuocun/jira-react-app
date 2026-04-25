import { projectModalStore } from "./projectModalStore";

describe("projectModalStore", () => {
    beforeEach(() => {
        projectModalStore.closeModalMobX();
    });

    afterEach(() => {
        projectModalStore.closeModalMobX();
    });

    it("starts with the modal closed", () => {
        expect(projectModalStore.isModalOpened).toBe(false);
    });

    it("opens and closes the modal", () => {
        projectModalStore.openModalMobX();
        expect(projectModalStore.isModalOpened).toBe(true);

        projectModalStore.closeModalMobX();
        expect(projectModalStore.isModalOpened).toBe(false);
    });

    it("keeps action methods bound when they are destructured", () => {
        const { openModalMobX, closeModalMobX } = projectModalStore;

        openModalMobX();
        expect(projectModalStore.isModalOpened).toBe(true);

        closeModalMobX();
        expect(projectModalStore.isModalOpened).toBe(false);
    });
});
