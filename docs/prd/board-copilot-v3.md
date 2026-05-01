# PRD: Board Copilot v3 — AI UX Excellence for `jira-react-app`

| Field             | Value                                                                                                                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status            | Draft v3 — extends and supersedes [`board-copilot-v2.1-agent.md`](board-copilot-v2.1-agent.md) for UX direction. v2.1 remains the binding backend/wire contract; v3 is the UX and product layer on top of it.    |
| Author            | Product                                                                                                                                                                                                          |
| Last updated      | 2026-05-01                                                                                                                                                                                                       |
| Target repository | `jira-react-app` (frontend) + Python agent server at `${REACT_APP_AI_BASE_URL}` (out of repo)                                                                                                                   |
| Document scope    | AI UX audit, identified issues, competitive analysis, industry best practices, redesigned AI surfaces, trust & transparency patterns, onboarding, accessibility, and phased UX rollout.                          |
| Companion docs    | [`board-copilot.md`](board-copilot.md) (v1), [`board-copilot-v2.1-agent.md`](board-copilot-v2.1-agent.md) (backend contract), [`board-copilot-progress.md`](board-copilot-progress.md), [`board-copilot-review.md`](board-copilot-review.md), [`ui-ux-optimization-plan.md`](../ui-ux-optimization-plan.md) |

---

## 1. Executive Summary

Board Copilot has shipped five capable AI features (smart task drafting, estimation & readiness, board brief, conversational assistant, semantic search) backed by a solid infrastructure spine. v2.1 defined the agentic backend contract (LangGraph agents, progressive autonomy, bidirectional tool calling). What remains unaddressed is **the experience layer** — the gap between "AI features that work" and "AI features that users trust, understand, and adopt."

v3 is a **UX-focused PRD**. It does not replace v2.1's backend architecture; it builds the product surface on top of it. The core thesis:

> AI features fail not because the model is wrong, but because the interface doesn't help users calibrate trust, recover from errors, or understand what happened.

v3 addresses this with seven design moves:

1. **Confidence UI everywhere.** Replace raw percentages with calibrated confidence bands, reasons, and escape hatches on every AI output.
2. **Citations as first-class UI.** Every AI answer that references project data must show verifiable, clickable, source-linked citations.
3. **Progressive onboarding, not feature dumps.** New users see three deterministic prompts, not a blank chat. Features reveal themselves through use, not tours.
4. **Streaming-first rendering.** Skeleton → streaming text → final state on every AI surface, with graceful degradation for slow or failed responses.
5. **Unified AI surface architecture.** One right-rail panel with tabs (Chat, Brief, Inbox, History) replaces four separate drawers. Command palette is the keyboard-first entry point.
6. **Mutation previews with tracked changes.** Every AI-proposed change shows a visual diff before execution, with inline Accept/Reject per field.
7. **Feedback loops that close.** Thumbs-up/down, citation flagging, and "wrong because..." all feed back into quality signals visible to admins.

---

## 2. Current State Audit — AI UX Issues

This section catalogs every AI UX issue identified through code review, competitive analysis, and industry best-practice evaluation. Each issue is tagged with severity and the design principle it violates.

### 2.1 Trust & Transparency Issues

| # | Issue | Severity | Current State | Principle Violated |
|---|-------|----------|---------------|-------------------|
| T1 | **Raw confidence percentages without context** | High | `AiTaskAssistPanel` shows "72% confidence" as a number + Tag. Users without probability intuition cannot act on this. | Confidence UI pattern: signals must be understandable (buckets, not raw numbers) |
| T2 | **No citations on AI answers** | High | Chat assistant answers questions about the board but never shows which tasks/members it referenced. Brief shows a recommendation but doesn't cite the data behind it. | Citation as trust anchor: "Without provenance, users can't assess credibility" (Attrill 2026) |
| T3 | **Tool-call internals leak to users** | Medium | `AiChatDrawer` renders `role: "tool"` messages in a `<pre>` block showing raw function names like `getProject`, `listTasks`. Even behind "Show details", this is builder observability, not user affordance. | Aesthetic & minimalist design (Nielsen H8); AI should not expose implementation detail |
| T4 | **No "AI-generated" provenance badges** | Medium | After clicking "Apply" on an AI suggestion, the field value is indistinguishable from a manually entered one. No `Suggested by Copilot` badge exists. | AI provenance: users must be able to identify AI-contributed content (EU AI Act, Google AI UX guidelines) |
| T5 | **No "Why this?" explainability** | Medium | Estimation shows similar tasks in a list but no expandable rationale. Brief's recommendation is a single sentence with no supporting evidence. | Explainability hooks: "Allow users to ask 'Why did you say that?'" (Conversational AI Resilience Framework) |
| T6 | **No "What is shared?" transparency** | Medium | v2.1 specifies this panel but it's unimplemented. Users cannot see what data leaves the browser. | Trust through transparency: "Users see what the AI knows" (ChatGPT Memory pattern) |

### 2.2 Interaction & Usability Issues

| # | Issue | Severity | Current State | Principle Violated |
|---|-------|----------|---------------|-------------------|
| U1 | **Four separate AI drawers/modals compete** | High | Board header has Brief button, Ask button, Draft with AI link, and a Project AI switch — all in one row. At 1024px these wrap unpredictably. | Consistency & standards (Nielsen H4); information architecture should not split one assistant into four surfaces |
| U2 | **No streaming text rendering** | Medium | All AI responses arrive as complete JSON. The local engine resolves synchronously; the remote path uses request/response fetch. No progressive text reveal. | Streaming output is the #1 LLM UX pattern (DesignPixil, GroovyWeb 2026): "If responses take >1-2s, stream" |
| U3 | **Chat has no regenerate control** | Medium | If the AI gives a poor answer, the user must rephrase and ask again. No "Regenerate" button. | Regenerate and Refine Controls: "essential for generative features where quality varies" (DesignPixil) |
| U4 | **No prompt history** | Low | Chat state lives in `useState` only; cleared on reload. No session list, no search across past conversations. | Session persistence: "Auto-save every message. Show a session list." (AI Chat UI Best Practices) |
| U5 | **No feedback mechanism on text answers** | Medium | Accept/reject exists for mutation proposals but not for non-mutating text answers. No thumbs-up/down. | Feedback loops: "71% of enterprise employees won't use an AI tool they don't trust" (PwC) |
| U6 | **Chat send box has no character limit indicator** | Low | Prompts can be arbitrarily long with no visible counter. | Error prevention (Nielsen H5); prevent before the model silently truncates |
| U7 | **Brief is static — no "what changed" awareness** | Medium | Headline is a count ("12 tasks on the board, 5 in progress"). It should be "What's new vs. yesterday." | Proactive relevance: the lede that earns daily reads is "what changed", not "what exists" |
| U8 | **Semantic search uses Jaccard — no synonyms** | Medium | "auth bugs caused by token expiry" finds nothing when tasks say "session", "JWT", "401". No "Did you mean…?" fallback. | Recognition over recall (Nielsen H6); search should handle synonyms and offer reformulations |
| U9 | **Breakdown uses hard-coded subtask verbs** | Low | `breakdownTask` always produces "Investigate / Implement / Add tests for / Document / Polish UX of". No axis picker. | User control & freedom (Nielsen H3); the user should choose the decomposition strategy |

