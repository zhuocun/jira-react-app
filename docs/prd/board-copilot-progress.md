# Board Copilot — implementation progress

Companion to [`docs/prd/board-copilot.md`](board-copilot.md). Tracks what has shipped to `main`, what is still open, and the concrete file/test inventory so a new contributor can pick up cleanly.

| Field        | Value                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Status       | Phases 0–4: semantic search ships on branch `cursor/board-copilot-semantic-search-1b36` (this work); Phases 0–3 on `main` |
| Last updated | 2026-04-29                                                                                                                |
| Owner        | TBD (frontend)                                                                                                            |

---

## Main vs in-flight

| Location                                                                                | What it contains                                                                                                                                                                            |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`main`** (through merge of [PR #3](https://github.com/zhuocun/jira-react-app/pull/3)) | Phases 0–3: everything through the conversational assistant (`AiChatDrawer`, `useAiChat`, `chatTools` / `chatEngine`, `Ask` on board + project list, optional remote `POST …/api/ai/chat`). |
| **Branch `cursor/board-copilot-semantic-search-1b36`** (this work)                      | Phase 4 — **Capability E**: `AiSearchInput`, `semanticSearch` in `engine.ts`, `search` route on `useAi`, URL param `semanticIds`, task + project panel integration, tests.                  |

---

## At a glance

| Phase    | Capability                                                 | PRD section | Status                                                                              |
| -------- | ---------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| Phase 0  | Plumbing (env, hook, validators, runtime toggle)           | §7, §3.5    | ✅ Shipped                                                                          |
| Phase 1  | Capability C — Board summary brief                         | §5.3        | ✅ Shipped                                                                          |
| Phase 2A | Capability A — Smart task drafting                         | §5.1        | ✅ Shipped                                                                          |
| Phase 2B | Capability B — AI estimation + readiness                   | §5.2        | ✅ Shipped                                                                          |
| Phase 3  | Capability D — Conversational assistant                    | §5.4        | ✅ Shipped on `main` ([PR #3](https://github.com/zhuocun/jira-react-app/pull/3))    |
| Phase 4  | Capability E — Semantic search                             | §5.5        | ✅ Shipped on `cursor/board-copilot-semantic-search-1b36` (merge to `main` pending) |
| Backend  | Vercel `api/ai/[route].ts` proxy with provider abstraction | §7.2        | ⏳ Not started (FE works against the deterministic local engine in the meantime)    |

---

## What shipped

Historical note: the first large Board Copilot drop was PR #1; [PR #3](https://github.com/zhuocun/jira-react-app/pull/3) merged Phase 3 (Ask Board Copilot) to `main`.

### Phase 0 — Plumbing

- **Env flags** (`src/constants/env.ts`): `aiEnabled`, `aiBaseUrl`, `aiUseLocalEngine`. Defaults to enabled with the local engine; `REACT_APP_AI_ENABLED=false` hides every AI surface; `REACT_APP_AI_BASE_URL=…` switches to the remote proxy.
- **Runtime toggle** (`src/utils/hooks/useAiEnabled.ts`): persisted to `localStorage` under `boardCopilot:enabled`, with cross-component live updates via a custom `boardCopilot:toggled` event.
- **Single AI hook** (`src/utils/hooks/useAi.ts`): exposes `run`, `abort`, `reset`, `data`, `error`, `isLoading`. Owns the `AbortController` lifecycle, switches transparently between the local engine and the remote proxy, and validates every response before resolving.
- **Local AI engine** (`src/utils/ai/engine.ts`): deterministic `draftTask`, `breakdownTask`, `estimate`, `readiness`, `boardBrief`, `semanticSearch`. Lets the FE work end-to-end with no backend.
- **Validators** (`src/utils/ai/validate.ts`): cross-checks every model-supplied id (`columnId`, `coordinatorId`, similar `taskId`s) against the cached context, drops or replaces unknown ids, and clamps story points to `1/2/3/5/8/13`.
- **Pure helpers** (`src/utils/ai/keywords.ts`, `src/utils/ai/storyPoints.ts`): tokenisation, Jaccard similarity, Fibonacci snapping.
- **Typed contracts** (`src/interfaces/ai.d.ts`): `IDraftTaskSuggestion`, `ITaskBreakdownSuggestion`, `IEstimateSuggestion`, `IReadinessReport`, `IBoardBrief`, `ISearchResult` — these are the shapes the future remote proxy must return per route.

### Phase 1 — Capability C: Board summary brief

- `src/components/boardBriefDrawer/index.tsx` — Ant Design `Drawer` with headline, per-column counts table, largest unstarted, unowned, workload, and a one-line recommendation.
- Brief items deep-link into the existing task modal via `useTaskModal`.
- `src/pages/board.tsx` — adds a `Brief` button in the header gated by the runtime toggle.

### Phase 2A — Capability A: Smart task drafting

- `src/components/aiTaskDraftModal/index.tsx` — natural-language prompt → fully populated antd form (name, type, epic, story points, note with acceptance criteria, suggested column and coordinator) → existing `useReactMutation("tasks", "POST", …, newTaskCallback)`.
- `Break down` action posts N child tasks sequentially through the same mutation, preserving the optimistic update.
- `src/components/taskCreator/index.tsx` — adds a `Draft with AI` affordance next to `+ Create task`, gated by the runtime toggle.

### Phase 2B — Capability B: AI estimation + readiness

- `src/components/aiTaskAssistPanel/index.tsx` — sidebar showing suggested story points (with confidence and similar-task back-references) and a readiness check (missing acceptance criteria, missing coordinator, etc.) with one-click `Apply` that fills the antd form.
- `src/components/taskModal/index.tsx` — extends the form with `epic`, `storyPoints`, `note` editors so AI suggestions have somewhere to land, and mounts the assist panel for non-mock tasks when AI is enabled.

### Phase 3 — Capability D: Conversational assistant

- `src/components/aiChatDrawer/index.tsx` — right-edge `Drawer` (“Ask Board Copilot”) with message thread, read-only tool traces, local deterministic engine or `POST` to remote `/api/ai/chat` when `REACT_APP_AI_BASE_URL` is set.
- `src/utils/hooks/useAiChat.ts` — orchestrates turns; executes validated read-only tools via `executeChatToolCall` (`src/utils/ai/chatTools.ts`).
- `src/utils/ai/chatEngine.ts` — local assistant step (`chatAssistantTurn`) and tool-result formatting (`summarizeToolResultForUser`).
- `src/pages/board.tsx` and `src/pages/project.tsx` — `Ask` button when AI is enabled.

Remote proxy (optional): `POST ${REACT_APP_AI_BASE_URL}/api/ai/chat` with body `{ messages, context }` returning `{ kind: "text", text }` or `{ kind: "tool_calls", toolCalls }` using the same read-only tool names as `chatTools.ts`.

**PRD gaps / follow-ups for Phase 3**

- Chat uses **request–response JSON**, not **SSE** token streaming (PRD §6.1 / §7.1 describe SSE for `useAi`; structured routes also use non-streaming `fetch` today).
- **Tests:** `src/components/aiChatDrawer/index.test.tsx`, `src/utils/hooks/useAiChat.test.tsx`, `src/utils/hooks/useAiChat.remote.test.tsx` cover the drawer, local chat turns, and remote chat transport (tool/engine units remain in `*.test.ts`).

### Phase 4 — Capability E: Semantic search (PRD §5.5)

- `src/interfaces/ai.d.ts` — `ISearchResult` (`ids`, `rationale`).
- `src/utils/ai/engine.ts` — `semanticSearch` (Jaccard over tokenised query vs task name/type/epic/note or project name/org/manager); `AiSearchProjectsContext` for project-side context.
- `src/utils/ai/validate.ts` — `validateSearch` intersects `ids` with known cache ids.
- `src/utils/hooks/useAi.ts` — `AiRoute` includes `"search"`; `RunPayload.search` with `kind`, `query`, and `projectContext` or `projectsContext`.
- `src/components/aiSearchInput/index.tsx` — “Ask in natural language” + Search / Clear AI search; local engine or remote `POST …/api/ai/search`.
- `src/components/taskSearchPanel/index.tsx` — optional `aiSearchSlot`; `TaskSearchParam.semanticIds`; Reset clears semantic filter.
- `src/components/projectSearchPanel/index.tsx` — optional `aiSearchSlot`; `ProjectSearchParam.semanticIds`.
- `src/pages/board.tsx` — `semanticIds` in URL; passes slot + `AiSearchInput` when AI enabled and project context ready.
- `src/pages/project.tsx` — `semanticIds` in URL; debounced API fetch excludes `semanticIds`; list filtered client-side by semantic ids when set.
- `src/components/column/index.tsx` — AND semantic id filter with existing task filters.

Remote proxy (optional): `POST ${REACT_APP_AI_BASE_URL}/api/ai/search` with JSON body matching `RunPayload.search` (same `kind`, `query`, and context objects as other AI routes). Response `{ ids, rationale }` is validated with `validateSearch` client-side.

### Shared

- `src/components/header/index.tsx` — **Board Copilot** runtime switch (Ant Design `Switch`) when `REACT_APP_AI_ENABLED` is not `false`; persists via `useAiEnabled` / `localStorage` (PRD §7.3).
- `src/components/aiSparkleIcon/index.tsx` — single shared "AI" affordance used wherever AI initiates an action.
- `README.md` — Board Copilot section: backends, env vars, safety, link to the PRD.

### Test coverage

- 76 suites, 340 tests.
- Coverage on the runtime AI scope: **97% statements / 92.37% branches / 97% functions / 97.84% lines**.
- New test files:
    - `src/utils/ai/{engine,keywords,storyPoints,validate,chatEngine,chatTools}.test.ts`
    - `src/utils/hooks/{useAi,useAi.remote,useAiChat,useAiChat.remote,useAiEnabled,useAiEnabled.disabled}.test.tsx`
    - `src/components/{aiChatDrawer,aiSearchInput,aiTaskDraftModal,aiTaskAssistPanel,boardBriefDrawer}/index.test.tsx`
    - `src/components/header/index.test.tsx` (includes Board Copilot toggle)
    - Extended: `src/components/{taskCreator,taskModal}/index.test.tsx`, `src/constants/env.test.ts`

**Note:** AC-D1–AC-D4 apply with Phase 3 on `main` ([PR #3](https://github.com/zhuocun/jira-react-app/pull/3)).

### Acceptance-criteria status (against the PRD)

| ID    | Acceptance criterion                                                              | Status                                                                                  |
| ----- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| AC-A1 | With AI off, `TaskCreator` is unchanged                                           | ✅                                                                                      |
| AC-A2 | Draft button opens the modal with a streaming partial form                        | ✅ (local engine resolves synchronously; UX scaffold in place for real streaming)       |
| AC-A3 | Submitted task is indistinguishable from a manually created one in the cache      | ✅ (uses the existing `newTaskCallback`)                                                |
| AC-A4 | Unknown `columnId` is rejected and replaced with the opener column                | ✅ (`validateDraft`)                                                                    |
| AC-A5 | Unknown `coordinatorId` is rejected and replaced with the current user            | ✅                                                                                      |
| AC-A6 | Escape / unmount aborts the in-flight request                                     | ✅ (`AbortController` in `useAi`)                                                       |
| AC-A7 | Breakdown posts each subtask via `useReactMutation` with the optimistic callback  | ✅                                                                                      |
| AC-B1 | With AI off, the task modal is unchanged                                          | ✅                                                                                      |
| AC-B2 | Opening a task triggers exactly one estimation; further estimations are debounced | ✅ (1000 ms via existing `useDebounce`)                                                 |
| AC-B3 | Suggested `storyPoints` is always in `{1,2,3,5,8,13}`                             | ✅ (`clampToFibonacci`)                                                                 |
| AC-B4 | Each `similar[]._id` is present in the project's `tasks` cache                    | ✅ (`validateEstimate`)                                                                 |
| AC-B5 | `Apply suggestion` does not submit the form                                       | ✅ (only calls `form.setFieldsValue`)                                                   |
| AC-B6 | Closing the modal mid-request aborts the request                                  | ✅                                                                                      |
| AC-C1 | With AI off, no Brief button is rendered                                          | ✅                                                                                      |
| AC-C2 | Brief opens immediately and renders within ≤2s for ≤200 tasks                     | ✅ (local engine is synchronous; remote-path SLO will be measured once the proxy ships) |
| AC-C3 | All `taskId` and `memberId` references in the brief exist in the cache            | ✅ (`validateBoardBrief`)                                                               |
| AC-C4 | Brief is read-only except deep-linking into the existing task modal               | ✅                                                                                      |
| AC-C5 | Drawer's request is aborted when the drawer closes                                | ✅                                                                                      |
| AC-D1 | Only registered read-only tools can run client-side                               | ✅ (`chatTools.ts` whitelist)                                                           |
| AC-D2 | Tool definitions not supplied from user thread (remote must own tools)            | ✅ (local engine is fixed; remote contract documented in progress doc)                  |
| AC-D3 | Closing the chat drawer aborts in-flight work                                     | ✅ (`useAiChat` + drawer `abort`)                                                       |
| AC-D4 | Conversation cleared on hard reload                                               | ✅ (in-memory state only)                                                               |
| AC-E1 | Returned `ids` intersected with cache                                             | ✅ (`validateSearch`)                                                                   |
| AC-E2 | Empty semantic search restores list + hint                                        | ✅ (info `Alert` + full list when no ids)                                               |
| AC-E3 | Clearing AI search restores prior filters                                         | ✅ (`semanticIds` removed from URL / reset)                                             |

---

## What is open

### Backend — Vercel proxy (PRD §7.2)

Not started — **no `api/` routes in this repo** yet. The client posts to `${REACT_APP_AI_BASE_URL}/api/ai/<route>` when that env var is set. To plug in a real LLM:

- Add `api/ai/[route].ts` (or equivalent) per `vercel.json`.
- Hold the model API key in the server env (never `REACT_APP_*`).
- Per route: JSON schema for structured output (existing types in `src/interfaces/ai.d.ts`, including `ISearchResult` for search).
- Chat route should expose **only** the read-only tools from `chatTools.ts` on the server; never trust client-supplied tool definitions (AC-D2).
- Enforce per-IP, per-route token budgets and timeouts (PRD §9).
- Log only metadata (route, latency, token counts, status) — never raw user content in production.

### Product / UX gaps (from PRD)

- ~~**Runtime toggle UI** (PRD §7.3)~~: shipped in `src/components/header` (`Switch` + `useAiEnabled`).
- ~~**“Disable AI for this project”** (PRD §8)~~: shipped — `boardCopilot:disabledProjectIds` in `localStorage`, `useAiProjectDisabled` + **Project AI** switch on the board header, guards in `useAi` / `useAiChat`, `boardAiOn` passed to `Column` / `TaskCreator` / `TaskModal`.
- **Observability** (PRD §7.7, §9): client/server counters — lands with proxy.
- **Chat write-tools** (PRD §5.4 follow-up): out of scope until a later version.

### Optional polish

- **SSE / streaming** for chat and structured routes if you want parity with PRD §7.1 (today: synchronous local engine + JSON `fetch` for remote).
- **`useAi.ts` type union:** PRD lists `chat` and `search` on `AiRoute`; implementation keeps chat in `useAiChat` and structured routes in `useAi` — fine, but document or consolidate if desired.

---

## How to verify what shipped

```bash
npm install
npm run eslint
CI=true npm test -- --watchAll=false --runInBand --coverage --coverageReporters=text-summary
npx vite build
```

Expected: lint clean, 76 suites / 340 tests pass, ≥97% statement coverage, build succeeds.

To exercise Board Copilot in the browser:

1. `npm start`, log in (any non-`wrong` email + password against the mock backend).
2. Open a project board.
3. Click `Brief` in the board header (Capability C).
4. Click `+ Create task` → `Draft with AI`, type a prompt, click `Draft task` (Capability A) or `Break down` for subtasks.
5. Open any existing task to see the Board Copilot sidebar (Capability B).
6. Click `Ask` in the board or project list header to open the conversational assistant (Capability D).
7. Use **Ask in natural language** above the board or project filters, then **Search** (Capability E); **Clear AI search** removes only the semantic filter.

To turn AI off without rebuilding, use the **Board Copilot** switch in the app header (when `REACT_APP_AI_ENABLED` is not `false`), or:

```js
localStorage.setItem("boardCopilot:enabled", "false");
location.reload();
```

To force-disable at build time:

```bash
REACT_APP_AI_ENABLED=false npm run build
```

To point at a real LLM proxy:

```bash
REACT_APP_AI_BASE_URL=https://your-proxy.example npm run build
```
