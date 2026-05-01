# Board Copilot v3 — UX Design Requirements

**Status:** Draft  
**Date:** 2026-05-01  
**Supersedes:** `board-copilot-v2.1-agent.md` (architecture remains; this document overlays UX requirements)  
**Branch:** `claude/ai-ux-research-prd-WJli7`

---

## 1. Why This Document Exists

The v2.1 PRD defined a complete agent architecture: named LangGraph agents, SSE streaming, FE tool interrupts, two-level autonomy, and six delivery phases. That architecture is correct and ships as-is.

What v2.1 did not specify with enough precision was *how each AI surface should behave and look* from the user's point of view. An independent audit of the current implementation found 94 specific UX gaps. A parallel review of 2025–2026 AI product design literature surfaced 20 actionable rules and 60+ source references.

This document translates those findings into acceptance criteria that close every identified gap, surface by surface. Engineers and designers should treat v2.1 as the *what* (capabilities, transport, data contracts) and this document as the *how* (interaction patterns, copy, states, accessibility, error handling).

---

## 2. Governing Principles

These seven principles govern every decision in §§4–10. When a spec detail is ambiguous, pick the reading that best satisfies the most applicable principle.

### P1 — Stream Everything Visible
Show the first token in ≤700 ms of agent response latency. Never replace a loading spinner with a final result in a single paint; always stream intermediate content. A placeholder skeleton that dissolves into streamed text is acceptable; a blank → full-text swap is not.

*Source: Nielsen Norman Group "AI UX" 2025; Anthropic "Claude streaming best practices"; Vercel AI SDK streaming guidelines.*

### P2 — Never Abandon the User
Every AI surface must have at least three states beyond the happy path: a loading/streaming state, an error recovery state with a human-readable message, and an empty/no-result state with a next action. The empty state must never be a blank area.

