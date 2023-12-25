import { makeAutoObservable } from "mobx";
import { createContext } from "react";

class ProjectModalStore {
    isModalOpened = false;

    constructor() {
        makeAutoObservable(this);
        this.openModalMobX = this.openModalMobX.bind(this);
        this.closeModalMobX = this.closeModalMobX.bind(this);
    }

    openModalMobX() {
        this.isModalOpened = true;
    }

    closeModalMobX() {
        this.isModalOpened = false;
    }
}

const projectModalStore = new ProjectModalStore();

const ProjectModalStoreContext = createContext(projectModalStore);

export { projectModalStore, ProjectModalStoreContext };
