# Board Copilot — implementation progress

Companion to [`docs/prd/board-copilot.md`](board-copilot.md). Tracks what has shipped to `main`, what is still open, and the concrete file/test inventory so a new contributor can pick up cleanly.

| Field | Value |
| --- | --- |
| Status | Phase 0–2B shipped on `main` (PR #1) |
| Last updated | 2026-04-29 |
| Owner | TBD (frontend) |

---

## At a glance

| Phase | Capability | PRD section | Status |
| --- | --- | --- | --- |
| Phase 0 | Plumbing (env, hook, validators, runtime toggle) | §7, §3.5 | ✅ Shipped |
| Phase 1 | Capability C — Board summary brief | §5.3 | ✅ Shipped |
| Phase 2A | Capability A — Smart task drafting | §5.1 | ✅ Shipped |
| Phase 2B | Capability B — AI estimation + readiness | §5.2 | ✅ Shipped |
| Phase 3 | Capability D — Conversational assistant | §5.4 | ⏳ Not started |
| Phase 4 | Capability E — Semantic search | §5.5 | ⏳ Not started |
| Backend | Vercel `api/ai/[route].ts` proxy with provider abstraction | §7.2 | ⏳ Not started (FE works against the deterministic local engine in the meantime) |

---

## What shipped (PR #1, merged)

### Phase 0 — Plumbing

- **Env flags** (`src/constants/env.ts`): `aiEnabled`, `aiBaseUrl`, `aiUseLocalEngine`. Defaults to enabled with the local engine; `REACT_APP_AI_ENABLED=false` hides every AI surface; `REACT_APP_AI_BASE_URL=…` switches to the remote proxy.
- **Runtime toggle** (`src/utils/hooks/useAiEnabled.ts`): persisted to `localStorage` under `boardCopilot:enabled`, with cross-component live updates via a custom `boardCopilot:toggled` event.
- **Single AI hook** (`src/utils/hooks/useAi.ts`): exposes `run`, `abort`, `reset`, `data`, `error`, `isLoading`. Owns the `AbortController` lifecycle, switches transparently between the local engine and the remote proxy, and validates every response before resolving.
- **Local AI engine** (`src/utils/ai/engine.ts`): deterministic `draftTask`, `breakdownTask`, `estimate`, `readiness`, `boardBrief`. Lets the FE work end-to-end with no backend.
- **Validators** (`src/utils/ai/validate.ts`): cross-checks every model-supplied id (`columnId`, `coordinatorId`, similar `taskId`s) against the cached context, drops or replaces unknown ids, and clamps story points to `1/2/3/5/8/13`.
- **Pure helpers** (`src/utils/ai/keywords.ts`, `src/utils/ai/storyPoints.ts`): tokenisation, Jaccard similarity, Fibonacci snapping.
- **Typed contracts** (`src/interfaces/ai.d.ts`): `IDraftTaskSuggestion`, `ITaskBreakdownSuggestion`, `IEstimateSuggestion`, `IReadinessReport`, `IBoardBrief` — these are the shapes the future remote proxy must return per route.

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

### Shared

- `src/components/aiSparkleIcon/index.tsx` — single shared "AI" affordance used wherever AI initiates an action.
- `README.md` — Board Copilot section: backends, env vars, safety, link to the PRD.

### Test coverage

- 70 suites, 306 tests (was 59/232 before this work).
- Coverage on the runtime AI scope: **97% statements / 92.37% branches / 97% functions / 97.84% lines**.
- New test files:
    - `src/utils/ai/{engine,keywords,storyPoints,validate}.test.ts`
    - `src/utils/hooks/{useAi,useAi.remote,useAiEnabled,useAiEnabled.disabled}.test.tsx`
    - `src/components/{aiTaskDraftModal,aiTaskAssistPanel,boardBriefDrawer}/index.test.tsx`
    - Extended: `src/components/{taskCreator,taskModal}/index.test.tsx`, `src/constants/env.test.ts`

### Acceptance-criteria status (against the PRD)

| ID | Acceptance criterion | Status |
| --- | --- | --- |
| AC-A1 | With AI off, `TaskCreator` is unchanged | ✅ |
| AC-A2 | Draft button opens the modal with a streaming partial form | ✅ (local engine resolves synchronously; UX scaffold in place for real streaming) |
| AC-A3 | Submitted task is indistinguishable from a manually created one in the cache | ✅ (uses the existing `newTaskCallback`) |
| AC-A4 | Unknown `columnId` is rejected and replaced with the opener column | ✅ (`validateDraft`) |
| AC-A5 | Unknown `coordinatorId` is rejected and replaced with the current user | ✅ |
| AC-A6 | Escape / unmount aborts the in-flight request | ✅ (`AbortController` in `useAi`) |
| AC-A7 | Breakdown posts each subtask via `useReactMutation` with the optimistic callback | ✅ |
| AC-B1 | With AI off, the task modal is unchanged | ✅ |
| AC-B2 | Opening a task triggers exactly one estimation; further estimations are debounced | ✅ (1000 ms via existing `useDebounce`) |
| AC-B3 | Suggested `storyPoints` is always in `{1,2,3,5,8,13}` | ✅ (`clampToFibonacci`) |
| AC-B4 | Each `similar[]._id` is present in the project's `tasks` cache | ✅ (`validateEstimate`) |
| AC-B5 | `Apply suggestion` does not submit the form | ✅ (only calls `form.setFieldsValue`) |
| AC-B6 | Closing the modal mid-request aborts the request | ✅ |
| AC-C1 | With AI off, no Brief button is rendered | ✅ |
| AC-C2 | Brief opens immediately and renders within ≤2s for ≤200 tasks | ✅ (local engine is synchronous; remote-path SLO will be measured once the proxy ships) |
| AC-C3 | All `taskId` and `memberId` references in the brief exist in the cache | ✅ (`validateBoardBrief`) |
| AC-C4 | Brief is read-only except deep-linking into the existing task modal | ✅ |
| AC-C5 | Drawer's request is aborted when the drawer closes | ✅ |

---

## What is open

### Phase 3 — Capability D: Conversational assistant (PRD §5.4)

Not started. Requires:

- A new `src/components/aiChatDrawer/` with streaming message UI.
- Tool definitions wrapping the existing `useApi` endpoints (`listProjects`, `listMembers`, `getProject`, `listBoard`, `listTasks`, `getTask`).
- A new `chat` route in `useAi` and on the proxy.
- Read-only enforcement on the proxy side (no write tools in Phase 3).

### Phase 4 — Capability E: Semantic search (PRD §5.5)

Not started. Smallest standalone slice:

- `src/components/aiSearchInput/` mounted inside `taskSearchPanel` and `projectSearchPanel`.
- A new `search` route in `useAi`.
- Result `ids` intersected with the cache before narrowing the existing filter state.

### Backend — Vercel proxy (PRD §7.2)

Not started. The FE already routes to `${REACT_APP_AI_BASE_URL}/api/ai/<route>` when that env var is set. To plug in a real LLM:

- Add `api/ai/[route].ts` (Vercel function) per `vercel.json`.
- Hold the model API key in the Vercel env (never `REACT_APP_*`).
- Per route, define the JSON schema for structured output (mirrors `src/interfaces/ai.d.ts`).
- Wrap user input in a server-defined system prompt to mitigate prompt injection.
- Enforce per-IP, per-route token budgets and timeouts (PRD §9).
- Log only metadata (route, latency, token counts, status) — never raw user content in production.

The FE contract is stable: each route returns the JSON shape declared in `src/interfaces/ai.d.ts`. The hook will validate it before any UI sees it.

### Other PRD items not yet implemented

- A user-facing settings entry for the runtime toggle (PRD §7.3, Phase 1.5). The toggle hook and storage key already exist; only the UI surface is missing. Suggested location: the user dropdown in `src/components/header/index.tsx`.
- "Disable AI for this project" per-project setting (PRD §8). Requires new state somewhere (likely `localStorage` keyed by `projectId`) and a guard in `useAiEnabled` or in each AI surface.
- Server-side observability counters and SLO measurements (PRD §7.7, §9). Lands with the Vercel proxy.
- Phase 3 chat write-tools follow-up (PRD §5.4 follow-up, OQ6). Out of scope until v3.

---

## How to verify what shipped

```bash
npm install
npm run eslint
CI=true npm test -- --watchAll=false --runInBand --coverage --coverageReporters=text-summary
npx vite build
```

Expected: lint clean, 70 suites / 306 tests pass, ≥97% statement coverage, build succeeds.

To exercise Board Copilot in the browser:

1. `npm start`, log in (any non-`wrong` email + password against the mock backend).
2. Open a project board.
3. Click `Brief` in the board header (Capability C).
4. Click `+ Create task` → `Draft with AI`, type a prompt, click `Draft task` (Capability A) or `Break down` for subtasks.
5. Open any existing task to see the Board Copilot sidebar (Capability B).

To turn AI off without rebuilding:

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