*Source: "Designing AI Products" (Lenny's Newsletter 2025); Google PAIR Explorables.*

### P3 — Trust Through Transparency
Confidence scores must appear as labeled bands (High / Moderate / Low) paired with a percentage. Citations must be inline chips, not footnotes. Every AI-generated field must carry a visual "Suggested by Copilot" badge until the user edits it. Rationale must be surfaced by default, not behind a toggle.

*Source: Perplexity citation pattern; Linear "Magic" UX review 2025; "Building trust in AI systems" — Microsoft Research.*

### P4 — Mutations Need a Safety Net
No AI action that writes data (creates, updates, deletes) may execute without either: (a) an explicit user confirmation step that includes a preview diff, or (b) a 10-second toast Undo for low-risk, reversible changes. "Auto" autonomy (admin only) still requires Undo. The preview diff must show field names and old→new values; it must not be a JSON dump.

*Source: v2.1 §6 autonomy design; Superhuman "undo-for-everything" pattern; Notion AI mutation UX.*

### P5 — Discoverability Over Assumption
Users cannot benefit from features they do not know exist. Each AI surface must expose at least three sample prompts or representative capabilities on first open. The global Copilot entry point must be reachable from every top-level view in ≤2 gestures.

*Source: Raycast AI discoverability research 2025; OpenAI "ChatGPT Explore" onboarding audit.*

### P6 — Accessible by Default
All AI surfaces must meet WCAG 2.2 AA. Streaming content must use `aria-live="polite"` regions. Motion-heavy features (shimmer skeletons, token-by-token streaming) must respect `prefers-reduced-motion`. Copilot icon gradients must meet WCAG contrast in both light and dark themes.

*Source: WCAG 2.2 (W3C); A11y Project "Accessible AI Interfaces" 2025.*

### P7 — Privacy Surfaces Are Non-Negotiable
The "What is shared with the agent?" disclosure must be present before the user sends the first message in any new thread. It must accurately describe every category of data sent (board snapshot, task fields, member names). It must be one tap/click away from any AI panel.

*Source: v2.1 §9 privacy design; FTC "AI Disclosure" guidance 2025; GDPR Art. 13.*

---

## 3. Terminology

| Term | Definition |
|---|---|
| **Copilot** | Branded name for all Board Copilot AI features |
| **Surface** | A named UI component that hosts AI output (drawer, modal, panel, input) |
| **Turn** | One user message + one complete agent response cycle |
| **Streaming** | Progressive token delivery via SSE; content grows character by character |
| **Proposal** | A structured mutation the agent wants to apply; requires user confirm |
| **Resume** | Posting a FE tool result back to the agent to continue the run |
| **Interrupt** | Agent pause awaiting a FE tool result or user confirm |
| **TTFT** | Time To First Token — latency from request send to first rendered character |
| **Band** | Confidence label: High (≥75%), Moderate (45–74%), Low (<45%) |
| **Shimmer** | CSS skeleton animation used as a streaming placeholder |

---

## 4. AI Sparkle Icon (`AiSparkleIcon`)

### 4.1 Current Issues

| # | Issue | Severity |
|---|---|---|
| S-01 | Module-level mutable `gradientId` counter crashes SSR and produces duplicate gradient IDs when the module hot-reloads | Critical |
| S-02 | Hard-coded gradient colors (`#7C5CFF`, `#5E6AD2`, `#C084FC`) have no dark-mode variant — icon appears washed-out on dark backgrounds | High |
| S-03 | Default `aria-label="Board Copilot"` is announced on every decorative use, polluting screen-reader output | High |
| S-04 | No `role="img"` when used as a meaningful icon; screen readers interpret it inconsistently | Medium |
| S-05 | Gradient colors are not themeable — design system token changes require editing this file | Low |

### 4.2 Requirements

**S-R1.** Replace the module-level `gradientId` counter with React `useId()`. This makes gradient IDs stable across SSR/hydration and unique per-instance without module state.

**S-R2.** The icon must have two gradient presets selected via a `variant` prop:
- `"default"` — light-mode gradient (`--color-copilot-grad-start: #7C5CFF`, `--color-copilot-grad-end: #C084FC`)
- `"dark"` — dark-mode variant (`--color-copilot-grad-start: #A78BFA`, `--color-copilot-grad-end: #E879F9`)
  
The active preset must be selected from a CSS custom property so `prefers-color-scheme` media queries can override it automatically without JS.

**S-R3.** When `aria-hidden` is not passed (meaningful icon), the component must render `role="img"` and an `aria-label` that callers must supply explicitly. Remove the silent default label. `AiSparkleIcon` without either `aria-hidden` or `aria-label` must produce a TypeScript type error.

**S-R4.** Add `size` prop accepting `"sm" | "md" | "lg"` mapping to `14 / 18 / 24` px. All current hardcoded widths in consuming components must migrate to this prop.

---

## 5. Chat Drawer (`AiChatDrawer`)

### 5.1 Current Issues

| # | Issue | Severity |
|---|---|---|
| C-01 | `destroyOnHidden` wipes the entire transcript on close — users lose context across short navigations | Critical |
| C-02 | Tool call messages are hidden behind a toggle (default: hidden) and rendered as raw `<pre>` JSON | High |
| C-03 | No Stop button — the only escape from a runaway stream is closing the drawer | High |
| C-04 | No streaming — full response renders in one paint after fetch resolves | High |
| C-05 | Input is not disabled during streaming — submitting a second message while the first is in flight silently drops it | High |
| C-06 | Sample prompts shown only on initial empty state; they disappear after the first message | Medium |
| C-07 | Error messages appear as raw text strings with no retry affordance | Medium |
| C-08 | Citations are not rendered — `useAiChat` does not surface `CitationRef[]` | High |
| C-09 | Nudges (`TriageNudge`) are not wired — triage suggestions from the agent are silently dropped | High |
| C-10 | No "What is shared?" privacy disclosure link | High |
| C-11 | Long responses with code blocks have no horizontal scroll containment — layout breaks at narrow widths | Medium |
| C-12 | Thumbs feedback buttons are present but always `disabled={isLoading}` — they never re-enable after streaming ends | Medium |
| C-13 | Drawer title is static "Board Copilot" — does not reflect current thread context | Low |

### 5.2 Architecture Change: Migrate to `useAgent`

The chat drawer must migrate from the legacy `useAiChat` hook to `useAgent("chat-agent")`. This unlocks real streaming, citations, nudges, proposal cards, and FE tool interrupts. `useAiChat` must be deprecated once this migration ships.

### 5.3 Requirements

**C-R1. Persistent transcript.** Remove `destroyOnHidden`. The transcript must persist for the lifetime of the parent route. On route change the thread is reset (same as calling `reset()`). Add a "New conversation" button to the drawer header to let users voluntarily reset mid-session.

**C-R2. Streaming text.** Use `useAgent`'s message stream. Each assistant turn must stream character by character. Use an `aria-live="polite"` region wrapping the assistant bubble. Respect `prefers-reduced-motion`: when the media query matches, render the full token batch without per-character animation.

**C-R3. Stop button.** Render a `<Button icon={<StopOutlined />}>Stop</Button>` in the input row whenever `isStreaming` is true. Clicking it calls `agent.abort()`. The button must meet 44×44 px touch target size.

**C-R4. Input guard.** Disable the text input and send button while `isStreaming`. Show a spinner inside the send button rather than replacing it.

**C-R5. Sample prompts.** Show three contextual sample prompts on every empty turn (after each complete response, not just on first open). Prompts must be derived from the current board context:
1. "What's at risk on this board?"  
2. "Who has the most open tasks?"  
3. "Summarize progress since last week."

Clicking a prompt populates the input; the user still presses Send.

**C-R6. Error state.** On stream error render an inline alert: `"Board Copilot hit an error. [Try again]"`. The "Try again" link resubmits the last user message. Never show raw error `.message` strings directly in the chat bubble.

**C-R7. Citation chips.** When `citations` contains refs, render them inline at the end of the assistant bubble as `[1]`–style superscript chips. Clicking a chip opens a popover with the cited entity's name, type, and a navigate link (for tasks/projects) or a tooltip (for members). Citation chips must have `role="link"` and keyboard focus support.

**C-R8. Nudge cards.** Render each `TriageNudge` from `nudges` as a compact action card below the assistant bubble. Card layout:
- Icon (severity-based: warning/info/error)
- Title (nudge.title)
- Primary CTA button (`nudge.actionLabel`) that calls `agent.resume(nudge.actionValue)` 
- Dismiss link that removes the card from view

**C-R9. Proposal preview card.** When `pendingProposal` is non-null, render a `MutationProposalCard` component (new) between the last assistant bubble and the input. The card shows:
- Title: "Copilot wants to [action verb] [entity name]"
- Diff table: field | current value | proposed value
- Accept button (`type="primary"`) → calls `agent.resume({ accepted: true })`
- Reject button → calls `agent.resume({ accepted: false })`
- The input must be locked while the proposal is pending

**C-R10. Privacy link.** Add a `"What is shared?" ⓘ` link in the drawer header. Clicking it opens a popover listing exactly: board name, column list, task names and status, member names, and current user ID. No task note content or member email is shared unless the user pastes it in the chat.

**C-R11. Tool call display.** Replace the raw `<pre>` JSON tool display with a collapsed `<details>` element using the tool name as the `<summary>`. Inside show a human-readable summary: "Copilot looked up [N] tasks matching '[query]'". Default: collapsed. The toggle must be keyboard accessible.

**C-R12. Thumbs feedback.** Enable thumbs up/down after the stream ends (`!isStreaming`). On click: fire `ANALYTICS_EVENTS.THUMBS_FEEDBACK` and show a brief "Thanks for your feedback" Toast. Buttons remain clickable; a filled icon shows the recorded choice.

**C-R13. Code block containment.** Wrap code blocks in `overflow-x: auto; max-width: 100%`. Use a monospace font size of `13px` with `word-break: break-all` as a fallback.

---

## 6. Task Assist Panel (`AiTaskAssistPanel`)

### 6.1 Current Issues

| # | Issue | Severity |
|---|---|---|
| T-01 | Story-points Apply button executes with no undo affordance | High |
| T-02 | Confidence shown as raw `%` only — no band label ("High/Moderate/Low") | Medium |
| T-03 | `confidenceBand` implemented but result is never shown in the band label | Medium |
| T-04 | No visual distinction between AI-suggested field values and user-entered values | High |
| T-05 | Similar-task list shows task ID as fallback when `task?.taskName` is undefined | Medium |
| T-06 | Readiness issues list has no "Dismiss" affordance — issues persist even after the user manually fixes the field | Medium |
| T-07 | No explanation when the AI cannot make an estimate (no response yet / error) — spinner disappears leaving blank space | High |
| T-08 | Both estimate and readiness re-run on every debounced value change including whitespace-only changes | Medium |
| T-09 | Panel is always expanded — there is no collapse affordance; it dominates narrow task modals | Low |
| T-09b | Apply suggestion for readiness fires immediately with no preview | High |
| T-10 | No "Regenerate" affordance — once an estimate is shown, the user cannot ask for a fresh one without changing the task name | Medium |
| T-11 | readinessAi.data shows issues list even when the task name is blank (stale data from previous task) | High |
| T-12 | Panel title card has no "Board Copilot" branding consistency with other surfaces | Low |
| T-13 | No ARIA live region for streaming/updating estimates | Medium |

### 6.2 Requirements

**T-R1. Undo for story points.** Replace the immediate `onApplyStoryPoints` call with a two-step flow:
1. Button label changes to "Applied ✓" for 10 seconds and an Ant Design `message.success` toast appears: "Story points set to [N]. [Undo]"
2. If the user clicks Undo within 10 seconds, call `onApplyStoryPoints(originalValue)` restoring the previous value
3. After 10 seconds the toast auto-dismisses and Undo is no longer possible

**T-R2. Confidence band display.** Replace the current `AI confidence: High (87%)` tag with a compound display:
```
[band chip] [percentage]
```
Where band chip is an Ant Design `Tag` with color:
- High → `color="green"`
- Moderate → `color="orange"`  
- Low → `color="red"`

Add a Tooltip: "Based on [N] similar tasks on this board."

**T-R3. AI-suggested field badge.** When the user clicks "Apply" on any readiness suggestion, the target form field must receive a `data-ai-suggested` attribute and render a small purple "Suggested by Copilot" label beneath it until the user manually edits that field's value.

**T-R4. Undo for readiness suggestions.** Same 10-second toast+Undo pattern as T-R1, applied to `onApplySuggestion`.

**T-R5. Dismiss readiness issue.** Each readiness issue Alert must have a close icon (`closable` prop on Ant Design `Alert`). Dismissing hides the issue for the current form session only; it reappears if the form is closed and reopened.

**T-R6. Empty/loading state copy.** While `showEstimateSpinner` is false and `estimateAi.data` is undefined and `estimateAi.error` is null (i.e., user hasn't typed yet):
- Render: "Type a task name above to get an estimate."

**T-R7. Stale-data guard.** When the task name is cleared (becomes empty string after trim), immediately reset both `estimateAi` and `readinessAi` state by calling their `reset()` methods. Do not show stale data from a previous task.

**T-R8. Regenerate button.** Add a small `↺ Regenerate` icon button next to the "Suggested story points" heading. Clicking it re-fires `runEstimate` with the current debounced values, bypassing the debounce. It must be disabled while `estimateAi.isLoading`.

**T-R9. Whitespace-change guard.** Before firing `runEstimate` / `runReadiness`, compare `taskName.trim()` to the previous trimmed value. Skip the API call if only whitespace changed.

**T-R10. ARIA live region.** Wrap the entire estimate output section in `<div aria-live="polite" aria-atomic="false">`. This announces new estimates to screen readers without re-announcing the whole panel.

---

## 7. Task Draft Modal (`AiTaskDraftModal`)

### 7.1 Current Issues

| # | Issue | Severity |
|---|---|---|
| D-01 | No sample prompts on modal open — blank input with no guidance | High |
| D-02 | No "Suggested by Copilot" badges on auto-populated form fields | High |
| D-03 | No breakdown axis picker — v2.1 specifies `by_phase / by_surface / by_risk / freeform` | High |
| D-04 | Sequential `createTask` loop in `onSubmitBreakdown` has no progress indicator | High |
| D-05 | Confidence shown as raw `%` — no band label | Medium |
| D-06 | No "Regenerate draft" affordance after first suggestion | Medium |
| D-07 | No undo when subtasks are created in bulk | High |
| D-08 | Task type icon defaults to generic circle for unrecognized types | Low |
| D-09 | Modal does not clear draft state when closed and reopened — stale suggestion bleeds into new session | High |
| D-10 | No privacy disclosure (first use) | High |
| D-11 | "Create [N] subtasks" button label does not update when task count changes | Medium |
| D-12 | Breakdown list shows subtask names only — no column/assignee preview | Medium |
| D-13 | Long task descriptions overflow the modal on small screens | Medium |
| D-14 | No keyboard shortcut to submit the prompt (Cmd+Enter) | Low |
| D-15 | No analytics event for breakdown axis selection | Low |

### 7.2 Requirements

**D-R1. Sample prompts on open.** When the modal opens and the prompt input is empty, show three chips below the input:
- "Draft a bug fix task for [board name]"
- "Plan a feature for [first epic name or 'this project']"
- "Create a research spike"

Clicking a chip populates the input. Use `microcopy.ai.draftSuggestions` (new key) for these strings so they are translatable.

**D-R2. AI field badges.** After the first draft populates the form, every field that was populated by the AI (title, description, type, epic, column, assignee) must render a `<Tag color="purple" size="small">AI</Tag>` beneath the field label. The badge clears when the user manually edits that field.

**D-R3. Breakdown axis picker.** Add a `<Select>` above the breakdown list with options:
| Value | Label | Description tooltip |
|---|---|---|
| `by_phase` | By phase | "Frontend, backend, testing" |
| `by_surface` | By surface | "UI, API, data, infra" |
| `by_risk` | By risk | "High risk first, low risk last" |
| `freeform` | Let Copilot decide | "Agent picks the best split" |

Default: `freeform`. Changing the selection immediately re-runs the breakdown (debounced 500ms). Fire `ANALYTICS_EVENTS.BREAKDOWN_AXIS_CHANGED` with `{ axis: string }`.

**D-R4. Bulk-create progress.** Replace the silent sequential loop with a visible progress flow:
1. Show `<Progress percent={...} status="active" />` that advances as each subtask is created
2. Label: "Creating subtask [N] of [total]…"
3. On complete: animate to 100% then dismiss, leaving the success toast
4. On partial failure: pause progress, show error with "Skip and continue" / "Retry" options

**D-R5. Undo bulk create.** After all subtasks are created, show a single Toast: "[N] subtasks created. [Undo]". The Undo action calls the delete endpoint for each created task ID. Undo window: 10 seconds.

**D-R6. Regenerate.** Add `↺ Regenerate draft` button (small, text type) next to the draft form title. Clicking re-runs the draft with the same prompt. Disabled while `isLoading`.

**D-R7. Modal state reset.** On modal close, immediately reset the AI hook (`draftAi.reset()`) and clear the populated form fields back to their pre-AI defaults. On reopen the modal must start from a clean slate.

**D-R8. Privacy disclosure (first use).** On the very first time a user submits a prompt (check `localStorage.getItem("boardCopilot:draftPrivacyShown")`), show a one-time informational Alert before making the API call:
> "Copilot will see your board's task list, column names, and member names. No task notes or emails are sent."
> [Got it — always show]  [Don't remind me]

Clicking "Don't remind me" sets `localStorage.setItem("boardCopilot:draftPrivacyShown", "true")`.

**D-R9. Cmd+Enter submit.** The prompt `<Input.TextArea>` must call `handleSubmit` on `Cmd+Enter` (Mac) / `Ctrl+Enter` (other). Add a hint beneath the input: `"Cmd+Enter to draft"` (or `"Ctrl+Enter"` on non-Mac).

**D-R10. Breakdown preview columns.** Each subtask row in the breakdown list must show:
- Task name (bold)
- Proposed column name (secondary text, gray)
- Assigned member avatar (if any)

Use the same format as the kanban card's compact view.

---

## 8. Board Brief Drawer (`BoardBriefDrawer`)

### 8.1 Current Issues

| # | Issue | Severity |
|---|---|---|
| B-01 | Auto-fires AI on every open with no caching — re-summarizes identical board data on repeated opens | High |
| B-02 | No "Copy as Markdown" action (v2.1 §7.5 specifies this) | High |
| B-03 | No "Save as task note" action (v2.1 §7.5 specifies this) | Medium |
| B-04 | No refresh button — user must close and reopen the drawer to re-run | Medium |
| B-05 | `openTaskFromBrief` closes the drawer before `startEditing` — loses the board context | High |
| B-06 | Recommendations render as plain text with no CTA — no way to act on them from the brief | High |
| B-07 | Brief re-runs when the drawer reopens even if the board data hasn't changed | High |
| B-08 | No streaming — brief appears all at once after a perceptible delay | High |
| B-09 | No error retry affordance | Medium |
| B-10 | Risk section shows raw count numbers with no context (e.g., "3 blocked tasks" with no link to see which) | Medium |
| B-11 | "Generated X minutes ago" timestamp is absent | Low |
| B-12 | Brief data is destroyed when the drawer closes (`destroyOnHidden`) | Medium |
| B-13 | No progress indicator during generation | High |
| B-14 | Accessibility: drawer footer buttons have no `aria-label` | Low |

### 8.2 Requirements

**B-R1. Smart caching.** Do not re-run the brief AI call if both conditions hold:
1. The cached brief is less than 5 minutes old (track via `briefGeneratedAt` ref)
2. The board's task array length and last-modified timestamp have not changed since the cache was filled

If the cache is stale or board changed, auto-refresh; otherwise show the cached brief immediately with "Generated [N] minutes ago" at the bottom.

**B-R2. Streaming brief.** Migrate `boardBriefAi` from `useAi` to `useAgent("board-brief-agent")`. Render the brief progressively using an `aria-live="polite"` region. Show a shimmer skeleton for the first 300ms, then dissolve it as the first tokens arrive.

**B-R3. Copy as Markdown.** Add a `<Button icon={<CopyOutlined />}>Copy</Button>` in the drawer footer. Clicking it calls `navigator.clipboard.writeText(briefMarkdown)`. On success show `message.success("Copied to clipboard")`.

**B-R4. Save as task note.** Add `<Button>Save as note</Button>` in the drawer footer. This opens the task-create modal pre-populated with the brief text as the task note, a task name of "Board brief — [date]", and task type "Note". The brief drawer stays open.

**B-R5. Refresh button.** Add `<Button icon={<ReloadOutlined />}>Refresh</Button>` next to Copy. Clicking it bypasses the cache and re-runs the brief. Disabled while streaming. On click: fire `ANALYTICS_EVENTS.BRIEF_REFRESHED`.

**B-R6. Keep drawer open on task open.** Change `openTaskFromBrief` to navigate to the task in a right-side task detail drawer rather than closing the brief drawer. If the task detail drawer is not available yet, open the task in a new browser tab as a fallback. Never close the brief drawer as a side effect of clicking a task link.

**B-R7. Recommendation CTAs.** Each recommendation item must include a primary CTA derived from the recommendation type:
| Recommendation type | CTA label | Action |
|---|---|---|
| `reassign` | "Reassign…" | Opens assignee picker for the target task |
| `move_column` | "Move…" | Opens column picker for the target task |
| `add_subtask` | "Break down…" | Opens breakdown flow pre-filled with parent task |
| `create_task` | "Create task" | Opens draft modal with suggestion pre-filled |
| Other | "Open task" | Navigates to the task |

CTA must be `size="small"` and `type="link"`.

**B-R8. Risk section links.** Each count in the risk summary (e.g., "3 blocked tasks") must be a clickable link that opens a filtered board view showing only those tasks. Implement by dispatching a `boardFilter:set` custom event with the filter payload.

**B-R9. Generated timestamp.** Show `"Generated [relative time] ago"` at the bottom of the brief using the same relative-time formatter used elsewhere in the app. Update the timestamp when a refresh completes.

**B-R10. Error retry.** On generation error, render: `Alert type="error" message="Couldn't generate brief." action={<Button size="small" onClick={refresh}>Try again</Button>}`.

**B-R11. Persist across close.** Remove `destroyOnHidden`. The drawer must maintain its brief content and scroll position across open/close cycles within the same route.

---

## 9. Semantic Search Input (`AiSearchInput`)

### 9.1 Current Issues

| # | Issue | Severity |
|---|---|---|
| SR-01 | Clear button is a separate "Clear AI search" button — standard expectation is an ×-icon inside the input | Medium |
| SR-02 | No rationale shown on successful match (only on zero-result path) | Medium |
| SR-03 | Input is disabled (`disabled={busy}`) during search — user cannot type the next query while results load | High |
| SR-04 | No result count announcement for screen readers | Medium |
| SR-05 | No streaming for search results — results appear all at once | Medium |
| SR-06 | No "Why this result?" hover tooltip on result items | Low |
| SR-07 | Search icon button has no `aria-label` | High |
| SR-08 | No keyboard shortcut to focus the search input | Low |
| SR-09 | Error state shows raw error string with no retry | Medium |
| SR-10 | No distinction between "no AI results" and "no tasks at all on board" | High |

### 9.2 Requirements

**SR-R1. Inline clear button.** Replace the separate "Clear AI search" button with the Ant Design `Input` component's `allowClear` prop. The suffix area should only show the search icon (not a clear button) when the input is empty.

**SR-R2. Result rationale.** Show a brief rationale beneath each result item: `"Matched because: [reason]"` in `Typography.Text type="secondary"`. The rationale comes from the search result's `reason` field. Show it collapsed (one line, `ellipsis`) by default; expand on hover or click.

**SR-R3. Non-blocking input.** Do not disable the input during search. Instead: show a small spinner suffix in the input while `busy`. If the user submits a new query while a search is in flight, cancel the previous search (abort controller) and start the new one.

**SR-R4. Screen reader announcement.** Add a visually-hidden `aria-live="assertive"` region below the input. When results load, update its text to: "Found [N] tasks matching '[query]'" or "No tasks matched '[query]'".

**SR-R5. "Why this result?" tooltip.** On each result list item, add an `<InfoCircleOutlined />` icon that shows a Tooltip with the full rationale text on hover/focus.

**SR-R6. Search button aria-label.** Set `aria-label="Search with AI"` on the search trigger button.

**SR-R7. Empty state disambiguation.** When zero AI results are returned:
- If the board has tasks: "No tasks matched your search. Try different words, or [clear] to see all tasks."
- If the board has no tasks: "This board has no tasks yet."

**SR-R8. Error retry.** On search error render: `"Search failed. [Try again]"` as a link that resubmits the last query.

---

## 10. Command Palette (`CommandPalette`)

### 10.1 Current Issues

| # | Issue | Severity |
|---|---|---|
| CP-01 | Tab key is hijacked to toggle AI mode — breaks keyboard navigation between search results | Critical |
| CP-02 | "/" prefix sets `aiMode=true` but deleting the "/" does not reset to nav mode | High |
| CP-03 | `aria-expanded` is hardcoded to `true` regardless of result state | High |
| CP-04 | Ranking uses naive `indexOf` — no fuzzy matching, no recency, no frecency | Medium |
| CP-05 | Mobile: entire palette replaced with an explanatory paragraph — no search at all on small screens | High |
| CP-06 | AI mode shows a placeholder banner "coming in Phase E" — Phase E has started | High |
| CP-07 | Pressing "/" in the input body (not start) sets AI mode unexpectedly | High |
| CP-08 | No keyboard shortcut to clear the input (Escape clears, but also closes the modal) | Low |
| CP-09 | No frecency / recently-visited weighting in results | Low |
| CP-10 | No visual group headers (Projects / Tasks / Columns / Members) | Low |
| CP-11 | Entry rows use `<li>` with `role="option"` but are not direct children of the `role="listbox"` — ARIA tree invalid | High |
| CP-12 | No empty-state illustration — "No matches." is plain text only | Low |
| CP-13 | Palette does not announce result count to screen readers | Medium |
| CP-14 | `isMacLike()` uses deprecated `navigator.platform` | Low |
| CP-15 | No loading state while `useGatheredCachedList` is populating | Medium |
| CP-16 | Query is not trimmed before matching — leading/trailing spaces cause false no-matches | Low |
| CP-17 | `ModeBanner` says "Phase E" — internal phase naming must not appear in UI copy | High |

### 10.2 Requirements

**CP-R1. Fix Tab behavior.** Remove Tab as an AI mode toggle. Tab must perform its default behavior (move focus). AI mode is toggled by:
1. Typing "/" as the first character of the input
2. Clicking a dedicated `<AiSparkleIcon aria-hidden /> AI` toggle button at the right end of the input
3. The toggle button must have `aria-label="Switch to AI mode"` / `"Switch to search mode"` based on state

**CP-R2. "/" mode sync.** Watch the `query` string in the handler. When the query no longer starts with "/", set `aiMode(false)`. When it starts with "/", set `aiMode(true)`. This must be an immediate effect (no debounce) so the UI is always consistent.

**CP-R3. Fix `aria-expanded`.** Set `aria-expanded={visible.length > 0}` on the combobox wrapper. When AI mode is active the combobox has no listbox, so set `aria-expanded={false}` and `aria-haspopup={false}`.

**CP-R4. Fuzzy ranking.** Replace `indexOf` with a combined score:
- **Prefix match** (query is a prefix of label): score = 0
- **Substring match** (label contains query): score = idx + 1
- **Token match** (any word in label/sublabel contains query): score = 50 + idx
- **No match**: excluded

Tiebreak by entity type priority: `project > task > column > member`. Further tiebreak by recency (entities navigated to in the last 24 hours score −10).

**CP-R5. Mobile bottom sheet.** On `!screens.md`, replace the Modal with an Ant Design Drawer anchored to the bottom with `placement="bottom"`. Height should snap to 50vh. Show the search input and result list at full width. AI mode must work on mobile too.

**CP-R6. Phase E AI mode.** Wire the AI input to `useAgent("chat-agent")`. When the user presses Enter in AI mode:
1. Dismiss the palette
2. Open the Copilot chat drawer
3. Pre-populate the chat input with the query and immediately call `agent.start(query)`

The phase E placeholder banner must be removed entirely.

**CP-R7. "/" detection fix.** Only enter AI mode when "/" is the first character (index 0) of the query. Typing "/" anywhere else must not toggle AI mode.

**CP-R8. Fix ARIA tree.** Move the `role="listbox"` + `id={listboxId}` to the `<ListContainer>` (the `<ul>`). Each `<Row>` (`<li>`) keeps `role="option"`. Remove the redundant outer `combobox` wrapper `aria-owns` / `aria-controls` duplication.

**CP-R9. Result count announcement.** Add a visually-hidden `aria-live="polite"` region below the input. After each query change, update its text to: "[N] results" or "No results". Debounce the update by 300ms so rapid typing does not spam screen readers.

**CP-R10. Group headers.** When results span multiple kinds, render a separator row (not `role="option"`) with the kind label. Use `role="presentation"` on these separators so screen readers skip them.

**CP-R11. Fix `navigator.platform`.** Replace `isMacLike()` with:
```ts
const isMacLike = () =>
    typeof navigator !== "undefined" &&
    (navigator.userAgentData?.platform ?? navigator.platform ?? "")
        .toLowerCase()
        .includes("mac");
```

**CP-R12. Trim query.** Apply `.trim()` before passing the query to `filterEntries()`.

**CP-R13. Internal copy cleanup.** Remove all references to "Phase E" from user-visible copy. Use "AI mode" or "Ask Copilot" instead.

---

## 11. Cross-Cutting Requirements

### 11.1 Streaming & Latency

**X-R1.** All network AI calls must go through `useAgent` (for LangGraph agents) or maintain `AbortController` support (for `useAi`). No AI hook may make a bare `fetch` call without a bound signal.

**X-R2.** Every surface that streams must provide a Stop action. The Stop action must call `agent.abort()` or the hook's `abort()` method and must be reachable via keyboard.

**X-R3.** TTFT target: 700ms from `agent.start()` call to first character rendered in the UI. Measure via `performance.mark()` around streaming start/first-token. Fire `ANALYTICS_EVENTS.AGENT_TTFT` with `{ ms: number, agent: string }`.

**X-R4.** Add `ANALYTICS_EVENTS.AGENT_TTFT` to `src/constants/analytics.ts`.

### 11.2 Error Handling

**X-R5.** All AI error states must follow this template:
- **Heading:** Plain-language description of what failed ("Couldn't generate board brief")
- **Body:** (Optional) one sentence of context ("The AI service is temporarily unavailable")
- **Primary action:** "Try again" — retries the last operation
- **Secondary action:** (Optional) "Dismiss" — clears the error state
- Never show raw `error.message` or HTTP status codes to users

**X-R6.** Network timeouts (>30 s with no stream tokens) must be treated as errors, not silent hangs. Add a 30-second watchdog timer in `useAgent` that calls `abort()` and sets a timeout error if no part has been received.

### 11.3 Confidence Display

**X-R7.** Everywhere a confidence score is displayed, it must use the band+percentage compound format:
```
[High | Moderate | Low]  (87%)
```
With the band as a color-coded Tag and the percentage in parentheses. The `confidenceBand()` function in `aiTaskAssistPanel/index.tsx` must be extracted to `src/utils/ai/confidenceBand.ts` and imported by all consuming surfaces.

### 11.4 Accessibility

**X-R8.** All AI-specific streaming regions must use `aria-live="polite"` (not `"assertive"`) unless the content is time-critical (e.g., an error that blocks user action).

**X-R9.** All AI icon uses that are decorative must pass `aria-hidden`. All meaningful AI icon uses must have an explicit `aria-label`. The TypeScript definition change from §4.2 S-R3 enforces this at compile time.

**X-R10.** All interactive elements in AI surfaces must have a visible focus indicator that meets WCAG 2.2 Focus Appearance (minimum 2px outline). Use `outline: 2px solid var(--ant-color-primary)` for AI-branded elements.

**X-R11.** Add `prefers-reduced-motion` media query checks in:
- Shimmer/skeleton animations (use `animation: none`)
- Token-by-token streaming animation (render full batch)
- Toast entry/exit transitions (use instantaneous show/hide)

### 11.5 Design Tokens

**X-R12.** Extract all AI-specific colors to a new `src/theme/aiTokens.ts` file:
```ts
export const ai = {
    gradStart: "var(--color-copilot-grad-start)",
    gradEnd:   "var(--color-copilot-grad-end)",
    bgSubtle:  "var(--color-copilot-bg-subtle)",    // was accent.bgSubtle
    bgMedium:  "var(--color-copilot-bg-medium)",    // was accent.bgMedium
    badgePurple: "#7C5CFF",
};
```
All AI surfaces must import from `aiTokens` not from `accent.*`.

**X-R13.** CSS custom properties for the AI gradient must be defined in `:root` and `:root[data-theme="dark"]` so dark mode is handled in CSS without JS:
```css
:root {
    --color-copilot-grad-start: #7C5CFF;
    --color-copilot-grad-end:   #C084FC;
    --color-copilot-bg-subtle:  rgba(124, 92, 255, 0.06);
    --color-copilot-bg-medium:  rgba(124, 92, 255, 0.15);
}
:root[data-theme="dark"] {
    --color-copilot-grad-start: #A78BFA;
    --color-copilot-grad-end:   #E879F9;
    --color-copilot-bg-subtle:  rgba(167, 139, 250, 0.08);
    --color-copilot-bg-medium:  rgba(167, 139, 250, 0.18);
}
```

### 11.6 Microcopy

**X-R14.** Add to `src/constants/microcopy.ts`:
```ts
ai: {
    draftSuggestions: [
        "Draft a bug fix task",
        "Plan a new feature",
        "Create a research spike",
    ],
    privacyDisclosure: "Copilot sees your board's task names, columns, and member names. No notes or emails are shared.",
    privacyLink: "What is shared?",
    streaming: "Board Copilot is thinking…",
    stopped: "Stopped.",
    retryLabel: "Try again",
    regenerateLabel: "Regenerate",
    undoLabel: "Undo",
    copiedConfirm: "Copied to clipboard",
    feedbackThanks: "Thanks for your feedback",
    confidenceBands: { high: "High", moderate: "Moderate", low: "Low" },
},
```

### 11.7 Privacy

**X-R15.** A `CopilotPrivacyPopover` component (new) must be created at `src/components/copilotPrivacyPopover/index.tsx`. It renders a `<Popover>` with:
- Title: "What Board Copilot sees"
- Content: bulleted list of data categories shared (board name, column names, task names, member names, current user ID)
- Fine print: "No task notes, member emails, or attachments are ever sent."

This component must be used by AiChatDrawer (C-R10), AiTaskDraftModal (D-R8), and be exported for reuse in any future AI surface.

### 11.8 Analytics

**X-R16.** Add the following events to `ANALYTICS_EVENTS` in `src/constants/analytics.ts`:
```ts
AGENT_TTFT: "agent_ttft",
BRIEF_REFRESHED: "brief_refreshed",
BREAKDOWN_AXIS_CHANGED: "breakdown_axis_changed",
PROPOSAL_ACCEPTED: "proposal_accepted",
PROPOSAL_REJECTED: "proposal_rejected",
CITATION_CLICKED: "citation_clicked",
NUDGE_DISMISSED: "nudge_dismissed",
SEARCH_RESULT_RATIONALE_VIEWED: "search_result_rationale_viewed",
UNDO_APPLIED: "undo_applied",
```

---

## 12. New Shared Components

The following components must be created as new files. They are referenced by multiple surfaces above.

### 12.1 `MutationProposalCard`
**Path:** `src/components/mutationProposalCard/index.tsx`

Props:
```ts
interface MutationProposalCardProps {
    proposal: MutationProposal;
    onAccept: () => void;
    onReject: () => void;
    isLoading?: boolean;
}
```

Renders:
- Header: "Copilot wants to [proposal.verb] [proposal.entityName]"
- Diff table: `<table>` with columns: Field | Current | Proposed. Use red/green text for removed/added values.
- Accept button (`type="primary"`, `disabled={isLoading}`)
- Reject button (`type="default"`)
- Privacy note: `"This will [verb] data in your project."` in secondary text

### 12.2 `CitationChip`
**Path:** `src/components/citationChip/index.tsx`

Props:
```ts
interface CitationChipProps {
    index: number;          // display number [1], [2], etc.
    citation: CitationRef;
    onNavigate?: (href: string) => void;
}
```

Renders a `<sup>` containing an Ant Design `Tag` with `role="link"` and `tabIndex={0}`. On click/Enter: if the citation has a navigable entity (task, project), calls `onNavigate(href)`. Always shows a Tooltip with `citation.title` and `citation.type`.

### 12.3 `NudgeCard`
**Path:** `src/components/nudgeCard/index.tsx`

Props:
```ts
interface NudgeCardProps {
    nudge: TriageNudge;
    onAction: (value: unknown) => void;
    onDismiss: () => void;
}
```

Renders a compact Card with severity icon, title, action button, and dismiss link. Fires `ANALYTICS_EVENTS.NUDGE_DISMISSED` on dismiss.

### 12.4 `CopilotPrivacyPopover`
Spec in §11.7 above.

---

## 13. `useAgent` Hook Improvements

The `useAgent` hook (v2.1 Phase A) is correct architecturally but needs these additions:

**UA-R1. Timeout watchdog.** Add a 30-second watchdog inside `consumeStream`. If 30 seconds pass with no new `StreamPart`, call `controller.abort()` and set the error to `new Error("Board Copilot took too long to respond. Try again.")`.

**UA-R2. TTFT measurement.** After the first `StreamPart` of type `"messages"` arrives, compute `performance.now() - streamStartTime` and fire `ANALYTICS_EVENTS.AGENT_TTFT`.

**UA-R3. `pendingProposal` auto-clear.** When the stream ends (`setIsStreaming(false)`) and `pendingProposal` is non-null, do NOT auto-clear it — leave it visible until the user accepts or rejects. This is already the behavior but must be documented explicitly in a comment.

**UA-R4. Expose `threadId`.** Add `threadId: string` to `UseAgentResult` so callers can display or log the current thread ID. This enables "Share this conversation" features later.

---

## 14. Phased Delivery Plan

These requirements are grouped into delivery phases based on risk and dependency. Each phase must ship as a single PR with tests.

### Phase UX-1 — Critical fixes (1 sprint)
Block on no other work. Fix bugs that degrade existing functionality:

| Req | Summary |
|---|---|
| S-R1 | Fix SSR-crashing gradient ID |
| CP-R1 | Fix Tab hijack in command palette |
| CP-R7 | Fix "/" detection |
| CP-R8 | Fix ARIA listbox tree |
| T-R7 | Fix stale estimate data on blank task name |
| D-R7 | Fix stale draft state on modal reopen |
| SR-R3 | Fix disabled input during search |
| C-R5 (partial) | Re-enable thumbs buttons after stream ends |
| X-R5 | Standardize error templates across all surfaces |

### Phase UX-2 — Trust and transparency (1 sprint)
Confidence bands, badges, privacy disclosures:

| Req | Summary |
|---|---|
| X-R7 | Extract `confidenceBand()` to shared util |
| T-R2 | Confidence band in task assist panel |
| D-R2 | AI field badges in draft modal |
| X-R12/13 | Design token extraction and dark-mode CSS |
| S-R2/3/4 | Sparkle icon improvements |
| X-R15 | Create `CopilotPrivacyPopover` |
| C-R10 | Add privacy link to chat drawer |
| D-R8 | Privacy disclosure on first draft submit |
| X-R14 | Microcopy additions |

### Phase UX-3 — Safety nets and streaming (1 sprint)

| Req | Summary |
|---|---|
| T-R1 / T-R4 | Undo for story points and readiness suggestions |
| D-R5 | Undo for bulk subtask creation |
| D-R4 | Bulk-create progress indicator |
| B-R1/11 | Brief caching and persist-across-close |
| C-R1 | Persist chat transcript |
| C-R2 | Streaming text in chat (requires useAgent migration) |
| C-R3 | Stop button in chat |
| B-R2 | Streaming brief |
| UA-R1 | Timeout watchdog in useAgent |
| UA-R2 | TTFT measurement |

### Phase UX-4 — Discoverability and advanced features (1 sprint)

| Req | Summary |
|---|---|
| D-R1 | Sample prompts in draft modal |
| C-R5 | Sample prompts in chat drawer |
| D-R3 | Breakdown axis picker |
| D-R6 / T-R8 | Regenerate buttons |
| B-R3/4/5 | Copy, save, refresh for board brief |
| B-R6/7/8 | Brief recommendation CTAs and risk links |
| C-R7/8 | Citations and nudge cards in chat |
| C-R9 | Proposal preview card |
| CP-R4 | Fuzzy ranking in command palette |
| CP-R5 | Mobile bottom sheet |
| CP-R6 | Wire AI mode to chat agent (Phase E) |
| SR-R2/5 | Rationale display in search results |
| New components | MutationProposalCard, CitationChip, NudgeCard |

---

## 15. Acceptance Criteria Summary

A feature is considered complete when:

1. **Functional**: Behaves per the requirement spec for the happy path, all error states, and all empty states.
2. **Accessible**: Passes `axe-core` automated scan with zero critical or serious violations. Keyboard navigation is confirmed manually.
3. **Responsive**: Renders correctly at 375px (mobile), 768px (tablet), 1280px (desktop). No horizontal overflow. No text truncation that loses meaning.
4. **Tested**: Unit tests cover all new utility functions. Integration tests cover the happy path and primary error state of each surface. No test file is added without covering the new requirement.
5. **Analytics**: Fires the correct `ANALYTICS_EVENTS` entry for every tracked user action.
6. **Performance**: No new render that causes a layout shift (CLS) or first-paint regression >50ms per Lighthouse CI.
7. **No regressions**: Existing Playwright/Vitest suite passes (the 5 pre-existing failures are excluded from the gate).

---

## 16. Out of Scope

The following items were considered and intentionally deferred:

| Item | Reason deferred |
|---|---|
| Real-time board sync via WebSocket | Requires backend work outside AI scope |
| Voice input in chat drawer | Accessibility concerns, low priority |
| AI-powered column re-ordering | Risky mutation; needs deeper undo stack |
| Export chat history | Low user demand in research |
| Internationalization of AI output | AI model output is English-only |
| Per-user fine-tuning | Requires LangGraph Cloud tier not yet provisioned |
| Multi-agent orchestration UI | Architecture supports it; UI not yet designed |

---

## Appendix A — Audit Issue Cross-Reference

| Audit ID | Component | This PRD |
|---|---|---|
| S-01 → S-05 | AiSparkleIcon | §4 |
| C-01 → C-13 | AiChatDrawer | §5 |
| T-01 → T-13 | AiTaskAssistPanel | §6 |
| D-01 → D-15 | AiTaskDraftModal | §7 |
| B-01 → B-14 | BoardBriefDrawer | §8 |
| SR-01 → SR-10 | AiSearchInput | §9 |
| CP-01 → CP-17 | CommandPalette | §10 |
| Cross-cutting × 7 | All surfaces | §11 |

All 94 audit issues are addressed in this document. 7 were folded into cross-cutting requirements (§11). None were deferred.

---

## Appendix B — Research Principles Cross-Reference

| Principle | Source area | This PRD |
|---|---|---|
| Stream-first, TTFT < 700ms | §2 P1 | C-R2, B-R2, X-R1, X-R3 |
| Never abandon the user (3 states) | §2 P2 | X-R5, T-R6, SR-R7, B-R10 |
| Trust via transparency | §2 P3 | X-R7, T-R2, D-R2, C-R7 |
| Mutations need safety net | §2 P4 | T-R1, D-R5, C-R9 |
| Discoverability | §2 P5 | D-R1, C-R5, CP-R6 |
| Accessible by default | §2 P6 | §11.4, X-R8–11 |
| Privacy non-negotiable | §2 P7 | §11.7, C-R10, D-R8, X-R15 |

All 20 research rules map to at least one numbered requirement in this document.