### 2.3 Onboarding & Empty State Issues

| # | Issue | Severity | Current State | Principle Violated |
|---|-------|----------|---------------|-------------------|
| O1 | **No AI onboarding** | High | First-time AI users see the same interface as power users. No guidance on what Board Copilot can do, no interactive walkthrough. | Time to first value: "Get to the aha moment as fast as possible" (Dench); progressive disclosure (IxDF) |
| O2 | **Hard-coded sample prompts** | Medium | Chat shows three static prompts that never change regardless of project state or user history. | Contextual relevance: "Sample prompts should reflect the user's recent activity" (Linear, Asana pattern) |
| O3 | **Empty chat state is a paragraph of text** | Low | Initial chat state is a muted paragraph. Should be actionable sample-prompt chips. | Empty states should guide action, not describe features (Slack pattern) |
| O4 | **Cold-start brief shows full counts on empty board** | Low | Brief on a brand-new project still tries to compute counts/workload with zero data. | Cold-start: "Not enough history for trend analysis yet" with graceful degradation (v2.1 §3.5) |

### 2.4 Accessibility & Responsiveness Issues

| # | Issue | Severity | Current State | Principle Violated |
|---|-------|----------|---------------|-------------------|
| A1 | **AI task draft modal uses raw `<input type="checkbox">`** | Medium | Breakdown selection uses unstyled native checkboxes instead of AntD `<Checkbox>`. Visual inconsistency, missing focus states. | WCAG 2.5.8 Target Size; consistency with design system |
| A2 | **No `aria-live` on AI assist panel** | Medium | Chat drawer has `aria-live="polite"` but the estimation/readiness panel does not announce updates to screen readers. | WCAG 4.1.3 Status Messages |
| A3 | **AI sparkle icon has inconsistent padding** | Low | Sometimes 8px hard-coded, sometimes none. No design token. | Consistency & standards (Nielsen H4) |
| A4 | **Drawers don't render as bottom sheets on mobile** | Medium | All AI drawers use the same right-edge Drawer on mobile. Should be bottom sheets on `xs`/`sm`. | Touch & mobile: bottom-sheet variant for small viewports (UI/UX Plan §2.A.2) |
| A5 | **No keyboard shortcut for AI features** | Low | No `?` shortcut on task cards, no keyboard path to Brief/Ask/Draft without mouse. | Flexibility & efficiency (Nielsen H7); keyboard-first design (Linear) |

### 2.5 Performance & Loading Issues

| # | Issue | Severity | Current State | Principle Violated |
|---|-------|----------|---------------|-------------------|
| P1 | **Spinner flash on fast local engine** | Medium | AI assist panel shows a Spin for every debounced call even when the local engine resolves in <10ms. | Throttled spinners: only show after 250ms (UI/UX Plan §2.A.7) |
| P2 | **Estimation re-fires on every keystroke** | Low | 600ms debounce (PRD says 1000ms). With remote LLM, this would mean multiple concurrent API calls per form interaction. | Performance UX: debounce should match the PRD specification |
| P3 | **No skeleton loading states for AI** | Medium | AI panels use bare `<Spin>` instead of content-shaped skeletons that match the final layout. | Skeleton shape match: "Skeletons must match the final element's bounding box" (UI/UX Plan §3.5) |

---

## 3. Competitive Analysis — How the Best Do AI UX

### 3.1 Linear

| Strength | Lesson for Board Copilot |
|----------|-------------------------|
| **Keyboard-first (`Cmd+K` everything)** | Our command palette exists but AI mode is a placeholder. Ship it. |
| **AI Triage auto-routes incoming issues (85% accuracy)** | Our triage-agent exists in spec but has no UI. Ship the Inbox. |
| **Sub-100ms response times, local-first architecture** | Our local engine is synchronous and fast — leverage this as the instant-feedback layer while the remote agent streams. |
| **Minimal, scannable UI — dense rows, not card-heavy boards** | Our AI panels (especially the chat drawer) are text-heavy walls. Add structure: cards, dividers, collapsible sections. |
| **Dark theme by default, clean typography** | We have dark mode. Ensure all AI surfaces respect both themes. |

### 3.2 Atlassian Jira (Rovo / AI)

| Strength | Lesson for Board Copilot |
|----------|-------------------------|
| **Agents as assignees — run inside workflows** | v3 is not there yet (requires real backend), but the mutation proposal pattern is the stepping stone. |
| **AI-powered issue creation + summaries** | We have this. Invest in quality (citations, confidence) rather than breadth. |
| **Deep integration with Confluence/Bitbucket** | We don't have integrations. Focus on what we can do well: in-product AI with verifiable citations. |
| **3000+ marketplace apps** | Not relevant. Our moat is UX quality, not ecosystem breadth. |

### 3.3 Notion AI

| Strength | Lesson for Board Copilot |
|----------|-------------------------|
| **AI content generation inline — write/rewrite/summarize right where text lives** | Our "Rewrite with AI" button (v2.1 §7.3) is the right scope. Don't try to be a full editor. |
| **Beautiful, minimalist design** | AI surfaces should inherit the design system, not fight it. Consistent tokens, consistent spacing. |
| **Q&A across workspace** | Our semantic search + chat already do this. The gap is quality (embeddings vs. Jaccard) and UX (citations). |

### 3.4 Industry Anti-Patterns to Avoid

These are documented failure modes from AI UX research (Hamilton 2025, Groto 2026, Apptension 2026). Each maps to a concrete risk in Board Copilot.

