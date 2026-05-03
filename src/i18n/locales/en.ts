/**
 * English (en) dictionary — the structural baseline that every other
 * locale must satisfy.
 *
 * This file owns the literal strings: the type derived from
 * `typeof enSource` is the contract used by `Dictionary` (in `../types`),
 * the Chinese/future translations, and the runtime Proxy in
 * `src/constants/microcopy.ts`.
 *
 * Owning the literal here (rather than in `src/constants/microcopy.ts`)
 * keeps the i18n module self-contained and side-steps an otherwise
 * circular import — `microcopy.ts` reads the active dictionary through
 * `i18n/active.ts`, which seeds itself from this module.
 */
export const enSource = {
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
        useLightMode: "Switch to light mode",
        goToProjects: "Go to projects",
        members: "Members",
        viewTeamMembers: "View team members"
    },
    settings: {
        darkMode: "Dark mode",
        toggleDarkMode: "Toggle dark mode",
        boardCopilot: "Board Copilot",
        toggleBoardCopilot: "Enable Board Copilot features",
        language: "Language",
        changeLanguage: "Change language"
    },
    labels: {
        members: "Members",
        teamMembers: "Team Members"
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
        reloadPage: "Reload page",
        networkError:
            "Unable to connect. Check your internet connection and try again.",
        optimisticReverted: "Couldn't save — your changes were reverted.",
        projectDeleted: "Project deleted",
        taskDeleted: "Task deleted",
        likeFailed: "Couldn't update like. Please try again.",
        taskSaved: "Task saved",
        welcomeBack: "Welcome back!"
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
        },
        filteredColumn: {
            title: "No tasks match the current filters",
            cta: "Reset filters"
        },
        commandPalette: {
            loading: "Loading…",
            empty: "No matches."
        },
        notFound: {
            title: "Page not found",
            description:
                "We couldn't find the page you're looking for. It may have moved, or the link might be out of date.",
            cta: "Back to projects"
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
            "Board Copilot uses board and project names, columns, task names, types, story points, epics, notes when present, and member usernames, emails, or user IDs where needed.",
        privacyDataScope: [
            "Board and project names, plus column titles",
            "Task names, types, story points, epics, notes when present, and column placement",
            "Member usernames, emails, and user IDs where needed"
        ] as readonly string[],
        privacyExclusions:
            "Attachments are not included in Board Copilot requests.",
        localProcessingDisclosure:
            "This build uses local deterministic Board Copilot rules. No external AI service processes these requests.",
        remoteProcessingDisclosure:
            "Requests are processed by the configured AI service. Your sign-in token is forwarded so the proxy can authorize your account.",
        remoteProcessingDisclosureWithOrigin:
            "Requests are processed by the configured AI service at {origin}. Your sign-in token is forwarded so the proxy can authorize your account.",
        processingModeLocalLabel: "Local engine",
        processingModeRemoteLabel: "Remote AI service",
        engineCapabilityLocal:
            "Board Copilot in this build runs deterministic project rules locally — no external language model is configured. Suggestions reflect the rules, not a language model.",
        engineCapabilityRemote:
            "Board Copilot is connected to a configured AI service. Outputs may include generated language; review before applying.",
        privacyLink: "What is shared?",
        privacyAcknowledge: "Got it",
        privacySuppress: "Don't remind me",
        streaming: "Reading your board data…",
        stopped: "Stopped",
        retryLabel: "Try again",
        regenerateLabel: "Regenerate",
        undoLabel: "Undo",
        copiedConfirm: "Copied to clipboard",
        feedbackThanks: "Thanks for your feedback",
        feedbackImpactNotice:
            "Feedback is saved for product review — it does not change this answer or train a model.",
        feedbackThumbsDownTooltip:
            "Not helpful? Tell us why. Categories are saved for product review only — your message text is not sent.",
        chatBusyError: "Board Copilot is busy. Try again in a moment.",
        feedbackPromptDownTitle: "What went wrong?",
        feedbackPromptDownHelper:
            "Pick at least one — it helps us prioritize fixes without sending your message text.",
        feedbackCategories: {
            incorrect: "Incorrect or made-up information",
            missingSource: "Missing or wrong source",
            outdated: "Used outdated board data",
            notActionable: "Not actionable",
            unsafe: "Unsafe or risky suggestion",
            privacy: "Privacy concern",
            other: "Something else"
        },
        feedbackOptionalNote: "Add an optional note (no message text is sent)",
        feedbackSubmit: "Send feedback",
        feedbackSkip: "Skip",
        regeneratedBadge: "Regenerated response",
        regeneratedTooltip:
            "Board Copilot generated a fresh answer to the same question. The earlier response is still above for comparison.",
        thinkingDefault: "Reading your board data…",
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
            "No answer was found. Try rephrasing, or check the listed sources.",
        chatNoSourcesCaveat:
            "No board records were opened for this answer — verify before acting on it.",
        copilotLabel: "Board Copilot",
        askCopilot: "Ask Board Copilot",
        findRelatedTasks: "Find related tasks",
        findRelatedProjects: "Find related projects",
        findRelatedTasksAria:
            "Find related tasks with AI and filter the task list",
        findRelatedProjectsAria:
            "Find related projects with AI and filter the project list",
        findRelatedTasksPlaceholder: "Describe tasks to find…",
        findRelatedProjectsPlaceholder: "Describe projects to find…",
        findRelatedTasksHelper:
            "Matches by task name, type, epic, and notes. Filters this list — does not open chat.",
        findRelatedProjectsHelper:
            "Matches by project name, organization, and manager. Filters this list — does not open chat.",
        searchMatchStrength: {
            strong: "Strong match",
            moderate: "Partial match",
            weak: "Weak match"
        },
        searchMatchStrengthAria:
            "Match strength {strength} for the AI semantic search",
        searchSynonymExpanded:
            "Expanded {original} to include common synonyms ({expansions}).",
        citationFlagAction: "Report wrong source",
        citationFlagConfirm: "Thanks — flagged for review",
        remoteConsentTitle: "Heads up: this build sends data to a remote AI",
        remoteConsentBody:
            "Board Copilot is connected to {origin}. Your sign-in token, board data, and any task you open are sent there for processing. Outputs may include generated language — review before applying.",
        remoteConsentBodyGeneric:
            "Board Copilot is connected to a configured AI service. Your sign-in token, board data, and any task you open are sent there for processing. Outputs may include generated language — review before applying.",
        remoteConsentAccept: "I understand",
        remoteConsentLearnMore: "What is shared?",
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

export default enSource;
