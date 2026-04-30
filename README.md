# jira-react-app

`jira-react-app` is a React-based front-end application for a Jira-like project management tool. This app provides a user-friendly interface for managing tasks, projects, and team collaborations.

## Technologies

The project utilizes the following technologies:

- **React**: A JavaScript library for building user interfaces, used as the main UI library.
- **Redux**: A predictable state container for JavaScript apps, used for managing the application state.
- **React-Query**: A data-fetching library for React, used for fetching, caching, and syncing server data in the app.
- **Ant Design**: A popular design system and UI library for React, used for building the application components.
- **Emotion**: A CSS-in-JS library (`@emotion/react`, `@emotion/styled`) for styling components.
- **Hello Pangea DnD**: A drag-and-drop library for React, used for implementing drag-and-drop functionality.
- **React Router**: A collection of navigational components for creating single-page applications with navigation.

## Configuration

This project uses a combination of dependencies and devDependencies to ensure smooth development and efficient production builds. Some of the key packages include:

- **Vite**: A development server and production bundler used for local development and production builds.
- **eslint**: A pluggable JavaScript linter used for identifying and reporting patterns in code.
- **prettier**: An opinionated code formatter for consistent code style across the project.
- **husky**: A tool for managing Git hooks, ensuring code quality before committing changes.
- **lint-staged**: A package to run linters on Git staged files, used in conjunction with Husky for pre-commit checks.

The project is configured with scripts to streamline the development process, including scripts for starting the app, building production bundles, running tests, and performing pre-commit checks.

For a full list of dependencies, please refer to the `package.json` file.

## Board Copilot (AI features)

This app ships an AI assistant called **Board Copilot** with five capabilities:

- **Smart task drafting** in the create-task flow (a "Draft with AI" button next to `+ Create task`).
- **Story-point estimation and readiness check** inside the edit-task modal.
- **Board summary / standup brief** opened from the `Brief` button in the board header.
- **Ask Board Copilot** — conversational Q&A from the `Ask` button on the board or project list (read-only project data via tool calls locally; optional remote `/api/ai/chat` when `REACT_APP_AI_BASE_URL` is set).
- **Semantic search** — natural-language search on the board and project list (local token ranking, or optional remote `POST …/api/ai/search` when `REACT_APP_AI_BASE_URL` is set). Results combine with existing text filters; use **Clear AI search** to drop only the semantic filter.

All AI features are **opt-out**: the existing flows are unchanged, and AI surfaces are gated by a single env flag and a runtime user toggle (persisted in `localStorage` under `boardCopilot:enabled`).

### Backend

Board Copilot has two backends:

1.  **Local engine (default).** A deterministic in-browser engine derives all suggestions from the React Query caches that already exist in the app (project tasks, columns, members). It works with **no backend, no API key, and no network call**, which is how the FE is shipped today.
2.  **Remote proxy (optional).** If `REACT_APP_AI_BASE_URL` is set, the hook posts the same payload to `${REACT_APP_AI_BASE_URL}/api/ai/<route>` instead. The expected route handler should hold the LLM key, return a JSON response shaped according to `src/interfaces/ai.d.ts`, and follow the contract in `docs/prd/board-copilot.md`. **Never put the model key in the client bundle.**

### Environment variables

| Variable                | Default | Effect                                                                        |
| ----------------------- | ------- | ----------------------------------------------------------------------------- |
| `REACT_APP_AI_ENABLED`  | `true`  | Set to `false` at build time to hide every AI surface and bypass the hook. Also supports `VITE_AI_ENABLED` (see Vite note below).    |
| `REACT_APP_AI_BASE_URL` | empty   | When non-empty, AI calls go to `${...}/api/ai/<route>`. Empty = local engine. Also supports `VITE_AI_BASE_URL`. |

Vite inlines `process.env.REACT_APP_*` at build time via `vite.config.ts`. You may use `VITE_AI_BASE_URL` / `VITE_AI_ENABLED` in `.env` files as aliases; they map to the same client bundle flags.

The runtime toggle (per browser) overrides nothing about availability — it only lets a user disable AI on top of an already-enabled build.

### Validation and safety

Every model-supplied identifier (`columnId`, `coordinatorId`, similar `taskId`s) is cross-checked against the React Query cache before any UI action; unknown ids are dropped or replaced with safe defaults. Story points are clamped to `1/2/3/5/8/13`. AI suggestions are advisory only — every write to the board still goes through the user clicking Submit and the existing `useReactMutation` plumbing.

For the full design, see [docs/prd/board-copilot.md](docs/prd/board-copilot.md). For what has shipped vs what is still open, see [docs/prd/board-copilot-progress.md](docs/prd/board-copilot-progress.md). For a section-by-section design vs implementation review with file/line evidence, see [docs/prd/board-copilot-review.md](docs/prd/board-copilot-review.md).
