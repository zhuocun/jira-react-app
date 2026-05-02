interface IProject {
    _id: string;
    projectName: string;
    managerId: string;
    organization: string;
    /**
     * Server-managed timestamp from `serialize_document`. Optional
     * because `POST /projects` and `PUT /projects` return a string
     * acknowledgement ("Project created" / "Project updated") rather
     * than a project object, and synthetic projects (AI search results,
     * optimistic creates) do not carry one.
     */
    createdAt?: string;
}
