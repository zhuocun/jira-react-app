# PRD: Board Copilot v2 — Agentic AI for `jira-react-app`

| Field             | Value                                                                                                                                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status            | Draft v2 — **superseded by [`board-copilot-v2.1-agent.md`](board-copilot-v2.1-agent.md)**. Retained as historical context for the v2 → v2.1 design review. v1 capabilities ship as the fallback experience.                         |
| Author            | Product (this document is a PM-style review and redesign of the existing v1 Board Copilot)                                                                                                                                          |
| Last updated      | 2026-04-30                                                                                                                                                                                                                          |
| Target repository | `jira-react-app` (frontend) + a Python agent server hosted at `${REACT_APP_AI_BASE_URL}` (out of repo) reachable through the existing `${REACT_APP_AI_BASE_URL}/api/ai/*` seam                                                      |
| Document scope    | Product critique of v1, redesigned AI surfaces, FE↔BE agent / tool-calling contract, governance & rollout. Engineering specifics for the Python server are limited to the wire contract; server internals are intentionally opaque. |
| Companion docs    | [`board-copilot.md`](board-copilot.md) (v1 design), [`board-copilot-progress.md`](board-copilot-progress.md), [`board-copilot-review.md`](board-copilot-review.md), [`ui-ux-optimization-plan.md`](../ui-ux-optimization-plan.md)   |

---

## 1. TL;DR

Board Copilot v1 shipped the right _infrastructure_ (env flag + runtime toggle, single hook, deterministic local engine, advisory-only writes, cache-validated ids) but left almost every product opportunity on the table. The five "capabilities" are five disconnected one-shot prompt surfaces; the conversational assistant is regex-routed and read-only; the "remote" path is just a JSON POST to a server that does not yet exist; nothing in the system actually _does work_ on the user's behalf.

v2 reframes Board Copilot around three product moves:

1. **One agent, many surfaces.** Replace the five disconnected hooks with a single agent loop hosted on the Python server. Every existing surface (Brief, Draft, Estimate, Readiness, Chat, Search) becomes a _tool_ or a _preset prompt_ against the same agent.
2. **FE↔BE tool calling, both directions.** The agent owns planning. The server hosts knowledge tools (LLM, semantic similarity, embeddings, summarisation, optional Slack/Confluence post). The browser hosts board tools (read caches, propose mutations, navigate UI, attach selection). A typed JSON-RPC-shaped protocol carries tool calls in either direction over a single SSE stream.
3. **Progressive autonomy with first-class undo.** A four-step _autonomy dial_ (`Suggest`, `Plan`, `Act with confirmation`, `Act and notify`) replaces today's binary toggle. Every agent-initiated mutation is logged in a per-board _Action Audit_ drawer with a one-click undo (toast within 10 seconds, drawer entry within 24 hours). No mutation ships in v1 of v2 without explicit confirm; autonomous execution is gated on per-tool reliability metrics.

Net effect: v1's "AI button next to a form" becomes "an assistant that watches the board, proposes plans, executes with consent, and is reversible." Nothing in v1 is removed — every existing capability keeps its v1 fallback behind the same `boardCopilot:enabled` flag.

---

## 2. Why v1 needs a redesign — issues and verdicts

This section is the PM-side audit. Each item cites the responsible file or PRD section so a reader can verify against `main`.

### 2.1 Architectural / product-shape issues

1. **The "AI assistant" is regex-routed, not language-modelled, when local.**
   `src/utils/ai/chatEngine.ts:71–192` dispatches tools by `toLowerCase().match(...)` against the last user message. There is no LLM, no planning, no follow-up reasoning. The "tool calls" in `src/utils/ai/chatTools.ts:52–122` are immediately wrapped by `summarizeToolResultForUser` (`chatEngine.ts:210–283`) which prints the raw shape of the response. End-users effectively get a curl-to-markdown wrapper, not an assistant. The remote `/api/ai/chat` proxy is an optional drop-in — but no server implements it (PRD §7.2 / progress doc §"Backend"). The product as it ships is a deterministic templater.

2. **Five disconnected one-shot prompts.**
   `useAi` (`src/utils/hooks/useAi.ts:63–289`) supports six routes (`task-draft`, `task-breakdown`, `estimate`, `readiness`, `board-brief`, `search`); chat lives in a separate `useAiChat` hook. There is no shared "session" object, no cross-surface memory, no way for the user to say _"draft three subtasks like the last one I created and give the small one to whoever has the lightest workload"_ — that crosses three surfaces and the v1 architecture cannot express it.

3. **Reads only, mutations never.**
   PRD §3.3 N1 explicitly forbids autonomous mutation. v1 honours this everywhere: every chat tool is read-only (`chatTools.ts:5–12`) and every "Apply" button hands the value to `Form.setFieldsValue` so the user must Submit (`aiTaskAssistPanel:223–232`, `taskModal` apply callback). This is a defensible v1 posture, but in 2026 it is below market expectations:
    - Atlassian's Rovo agents in Jira can be assignees and run inside workflows (Rovo product page, Apr 2026).
    - Linear Agent (beta) closes stale issues, requests updates on blocked work, merges duplicates, decomposes large issues.
    - ClickUp Brain MAX runs scheduled "Project Manager" digests.
      "Advisory only" is the right _default_; "advisory only forever" is leaving the entire automation half of the market on the table.

4. **No agent loop, no plans, no provenance.**
   The PRD's §6.1 talks about streaming and §7.1 lists `useCallback` and `AbortController`, but nowhere does it describe the **plan → act → observe → repeat** loop that defines an agent. There is no surfaced reasoning trace, no "Sources" panel, no citation back to the cache slice or task that grounded an answer. The brief returns a one-line `recommendation` field but never says _which_ task or member the recommendation cites, and the Drawer does not deep-link the recommendation. Confidence is rendered as a number plus a "Why?" tooltip with a string (`aiTaskAssistPanel:213–222`) — there is no expandable reasoning.

5. **Two hooks, two transports, drifting types.**
   The PRD originally proposed a single `useAi` (PRD §7.1). The implementation splits structured calls (`useAi`) from chat (`useAiChat`) with a different remote contract (`POST /api/ai/chat` returns `{ kind: "text" | "tool_calls", ... }` whereas `POST /api/ai/<route>` returns the route-shaped JSON). The `AiRoute` union does not include `chat`. Every new feature has to choose a side. Review doc §4 already calls this out as an "intentional deviation"; v2 closes it.

6. **The Python server is not actually used by anything.**
   `progress.md` §"Backend" admits there are no `api/` routes, and the FE remote contract is a placeholder. The user's stated motivation here ("I have a Python server that supports the agent's features") is not honoured by v1 because v1's contract is N route handlers, each duplicating the local engine. v2 makes the server the _only_ path that the agent can take, and the local engine becomes a deterministic fallback for the read-only surfaces only.

