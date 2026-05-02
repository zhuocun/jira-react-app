interface IUser extends IMember {
    likedProjects: string[];
    /**
     * Bearer token. Present in the `POST /auth/login` response only.
     * Read-only profile endpoints (`GET /users/`, `PUT /users/`,
     * `PUT /users/likes`) intentionally omit it because the token is
     * orthogonal to user state -- `useAuth.refreshUser` patches it
     * back into the React Query cache from localStorage. Consumers
     * that need the token at request-time should fall back to
     * `localStorage.getItem("Token")` (this is what `useApi` does).
     */
    jwt?: string;
}
