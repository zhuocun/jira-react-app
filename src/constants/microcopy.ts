/**
 * Centralized microcopy. Importing from here keeps button labels, modal
 * titles, and confirmation prompts consistent (Phase 3.1 of the plan):
 * sentence case, action verbs, no banned words ("Submit", "OK", "Login").
 *
 * Each key is named after the intent, never the surface, so the same string
 * can be reused on any screen.
 */
export const microcopy = {
    actions: {
        addColumn: "Add column",
        apply: "Apply",
        askCopilot: "Ask Copilot",
        cancel: "Cancel",
        clear: "Clear",
        clearAiSearch: "Clear AI search",
        close: "Close",
        create: "Create",
        createProject: "Create project",
        createTask: "Create task",
        delete: "Delete",
        draftWithAi: "Draft with AI",
        edit: "Edit",
        editProject: "Edit project",
        editTask: "Edit task",
        logIn: "Log in",
        loggingIn: "Logging in…",
        logOut: "Log out",
        registerCta: "Register for an account",
        loginCta: "Log in to your account",
        resetFilters: "Reset filters",
        retry: "Retry",
        save: "Save",
        search: "Search",
        send: "Send",
        showPassword: "Show password",
        hidePassword: "Hide password",
        signUp: "Sign up",
        signingUp: "Signing up…",
        stop: "Stop",
        undo: "Undo"
    },
    validation: {
        emailRequired: "Please enter your email",
        emailInvalid: "Please enter a valid email address",
        passwordRequired: "Please enter your password",
        passwordTooShort: "Password must be at least 8 characters",
        usernameRequired: "Please enter your username",
        projectNameRequired: "Please enter the project name",
        organizationRequired: "Please enter the organization",
        managerRequired: "Please select a manager",
        coordinatorRequired: "Please select a coordinator",
        taskNameRequired: "Please enter the task name",
        taskTypeRequired: "Please select the task type"
    },
    a11y: {
        capsLockOn: "Caps Lock is on",
        loadingProject: "Loading project",
        loadingProjectName: "Loading project name",
        loadingBoard: "Loading board",
        accountMenu: "Account menu",
        boardCopilot: "Board Copilot",
        aiSuggestion: "AI suggestion",
        aiBadge: "AI · review before using",
        useDarkMode: "Switch to dark mode",
        useLightMode: "Switch to light mode"
    },
    fields: {
        coordinator: "Coordinator",
        email: "Email",
        epic: "Epic",
        manager: "Manager",
        notes: "Notes",
        organization: "Organization",
        password: "Password",
        projectName: "Project name",
        storyPoints: "Story points",
        taskName: "Task name",
        type: "Type",
        username: "Username"
    },
    confirm: {
        deleteProject: {
            title: "Delete this project?",
            description: "This action cannot be undone.",
            confirmLabel: "Delete project"
        },
        deleteColumn: {
            title: "Delete this column?",
            description: "This action cannot be undone.",
            confirmLabel: "Delete column"
        },
        deleteTask: {
            title: "Delete this task?",
            description: "This action cannot be undone.",
            confirmLabel: "Delete task"
        }
    },
    feedback: {
        loadFailed: "Couldn't load. Please try again.",
        saveFailed: "Couldn't save. Please try again.",
        operationFailed: "Operation failed",
        retryHint: "Check your connection or retry.",
        noManager: "No manager",
        noDate: "No date",
        renderFailed: "This page couldn't render.",
        renderFailedHint:
            "Try again, or reload the page if the problem persists.",
        reloadPage: "Reload page"
    },
    /**
     * ICU-style placeholder greeting. Header reads it as
     * `microcopy.greeting.replace("{name}", username)`. Keeping the token
     * in a single string (instead of `${microcopy.actions.hi} ${name}`)
     * lets translators reorder the noun and the verb per locale.
     */
    greeting: "Hi, {name}",
    empty: {
        projects: {
            title: "No projects yet",
            description:
                "Create your first project to start tracking work, owners, and progress."
        },
        board: {
            title: "Add your first column",
            description:
                "Boards organize tasks into columns. Try Backlog, In progress, Done."
        },
        members: {
            title: "No team members",
            description: "Invite teammates to collaborate on this workspace."
        },
        chat: {
            title: "Ask Board Copilot",
            description:
                "Try: 'What's at risk?' or 'Who has the most open tasks?' — answers come from your board data."
        }
    }
} as const;