7. **Validation is one-way.**
   `validate.ts` cross-checks every model-returned id against the cache, which is correct (PRD §5.1.4 / §5.2.4 / §5.4.3). But the agent has no equivalent on the _input_ side: the request to the model includes the entire `tasks`/`columns`/`members` arrays as `context` (see `useAi.ts:135–186`), unbounded by token budget on the FE. For projects with hundreds of tasks the local engine quietly truncates; the remote path does not, and there is no cost cap announced to the user.

8. **No memory across surfaces.**
   `useAiChat` keeps `messages` in component `useState` only (`useAiChat.ts:64`), which the PRD calls a feature (AC-D4: conversation cleared on hard reload). For an _assistant_, this is a regression vs. industry baseline (Linear, Asana, ClickUp all persist threads). The "right to silence per project" requirement (PRD §8) can be satisfied alongside per-project, opt-in persistence; the two are not mutually exclusive.

9. **Per-project disable is rule, not nuance.**
   `useAiProjectDisabled` is the only granularity below the global toggle. Users want to disable AI _for one task type_ (e.g. "do not draft customer-facing copy") or _for one autonomy level_ (e.g. "let it propose, never let it act"). v1 cannot express this.

### 2.2 Surface-level UX issues

10. **Brief does not ship anywhere.**
    `BoardBriefDrawer` (`src/components/boardBriefDrawer/`) renders a structured brief inside a Drawer with deep-links into the task modal — and that's it. There is no "Copy as markdown", "Post to Slack", "Save as task note", "Email me at 09:00 daily", or "Add to Confluence". The brief is the obvious vector for proactive notifications and it is currently inert.

11. **Chat dumps tool internals.**
    Even with the recent "Show details" toggle (`aiChatDrawer.tsx:127–148`), the underlying messages list still carries `role: "tool"` entries with raw JSON-shaped strings (`chatEngine.ts:210–283`). End-users should see a _summary_ (e.g., "Looked at 3 tasks in Backlog") and a _footnote_ (e.g., "based on tasks #abc, #def"); they should not see `\`getProject\``or`\`listTasks\`` ever, even behind a toggle. Tool calls are observability for builders, not affordance for users.

12. **Estimation "Apply" is invisible after one tap.**
    The `Apply` button at `aiTaskAssistPanel:223–232` writes to the form and disappears into the form value. There is no `Suggested by Copilot` badge until the user edits, no "Why this number?" popover citing the similar tasks that produced it, no easy revert. (UI/UX plan 2.A.8 already proposes this; v2 makes it canonical.)

13. **Draft modal is opinionated about subtasks.**
    `breakdownTask` (`engine.ts:208–233`) hard-codes subtask verbs `Investigate / Implement / Add tests for / Document / Polish UX of` and a "halve the points" rule (`storyPoints: clampToFibonacci(Math.max(1, Math.round(base.storyPoints / 2)))`). The user has no say in the breakdown axis (by phase? by surface? by risk?), and the same breakdown is produced for every prompt regardless of domain. The remote LLM path inherits this only if the server returns the same shape; the local fallback is locked in.

14. **Semantic search has no learning, no synonyms, no embeddings.**
    `semanticSearch` in `engine.ts:478–550` is Jaccard over `tokenize`. Querying _"auth bugs caused by token expiry"_ on a board whose task notes say "session", "JWT", "logout", or "401" yields nothing because none of those tokens overlap. Industry baseline (Asana Smart Search, Linear) is sentence-embedding similarity. The UI has no "no results — did you mean…" affordance; it just shows the unfiltered list with a muted Alert (`AiSearchInput`).

15. **Sample prompts are decorative.**
    `aiChatDrawer.tsx:23–27` carries three hardcoded sample prompts with no taxonomy ("What's at risk?", "Who has the most open tasks?", "Summarize this board"). They never grow with usage, never localise, and never reflect the user's recent activity. Industry assistants (Linear, Asana) personalise sample prompts from project state.

16. **No agent-initiated triage.**
    All AI is _pulled_ — the user has to click Brief, Ask, or Draft. There is no proactive surface for "two tasks were just dropped to Backlog without an estimate", "the largest unstarted task is now blocking three smaller ones", or "Maya has shipped 0 tasks this week and 8 in flight". Linear's AI Triage and ClickUp Brain bridge exactly this gap; v1 does not.

17. **Brief headline is a count.**
    `boardBrief` produces `"${totalTasks} tasks on the board, ${inProgress} in progress."` (`engine.ts:434`). For the user's first scroll-stop signal, a count is a poor lede. The headline should be _the most surprising thing about this board today_: "1 unowned bug filed in the last 24h", "Maya has 3× the average load", "WIP in Doing exceeds your usual cap", etc.

18. **Search has no "agent search".**
    There is no way to ask the agent _"find anything that looks like a regression of #abc and surface only the top 3"_. v1 either runs Jaccard locally or POSTs to a single-route remote search. The agent could combine semantic, structural (same epic, same coordinator), and temporal (created in the last sprint) signals; v1 cannot.

19. **No keyboard / command palette.**
    UI/UX plan §2.A.9 already specifies `Cmd/Ctrl+K`. v1 ships none of it. The command palette is the natural primary surface for the agent and would unify Brief / Ask / Draft / Search behind one input.

20. **Inline AI is missing where it would be most useful.**
    The task editor's `note` textarea has no slash-command, no `/copilot rewrite as user story`, no inline expand. The column header has no `+ task with AI` shortcut. The brief has no "Schedule this digest". Each of these is a one-tool agent invocation, and each removes one Drawer-open from the user's flow.

### 2.3 Trust, governance, and metrics issues

21. **Autonomy is binary.**
    Today: AI on, AI off. v2: a four-step dial per workspace, with optional per-tool override (Section 6.1). This is the dominant 2026 pattern (Smashing UX Designing for Agentic AI Feb 2026; AI UX Design Guide "Autonomy Spectrum"; Anthropic case study on HITL).

22. **No undo for any AI action.**
    Because v1 has no AI-initiated mutations, undo is moot for now. v2 explicitly defines an Action Audit + Undo for _every_ mutation initiated through the agent (Section 6.2). Without this, the autonomy dial is unsafe to ship.

23. **No success metrics in product.**
    PRD §13 lists M1..M7 (adoption, quality, estimation acceptance, brief usage, reliability, safety, coverage). Nothing in `main` emits `web-vitals`-style events for AI-initiated actions today (search `rg "track\\(|web-vital" src/utils/ai` returns nothing). Without telemetry, the autonomy dial cannot promote a tool from "Plan" to "Act", which is the whole point of having the dial.

24. **No spend cap and no PII redaction.**
    PRD §8 talks about "no PII in logs" and §9 talks about per-IP rate limits, but the FE has no surfaced spend telemetry, no per-project budget, and no client-side redaction layer (e.g. for emails / hex secrets) before payload leaves the browser.

