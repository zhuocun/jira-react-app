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
        apply: "Apply",
        cancel: "Cancel",
        clear: "Clear",
        close: "Close",
        create: "Create",
        createProject: "Create project",
        delete: "Delete",
        edit: "Edit",
        logIn: "Log in",
        loggingIn: "Logging in…",
        logOut: "Log out",
        registerCta: "Register for an account",
        loginCta: "Already have an account? Log in",
        resetFilters: "Reset filters",
        retry: "Retry",
        save: "Save",
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
        usernameRequired: "Please enter your username",
        projectNameRequired: "Please enter the project name",
        organizationRequired: "Please enter the organization",
        managerRequired: "Please select a manager"
    },
    a11y: {
        capsLockOn: "Caps Lock is on",
        loadingProject: "Loading project",
        loadingProjectName: "Loading project name",
        loadingBoard: "Loading board",
        accountMenu: "Account menu",
        boardCopilot: "Board Copilot",
        aiSuggestion: "AI suggestion",
        aiBadge: "AI · review before using"
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
        retryHint: "Check your connection or retry."
    },
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
