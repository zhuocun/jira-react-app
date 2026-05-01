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
    },
    /**
     * Board Copilot v3 microcopy (PRD §9.6 X-R13). The `ai` namespace
     * collects every user-visible AI string so a future translator (or a
     * neutral-tone audit) only needs to look at one block. Keep strings
     * tool-like — never "I think" or "I understand" (PRD §6.2).
     */
    ai: {
        draftSuggestions: [
            "Draft a bug fix task",
            "Plan a new feature",
            "Create a research spike"
        ] as readonly string[],
        chatSuggestions: [
            "What's at risk on this board?",
            "Who has the most open tasks?",
            "Summarize this board"
        ] as readonly string[],
        privacyTitle: "What Board Copilot sees",
        privacyDisclosure:
            "Board Copilot sees your board's task names, columns, and member names. No notes, emails, or attachments are shared.",
        privacyLink: "What is shared?",
        privacyAcknowledge: "Got it",
        privacySuppress: "Don't remind me",
        streaming: "Board Copilot is thinking…",
        stopped: "Stopped",
        retryLabel: "Try again",
        regenerateLabel: "Regenerate",
        undoLabel: "Undo",
        copiedConfirm: "Copied to clipboard",
        feedbackThanks: "Thanks for your feedback",
        confidenceBands: {
            high: "High",
            moderate: "Moderate",
            low: "Low"
        },
        appliedSuggestion: "Suggested by Copilot",
        appliedSuggestionShort: "AI",
        suggestionPopover:
            "Board Copilot filled this in. Edit it, or revert to the previous value.",
        revertToPrevious: "Revert to previous",
        showAlternatives: "Show alternatives",
        showRationale: "Why this?",
        applyAnyway: "Apply anyway",
        emptyChatLead:
            "Ask about this board, tasks, or your projects. Answers use read-only data from the app.",
        emptyBriefLead:
            "Not enough history for trends. The brief gets smarter as the board grows.",
        emptyInbox:
            "No nudges right now. Board Copilot checks for issues every 15 minutes.",
        emptyHistory:
            "No AI actions yet. Changes made with Board Copilot will appear here.",
        rateLimit:
            "Board Copilot is at capacity. Please try again in {seconds} seconds.",
        projectDisabled:
            "Board Copilot is turned off for this project. An admin can enable it in Settings.",
        chatErrorRecovery:
            "I couldn't find an answer. Try rephrasing, or check sources for what I looked at.",
        copilotLabel: "Board Copilot",
        askCopilot: "Ask Board Copilot",
        newConversation: "New conversation",
        stopResponse: "Stop response",
        characterCounterMax: 2000,
        characterCounterShowAfter: 500,
        breakdownAxes: {
            by_phase: {
                label: "By phase",
                tooltip: "Frontend, backend, testing"
            },
            by_surface: {
                label: "By surface",
                tooltip: "UI, API, data, infra"
            },
            by_risk: {
                label: "By risk",
                tooltip: "High risk first, low risk last"
            },
            freeform: {
                label: "Let Copilot decide",
                tooltip: "Agent picks the best split"
            }
        },
        welcomeBannerTitle: "Board Copilot is ready",
        welcomeBannerBody:
            "Draft tasks, estimate work, summarize the board, and answer questions — all from your board data.",
        welcomeBannerCta: "Try: Summarize this board",
        welcomeBannerDismiss: "Dismiss"
    }
} as const;