25. **Localisation never modelled.**
    Prompts in `chatEngine.ts` are English-only regex (`/\\b(list|show|all)\\s+projects\\b.../`). The agent's outputs are also English-only. UI/UX plan §2.A.6 calls out i18n readiness for the broader app; v2 must extend that to AI outputs.

### 2.4 Pre-existing test failures on `main`

26. **5 tests fail on a clean checkout** (review doc §7). Three of them touch AI surfaces directly (`AiTaskAssistPanel`, `TaskModal Board Copilot assist panel`). v2 does not introduce new test debt, and we re-baseline these tests as part of Section 8.4.

---

## 3. Personas (carry over from v1, with refined needs)

- **Maya, IC engineer.** Wants drag-and-drop creation, smart estimation that learns, and an inline `/copilot` slash command in the task note so she never leaves the editor.
- **Devon, tech lead.** Wants a daily 09:00 digest in Slack he can confirm-or-reroll, an "agent-as-triage" that pre-tags new bugs, and a one-click "rebalance Maya → Priya" suggestion he can accept or reject.
- **Priya, product manager.** Wants a chat that remembers her last three questions on this board, can re-run the same question on a different project, and can save its answer as a task note.
- **Ari, IT/admin.** Wants a workspace-level autonomy dial, a per-project disable, an _audit log_ of every agent mutation with reversible windows, an exportable JSON of what data left the browser, and a per-project monthly spend cap.

---

## 4. Goals and non-goals (v2 of Board Copilot)

### 4.1 Goals

- **G1 — One agent, one transport.** Every AI feature is a tool call against the same agent endpoint, streamed over SSE, with a stable wire schema (Section 5).
- **G2 — Proper FE↔BE tool calling.** The browser exposes a typed tool registry to the agent (Section 5.4); the server exposes a typed tool registry to the browser (Section 5.5). Tool calls flow in either direction over the same stream (Section 5.3).
- **G3 — Progressive autonomy with undo.** A four-step autonomy dial governs whether the agent suggests, plans, acts with confirmation, or acts and notifies. Every mutation is undoable (Section 6).
- **G4 — Smart, proactive surfaces.** The agent watches the board (drift detection), surfaces nudges in a non-blocking inbox, and can be invoked from a `Cmd/Ctrl+K` palette (Section 7).
- **G5 — Observable trust.** Agent provenance (which tools ran, on which inputs, with what confidence) is one click away from every suggestion (Section 8.2). Workspace admins see an Action Audit log and a spend dashboard (Section 8.3).
- **G6 — No regression on the v1 fallback.** With `REACT_APP_AI_BASE_URL` empty, the local engine continues to power Brief / Draft / Estimate / Readiness / Search exactly as today (Section 9).

### 4.2 Non-goals (v2)

- N1 — Multi-tenant model-key management. The Python server holds one provider key per deployment.
- N2 — Voice / speech-to-text composer. Reserved for v2.1.
- N3 — Replacing the Python server's prompt-engineering with a configurable prompt UI for end-users. v2 keeps prompts server-owned (mitigates injection).
- N4 — Real-time multi-user collaboration on agent outputs (CRDT / Yjs). Single-user threads only.
- N5 — Cross-project agent context. The agent's plans must respect per-project disable; cross-project queries (e.g. "tasks across all my projects assigned to me") are explicit and require the user to be on the project list page.
- N6 — Replacing `@hello-pangea/dnd` with an AI-driven drag-and-drop. Out of scope.

---

## 5. Architecture — agent, transport, and tools

### 5.1 Agent placement

The agent **lives on the Python server**. The browser is its _eyes and hands_: it provides cache-validated context, executes UI-side tool calls (e.g. `selectTask`, `proposeMutation`, `openModal`, `attachSelection`), and renders streaming output. The server provides knowledge tools (LLM, embeddings, summarisation, optional Slack/Confluence sinks) and owns the planning loop.

Why not put the agent on the FE: token cost, IP exposure of the system prompt, and the inability to enforce per-IP rate limits and PII redaction client-side.

Why not put planning on a Vercel function: the server is already in the user's stack; consolidating the loop, the rate limits, and the audit log on a single host is cheaper than fanning out to N stateless functions per turn.

### 5.2 Single transport

One endpoint:

```
POST  ${REACT_APP_AI_BASE_URL}/api/ai/agent
Accept: text/event-stream
Content-Type: application/json
Authorization: Bearer <jwt>     ← reuses src/utils/aiAuthHeader.ts
```

The request body opens a _session turn_. Each turn is a stream of JSON events (one event per SSE `data:` line) until the server emits `event: end`. Within a turn, the server may call back to the browser via `tool_call` events, and the browser replies in-line via `tool_result` events sent on the same persistent connection (or, if the FE proxy disallows SSE upstream, via a follow-up `POST /api/ai/agent/<sessionId>/tool_result`).

Wire shape (TypeScript):

```ts
type AgentEvent =
    | {
          type: "session";
          sessionId: string;
          autonomy: AutonomyLevel;
          budget: { tokensRemaining: number; usdRemaining: number };
      }
    | {
          type: "plan";
          steps: Array<{
              tool: ToolName;
              rationale: string;
              risk: "low" | "med" | "high";
          }>;
      }
    | {
          type: "tool_call";
          callId: string;
          tool: ToolName;
          arguments: Record<string, unknown>;
          confirm: boolean;
      }
    | { type: "text"; delta: string } // streamed assistant text token-by-token
    | {
          type: "citation";
          refs: Array<{
              kind: "task" | "column" | "member" | "project";
              id: string;
              quote?: string;
          }>;
      }
    | {
          type: "suggestion";
          surface:
              | "draft"
              | "estimate"
              | "readiness"
              | "brief"
              | "search"
              | "triage";
          payload: unknown;
      }
    | {
          type: "mutation_proposal";
          proposalId: string;
          description: string;
          diff: MutationDiff;
          risk: "low" | "med" | "high";
          undoable: true;
      }
    | { type: "error"; message: string; retryable: boolean }
    | { type: "usage"; tokensIn: number; tokensOut: number; usd: number }
    | { type: "end" };

type ClientEvent =
    | { type: "tool_result"; callId: string; ok: true; payload: unknown }
    | { type: "tool_result"; callId: string; ok: false; error: string }
    | {
          type: "decision";
          proposalId: string;
          choice: "accept" | "reject";
          editedDiff?: MutationDiff;
      }
    | { type: "abort" };
```

Notes:

- All ids in `tool_call.arguments`, `citation.refs`, and `mutation_proposal.diff` are validated client-side against the React Query cache before the FE acts on them. Identical guarantee to v1 (PRD §8 "Hallucinated id rejection"), now applied to _every_ event, not just the structured-output validators.
- `confirm: true` on a `tool_call` halts execution until the user accepts. `confirm: false` is allowed only for the FE-side **read** tools listed in Section 5.4.1.
- `suggestion` carries the same shapes v1 already validates (`IDraftTaskSuggestion`, `IBoardBrief`, `IEstimateSuggestion`, `IReadinessReport`, `ISearchResult`); these become _one_ of the things the agent can emit, not the only thing.