| Anti-Pattern | Risk in Board Copilot | Mitigation |
|-------------|----------------------|------------|
| **Illusion of determinism** — presenting AI outputs as factual answers | Estimation shows "5 points" as if it's the right answer, not one possible answer | Confidence bands + "one possible estimate" language + show alternatives |
| **Black box AI** — no explanation of how a result was produced | Chat answers board questions without showing its reasoning or sources | Mandatory citations with required `quote` field; "Sources (N)" footnote |
| **Feature dump onboarding** — showing every AI feature on day one | Board header has 4+ AI controls visible simultaneously | Progressive disclosure: consolidate into one Copilot dropdown; reveal features through use |
| **Overconfident personality** — AI uses phrases like "I understand" or "I think" | Chat engine microcopy should avoid anthropomorphism | Neutral, tool-like tone: "Based on 3 tasks in Backlog..." not "I think the workload is..." |
| **Hidden uncertainty** — AI generates confident output when it should hedge | Local engine always produces an answer, never says "I'm not sure" | Low-confidence threshold: if Jaccard similarity < 0.1, show "Low confidence — verify manually" |
| **No failure UI** — errors show generic messages | AI errors show "Couldn't draft a task this time" with no next step | Specific failure reasons + suggested next inputs: "Try adding more detail to your prompt" |
| **AI that interrupts flow** — copilot surfaces that take over the screen | Draft modal is a full modal; Brief is a 480px drawer | Keep AI surfaces as side panels and overlays; never block the primary view |
| **No undo** — AI changes that can't be reversed | "Apply suggestion" fills form fields with no revert | Every Apply shows a "Revert to previous" link for 30 seconds; toast Undo on all mutations |

---

## 4. Design Principles (v3-specific)

These principles govern every AI UX decision in v3. They extend the v2.1 goals with user-experience-specific guidance.

### P1: Calibrated Confidence, Not False Certainty

Every AI output must communicate three things: (a) how sure it is, (b) why, and (c) what the user should do next. Use plain-language bands ("High confidence — 3 similar tasks agree" / "Low confidence — no similar tasks found, verify manually"), not raw percentages. When confidence is low, default to a safer behavior (show alternatives, ask for clarification, or decline to answer).

### P2: Verifiable, Not Magical

Every AI claim that references project data must be traceable to its source via a clickable citation. Citations use the `CitationRef` type from v2.1 with a **required** `quote` field (verbatim excerpt). Click-through scrolls the cited entity into view and pulse-highlights it for 1 second. This turns "the AI said so" into "the AI referenced task #X which says Y."

### P3: Assistive, Not Autonomous (by Default)

The default autonomy level is "Plan" — the AI proposes, the user decides. Every mutation preview shows a visual diff of what will change. The user's explicit consent is the gate for every write. Autonomy is earned per-tool through shadow mode quality metrics, not assumed.

### P4: Progressive, Not Overwhelming

AI features reveal themselves through use, not through tours or feature dumps. New users see three deterministic sample prompts, an explanation of what Copilot can do, and a single visible entry point. Advanced features (breakdown axes, rewrite modes, triage inbox) surface as users interact with the basics.

### P5: Resilient, Not Fragile

Every AI surface degrades gracefully. Network failure → explicit banner + local engine fallback. Slow response → streaming skeleton → partial result. Rate limit → friendly message with retry timing. The non-AI flow always remains fully usable.

### P6: Transparent, Not Opaque

Users can always see what data the AI used (citations), what data left the browser ("What is shared?" panel), and what the AI did (Action History). Tool-call internals are hidden by default but available behind "Show details" for power users. The AI never acts on data the user can't inspect.

### P7: Feedback Closes the Loop

Every AI output has a low-friction feedback path: thumbs-up/down on text answers, Accept/Reject on proposals, flag-as-irrelevant on citations. This data feeds quality metrics, shadow-mode evaluation, and admin dashboards. Users who provide feedback see a "Thanks — this improves Board Copilot" acknowledgment.

---

## 5. Redesigned AI Surfaces

### 5.1 Unified AI Right-Rail Panel

**Problem:** Four separate surfaces (Brief drawer, Chat drawer, Inbox, History) each compete for the right edge of the screen.

**Solution:** A single right-rail panel with tabbed navigation:

