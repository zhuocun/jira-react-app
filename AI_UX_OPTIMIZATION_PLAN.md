# UI/UX Optimization Plan — Jira React App

Audit of the codebase against `AI_UX_BEST_PRACTICES.md`, organized by severity.
Each finding references the violated principle and affected file(s).

---

## Table of Contents

1. [Audit Methodology](#1-audit-methodology)
2. [Executive Summary](#2-executive-summary)
3. [Critical Issues (P0)](#3-critical-issues-p0)
4. [High-Priority Issues (P1)](#4-high-priority-issues-p1)
5. [Medium-Priority Issues (P2)](#5-medium-priority-issues-p2)
6. [Low-Priority / Polish (P3)](#6-low-priority--polish-p3)
7. [What the App Already Does Well](#7-what-the-app-already-does-well)
8. [Implementation Roadmap](#8-implementation-roadmap)

---

## 1. Audit Methodology

Every page, component, hook, and utility under `src/` was read and mapped
against the principles in `AI_UX_BEST_PRACTICES.md`, with particular focus on:

- **Microsoft HAX Toolkit** 18 guidelines (G1–G18)
- **Google PAIR** guidebook principles
- **Krux audit** 8 common AI UX failures
- **Smashing Magazine** agentic AI patterns (Intent Preview, Autonomy Dial,
  Explainable Rationale, Confidence Signal, Action Audit & Undo, Escalation
  Pathway)
- **NN/g** AI product design guidelines
- **Trust calibration** anti-patterns (uniform confidence, hidden sources,
  cosmetic verification, etc.)

Files examined: all of `src/pages/`, `src/components/`, `src/utils/`,
`src/routes/`, `src/store/`, `src/theme/`, `src/constants/`, `src/layouts/`,
plus `vite.config.ts` and `package.json`.

---

## 2. Executive Summary

### Strengths

The app has a mature foundation: centralized microcopy, AI tokens/theming,
accessibility landmarks, live regions, focus management, responsive breakpoints,
safe-area insets, dark/light mode, reduced motion, forced-colors, coarse-pointer
targets, View Transitions, and optimistic updates. AI features include: privacy
disclosure, per-project opt-out, autonomy levels, undo toasts, confidence bands,
citation chips, tool-call transparency, welcome banner, sample prompts, and
analytics tracking.

### Gap Areas

The gaps cluster around four themes:

1. **Silent failures** — Multiple mutation and query error paths produce no
   user-visible feedback, violating HAX G9 (support efficient correction) and
   the graceful degradation principle.
2. **Incomplete AI trust calibration** — Confidence indicators exist in utilities
   but are not consistently surfaced on all AI output surfaces; the chat drawer
   lacks confidence signals and the regenerate flow lacks version history.
3. **Performance / bundle** — No route-level code splitting, elevated Vite chunk
   warning limit, no QueryClient cache tuning, long filter debounce.
4. **Consistency gaps** — Hardcoded English strings alongside microcopy, mixed
   error handling patterns, uneven loading skeletons.

### Counts

| Priority | Issues |
|----------|--------|
| P0 — Critical | 4 |
| P1 — High | 7 |
| P2 — Medium | 9 |
| P3 — Low / Polish | 6 |
| **Total** | **26** |

---

## 3. Critical Issues (P0)

These directly cause user-visible data loss, silent failures, or broken trust.

---

### P0-1: Task update failures are invisible to the user

**Principle violated:** HAX G9 (support efficient correction), Krux #7 (missing
error states), graceful degradation.

**Files:** `src/components/taskModal/index.tsx`

**Current behavior:** `onOk` calls `update(merged).then(closeModal)` with no
`.catch()` and no error display. If the PUT fails, the modal stays open with no
error message. Users may re-click Save or assume it saved and close manually.

**Impact:** Silent failure destroys trust.

**Fix:**
- Add an `ErrorBox` component inside the modal (same pattern as `loginForm` and
  `registerForm`) that displays the mutation error.
- Wire the `useReactMutation` `onError` callback to set a local error state.
- Show a retry affordance inline and clear the error on successful save.
- Consider adding a toast notification on success to confirm the save completed
  (currently the modal just closes, giving no positive confirmation either).

---

### P0-2: Like mutation has no error handling — UI hangs in pending state

**Principle violated:** HAX G9, Krux #7, graceful degradation.

**Files:** `src/components/projectList/index.tsx`

**Current behavior:** `onLike` calls `update({ projectId }).then(...)` with no
`.catch()`. On failure, `pendingLikeId` is never cleared — the heart icon stays
in its inverted (pending) state indefinitely with no error message.

**Impact:** The like button appears stuck with no recovery path.

**Fix:**
- Add a `.catch()` that clears `pendingLikeId` and shows a brief
  `message.error()` toast.
- Consider using `useReactMutation`'s `onError` callback instead of raw
  `.then()` to get automatic rollback.

---

### P0-3: Network errors surface cryptic browser messages

**Principle violated:** Graceful degradation, Krux #7 (missing error states).

**Files:** `src/utils/hooks/useApi.ts`, `src/utils/authApis.ts`

**Current behavior:** When the network is down, `fetch()` rejects with a
`TypeError("Failed to fetch")`. React Query catches this for queries (and
surfaces it via `query.error`), and auth forms display it in their `ErrorBox`.
However, the error message shown to the user is the raw browser string
`"Failed to fetch"` — not a helpful, actionable message.

**Impact:** Users see a technical error string instead of guidance like "Check
your internet connection and try again." This erodes trust and leaves users
without a clear recovery path.

**Fix:**
- In `api()`, wrap the `fetch` call so that `TypeError` is converted into a
  user-friendly `Error("Unable to connect. Check your internet connection and
  try again.")`.
- Apply the same treatment in `authApis.ts` login/register functions.

---

### P0-4: Optimistic update rollbacks produce no user feedback

**Principle violated:** HAX G9 (support efficient correction), trust calibration
(invisible error anti-pattern).

**Files:** `src/utils/hooks/useReactMutation.ts`,
`src/utils/optimisticUpdate/*.ts`

**Current behavior:** When an optimistic mutation fails, `useReactMutation`
restores the previous cache state silently — no toast, no notification. The UI
reverts (e.g., a reordered column snaps back) with no explanation.

**Impact:** The "invisible error" anti-pattern. Users see the UI change and then
mysteriously revert with no indication of what happened.

**Fix:**
- Add a `message.error()` or `notification.error()` call in the
  `useReactMutation` `onError` path when a `callback` (optimistic updater)
  was supplied, so users always see a "Couldn't save — your changes were
  reverted" notice.
- For drag-and-drop reorders specifically, show a brief toast: "Couldn't
  reorder. The board has been restored."

---

## 4. High-Priority Issues (P1)

These degrade the experience noticeably but don't cause data loss.

---

### P1-1: No 404 / catch-all route

**Principle violated:** HAX G10 (scope services when in doubt / gracefully
degrade), error handling best practices.

**Files:** `src/routes/index.tsx`

**Current behavior:** No catch-all route. Navigating to `/settings`, `/foo`, or
any undefined path renders a blank page.

**Fix:**
- Add a catch-all route (`path: "*"`) that renders a `PageError` component with
  a "Page not found" message and a link back to `/projects`.
- Use the existing `EmptyState` component with a relevant illustration.

---

### P1-2: AI chat regenerate doesn't preserve versions (Regenerate Trap)

**Principle violated:** Krux #2 (destructive "Regenerate" button), trust
calibration.

**Files:** `src/components/aiChatDrawer/index.tsx`

**Current behavior:** `handleRegenerate` re-dispatches the previous user message,
appending a new assistant bubble below the original. The old version is preserved
in scroll history, but there is no visual grouping, no version indicator, and
no way to compare responses.

**Impact:** Users see two similar-looking responses with no indication which is
the regenerated one.

**Fix:**
- Add a visual indicator on regenerated responses: "Regenerated response" badge
  or a subtle divider with "↻ Regenerated" label.
- Consider collapsing the previous response with an "Show earlier version"
  toggle, or add a "Version 1 / Version 2" tab group.

---

### P1-3: Chat drawer loading uses generic spinner instead of content-shaped skeleton

**Principle violated:** Loading state best practices (never use bare spinners
for AI operations), Krux #1 (no feedback during AI processing).

**Files:** `src/components/aiChatDrawer/index.tsx` (lines 569–583)

**Current behavior:** While the AI is generating, the drawer shows a `<Spin>`
component with "Board Copilot is thinking…" text. The `streamingText` state
from `useAiChat` is shown next to the spinner, but it only contains tool-name
status labels (e.g., "Get tasks…") — not actual response content. The response
arrives all at once as a complete message bubble after the spinner disappears.

**Impact:** Users stare at a spinner during the 2-8 second AI response time. Per
the research, perceived wait drops by 55-70% with streaming, and users begin
trying to interact or leaving after 3-5 seconds of a spinner.

**Fix:**
- Replace the loading spinner with a chat-bubble-shaped skeleton (shimmer
  animation in the approximate shape of an assistant message bubble).
- If `streamingText` contains actual response content (not just a status label),
  render it progressively inside a message bubble as it arrives.
- Show staged progress: "Reading your board data…" → "Analyzing tasks…" →
  "Writing response…"

---

### P1-4: ProjectDetail page has no error state for failed project query

**Principle violated:** HAX G9, graceful degradation, Krux #7.

**Files:** `src/pages/projectDetail.tsx`

**Current behavior:** The query's `error` return is not destructured or used. If
the project fetch fails, the breadcrumb shows "Project" (fallback) and the body
renders `<Outlet />` with no error alert, no retry, and no failure indication.

**Fix:**
- Destructure `error` and `refetch` from the query.
- When `error` is truthy, render an `Alert` with retry (same pattern as
  `board.tsx` and `project.tsx`).
- Show a `PageError` component when the project is not found (404 from API).

---

### P1-5: No positive confirmation on destructive actions completing

**Principle violated:** Trust calibration (feedback loop closure), HAX G16
(convey consequences of user actions).

**Files:** `src/components/projectList/index.tsx`,
`src/components/taskModal/index.tsx`

**Current behavior:** After deleting via `Modal.confirm`, the item disappears
optimistically with no success toast. If the deletion fails, the item reappears
with no explanation.

**Fix:**
- Add `message.success("Project deleted")` and `message.success("Task deleted")`
  on successful mutation completion.
- If the deletion is optimistic, show the toast immediately with an undo option
  (leveraging the existing `useUndoToast` pattern used in AI flows).

---

### P1-6: QueryClient has no default configuration

**Principle violated:** Performance best practices, unnecessary re-fetches.

**Files:** `src/utils/appProviders.tsx`

**Current behavior:** `new QueryClient()` with no configuration. Defaults:
`staleTime: 0` (data stale on every mount), `retry: 3` (including non-idempotent
mutations). Every navigation back to `/projects` triggers a refetch even if data
was loaded seconds ago.

**Fix:**
- Set `staleTime: 30_000` (30s) as a global default so repeated mounts within
  30 seconds use cached data.
- Set `retry: 1` or configure retry only for queries (not mutations) to avoid
  retrying non-idempotent operations.
- Consider `refetchOnWindowFocus: false` for a calmer UX.

```tsx
const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: false,
        },
    },
}));
```

---

### P1-7: No feedback acknowledgment on AI chat thumbs up/down

**Principle violated:** Feedback loop closure (Google PAIR: "acknowledge that you
received feedback"), trust calibration.

**Files:** `src/components/aiChatDrawer/index.tsx`

**Current behavior:** Clicking 👍/👎 toggles `aria-pressed` and fires an
analytics event, but shows no visible acknowledgment. The
`microcopy.ai.feedbackThanks` string exists but is never rendered.

**Impact:** Users who provide feedback never see it was received.

**Fix:**
- Show a brief `message.success(microcopy.ai.feedbackThanks)` when feedback
  is submitted.
- Alternatively, render a brief inline acknowledgment below the rated message
  that fades after 2 seconds.

---

## 5. Medium-Priority Issues (P2)

---

### P2-1: No route-level code splitting

**Principle violated:** Performance best practices.

**Files:** `src/routes/index.tsx`

**Current behavior:** All page components are eagerly imported (comment defers
`React.lazy` citing test compatibility). Vite `chunkSizeWarningLimit` was raised
to 1600. The initial bundle includes all page and AI code even for the login
page.

**Fix:**
- Wrap page imports with `React.lazy()` and add `<Suspense>` boundaries at
  the route level with appropriate fallbacks (e.g., `PageSpin`).
- Update affected tests to handle asynchronous component loading (wrap renders
  in `Suspense` or use `waitFor`).
- Consider splitting the heavy AI components (chat drawer, task assist panel,
  brief drawer) into a separate chunk since they're conditionally rendered.

---

### P2-2: AI confidence indicators not shown on chat responses

**Principle violated:** Confidence signal pattern (Smashing Magazine), trust
calibration, HAX G2 (make clear how well the system can do what it can do).

**Files:** `src/components/aiChatDrawer/index.tsx`,
`src/utils/ai/confidenceBand.ts`

**Current behavior:** `confidenceBand` utility and `microcopy.ai.confidenceBands`
exist, and `AiTaskAssistPanel`/`AiSearchInput` use them. However, the chat
drawer — the primary AI surface — shows no confidence signal. All responses
appear with equal visual weight.

**Impact:** The "uniform confidence" anti-pattern on the most-used AI surface.

**Fix:**
- If the chat engine can provide confidence metadata, render a subtle confidence
  badge (High/Moderate/Low) on each assistant response.
- At minimum, add a static "AI-generated · verify before using" label on each
  assistant bubble (the `microcopy.a11y.aiBadge` string already exists).
- Show the "Board Copilot uses read-only data" disclosure more prominently.

---

### P2-3: 1000ms filter debounce feels sluggish

**Principle violated:** Responsiveness best practices (perceived latency).

**Files:** `src/pages/board.tsx` (line 325), `src/pages/project.tsx` (line 188)

**Current behavior:** Both pages use `useDebounce(param, 1000)` — a full
1-second debounce before any visual feedback. Client-side filtering of
already-loaded data also waits 1 second.

**Impact:** Users expect < 200ms visual feedback for keystrokes.

**Fix:**
- Separate the concerns: debounce the API request parameters but apply
  client-side filtering immediately on the raw `param`.
- Reduce the debounce to 300-500ms for the API-triggering params.
- Show a "Searching…" indicator during the debounce window.

---

### P2-4: Inconsistent hardcoded English vs. microcopy

**Principle violated:** Consistency (HAX G5, match relevant social norms),
maintainability.

**Files:** Widespread across components

**Examples of hardcoded strings that should be in `microcopy`:**
- `src/pages/project.tsx`: "Projects", "Browse the boards your team is
  shipping…", stat labels ("Total projects", "Organizations", "Team members")
- `src/pages/board.tsx`: "Board", "Swipe to see more columns", "Enable on this
  board", Copilot settings description text
- `src/components/taskModal/index.tsx`: "Edit task · {name}" construction,
  "Notes / acceptance criteria" placeholder
- `src/components/projectModal/index.tsx`: "Edit project" / "Create project"
  title, subtitle sentences
- `src/components/aiChatDrawer/index.tsx`: "Ask a question… (Shift+Enter for a
  new line)" placeholder, "Regenerate response", "Helpful answer", "Not helpful"
- `src/components/commandPalette/index.tsx`: "Command palette", "No matches",
  section headers
- `src/components/columnCreator/index.tsx`: "Create column name" placeholder
- `src/components/boardBriefDrawer/index.tsx`: "Board Copilot brief" title,
  section headings

**Impact:** Copy changes or future i18n require touching 15+ files individually.

**Fix:**
- Audit all user-facing strings and migrate them to `microcopy.ts`.
- Group new strings under logical namespaces (e.g., `microcopy.pages.projects`,
  `microcopy.board.settings`).
- This is a large but mechanical change that can be done incrementally.

---

### P2-5: AI chat drawer shows no "AI-generated" label on responses

**Principle violated:** Transparency (label AI-generated content explicitly),
IBM Carbon for AI guidelines, HAX G1.

**Files:** `src/components/aiChatDrawer/index.tsx`

**Current behavior:** The drawer title includes a purple "AI · review before
using" tag, but individual assistant messages have no per-message AI label.
Messages are differentiated only by alignment and background color.

**Fix:**
- Add a small "Board Copilot" or sparkle icon prefix on each assistant message
  bubble (similar to how ChatGPT shows the model name).
- This is especially important if the product ever adds human-in-the-loop
  escalation — users must always be able to distinguish AI from human responses.

---

### P2-6: Delete actions lack undo — only confirmation

**Principle violated:** Undo/redo best practices (Smashing Magazine: "The single
most powerful mechanism for building user confidence is the ability to easily
reverse an agent's action").

**Files:** `src/components/projectList/index.tsx`,
`src/components/taskModal/index.tsx`, `src/components/column/index.tsx`

**Current behavior:** All delete actions use `Modal.confirm` as the only
safeguard. No undo after confirmation.

**Impact:** Confirmation dialogs become reflexive clicks (modal blindness). The
real safety net is undo.

**Fix (incremental):**
- Phase 1: After deletion, show a 5-second undo toast (leveraging
  `useUndoToast` already in the codebase). Keep the deleted item in local
  state during the undo window; only fire the DELETE API call after the
  window expires.
- Phase 2: Add a soft-delete mechanism on the API side to enable true undo.
- Phase 3: Add an "Action History" panel that logs recent destructive actions
  with undo timestamps.

---

### P2-7: Auth token stored with no expiry or refresh mechanism

**Principle violated:** Security best practices, session management.

**Files:** `src/utils/authApis.ts`, `src/utils/hooks/useAuth.ts`

**Current behavior:** JWT stored in localStorage with no expiry check. If the
token expires server-side, API calls fail with 401s but the UI keeps showing
the authenticated layout until a hard refresh.

**Fix:**
- Decode the JWT expiry (`exp` claim) client-side and schedule a refresh or
  redirect before expiry.
- Add a response interceptor that catches 401s globally and redirects to login
  with a "Session expired" message.
- Consider using `httpOnly` cookies instead of localStorage for token storage
  (requires API changes).

---

### P2-8: No loading skeleton for the project list table

**Principle violated:** Loading state best practices (content-shaped skeletons).

**Files:** `src/components/projectList/index.tsx`, `src/pages/project.tsx`

**Current behavior:** Uses Ant Design Table's built-in `loading` prop — a generic
spinner overlay that doesn't match the table's layout.

**Fix:**
- Replace the `loading` prop with a custom skeleton that renders 3-5 placeholder
  rows with shimmer animations matching the column layout (avatar + text for
  Project, gray bar for Organization, pill for Manager, etc.).
- Ant Design Table supports `locale.emptyText` for empty state; use a similar
  approach with `loading` rendering skeleton rows.

---

### P2-9: Board empty column state gives no guidance when filters yield zero tasks

**Principle violated:** Empty state best practices, HAX G10 (scope services when
in doubt).

**Files:** `src/components/column/index.tsx`, `src/pages/board.tsx`

**Current behavior:** When filters yield zero tasks in a column, it renders empty
with no indication that tasks exist but are hidden. The screen-reader live
region announces the count, but sighted users get no guidance.

**Fix:**
- Show a subtle inline message in each empty-after-filtering column: "No tasks
  match the current filters" with a "Reset filters" link.
- Differentiate visually between "column is empty" (never had tasks) and
  "column has tasks but none match" (filtered out).

---

## 6. Low-Priority / Polish (P3)

---

### P3-1: No success toast on login

**Files:** `src/components/loginForm/index.tsx`

**Current behavior:** The register form shows `message.success("Registration
successful")` on success, but the login form silently navigates to `/projects`
with no success feedback.

**Fix:** Add `message.success("Welcome back!")` or similar on login success,
consistent with the register flow.

---

### P3-2: Sparkle icon used without text label on some surfaces

**Files:** `src/pages/board.tsx` (Brief and Ask buttons do have labels, but the
header Copilot toggle and AiSearchInput entry point use icon-only affordances
on narrow viewports)

**Current behavior:** The sparkle icon is used consistently, but NN/g research
shows 17% of users confuse it with "favorite." Some surfaces use the sparkle
with a text label, others are icon-only.

**Fix:** Ensure every sparkle-icon affordance has an adjacent text label or at
minimum a tooltip. Audit all `<AiSparkleIcon>` usages for label coverage.

---

### P3-3: Command palette shows "No matches" instead of loading indicator

**Files:** `src/components/commandPalette/index.tsx`

**Current behavior:** The palette reads from cached query data. If the cache is
cold (first visit, before queries complete), the palette shows "No matches"
which is misleading — there are matches, the data just hasn't loaded yet.

**Fix:** Check if underlying queries are still loading and show a skeleton or
"Loading…" indicator instead of "No matches" while data is pending.

---

### P3-4: `deleteProject.ts` naming inconsistency

**Files:** `src/utils/optimisticUpdate/deleteProject.ts`

**Current behavior:** The file is named `deleteProject.ts` but the component
that imports it (`projectList/index.tsx`) imports it as `deleteTaskCallback`,
creating confusion about what the function does.

**Fix:** Rename the export to `deleteProjectCallback` for clarity.

---

### P3-5: Missing `<title>` on projectDetail page

**Files:** `src/pages/projectDetail.tsx`

**Current behavior:** The `projectDetail` page does not call `useTitle()`. The
browser tab title stays as whatever the previous page set (likely "Projects" or
"Board" from the nested board page).

**Fix:** Add `useTitle(project?.projectName ?? "Project")` so the tab title
reflects the current project while on the detail shell.

---

### P3-6: AI draft modal sample prompts are static

**Files:** `src/components/aiTaskDraftModal/index.tsx`

**Current behavior:** The sample prompts ("Draft a bug fix task", "Plan a new
feature", "Create a research spike") are static strings that don't adapt to the
board's context.

**Impact:** Per NN/g, "prompt suggestions must be contextually relevant,
personalized, and specific both to the task and to the user's level of
experience."

**Fix:** Generate 1-2 contextual sample prompts based on the board's current
columns and task types (e.g., "Draft a bug for [most recent column name]" or
"Plan a follow-up to [latest task]"). Keep 1-2 static prompts as fallbacks.

---

## 7. What the App Already Does Well

Credit where it's due — these areas are strong and should be preserved:

| Area | Implementation | Best Practice Alignment |
|------|---------------|------------------------|
| **Privacy disclosure** | `CopilotPrivacyPopover` + `CopilotPrivacyDisclosure` explain exactly what data the AI sees | Google PAIR: communicate data usage transparently |
| **Per-project AI opt-out** | `useAiProjectDisabled` + settings toggle per board | HAX G17: provide global controls |
| **Autonomy levels** | `useAutonomyLevel` stores suggest/plan/auto preference | Smashing Magazine Autonomy Dial pattern |
| **Undo toasts for AI actions** | `useUndoToast` on story point and readiness suggestions | Smashing Magazine Action Audit & Undo |
| **Confidence bands utility** | `confidenceBand.ts` + microcopy labels (High/Moderate/Low) | Qualitative confidence indicators |
| **AI suggestion badges** | `AiSuggestedBadge` with rationale + revert | Transparency: label AI-generated content |
| **Citation chips** | `CitationChip` with source attribution | Perplexity-style trust ratchet |
| **Tool-call transparency** | Collapsed `<details>` showing what tools the AI used | HAX G11: make clear why the system did what it did |
| **Accessibility landmarks** | Skip links, live regions, ARIA labels, focus management | WCAG compliance |
| **Reduced motion** | `useReducedMotion` hook + CSS `prefers-reduced-motion` | Accessibility best practice |
| **Forced-colors support** | CSS rules for high-contrast mode | Accessibility best practice |
| **Touch targets** | 44px minimum on coarse pointers | WCAG 2.5.5 |
| **Safe-area insets** | All surfaces respect `env(safe-area-inset-*)` | Mobile UX best practice |
| **Dark mode** | Full theming with CSS variables + Ant Design algorithm | Modern UX expectation |
| **Sample prompts** | Chat drawer and draft modal show clickable examples | NN/g: show what the AI can do |
| **Centralized microcopy** | `constants/microcopy.ts` for actions, validation, AI strings | Consistency and future i18n |
| **Optimistic updates** | Dedicated callback files for reorder, create, delete | Perceived performance |
| **Analytics tracking** | `ANALYTICS_EVENTS` constants for Copilot metrics | Measurement infrastructure |
| **Welcome banner** | `CopilotWelcomeBanner` for first-visit onboarding | AI discoverability |
| **Error boundary** | Class component wrapping the app shell | Graceful degradation |
| **Destructive action safeguards** | Mobile footer reorders Save/Cancel/Delete to prevent mis-taps | Mobile UX best practice |
| **View Transitions** | Route transitions use the View Transitions API | Modern navigation UX |

---

## 8. Implementation Roadmap

### Batch 1: Silent Failure Fixes (P0-1 through P0-4)

**Components:** `taskModal`, `projectList`, `useApi`, `useReactMutation`

These four issues share a common root: error paths that produce no user-visible
feedback. They can be addressed together because the patterns are identical:
add error state display or toast notifications where mutations currently fail
silently.

**Changes:**
- `useApi.ts`: Wrap `fetch()` in `try/catch` for network errors
- `useReactMutation.ts`: Add optional toast on optimistic rollback
- `taskModal/index.tsx`: Add `ErrorBox` for mutation errors
- `projectList/index.tsx`: Add `.catch()` on like mutation

**Testing:** Existing test suites + new tests for error scenarios.
**Risk:** Low — additive changes with no architectural impact.

---

### Batch 2: Core UX Improvements (P1-1, P1-4, P1-5, P1-6)

**Components:** Routes, `projectDetail`, `projectList`/`taskModal`, `appProviders`

**Changes:**
- Add catch-all 404 route
- Add error state to `projectDetail` page
- Add success toasts on delete completion
- Configure `QueryClient` defaults

**Testing:** Route tests, query behavior tests.
**Risk:** Low to medium — QueryClient changes affect caching behavior globally
and should be validated across all pages.

---

### Batch 3: AI Trust Calibration (P1-2, P1-3, P1-7, P2-2, P2-5)

**Components:** `aiChatDrawer`, `aiTaskAssistPanel`

**Changes:**
- Regenerate version indicator
- Chat skeleton loading / streaming improvements
- Feedback acknowledgment toast
- Confidence badge on chat responses
- AI-generated label on assistant messages

**Testing:** Chat drawer tests, visual regression.
**Risk:** Medium — changes to the chat rendering pipeline may affect existing
AI flow tests.

---

### Batch 4: Performance (P2-1, P2-3)

**Components:** Routes, debounce hooks

**Changes:**
- Implement `React.lazy` + `Suspense` for route-level code splitting
- Split client-side filtering from API debounce; reduce debounce to 300ms

**Testing:** All page-mount tests need `Suspense` wrappers.
**Risk:** Medium — the route comment explicitly warns about test compatibility.
Needs a dedicated pass through the test suite.

---

### Batch 5: Consistency and Polish (P2-4 through P2-9, P3-*)

**Components:** All pages and components (microcopy migration), column empty
states, auth token handling, project list skeleton, command palette loading

**Changes:**
- Migrate hardcoded strings to `microcopy.ts`
- Add filtered-empty column indicator
- Implement token expiry checking
- Table loading skeleton
- Command palette loading state
- Remaining P3 items

**Testing:** Microcopy migration is mechanical but touches many files.
**Risk:** Low individually but high total surface area.

---

## Appendix: Mapping to AI_UX_BEST_PRACTICES.md Sections

| Best Practice Section | Status in This App |
|-----------------------|--------------------|
| 2.1 Transparency and Explainability | Partially implemented: citations, tool transparency, privacy disclosure ✅; missing confidence on chat, AI labels on responses ⚠️ |
| 2.2 User Control and Autonomy | Strong: autonomy dial, per-project opt-out, privacy controls ✅; missing undo on deletes ⚠️ |
| 2.3 Trust Calibration | Partial: confidence bands utility exists ✅; not surfaced on primary AI surface ⚠️; feedback loop not closed ⚠️ |
| 2.4 Loading States and Latency | Good: board skeleton, breadcrumb skeleton, stat placeholders ✅; chat uses spinner ⚠️; table uses spinner ⚠️ |
| 2.5 Error Handling and Graceful Degradation | Mixed: page-level alerts with retry ✅; multiple mutation paths have no error display ❌ |
| 2.6 Onboarding and Discoverability | Good: welcome banner, sample prompts, command palette ✅ |
| 2.7 AI Interaction Patterns | Good: chat drawer, inline search, command palette AI mode, task assist panel ✅ |
| 2.8 Feedback Mechanisms | Partial: thumbs up/down exists ✅; no acknowledgment shown ⚠️ |
| 2.9 AI Content and Output Design | Good: structured tool details, citation chips ✅ |
| 2.10 Accessibility and Inclusivity | Strong: landmarks, live regions, focus management, touch targets, reduced motion, forced colors ✅ |
| 2.11 Privacy and Ethical UX | Strong: privacy disclosure, per-project control, clear data scope ✅ |
| 3.1 Common AI UX Failures (Krux 8) | #1 (no loading feedback): partially ⚠️; #2 (Regenerate trap): partially ⚠️; #7 (missing error states): multiple instances ❌; others: handled ✅ |
| 3.2 Trust Anti-Patterns | Uniform confidence on chat ⚠️; invisible errors on mutations ❌ |