### 5.3 Bidirectional tool flow (illustrated)

User on board page types "Rebalance the workload — move two of Maya's lowest-priority tasks to whoever has the lightest load."

```
FE ──turn open────────────────────────────────────────────────────► server
   { messages: [...], autonomy: "act_with_confirmation", projectId, selection: [] }

server ──{ type: "session", sessionId, autonomy, budget } ─────────► FE
server ──{ type: "plan", steps: [listTasks, getMember workload, proposeMoves] } ─► FE
server ──{ type: "tool_call", tool: "fe.listTasks", args: { projectId, coordinatorId: "maya" }, confirm: false } ─► FE
FE ─────{ type: "tool_result", payload: ITask[] (cache hit, no network) } ──────► server
server ──{ type: "tool_call", tool: "be.workloadByMember", args: {...}, confirm: false } ─► (server-internal)
server ──{ type: "text", delta: "Maya has 11 pts open; lightest load is Priya (3 pts)." } ► FE  (streamed)
server ──{ type: "mutation_proposal", proposalId, diff: { taskUpdates: [{taskId, coordinatorId: priya._id}, ...] }, risk: "med" } ► FE
FE renders a side-by-side diff in the Action Audit drawer with Accept / Edit / Reject.
FE ─────{ type: "decision", proposalId, choice: "accept" } ────────► server
server ──{ type: "tool_call", tool: "fe.applyMutation", args: { proposalId }, confirm: false } ─► FE
FE executes via existing useReactMutation, optimistic + cache invalidation.
FE ─────{ type: "tool_result", payload: { ok: true, taskIds: [...] } } ────────► server
server ──{ type: "text", delta: "Done. Reassigned 2 tasks; undo available for 10s." } ► FE
server ──{ type: "usage", tokensIn, tokensOut, usd } ──────────────► FE
server ──{ type: "end" } ──────────────────────────────────────────► FE
```

The same protocol covers every existing v1 surface. The Brief becomes:

```
FE ──turn open: { intent: "brief", projectId, autonomy: "suggest" } ─► server
server ──tool_call fe.boardSnapshot ─► FE ──tool_result {columns,tasks,members} ─► server
server ──suggestion(IBoardBrief) + citations ─► FE
server ──end
```

The Estimate becomes:

```
FE ──turn open: { intent: "estimate", projectId, taskDraft } ────► server
server ──tool_call fe.similarTasks(taskDraft) ─► FE ──tool_result ITask[] ─► server
server ──tool_call be.embeddingNeighbors(text) ─► (server-internal)
server ──suggestion(IEstimateSuggestion) + citations ─► FE
```

### 5.4 FE-side tool registry (browser exposes to agent)

Every FE tool is a typed function whose **arguments are validated against the cache** and whose **side-effects are tracked in the Action Audit**.

#### 5.4.1 Read tools (no confirmation needed)

| Tool                | Purpose                                                                             | Source of truth                   |
| ------------------- | ----------------------------------------------------------------------------------- | --------------------------------- |
| `fe.listProjects`   | Projects visible to the user                                                        | `useReactQuery("projects")`       |
| `fe.listMembers`    | Org members                                                                         | `useReactQuery("users/members")`  |
| `fe.getProject`     | Single project                                                                      | cache → fallback `useApi`         |
| `fe.listBoard`      | Columns of a project                                                                | `useReactQuery("boards", {pid})`  |
| `fe.listTasks`      | Tasks of a project, filtered                                                        | `useReactQuery("tasks", {pid})`   |
| `fe.getTask`        | Single task                                                                         | cache → fallback `useApi`         |
| `fe.boardSnapshot`  | Compact JSON snapshot for the brief (counts, unowned, workload) — no PII beyond ids | derived from above                |
| `fe.similarTasks`   | Top-N similar tasks by client-side similarity (free tier)                           | `engine.semanticSearch`           |
| `fe.viewerContext`  | `{ user, role, currentRoute, focusedTaskId, selectionIds }`                         | router + `useAuth` + Redux        |
| `fe.recentActivity` | Last 24h of optimistic updates (for "what changed" headlines)                       | new `activity log` slice          |
| `fe.formDraft`      | Current value of the open Form (e.g. task being edited or drafted)                  | `Form.getFieldsValue` via context |

These are equivalent to v1's `chatTools.ts` whitelist plus the additions needed for `viewerContext`, `recentActivity`, and `formDraft`. They run synchronously off the React Query cache in the common case.

#### 5.4.2 Mutation tools (confirmation required by default)

| Tool              | Mapped FE call                                                            | Risk band |
| ----------------- | ------------------------------------------------------------------------- | --------- |
| `fe.createTask`   | `useReactMutation("tasks", "POST", ...newTaskCallback)`                   | low       |
| `fe.updateTask`   | `useReactMutation("tasks", "PUT", ...)`                                   | low       |
| `fe.moveTask`     | wrapped reorder mutation (existing `optimisticUpdate/reorder.ts`)         | low       |
| `fe.deleteTask`   | existing delete                                                           | high      |
| `fe.assignTask`   | `updateTask` with `coordinatorId` only                                    | low       |
| `fe.createColumn` | column POST                                                               | med       |
| `fe.renameColumn` | column PUT                                                                | low       |
| `fe.deleteColumn` | column DELETE                                                             | high      |
| `fe.bulkApply`    | apply N proposed mutations atomically (used by "rebalance workload" etc.) | computed  |