```
┌──────────────────────────────────────┐
│  Board Copilot                   [×] │
│  ┌──────┬──────┬───────┬─────────┐  │
│  │ Chat │ Brief│ Inbox │ History │  │
│  └──────┴──────┴───────┴─────────┘  │
│                                      │
│  [Tab-specific content below]        │
│                                      │
│                                      │
│                                      │
│                                      │
│  ┌──────────────────────────────────┐│
│  │ 💬 Ask anything about this board ││
│  └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

**Design details:**

- **Width:** 420px on desktop (`md+`), full-width bottom sheet on mobile (`xs`/`sm`).
- **Tabs:** Chat (default), Brief, Inbox (with unread badge), History.
- **Persistence:** Panel state (open/closed, active tab) persists in `localStorage`.
- **Keyboard:** `Cmd/Ctrl+K` → type `/` to enter AI mode. Panel opens on first AI interaction.
- **ARIA:** `role="tablist"` for tabs; each tab panel has `role="tabpanel"` with `aria-labelledby`.
- **Motion:** 300ms ease-in-out slide from right; `prefers-reduced-motion: reduce` → instant.

### 5.2 Chat Tab — Redesigned

**Changes from current:**

1. **Sample prompts as actionable chips.** Replace the muted paragraph with three clickable chips that change based on project state:
   - "What's at risk on this board?" (always)
   - "{lastTouchedTaskName} — what's the status?" (contextual)
   - "Who has the most open work?" (always)
   
   Chips refresh when the React Query cache changes. No LLM call on panel open.

2. **Streaming text rendering.** Assistant responses render token-by-token with a blinking cursor. Partial text at 70% opacity until the stream completes. Uses `React.startTransition` to avoid jank.

3. **Mandatory citations.** Every assistant turn that references project data shows "Sources (N)" below the message. Click to expand a card list with:
   - Entity type icon (task/member/column)
   - Entity name (deep-linked)
   - Verbatim quote excerpt

4. **Regenerate button.** A circular arrow icon below each assistant message. Clicking re-runs the same prompt with a `regenerate: true` flag.

5. **Thumbs-up / Thumbs-down.** Inline below each assistant turn. Thumbs-down expands a "What went wrong?" textarea (optional). Stored via `BaseStore` for quality metrics.

6. **Character counter on input.** Shows `{current}/{max}` when the user has typed > 500 characters. Max = 2000 characters.

7. **"Save to task note" action.** Button on each assistant turn that writes the answer (with citations) to the focused task's note field, behind confirmation.

8. **Attach selection.** Board lasso or multi-select → "Ask about these tasks" chip appears in the input. Mirrors Cursor's `@workspace` affordance.

9. **Session persistence (opt-in).** Toggle in Settings. When enabled, conversations persist via LangGraph checkpointer. Session list appears as a sidebar within the Chat tab.

**Microcopy guidelines:**
- Never use "I think" or "I understand." Use "Based on..." or "Looking at..."
- Error states: "I couldn't find an answer. Try rephrasing, or check [Sources] for what I looked at."
- Rate limit: "Board Copilot is at capacity. Please try again in {retryAfter} seconds."
- Project disabled: "Board Copilot is turned off for this project. An admin can enable it in Settings."

### 5.3 Brief Tab — Redesigned

**Changes from current:**

1. **"What changed" headline.** The lede is computed from what changed since the user's last brief read (stored as `last_brief_read_at` in `BaseStore`). Priority ranking: load imbalance > WIP overflow > unowned bug in last 24h > backlog dilution > "Board looks balanced."

2. **Visual workload bars.** Replace the raw workload list with horizontal bar segments showing each member's open points relative to the team average. Over-loaded members highlighted in warning color.

3. **Counts as a mini bar chart.** Replace the raw table with a compact horizontal bar chart per column (tiny, inline, no axis labels — just visual proportion).

4. **Footer actions.** `Copy as Markdown` | `Save as task note`. (Slack/Confluence/Schedule deferred to v4 — each requires OAuth integration.)

5. **"Run this" on recommendation.** The recommendation sentence includes a button that converts it into a `mutation_proposal` displayed in the History tab with Accept/Reject.

6. **Citations on every data point.** Each task/member reference in the brief is a clickable chip that deep-links to the entity.

### 5.4 Inbox Tab — Triage Nudges

**New surface implementing v2.1 §7.8:**

1. **Nudge cards.** Each card shows:
   - Icon (bug, scale, clock) indicating nudge type
   - One-sentence description: "Maya has 3× the average open points"
   - Timestamp (relative: "2h ago")
   - Action button: "View proposal" / "Open task" / "Dismiss"
   - Dismiss button (×)

2. **Aggregation rules:**
   - Max 5 active nudges per board
   - Newer nudges of the same type replace older ones
   - Different types coexist

3. **Decay rules:**
   - Auto-dismiss when underlying state changes
   - Expire after 4 hours
   - Dismissed nudges removed immediately

4. **Empty state:** "No nudges right now. Board Copilot checks for issues every 15 minutes."

5. **Badge:** Header icon shows unread count, capped at 9+.

### 5.5 History Tab — Action History

**New surface implementing v2.1 §6.2:**

1. **Entry structure:**
   - Timestamp
   - Action description ("Reassigned task 'Fix login bug' from Maya to Priya")
   - Status badge: `Applied` / `Undone` / `Rejected` / `Expired`
   - Undo button (available for 10 seconds after application via toast, read-only after)
   - Expand arrow for full details (tool calls, inputs, outputs)

2. **Filtering:** By date range, action type, status.

3. **Toast Undo:** After any accepted mutation, a toast appears at top-right: "{Action description} — [Undo] (10s countdown)". Auto-dismisses after 10 seconds. Click Undo → inverse mutation → toast confirms "Undone."

4. **Empty state:** "No AI actions yet. When Board Copilot makes changes with your approval, they'll appear here."

### 5.6 Command Palette — AI Mode

**Extending the existing `Cmd/Ctrl+K` palette:**

Phase A (shipped): Navigation-only. Index projects, tasks, columns, members.

Phase E (v3): AI mode activated by pressing `Tab` or typing `/`:

1. **Mode indicator:** Pill badge switches from "Navigate" to "Ask Copilot" with a visual transition.
2. **Slash commands:**
   - `/draft` — open draft modal with the typed text as prompt
   - `/brief` — open Brief tab
   - `/estimate` — run estimation on the focused task
   - `/triage` — open Inbox tab
   - `/history` — open History tab
   - `/settings ai` — open AI settings
3. **Streaming results:** In AI mode, keystrokes stream a turn to `chat-agent`. Results render inline in the palette dropdown.
4. **ARIA:** `role="combobox"` + `listbox`. Arrow keys navigate results. `Enter` selects. `Esc` closes.
5. **Mobile:** Palette is desktop-only. Mobile users access AI via the single Copilot button → right-rail panel.

### 5.7 Confidence UI — Applied Everywhere

Every AI output gains a standardized confidence display:

**Estimation panel:**
```
┌──────────────────────────────────────┐
│  Suggested: 5 points                 │
│  ■■■■■■■■░░ High confidence          │
│  "3 similar tasks averaged 5 pts"    │
│  [Why?] [Apply] [Show alternatives]  │
└──────────────────────────────────────┘
```

- **Bands:** High (≥0.7), Moderate (0.4–0.7), Low (<0.4)
- **Reason label:** One sentence citing the evidence ("3 similar tasks averaged 5 pts" / "No similar tasks — estimate based on board averages")
- **Escape hatches:** "Show alternatives" displays the runner-up estimate. "Why?" expands a popover with the full rationale and similar-task deep-links.
- **Low-confidence behavior:** At Low, the panel shows: "Low confidence — verify this estimate manually" and the Apply button becomes "Apply anyway" (secondary style, not primary).

**Chat answers:**
- No raw confidence number. Instead, language cues: "Based on 3 tasks in Backlog..." (high) vs. "I found limited information — you may want to verify..." (low).
- Citations carry implicit confidence: more citations = more grounded answer.

**Brief:**
- Recommendation includes a confidence qualifier: "Strong signal: Maya has 11 open points (team avg: 4)" vs. "Possible concern: one unowned task — may be intentional."

**Search:**
- Result count + quality indicator: "Found 5 matches (high relevance)" vs. "Found 2 possible matches (low relevance) — try different keywords?"

### 5.8 Mutation Preview & Tracked Changes

When the agent proposes a mutation, the UI renders a visual diff before the user decides:

**Single-field change:**
```
┌──────────────────────────────────────┐
│  Proposed Change                     │
│                                      │
│  Coordinator                         │
│  - Maya Chen  →  + Priya Patel      │
│                                      │
│  Reason: "Maya has 3× the average   │
│  open points; Priya has capacity"    │
│                                      │
│  [Accept] [Edit] [Reject]           │
│  Risk: Medium · Undoable             │
└──────────────────────────────────────┘
```

**Multi-field / bulk change:**
```
┌──────────────────────────────────────┐
│  Proposed: Reassign 2 tasks          │
│                                      │
│  1. "Fix login bug"                  │
│     Coordinator: Maya → Priya        │
│  2. "Update token refresh"           │
│     Coordinator: Maya → Priya        │
│                                      │
│  [Accept All] [Review Each] [Reject] │
│  Risk: Medium · Undoable             │
└──────────────────────────────────────┘
```

**Design details:**
- `role="alertdialog"` — focus trapped, `Enter` accepts, `Escape` rejects.
- "Edit" opens inline form fields so the user can tweak the proposal before accepting.
- "Review Each" shows one-at-a-time cards for bulk proposals.
- Risk band (Low/Medium/High) displayed as colored chip.
- "Undoable" badge confirms the change can be reversed.
- After acceptance: 10-second toast with Undo + entry in History tab.

### 5.9 "Suggested by Copilot" Provenance Badges

After any AI suggestion is applied to a form field, that field shows a small badge:

```
Story Points: [5] 🤖 Suggested by Copilot
```

- Badge persists until the user manually edits the field.
- Clicking the badge opens a popover: "This value was suggested by Board Copilot based on 3 similar tasks. [View reasoning] [Revert to previous]"
- The `meta.source = "ai"` tag is stored with the task for analytics.
- Badge uses the AI sparkle icon at 12px, positioned as a suffix inside the form field.

### 5.10 "Rewrite with AI" — Task Note Editor

**Implementation per v2.1 §7.3 with v3 UX refinements:**

A small button above the task note `TextArea`: "✨ Rewrite with AI"

Clicking opens a side panel (not a modal — the textarea stays visible) with options:
- Rewrite as user story
- Add acceptance criteria
- Translate to {user locale}
- Summarize in 2 lines
- Polish tone
- Free prompt (text input)

**Flow:**
1. User clicks an option.
2. Side panel shows streaming rewrite with the original visible in the textarea behind it.
3. For notes longer than 3 lines: diff view (additions in green, removals in red).
4. For shorter notes: plain new text.
5. "Accept" replaces textarea content + adds `Suggested by Copilot` badge.
6. "Cancel" dismisses the panel with no changes.
7. Keyboard: `Tab` through options, `Enter` to select, `Escape` to cancel.

---

## 6. Onboarding & Progressive Disclosure

### 6.1 First-Time AI Experience

When a user first encounters Board Copilot (first time `boardCopilot:enabled` is true on a project with tasks):

**Step 1: Welcome banner** (top of board, dismissible)
```
┌──────────────────────────────────────────────────────┐
│ ✨ Board Copilot is ready                            │
│                                                      │
│ I can help you draft tasks, estimate work, summarize │
│ this board, and answer questions about your project. │
│                                                      │
│ [Try it: "Summarize this board"]  [Dismiss]          │
└──────────────────────────────────────────────────────┘
```

- Banner appears once, stored as `boardCopilot:onboarded` in `localStorage`.
- The CTA is a single deterministic prompt that opens the Chat tab and runs a brief.
- Dismissing hides forever but doesn't disable AI.

**Step 2: Contextual tooltips** (appear once per feature on first encounter)
- First time opening Draft: "Type a description and Board Copilot will fill in the details."
- First time seeing the assist panel: "Board Copilot suggests story points based on similar tasks."
- First time running a brief: "This summary updates every time you open it."
- Each tooltip has "Got it" to dismiss and "Don't show tips" to suppress all.

**Step 3: Empty-state sample prompts** (persistent, not one-time)
- Chat: three contextual chips (§5.2).
- Command palette AI mode: "What can Board Copilot do?" help panel on first entry.
- Brief on empty board: "Not enough data for a full summary yet. The brief gets better as the board grows."

### 6.2 Progressive Feature Revelation

Features surface based on usage maturity, not time:

| User Action | Feature Revealed |
|-------------|-----------------|
| Creates first task with AI | "Tip: You can also break tasks into subtasks" tooltip |
| Opens 3rd task modal | "Tip: Board Copilot can suggest story points" assist panel tooltip |
| Runs 2nd brief | "Tip: Copy as Markdown to share this summary" footer hint |
| Sends 5th chat message | "Tip: Use / in the command palette for quick AI actions" toast |
| Has 10+ tasks on board | Triage Inbox becomes visible in the right-rail tabs |

Each revelation is a single non-blocking tooltip or badge. Never a modal. Never blocking work.

### 6.3 Cold-Start States

Per v2.1 §3.5, every personalized surface has an explicit empty state:

| Surface | Cold-Start State |
|---------|-----------------|
| Chat | Three deterministic onboarding prompts: "What can Board Copilot do?", "Summarize this board", "Draft a sample task" |
| Brief | Structural counts + banner: "Not enough history for trends. The brief gets smarter as the board grows." |
| Estimation | Local engine heuristic + note: "Estimate based on board averages — accuracy improves with more tasks." |
| Inbox | "No nudges yet. Board Copilot checks for issues every 15 minutes." |
| History | "No AI actions yet. Changes made with Board Copilot will appear here." |
| Command palette AI mode | 30-second "What Copilot can do" help panel |

---

## 7. Accessibility Specification

### 7.1 ARIA Patterns Per Surface

| Surface | ARIA Pattern | Keyboard |
|---------|-------------|----------|
| Right-rail panel | `role="complementary"` with `aria-label="Board Copilot"` | `Cmd/Ctrl+Shift+C` toggle open/close |
| Tab bar | `role="tablist"` | `Left/Right` arrows switch tabs |
| Chat messages | `role="log"` with `aria-live="polite"` | `Tab` through messages |
| Streaming text | Wrapper with `aria-live="polite"` and `aria-atomic="false"` | — |
| Citation footnotes | `role="note"` per citation | `Tab` to focus, `Enter` to navigate to source |
| Mutation proposal | `role="alertdialog"` with `aria-live="assertive"` | Focus trapped; `Enter` accept; `Escape` reject |
| Inbox nudges | `role="feed"` with `role="article"` per nudge | `Tab` through nudges; `Enter` opens action |
| History entries | `role="log"` with `role="listitem"` per entry | `Tab` through entries; `Enter` expands |
| Confidence indicator | `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` | — |
| Sample prompt chips | `role="group"` of `role="button"` elements | `Tab` to focus, `Enter` to execute |
| Provenance badge | `aria-describedby` linking to popover content | `Enter` to open popover |

### 7.2 Focus Management

- All drawers/panels trap focus while open and return focus to the invoking control on close.
- Streaming text updates use `aria-live="polite"` — screen readers announce new content without interrupting.
- Mutation proposals use `aria-live="assertive"` — they interrupt because they require immediate attention.
- Sticky headers use `scroll-padding-top` to avoid occluding focused controls.
- Every interactive element ≥ 24×24 CSS px (WCAG 2.5.8). On `pointer: coarse` viewports, ≥ 44×44.

### 7.3 Reduced Motion

- All AI-specific animations (streaming cursor blink, citation pulse-highlight, skeleton fade, drawer slide) wrapped in `@media (prefers-reduced-motion: no-preference)`.
- With `prefers-reduced-motion: reduce`: streaming text appears instantly, citations highlight with a border change instead of animation, skeletons swap to static placeholders.

### 7.4 High Contrast / Forced Colors

- Confidence bars use both color and pattern fill (hatching for low confidence) so they're readable in `forced-colors: active`.
- AI sparkle icon has a fallback text label "AI" when icons are suppressed.
- Citation links maintain underline decoration in forced-colors mode.

---

## 8. Streaming & Loading States Specification

### 8.1 The Streaming Pipeline

Every AI surface follows this rendering pipeline:

```
Idle → Loading (skeleton) → Streaming (partial content) → Complete (final content)
                ↓                                              ↓
            Error (with retry)                          Error (with retry)