`bulkApply` always emits one Action Audit entry per child mutation but groups them under one Undo (mirrors how Gmail's Undo Send works on a single bundle).

#### 5.4.3 UI tools (no data changes; confirmation never required)

| Tool                 | Purpose                                                              |
| -------------------- | -------------------------------------------------------------------- |
| `fe.openTask`        | `useTaskModal().startEditing(taskId)` (already in v1)                |
| `fe.openProject`     | navigate to a project board                                          |
| `fe.openDraftModal`  | open `AiTaskDraftModal` with a prefilled prompt                      |
| `fe.scrollIntoView`  | scroll a task card into view, flash-highlight 1s                     |
| `fe.attachSelection` | request the user to lasso-select tasks; resolves with the chosen ids |
| `fe.notify`          | trigger a non-blocking toast with optional Undo                      |

### 5.5 BE-side tool registry (Python server exposes to agent)

These tools never touch the user's data store. They only operate on payloads the FE has already shipped over (post tool-result), or on aggregates the server is allowed to derive.

| Tool                    | Purpose                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `be.llmComplete`        | structured-output completion against the configured provider (OpenAI / Anthropic / etc.) with route-bound schema |
| `be.embed`              | sentence embedding for a list of texts                                                                           |
| `be.embeddingNeighbors` | top-K nearest tasks given an embedding (cached per project for the session)                                      |
| `be.summarize`          | long-text summarisation (e.g. 30 task notes → standup brief)                                                     |
| `be.translate`          | natural-language translation (used for i18n outputs)                                                             |
| `be.detectDrift`        | rule + LLM hybrid: detect WIP overflow, stale Doing tasks, unowned bugs                                          |
| `be.scheduleDigest`     | persist a server-side cron entry (e.g. 09:00 standup) → POST `be.dispatchDigest`                                 |
| `be.dispatchDigest`     | publish a brief to a configured sink (Slack webhook / email / Confluence page)                                   |
| `be.persistThread`      | per-project conversation history (opt-in; off by default; Section 6.3)                                           |
| `be.budgetCheck`        | enforce per-project / per-IP / per-org token + USD budget; refuse early on overrun                               |

The agent decides which tools to call. It is **not** allowed to call FE mutation tools without a `mutation_proposal` first; this is a server-side policy, not just a UI convention.

### 5.6 Validation, redaction, and safety

- Every tool argument crossing the wire is JSON-schema validated server-side and cache-validated client-side.
- `fe.boardSnapshot` strips notes longer than 4 KB to a head + tail + hash; the server may request the full note via `fe.getTask` only after explicit user consent or autonomy ≥ `act_with_confirmation`.
- A client-side redaction pass (`src/utils/ai/redact.ts`, new) replaces email addresses and bearer-shaped tokens in _outbound_ tool results before they leave the browser; the regex set is small, conservative, and unit-tested.
- The server enforces per-route token budgets (PRD §9 carries forward) plus a new per-org monthly USD cap surfaced to admins.
- All `mutation_proposal` events carry `undoable: true` (or are rejected by the FE before render). Non-undoable changes are not allowed in v1 of v2; future "schedule deletion" type actions get their own design pass.
- Tool definitions are server-owned. The browser cannot inject tool definitions into the agent thread (carries forward AC-D2).

---

## 6. Trust, autonomy, and undo (the core product moves)

### 6.1 The Autonomy Dial

A workspace-level setting (User menu → Settings → Board Copilot) with four positions and one optional per-tool override:

| Level                        | What the agent can do without asking                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **1. Suggest**               | Read tools only. Returns text + suggestions, never proposes mutations.                                               |
| **2. Plan** (default)        | Read tools + `mutation_proposal` events. Every proposal needs explicit user consent before execution.                |
| **3. Act with confirmation** | Same as Plan, but the agent may queue the proposal in the user's Action Audit inbox, with a single-click confirm.    |
| **4. Act and notify**        | The agent may execute pre-approved low-risk tool sets (`assignTask`, `moveTask` within a column, `renameColumn`)     |
|                              | autonomously, with a 10-second toast-Undo on each, and an entry in the Action Audit. High-risk tools always confirm. |

Per-tool overrides:

- An admin (or, in solo deployments, the user) can set autonomy _per tool_. Concrete shipped default: `fe.deleteTask`, `fe.deleteColumn`, `be.dispatchDigest` always require Level 2 confirmation regardless of dial.
- Autonomy is _promoted_ automatically only after the tool's last 50 invocations had ≥95% accept rate and 0 undos. The Action Audit drawer shows this number.

The dial replaces the v1 binary `boardCopilot:enabled`. v1's `boardCopilot:enabled=false` becomes Level 0 ("Off") for backward compat. The dial state persists in `localStorage` under `boardCopilot:autonomy:<projectId|"global">` with a custom-event broadcast (mirrors `useAiEnabled.ts` today).

### 6.2 Action Audit + Undo

A new right-edge Drawer ("Audit") accessible from the avatar menu.

- One row per agent-initiated mutation (or proposal that the user accepted).
- Columns: timestamp, tool, target ids (deep-linked), inputs (collapsible), outcome (`applied` / `undone` / `failed`), `Undo` button.
- Toast-Undo for the first 10 seconds after each mutation. Drawer-Undo for 24 hours (after which the inverse mutation may not be safe; the row shows "expired").
- `bulkApply` groups its child rows visually but undoes in one click.
- Undo is implemented via the _inverse mutation_, not by replaying state; the FE keeps a `prev` snapshot per mutation in IndexedDB for 24h.
- Audit entries are local to the browser by default; with `be.persistThread` enabled, they sync to the server so admins can view org-wide.

### 6.3 Memory and persistence

- **Per-turn memory.** The server holds the message thread for the duration of a single turn. (Same as v1.)
- **Per-thread memory.** With `be.persistThread` enabled, the browser persists the last 20 turns _per project_ under `boardCopilot:thread:<projectId>` in IndexedDB. Threads are scoped to the user; clearing them is one click. **Off by default**, opt-in per project, surfaced in the AI settings.
- **Project memory.** A _learned profile_ per project (vector index of accepted suggestions, per-coordinator workload defaults, per-epic point baselines) lives on the server. The user can inspect and reset it from the Audit drawer.
- **Right to silence.** v1's per-project disable carries over verbatim. When the project is disabled, no turn opens — this is enforced both client-side (`assertRunPayloadProjectsAiAllowed`) and server-side (the `projectId` is checked against an org allow-list).

### 6.4 Spend, budgets, and PII

- The server returns a `usage` event at the end of every turn with `tokensIn`, `tokensOut`, `usd`. The FE displays the running monthly spend in the Audit drawer (Section 8.3).
- Workspace admins set a per-project monthly USD cap. The server enforces it via `be.budgetCheck` at the _start_ of every turn; if a budget is exhausted, the agent returns a single text event and `end`.
- The client-side redaction pass (Section 5.6) is documented in `README.md` and unit-tested. Users can preview _exactly what is sent_ via a "What is shared with the agent?" button on the Audit drawer (mirrors the GitHub Copilot for Business _"Show context"_ affordance).

---

## 7. Redesigned and new surfaces

Each surface below is a _thin_ UI — the heavy lifting is the agent. v1's surfaces remain available as the "Level 1 Suggest" fallback when `REACT_APP_AI_BASE_URL` is unset or unreachable.

### 7.1 Command palette (`Cmd/Ctrl+K`) — new

A single input that:

- Indexes all projects, tasks, columns, members for instant navigation (offline).
- Has an _AI mode_ toggle (`Tab` to switch, or prefix `/` to enter agent mode).
- In AI mode, every keystroke streams a turn to the agent with `intent: "palette"` and the user's current focus (route, selected task) attached.
- Built-in slash commands: `/draft`, `/estimate`, `/brief`, `/triage`, `/standup`, `/audit`, `/settings ai`.

This surface unifies Brief, Ask, Draft, Search behind a single keystroke and lets us deprecate the four v1 buttons in the board header (which UI/UX plan §1.1.4 already calls out as cluttered).

### 7.2 Smart task drafting — redesigned

- The "Draft with AI" link still launches `AiTaskDraftModal`, but the modal now opens with **three suggested prompts** sourced from `fe.recentActivity` ("Continue the last bug you reported", "Add a follow-up to _X_", "Decompose the largest unstarted task"). Sample prompts are no longer hard-coded.
- The breakdown action shows a _picker_ for the breakdown axis (`by phase` / `by surface` / `by risk` / `freeform`), and the agent returns the breakdown for the chosen axis. The five hard-coded SUBTASK_VERBS are gone.
- Every populated field carries a `Suggested by Copilot` badge until the user edits the field (UI/UX plan §2.A.8). Hovering the badge opens a popover with the `rationale` and a `Why this choice?` deep-link to the Action Audit row.
- After Submit, a toast appears with `Undo` (10s); the new task is also visible in the Action Audit.

### 7.3 Inline AI in the task note editor — new

- A `/copilot` slash inside the `note` `TextArea` opens a small popover with: _Rewrite as user story_, _Add acceptance criteria_, _Translate to <user locale>_, _Summarise in 2 lines_, _Polish tone_, _Free prompt_.
- Each operation streams the rewrite into the textarea behind a translucent overlay; pressing `Esc` reverts; pressing `Enter` accepts. Accepted edits show the badge.

### 7.4 Estimation + readiness — redesigned

- `aiTaskAssistPanel` becomes a single Card with two collapsible sections (Estimate, Readiness), default-open.
- Estimate carries a _Why this number?_ link that opens a popover with the citations (similar tasks) and the agent's rationale, both clickable.
- Readiness presents at most three issues at once; further issues collapse behind "1 more concern…" so the panel does not visually dominate the form.
- The 600 ms debounce that disagrees with PRD §5.2.4 is corrected to 1000 ms (matches the PRD; gives the local engine more headroom; also reduces server load on remote).
- The throttled spinner (`useDelayedFlag(.., 250)`) carries over; on the remote path, the spinner becomes a streaming skeleton that fills with the partial response.

### 7.5 Board brief / standup — redesigned + extended

- The Brief Drawer remains, but its headline is computed by the agent's `be.detectDrift` tool (Section 5.5), not a count. Headline ranks: unowned bug in last 24h > WIP overflow > load imbalance > backlog dilution > "balanced".
- New buttons in the drawer footer: `Copy as Markdown`, `Send to Slack`, `Save as task note`, `Schedule daily 09:00`. The first three call FE tools; the schedule call invokes `be.scheduleDigest` and shows confirmation.
- The recommendation is a single sentence with a `Run this` button that maps to a `mutation_proposal` (e.g., recommendation = "Reassign 2 of Maya's tasks to Priya" → button opens the proposal in the Action Audit).

### 7.6 Conversational assistant — redesigned

- The `Ask` button is demoted: the same conversation lives in the command palette, in a side Drawer (carry-over), and as a `?` shortcut on every task card ("Ask about this task").
- Sample prompts are personalised from project state (`fe.boardSnapshot`).
- Tool-call internals are _never_ shown verbatim. Instead, the assistant emits a `citation` event after each tool result, and the UI shows a "Sources (3)" footnote that expands to the cited tasks/members/columns. Toggle "Show details" still exists for power users but defaults off.
- An `Attach selection` affordance lets the user select N tasks (board lasso) and attach them as context to the next question ("Why are these flaky?"). Mirrors GitHub Copilot Chat's `@workspace` affordance.
- A `Save to task note` button on every assistant turn writes the answer (with citations) to the note of the focused task, behind confirmation, with Undo.
- Optional persistence (Section 6.3); off by default.

### 7.7 Semantic + agent search — redesigned

- The local Jaccard fallback stays, but on the remote path, search becomes the agent's `be.embed` + `be.embeddingNeighbors` pipeline. Results are ranked across (a) embedding similarity, (b) structural similarity (same epic, same coordinator, same column), (c) recency.
- "No results" carries a `Did you mean…?` row with up to three reformulations the agent generated.
- The `AiSearchInput` accepts an optional `Reformulate with AI` chip when local search returned 0 hits.
- Results carry a `+` button to _add the entire result set as filter chips_ on the existing search panel (so AI search composes with manual filters cleanly; today it AND-filters silently).

### 7.8 Triage inbox — new

A small `Inbox` icon in the header (badge with unread count). Each entry is a _nudge_ the agent generated proactively:

- "2 bugs filed in the last hour have no acceptance criteria" → opens a multi-task readiness review.
- "Maya has 3× the average open points" → opens a rebalance proposal.
- "WIP in _Doing_ is 7 (your usual cap is 4)" → opens a brief filtered to _Doing_.
- "Search 'token expiry' (no manual hits) → 3 likely matches" → opens results.

Nudges are generated by `be.detectDrift` on a server-side schedule (every 15 min per project) and pushed to the FE via the next-opened SSE turn (or via a poll on the Inbox open). They never auto-execute; they always surface as a `mutation_proposal` if they propose a change. Per-project disable mutes nudges for that project.

### 7.9 Settings — new

A consolidated "Board Copilot" section in the avatar dropdown:

- Autonomy dial (Section 6.1)
- Per-tool overrides (Section 6.1)
- Per-project disable (carry over from v1)
- Thread persistence (Section 6.3)
- Spend dashboard (read-only summary, drills into the Audit drawer)
- "What is shared with the agent?" panel (Section 6.4)
- Reset learned profile per project

---

## 8. Technical contract for the Python server (FE-side requirements)

This section is the **binding contract** between the FE and the agent server. The Python server's internals are out of scope; the wire shape, errors, and SLOs are not.

### 8.1 Endpoints

| Method | Path                                    | Purpose                                                 |
| ------ | --------------------------------------- | ------------------------------------------------------- |
| `POST` | `/api/ai/agent`                         | Open a turn; streams `AgentEvent`                       |
| `POST` | `/api/ai/agent/<sessionId>/tool_result` | Reply to a `tool_call` if SSE-upstream isn't viable     |
| `POST` | `/api/ai/agent/<sessionId>/decision`    | Accept / reject a `mutation_proposal`                   |
| `POST` | `/api/ai/agent/<sessionId>/abort`       | Abort the turn (also sent as `ClientEvent.abort`)       |
| `GET`  | `/api/ai/health`                        | Liveness; FE shows a degraded indicator when down       |
| `GET`  | `/api/ai/budget?projectId=…`            | Returns remaining tokens / USD for the org/project      |
| `POST` | `/api/ai/digest/dispatch`               | Bypass-FE digest dispatch (used by `be.scheduleDigest`) |

All endpoints are authenticated via the existing bearer header (`getStoredBearerAuthHeader`).

### 8.2 Errors

- HTTP 401: relogin required; FE drops the cached token and re-auths.
- HTTP 429: returns `Retry-After`; FE shows the existing "Board Copilot is busy" message and re-tries with backoff.
- HTTP 402 (or 429 with `X-Reason: budget`): budget exhausted; FE shows the spend dashboard.
- Within-stream errors are emitted as `{ type: "error", retryable }`; FE shows the existing inline `<Alert type="warning">` and offers Retry only when `retryable`.

### 8.3 SLOs

- Time-to-first-event: ≤500 ms p50, ≤1.5 s p95.
- Time-to-first-token (text or tool_call): ≤1.2 s p50, ≤2.5 s p95.
- Brief end-to-end (≤200 tasks): ≤2 s p50, ≤4 s p95.
- Audit drawer fetch: ≤300 ms p95.
- Server availability: 99.5% rolling 30d.

### 8.4 Logging

- Server logs only metadata: `route`, `intent`, `latency_ms`, `tokens_in`, `tokens_out`, `usd`, `status`, `project_id_hash`, `tool_calls_count`, `mutation_proposals_count`, `mutations_applied_count`, `undos_count`. No raw user content.
- An admin export endpoint (Section 8.1, future) returns this metadata as CSV for a chosen window.

### 8.5 Versioning

- The wire schema lives in `src/interfaces/agent.d.ts` (new) and is versioned via a `protocolVersion: "1"` header on the first event of every turn. The server returns a 426 with the supported versions if the FE is too old/new; the FE shows a "Please reload to update Board Copilot" toast.

---

## 9. Backward compatibility and rollout

### 9.1 Local engine remains the fallback

If `REACT_APP_AI_BASE_URL` is empty or `health` is failing, the FE falls back to v1's local engine _for the read-only surfaces_ (Brief, Estimate, Readiness, Search, Draft as a deterministic prompt template). All write tools are hidden in fallback mode (the autonomy dial collapses to "Suggest"). The Inbox shows "Connect a copilot server to enable proactive nudges".

This guarantees zero regression for existing users and zero new infra dependency for the test environment.

### 9.2 Phased rollout (capability, not calendar)

- **Phase A — Wire + telemetry.**
  Ship `useAgent` (new), the SSE parser, the `agent.d.ts` types, the redaction pass, the spend dashboard scaffolding, and a _no-op_ server that always returns text-only suggestions. Carry forward all v1 surfaces unchanged (read-only).
- **Phase B — Brief + Estimate via the agent.**
  Replace the local engine for Brief and Estimate with `useAgent`. Add citations and provenance popovers. Local engine becomes fallback-only.
- **Phase C — Mutation proposals.**
  Introduce `mutation_proposal` and the Action Audit drawer + toast-Undo. Autonomy dial ships at Level 2 (Plan) by default.
- **Phase D — Triage inbox + scheduled digest.**
  `be.detectDrift` + `be.scheduleDigest` + `be.dispatchDigest`. Inbox surface and Slack/Confluence sinks.
- **Phase E — Command palette + slash commands.**
  Final consolidation surface; deprecate the board header buttons (still rendered for keyboard-only users).
- **Phase F — Promote autonomy.**
  Per-tool autopromotion based on accept/undo rates. Level 4 ("Act and notify") becomes available for `assignTask`, `moveTask` within a column, `renameColumn` only.

Each phase is independently revertible behind the same `boardCopilot:enabled` flag and the new `boardCopilot:autonomy:*` settings.

---

## 10. Acceptance criteria (v2)

Numbered to extend, not replace, the v1 ACs in `board-copilot.md` §5.

| ID     | Acceptance criterion                                                                                                                                                                      |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-V1  | With `REACT_APP_AI_BASE_URL` empty, the app behaves as v1: read-only AI surfaces, no Inbox, no Audit drawer, no autonomy dial.                                                            |
| AC-V2  | With the agent reachable, every AI feature (Brief / Draft / Estimate / Readiness / Chat / Search / Inbox) routes a single SSE turn through `/api/ai/agent` with the wire shape from §5.2. |
| AC-V3  | The agent never executes a `mutation_proposal` without an explicit `decision: accept` from the FE. Verified by integration test.                                                          |
| AC-V4  | Every accepted mutation produces an Audit row with a working Undo button for ≥10 s (toast) and ≥24 h (drawer).                                                                            |
| AC-V5  | Autonomy ≥ Level 4 may execute _only_ the pre-approved low-risk tool set (`assignTask`, in-column `moveTask`, `renameColumn`). Any other tool requires Level ≤ 3 confirmation.            |
| AC-V6  | Tool-call internals (raw `getTask`/`listProjects` payloads) are never visible without explicit "Show details" toggle. Default off.                                                        |
| AC-V7  | Every assistant turn that cited project data emits at least one `citation` event; the FE renders a "Sources (N)" footnote that links to the cited entities.                               |
| AC-V8  | Outbound payloads pass through `redact.ts`; emails / bearer tokens are masked. Verified by unit test on a corpus of 12 samples.                                                           |
| AC-V9  | Spend dashboard reflects the per-project monthly USD spent within ≤5 s of the last completed turn.                                                                                        |
| AC-V10 | Per-project disable continues to block both turns and proactive nudges; verified for both `useAi` and `useAgent` paths.                                                                   |
| AC-V11 | `Cmd/Ctrl+K` opens the command palette; AI mode toggles via `Tab` or `/`; `Esc` closes; focus is trapped while open.                                                                      |
| AC-V12 | Inline `/copilot` slash inside the task `note` editor streams a rewrite that the user can accept (Enter) or revert (Esc).                                                                 |
| AC-V13 | Brief footer Slack/Confluence/Schedule actions confirm before send and surface Undo (or "Cancel scheduled" for digests).                                                                  |
| AC-V14 | Triage Inbox unread count updates ≤30 s after a new nudge is produced server-side.                                                                                                        |
| AC-V15 | When the server returns HTTP 426 (protocol mismatch), the FE shows a single non-blocking toast prompting reload.                                                                          |

---

## 11. Metrics

Carries M1..M7 from `board-copilot.md` §13 and adds:

- **M8 — Acceptance rate per tool.** % of `mutation_proposal` events the user accepts. Target: ≥70% per tool before that tool can promote to autonomy Level 4.
- **M9 — Undo rate per tool.** % of accepted mutations that get undone within 24 h. Target: ≤5% per tool.
- **M10 — Time saved per turn.** Server-side estimate (compare proposed mutation count × median manual time) emitted as a `usage`-companion field. Surfaced in the spend dashboard.
- **M11 — Inbox engagement.** % of nudges read / acted on per week. Target: ≥40% read.
- **M12 — Palette adoption.** % of AI invocations that originate from the command palette vs the legacy buttons. Target: ≥50% within 4 weeks of GA.
- **M13 — Drift catches.** Number of accepted nudges per board per week.

All metrics flow through the same `track(event, payload)` no-op hook the UI/UX plan §2.C calls out. Concrete event names live in `src/constants/analytics.ts` (new) so the catalog cannot drift.

---

## 12. Risks and mitigations

| Risk                                                                   | Mitigation                                                                                                               |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| The agent proposes a confidently-wrong mutation                        | Plan default; explicit accept; Audit + Undo; per-tool autopromotion only after stable accept/undo metrics (M8/M9)        |
| Token spend balloons during a chatty session                           | Per-org / per-project monthly USD cap enforced by `be.budgetCheck` at every turn open                                    |
| Streaming SSE upstream is blocked by a corporate proxy                 | Fallback `POST /api/ai/agent/<sessionId>/tool_result` and `decision` endpoints; FE auto-detects via `Accept` negotiation |
| The user's note contains secrets that should not leave the browser     | `redact.ts` runs on every outbound tool result; `note` payloads above 4 KB ship as head + tail + hash by default         |
| The user disables the global toggle but a scheduled digest still fires | `be.dispatchDigest` checks the per-project disable list at fire time and silently drops the dispatch                     |
| Wire schema drifts between client and server                           | `protocolVersion` on the first event; HTTP 426 on mismatch; reload toast                                                 |
| Promoting a tool to Level 4 surprises a coworker who never opted in    | Autonomy is per-user; autopromotion is per-user; admins see and can revoke promotions in the org-level Audit dashboard   |
| The local fallback engine gets stale vs the agent's behaviour          | The fallback is documented as v1 behaviour, not v2; no attempt to back-port agent-only features (e.g., write tools)      |

---

## 13. Out of scope (and reasons)

- A real-time, multi-user shared agent thread (CRDT / Yjs). The mock backend has no user sessions to share threads across; revisit when a real backend ships.
- Voice composer. UX-rich; high cost; postpone to v2.1.
- An MCP-compatible front for the Python server. Worth exploring once Phase F lands; the wire schema in §5.2 is intentionally close to MCP's tool semantics but is not byte-compatible.
- Code-generating dev agents (Rovo Dev style). The repo is a frontend with a mocked backend; out of scope.
- Cross-project planning ("rebalance across all my projects"). Scope creep risk; explicitly opt-in once per-project metrics show acceptance ≥70%.

---

## 14. Open questions

- OQ1 — Should the Action Audit be per-user or per-project? Lean: per-user view by default, per-project view available to admins.
- OQ2 — What is the smallest set of "low-risk" tools that should ever reach Level 4? Lean: `assignTask`, in-column `moveTask`, `renameColumn`, `notify`. Everything else stays Level ≤ 3.
- OQ3 — Should the agent be able to _read_ notes that the FE redacted? Lean: no; only the user can re-send full content via an explicit "Send full note" toggle on a per-turn basis.
- OQ4 — Where does the autonomy dial live in the UI? Lean: avatar dropdown → Settings → Board Copilot, with a per-board chip that mirrors the current effective level.
- OQ5 — Should the command palette ship before Phase E, as a navigation-only utility (no AI)? Lean: yes; ship in Phase A as nav-only, add AI mode in Phase E.
- OQ6 — How do we surface confidence bands in chat answers without making them feel uncertain to non-experts? Lean: the existing "Low / Moderate / High" band on the assist panel, no raw percentages in chat.

---

## 15. Appendix — touch list (extends `board-copilot.md` §15.1)

- New
    - `src/utils/hooks/useAgent.ts` — single hook that opens an SSE turn, streams `AgentEvent`s, and invokes the FE tool registry on `tool_call` events.
    - `src/utils/ai/agentClient.ts` — SSE parser; reuses `parseFetchBody` patterns; AbortController lifecycle identical to `useAi.ts`.
    - `src/utils/ai/feTools/` — one file per FE tool from §5.4; each exports `{ schema, run }`.
    - `src/utils/ai/redact.ts` — outbound redaction.
    - `src/utils/ai/audit/` — Action Audit storage (IndexedDB) + selectors + Undo executor.
    - `src/components/commandPalette/` — `Cmd/Ctrl+K` palette.
    - `src/components/auditDrawer/` — Action Audit + spend dashboard.
    - `src/components/inboxDrawer/` — Triage inbox.
    - `src/components/aiSettingsModal/` — Autonomy dial + per-tool overrides + thread persistence + reset learned profile.
    - `src/interfaces/agent.d.ts` — wire schema for `AgentEvent` / `ClientEvent`.
    - `src/constants/analytics.ts` — event names for M1..M13.
- Modified
    - `src/components/aiTaskDraftModal/index.tsx` — breakdown axis picker, personalised sample prompts, `Suggested by Copilot` badges, post-Submit toast Undo.
    - `src/components/aiTaskAssistPanel/index.tsx` — collapsible sections, "Why?" popover with citations, debounce → 1000 ms.
    - `src/components/aiChatDrawer/index.tsx` — citations footnote, attach-selection affordance, save-to-note action, default-off raw tool details.
    - `src/components/aiSearchInput/index.tsx` — reformulate-with-AI chip on no-result, "+ filter chips" composability.
    - `src/components/boardBriefDrawer/index.tsx` — agent-driven headline, footer actions (Copy / Slack / Confluence / Schedule).
    - `src/components/header/index.tsx` — replace the global AI toggle with a Settings entry; expose Inbox + Audit drawers.
    - `src/pages/board.tsx` — collapse the Brief/Ask/Draft/Project AI buttons into a single `Copilot` `Dropdown.Button` (matches UI/UX plan §2.3).
    - `src/utils/hooks/useAiEnabled.ts` — extend with autonomy levels; keep `boardCopilot:enabled` for backward compat (`false` ↔ Level 0).
    - `src/utils/ai/projectAiStorage.ts` — extend the per-project disable to also gate the agent endpoint and proactive nudges.
    - `README.md` — Board Copilot v2 section: agent endpoint, autonomy dial, Audit drawer, fallback semantics.
- Deprecated (kept as fallback only when the agent is unreachable)
    - `src/utils/hooks/useAi.ts`, `src/utils/ai/engine.ts`, `src/utils/hooks/useAiChat.ts`, `src/utils/ai/chatEngine.ts`, `src/utils/ai/chatTools.ts`. None are removed in Phase A; their call sites switch to `useAgent` between Phases B and E.

---

## 16. Bottom line

v1 built the right scaffolding and shipped five disconnected suggestion surfaces. v2 turns that scaffolding into a single agent that watches the board, plans before it acts, and is reversible by default. The biggest product unlocks (proactive triage, undoable mutations, command palette, slash-commands in the note editor, scheduled digests) all become possible because the agent has both eyes (FE tool calls into React Query caches) and hands (FE mutation tools gated by user consent), and because the autonomy dial promotes tools only when they earn it.

The Python server becomes the orchestration brain that the user already has. The browser stops being a thin LLM client and becomes a typed tool host. v1's safety posture (advisory only, opt-out, validated ids) is preserved; v1's product ceiling (suggestion-only, surface-bound, no memory) is removed.