```

**Skeleton phase:** Content-shaped placeholders matching the final layout. Shows after a 250ms delay (throttled spinner) to avoid flash on fast local engine responses.

**Streaming phase:** For text responses, tokens render with a blinking cursor. For structured responses (estimation, brief), fields populate progressively — skeleton lines swap to real content as each field resolves.

**Complete phase:** Blinking cursor removed. Full content visible. Confidence indicators, citations, and action buttons appear.

**Error phase:** Inline `<Alert type="warning">` with:
- Specific error message (not generic "Something went wrong")
- Suggested next step ("Try again" / "Rephrase your question" / "Check your connection")
- Retry button (only when `retryable: true`)

### 8.2 Loading States by Surface

| Surface | Skeleton | Streaming | Error |
|---------|----------|-----------|-------|
| Chat message | Three-line paragraph skeleton | Token-by-token text | "Couldn't generate a response. [Retry]" |
| Estimation | Number skeleton + tag skeleton | Number appears, then confidence bar fills | "Couldn't estimate — [Retry] or enter manually" |
| Readiness | Three-row list skeleton | Issues appear one by one | "Readiness check unavailable — [Retry]" |
| Brief | Headline skeleton + table skeleton + list skeleton | Sections populate top-to-bottom | "Brief unavailable — [Retry]" |
| Search results | Three-row list skeleton | Results appear as found | "Search failed — [Clear] or try different keywords" |
| Draft modal | Full form skeleton | Fields populate one by one | "Couldn't draft a task — you can still create one manually" |

### 8.3 Abort Behavior

- Closing a panel/drawer/modal aborts the in-flight request via `AbortController`.
- Partial content from a streaming response is preserved and shown with a "Response was cut short" note.
- Abort on navigation: if the user navigates away, in-flight AI requests are aborted. No orphaned requests.

---

## 9. Analytics & Feedback Specification

### 9.1 Event Taxonomy

All events flow through the existing `track(event, payload)` no-op hook in `src/constants/analytics.ts`. Event names:

| Event | Payload | Metric |
|-------|---------|--------|
| `copilot.chat.send` | `{ projectId, promptLength, hasAttachment }` | Chat adoption |
| `copilot.chat.regenerate` | `{ projectId, turnIndex }` | Regeneration rate |
| `copilot.chat.feedback` | `{ projectId, turnIndex, rating: "up"/"down", reason? }` | M14 — Text answer quality |
| `copilot.citation.click` | `{ projectId, sourceType, sourceId }` | Citation engagement |
| `copilot.citation.flag` | `{ projectId, sourceType, sourceId }` | M15 — Citation relevance |
| `copilot.estimate.apply` | `{ projectId, taskId, suggested, confidence }` | M3 — Estimation acceptance |
| `copilot.estimate.reject` | `{ projectId, taskId, suggested, confidence }` | Estimation rejection rate |
| `copilot.brief.open` | `{ projectId }` | M4 — Brief usage |
| `copilot.brief.copy` | `{ projectId, format: "markdown" }` | Brief utility |
| `copilot.draft.submit` | `{ projectId, fieldCount, modifiedFields }` | M1, M2 — Drafting adoption/quality |
| `copilot.proposal.accept` | `{ projectId, proposalId, tool, risk }` | M8 — Acceptance rate |
| `copilot.proposal.reject` | `{ projectId, proposalId, tool, risk }` | Rejection rate |
| `copilot.proposal.undo` | `{ projectId, proposalId, tool, secondsElapsed }` | M9 — Undo rate |
| `copilot.inbox.read` | `{ projectId, nudgeType }` | M10 — Inbox engagement |
| `copilot.inbox.act` | `{ projectId, nudgeType, action }` | M12 — Drift catches |
| `copilot.palette.invoke` | `{ mode: "navigate"/"ai", command? }` | M11 — Palette adoption |
| `copilot.rewrite.accept` | `{ projectId, taskId, mode }` | Rewrite adoption |
| `copilot.onboarding.dismiss` | `{ step }` | Onboarding completion |
| `copilot.onboarding.cta` | `{ step, action }` | Onboarding engagement |

### 9.2 Success Metrics (extends v2.1 §11)

| Metric | Target | Measurement |
|--------|--------|-------------|
| M1 — Drafting adoption | ≥40% of new tasks created via AI draft (among AI-on users, 4 weeks post-GA) | `copilot.draft.submit / total task creates` |
| M2 — Draft quality | ≥30% of drafted tasks submitted without modifying any AI field except `taskName` | `copilot.draft.submit where modifiedFields ≤ 1` |
| M3 — Estimation acceptance | ≥25% of estimation panel opens result in Apply | `copilot.estimate.apply / panel opens` |
| M4 — Brief usage | Median ≥2 briefs / active board / week | `copilot.brief.open` per board per week |
| M8 — Proposal acceptance | ≥70% per tool before Auto promotion | `copilot.proposal.accept / (accept + reject)` |
| M9 — Undo rate | ≤5% per tool | `copilot.proposal.undo / copilot.proposal.accept` |
| M10 — Inbox engagement | ≥40% of nudges read per week | `copilot.inbox.read / nudges generated` |
| M11 — Palette adoption | ≥50% of AI invocations from palette vs buttons (4 weeks post-GA) | `copilot.palette.invoke(ai) / total AI invocations` |
| M14 — Text answer quality | ≥80% thumbs-up rate | `copilot.chat.feedback(up) / total feedback` |
| M15 — Citation relevance | ≥90% not flagged as irrelevant | `1 - (copilot.citation.flag / copilot.citation.click)` |
| **M16 — Onboarding completion** (new) | ≥60% of new users complete at least one AI action in first session | `copilot.onboarding.cta / new users with AI on` |
| **M17 — Time to first AI value** (new) | Median <3 minutes from AI enable to first meaningful AI interaction | Timestamp delta: `boardCopilot:enabled` → first `copilot.*.send/submit/open` |
| **M18 — Streaming perceived latency** (new) | p50 time-to-first-token <1.2s, p95 <2.5s | Client-side measurement on first `text` event |

---

## 10. Phased Rollout (extends v2.1 §9.2)

### Phase UX-A: Foundation (ships with v2.1 Phase A–B)

- [ ] Unified right-rail panel with Chat + Brief tabs
- [ ] Sample prompt chips (deterministic, cache-driven)
- [ ] Streaming text rendering in Chat
- [ ] Skeleton loading states on all AI surfaces (250ms throttled)
- [ ] Confidence bands (High/Moderate/Low) replace raw percentages
- [ ] "Sources (N)" citations on Chat and Brief
- [ ] Character counter on Chat input
- [ ] `Suggested by Copilot` badge on Apply
- [ ] Onboarding welcome banner (first-time)
- [ ] Cold-start empty states for all surfaces
- [ ] Correct estimation debounce to 1000ms (per PRD)
- [ ] Replace raw checkbox in draft modal with AntD `<Checkbox>`
- [ ] Add `aria-live` to AI assist panel
- [ ] Consistent sparkle icon padding via design tokens

### Phase UX-B: Trust & Feedback (ships with v2.1 Phase C–D)

- [ ] Mutation preview with visual diff (§5.8)
- [ ] History tab with Action History
- [ ] Toast Undo (10s) on every accepted mutation
- [ ] Inbox tab with triage nudges
- [ ] Thumbs-up/down on Chat answers
- [ ] "Why?" expandable rationale on estimation
- [ ] "What is shared?" panel in Settings
- [ ] Regenerate button on Chat answers
- [ ] Brief "What changed" headline
- [ ] Brief footer actions (Copy Markdown, Save as note)
- [ ] Contextual onboarding tooltips
- [ ] Low-confidence behavior (alternative display, "verify manually" language)

### Phase UX-C: Power Features (ships with v2.1 Phase E–F)

- [ ] Command palette AI mode with slash commands
- [ ] "Rewrite with AI" on task note editor
- [ ] Breakdown axis picker (by phase/surface/risk/freeform)
- [ ] Attach-selection in Chat (board lasso → context)
- [ ] Session persistence toggle + session list
- [ ] Citation flag-as-irrelevant
- [ ] "Wrong because..." textarea on thumbs-down
- [ ] Search "Did you mean...?" reformulations
- [ ] Progressive feature revelation (§6.2)
- [ ] Mobile bottom-sheet variant for AI panels
- [ ] Shadow mode UI for admins

---

## 11. Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Unified right-rail panel feels cramped on 1024px screens | Medium | Panel collapses to an icon bar at `md`; full panel at `lg+`. Bottom sheet on mobile. |
| Users ignore confidence bands and treat all AI output as fact | High | Low-confidence outputs require explicit "Apply anyway" action. Onboarding explains what confidence means. |
| Streaming rendering causes layout shift | Medium | Skeletons match final layout dimensions. Content container has `min-height`. Test CLS < 0.1. |
| Onboarding tooltips feel patronizing to power users | Low | "Don't show tips" option on first tooltip. Tips stored per-user, not per-session. |
| Citation click-through breaks flow (scrolls away from panel) | Medium | Citation opens in the main view while panel stays visible. Pulse-highlight is subtle (1s). |
| Toast Undo window (10s) is too short for complex changes | Medium | Bulk proposals show "Review Each" option before applying. History shows full details for manual reversal. |
| Thumbs-down feedback is sparse (users don't bother) | Medium | Thumbs-down is one click (minimum friction). Optional textarea is progressive disclosure. Show "Thanks — this helps" to reinforce. |
| Chat session persistence increases server storage | Low | Opt-in per project. Auto-expire threads after 30 days. Capped at 50 turns per thread. |

---

## 12. Open Questions

| # | Question | Lean |
|---|----------|------|
| OQ-V3-1 | Should the right-rail panel be resizable by the user? | No for v3. Fixed 420px. Resizable in v4 if requested. |
| OQ-V3-2 | Should "Rewrite with AI" show a word-level diff or line-level diff? | Line-level for notes > 3 lines; plain new text for shorter. Word-level is noisy. |
| OQ-V3-3 | Should confidence bands be visible on Chat answers or only on structured outputs? | Only on structured outputs (estimation, brief). Chat uses language cues. |
| OQ-V3-4 | Should the onboarding welcome banner appear on the board page or the project list? | Board page — that's where the AI features live. |
| OQ-V3-5 | Should citation pulse-highlight animate the task card on the board or scroll to it? | Scroll into view + 1s pulse-highlight border. Don't animate the card itself. |
| OQ-V3-6 | Should "Save to task note" on Chat answers append or replace the existing note? | Append with a horizontal rule separator. Never replace without confirmation. |

---

## 13. Appendix A — AI UX Red Flags Checklist

Use this checklist during design review of any AI surface. If any item is checked, the surface needs a redesign before shipping.

- [ ] **Presents AI output as factual** without confidence indicator or hedging language
- [ ] **Shows raw confidence percentage** without plain-language band or explanation
- [ ] **Makes AI changes without user consent** (mutation without proposal/accept)
- [ ] **Hides what data was used** — no citations, no "What is shared?" transparency
- [ ] **Uses anthropomorphic language** ("I think", "I understand", "I feel")
- [ ] **Dumps all features at once** — no progressive disclosure for new users
- [ ] **Shows blank/empty state** without guidance on what to do next
- [ ] **Exposes tool/function names** to end users (e.g., `getProject`, `listTasks`)
- [ ] **Has no feedback mechanism** — user cannot indicate quality of AI output
- [ ] **Has no undo** — AI-initiated change cannot be reversed
- [ ] **Fails silently** — error shows generic message with no next step
- [ ] **Blocks the primary flow** — AI error prevents manual workflow
- [ ] **Has no loading skeleton** — shows spinner instead of content-shaped placeholder
- [ ] **Lacks keyboard accessibility** — AI surface not reachable via keyboard
- [ ] **Missing `aria-live`** on dynamically updating AI content
- [ ] **Same surface on mobile** — drawer/modal not adapted for small viewports

---

## 14. Appendix B — Mapping to Design Frameworks

### Nielsen's 10 Usability Heuristics

| Heuristic | v3 Coverage |
|-----------|-------------|
| H1 — Visibility of system status | Streaming rendering, skeleton loading, confidence indicators, "Copilot is offline" banner |
| H2 — Match real world | Confidence bands use plain language ("High/Moderate/Low"), not raw numbers. Microcopy avoids jargon. |
| H3 — User control & freedom | Undo on every mutation, Escape to cancel, Regenerate on chat, Revert on applied suggestions |
| H4 — Consistency & standards | Unified right-rail, standardized confidence UI, consistent provenance badges, design tokens |
| H5 — Error prevention | Character counter, low-confidence warnings, "Apply anyway" friction on uncertain outputs |
| H6 — Recognition over recall | Contextual sample prompts, citation deep-links, History tab for past actions |
| H7 — Flexibility & efficiency | Command palette, keyboard shortcuts, slash commands, configurable autonomy |
| H8 — Aesthetic & minimalist | Tool internals hidden by default, collapsible sections, focused empty states |
| H9 — Help recover from errors | Specific error messages with next steps, Retry buttons, "Couldn't X — you can Y manually" |
| H10 — Help & documentation | Onboarding banner, contextual tooltips, "What can Copilot do?" help panel |

### Conversational AI Resilience Framework (Attrill 2026)

| Layer | v3 Coverage |
|-------|-------------|
| **Stability** — structural resilience | Session persistence, abort on unmount, explicit offline banner, no data loss on failure |
| **Focus** — cognitive load management | Unified panel (not 4 drawers), collapsible sections, max 5 inbox nudges, 3 sample prompts |
| **Clarity** — conversational transparency | Confidence bands, citations with required quotes, "What is shared?" panel, provenance badges |
| **Agency** — interaction flexibility | Accept/Edit/Reject on proposals, Regenerate, Revert on suggestions, Escape always cancels |

### WCAG 2.2 AA Coverage

| Criterion | v3 Specification |
|-----------|-----------------|
| 2.4.11–13 Focus | §7.2 Focus management rules |
| 2.5.7 Dragging | Existing dnd keyboard support; AI surfaces do not use drag |
| 2.5.8 Target Size | ≥24px CSS, ≥44px on coarse pointer |
| 3.3.1 Error Identification | Specific error messages per surface (§8.2) |
| 4.1.3 Status Messages | `aria-live` on all dynamic AI content (§7.1) |

---

## 15. Appendix C — Competitive UX Feature Matrix

| Feature | Board Copilot (current) | Board Copilot (v3) | Linear | Jira (Rovo) | Notion AI |
|---------|------------------------|-------------------|--------|-------------|-----------|
| AI task drafting | ✅ | ✅ + provenance badges | ❌ | ✅ | ✅ |
| Story-point estimation | ✅ | ✅ + confidence bands + alternatives | ❌ | ❌ (marketplace) | ❌ |
| Board summary | ✅ | ✅ + "what changed" headline + charts | ❌ | ❌ | ❌ |
| Conversational assistant | ✅ (basic) | ✅ + citations + streaming + feedback | ❌ | ✅ (Rovo Chat) | ✅ |
| Semantic search | ✅ (Jaccard) | ✅ + embeddings + reformulations | ✅ | ✅ | ✅ |
| Inline rewrite | ❌ | ✅ (side panel) | ❌ | ❌ | ✅ (inline) |
| AI triage / nudges | ❌ | ✅ (Inbox) | ✅ (AI Triage) | ✅ (Rovo Agents) | ❌ |
| Command palette + AI | ❌ (nav only) | ✅ (Phase UX-C) | ✅ | ❌ | ✅ |
| Mutation proposals + undo | ❌ | ✅ + visual diff + toast undo | ✅ (Agent beta) | ✅ (Workflow) | ❌ |
| Confidence indicators | Partial (raw %) | ✅ (calibrated bands) | ❌ | ❌ | ❌ |
| Citations | ❌ | ✅ (mandatory) | ❌ | ❌ | ✅ |
| Thumbs feedback | ❌ | ✅ | ❌ | ❌ | ✅ |
| Keyboard-first AI | ❌ | ✅ | ✅ | ❌ | ✅ |
| Mobile AI | ❌ (same as desktop) | ✅ (bottom sheet) | ✅ | ✅ | ✅ |
| Session persistence | ❌ | ✅ (opt-in) | ✅ | ✅ | ✅ |
| Onboarding | ❌ | ✅ (progressive) | Minimal | Tutorial | Minimal |

---

## 16. Bottom Line

v1 built the infrastructure. v2.1 defined the agentic backend. v3 builds the experience that earns trust.

The seven design moves — confidence UI, mandatory citations, progressive onboarding, streaming-first rendering, unified surface architecture, mutation previews, and feedback loops — are not decorative polish. They are the difference between an AI feature users tolerate and an AI assistant users rely on.

Every move is grounded in concrete research: the Confidence UI pattern that turns uncertainty into a trust multiplier (Modexa 2026), the Conversational AI Resilience Framework that prevents black-box fatigue (Attrill 2026), the progressive disclosure evidence that front-loaded features drive churn (Appcues 2026, IxDF 2026), and the competitive reality that Linear and Notion ship AI features that feel native while most tools feel bolted-on.

Board Copilot's competitive advantage is not having more AI features than competitors — it's having AI features that users trust, understand, and can verify. v3 is how we get there.
