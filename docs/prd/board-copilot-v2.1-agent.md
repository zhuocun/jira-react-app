# PRD: Board Copilot v2.1 — Agentic AI for `jira-react-app`

| Field             | Value                                                                                                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Status            | Draft v2.1 — supersedes [`board-copilot-v2-agent.md`](board-copilot-v2-agent.md). v1 capabilities ship as the fallback experience; v2.1 is the new default once the Python agent server is reachable.                                                  |
| Author            | Product (this document is the design-reviewed revision of the v2 Board Copilot PRD)                                                                                                                                                                    |
| Last updated      | 2026-05-01                                                                                                                                                                                                                                             |
| Target repository | `jira-react-app` (frontend) + a Python agent server at `${REACT_APP_AI_BASE_URL}` (out of repo), built on LangGraph 1.x with agents registered in `app/agents/catalog/`                                                                               |
| Document scope    | Product critique of v2, redesigned architecture aligned to LangGraph substrate, FE↔BE agent contract, governance & rollout. Server internals are referenced where they affect the wire contract.                                                        |
| Companion docs    | [`board-copilot.md`](board-copilot.md) (v1 design), [`board-copilot-v2-agent.md`](board-copilot-v2-agent.md) (v2), [`board-copilot-progress.md`](board-copilot-progress.md), [`board-copilot-review.md`](board-copilot-review.md), [`ui-ux-optimization-plan.md`](../ui-ux-optimization-plan.md) |

---

## 1. TL;DR

v2 correctly diagnosed v1's core failure — five disconnected one-shot prompt surfaces masquerading as an "assistant" — and proposed the right product spine: one agent, bidirectional tool calls, progressive autonomy, undo. v2.1 sharpens the design by aligning with the substrate the team already runs (LangGraph 1.x on the Python server) and trimming over-engineered subsystems that aren't yet earned by the product.

The five key changes from v2 to v2.1:

1. **Substrate alignment.** Replace the hand-rolled `POST /api/ai/agent` endpoint and `AgentEvent` union with the existing `POST /api/v1/agents/{name}/stream` registry. Each v2 "intent" becomes a named LangGraph agent in `app/agents/catalog/` (board-brief-agent, task-drafting-agent, task-estimation-agent, chat-agent, triage-agent), individually testable and individually rate-limited.
2. **Memory delegation.** Drop the four-layer client-side memory model (IndexedDB, localStorage). Delegate to LangGraph's `BaseCheckpointSaver` (per-thread) and `BaseStore` (cross-thread, namespaced per project/user). The server owns persistence; the browser is stateless between sessions.
3. **Autonomy simplification.** Trim the four-level × per-tool × auto-promotion autonomy dial to two shipped levels (Suggest, Plan) plus a per-tool Auto opt-in toggled by workspace admins — not by automatic threshold.
4. **Undo right-sizing.** Keep the 10-second toast Undo (proven by Gmail and Linear). Replace the 24-hour drawer Undo with a read-only Action History. Remove the IndexedDB snapshot store.
5. **Trust rebalancing.** Move redaction to the server. Move USD spend visibility to the admin pane. Specify accessibility, shadow mode, cold-start, dev-mode, and mobile — all missing from v2.

Net effect: the same product surface v2 was reaching for, with half the new code, half the new UI, and inheritance from a substrate the team already runs.

---

## 2. What v2 got right (carry forward)

These design decisions from v2 are preserved without change:

- **Agent-on-server, browser-as-tool-host.** The agent lives on the Python server; the browser provides cache-validated context and executes UI-side tool calls (Section 5).
- **Bidirectional tool calling.** The server calls FE read tools (auto-execute) and FE mutation tools (block on user approval). The browser calls BE knowledge tools indirectly via the agent's planning loop.
- **FE read/mutation tool registries.** v2's §5.4 tool tables carry forward with minor refinements (Section 5.4).
- **v1 as deterministic fallback.** When `REACT_APP_AI_BASE_URL` is empty or unreachable, the local engine powers read-only surfaces exactly as today (Section 9).
- **Cache-validated IDs everywhere.** Every agent-returned ID is checked against the React Query cache before the FE acts on it.
- **Per-project disable.** `boardCopilot:disabledProjectIds` continues to gate both interactive turns and proactive nudges.

---

## 3. Personas (carry over from v1/v2, with refined needs)

- **Maya, IC engineer.** Wants drag-and-drop creation, smart estimation that learns, and an AI rewrite button on the task note editor so she never leaves the form.
- **Devon, tech lead.** Wants a daily brief he can confirm or reroll, an "agent-as-triage" that pre-tags new bugs, and a one-click "rebalance Maya → Priya" suggestion he can accept or reject.
- **Priya, product manager.** Wants a chat that remembers her last three questions on this board, can re-run the same question on a different project, and can save its answer as a task note.
- **Ari, IT/admin.** Wants a workspace-level autonomy setting, a per-project disable, a read-only audit log of every agent mutation, an exportable record of what data left the browser, and a per-project monthly spend cap visible in the admin pane.

### 3.5 Cold-start state

First-time user on a fresh project: no recent activity, no past tasks, no learned profile. Every personalised surface falls back to an explicit empty state:

- **Chat sample prompts:** three deterministic onboarding prompts — "What can Board Copilot do?", "Summarize this board", "Draft a sample task".
- **Brief:** renders the structural brief (counts, workload) with a banner: "Not enough history for trend analysis yet. The brief will get smarter as the board grows."
- **Command palette AI mode:** a 30-second "What Copilot can do" help panel replaces personalised suggestions.
- **Estimation:** falls back to the local engine's heuristic with a note: "Estimate based on board averages — accuracy improves with more tasks."

---

## 4. Goals and non-goals (v2.1)

### 4.1 Goals

- **G1 — Named agents, one transport.** Every AI feature is a named LangGraph agent invoked over `POST /api/v1/agents/{name}/stream`, streamed via SSE (Section 5).
- **G2 — FE↔BE tool calling via LangGraph interrupt.** The browser exposes a typed tool registry; the agent pauses via `interrupt()` when it needs FE data or user approval. The FE resumes via `Command(resume=...)` (Section 5.3).
- **G3 — Two-level autonomy with per-tool Auto opt-in.** Suggest (read-only) and Plan (proposals + 10s toast Undo) ship by default. Per-tool Auto is admin-only, off by default (Section 6.1).
- **G4 — Smart, proactive surfaces.** Drift detection, triage inbox with aggregation/decay rules, command palette (Section 7).
- **G5 — Observable trust.** Server-side redaction, admin-only spend dashboard, "What is shared" panel, shadow mode for safe tool promotion (Section 6).
- **G6 — No regression on the v1 fallback.** With `REACT_APP_AI_BASE_URL` empty, the local engine powers Brief / Draft / Estimate / Readiness / Search exactly as today (Section 9).
- **G7 — MCP compatibility from Phase A.** Named agents are MCP-compatible via `langchain-mcp-adapters`, serving both the FE and any external assistant (Section 5.6).

### 4.2 Non-goals (v2.1)

- N1 — Multi-tenant model-key management. The Python server holds one provider key per deployment.
- N2 — Voice / speech-to-text composer. Reserved for v3.
- N3 — Replacing the server's prompt-engineering with a configurable prompt UI for end-users. Prompts stay server-owned.
- N4 — Real-time multi-user collaboration on agent outputs (CRDT / Yjs). Single-user threads only.
- N5 — Cross-project agent context (except explicit cross-project queries from the project list page).
- N6 — Replacing `@hello-pangea/dnd` with AI-driven drag-and-drop.
- N7 — Inline `/copilot` slash commands in the task note editor (deferred until the editor substrate supports it — see Section 7.3).
- N8 — Scheduled digest dispatch to Slack/Confluence (deferred — each is a full OAuth integration feature; see Section 13).

---

## 5. Architecture — agents, transport, and tools

### 5.1 Named agent registry (LangGraph alignment)

The Python server hosts a **registry of named agents** in `app/agents/catalog/`. Each agent is a LangGraph `StateGraph` compiled with a `BaseCheckpointSaver` (thread-scoped) and a `BaseStore` (cross-thread, namespaced). Each agent has its own `recursion_limit`, `context_schema`, tool set, and version metadata.

| Agent name              | v2 intent      | Purpose                                                      | Key tools                                       |
| ----------------------- | -------------- | ------------------------------------------------------------ | ------------------------------------------------ |
| `board-brief-agent`     | `brief`        | Structured board summary with drift-aware headline           | `fe.boardSnapshot`, `be.detectDrift`             |
| `task-drafting-agent`   | `draft`        | Natural-language → fully populated task form                 | `fe.boardSnapshot`, `fe.similarTasks`            |
| `task-estimation-agent` | `estimate`     | Story-point estimation + readiness check with citations      | `fe.similarTasks`, `be.embeddingNeighbors`       |
| `chat-agent`            | `chat`         | Conversational Q&A grounded in project data                  | All FE read tools, `be.summarize`                |
| `triage-agent`          | `triage`       | Proactive drift detection → nudges                           | `fe.boardSnapshot`, `be.detectDrift`             |

Each agent is:

- **Individually testable** via `pytest` against LangGraph's test harness.
- **Individually rate-limited** via per-agent config on the server.
- **Individually versionable** via `AgentMetadata.version` on `GET /api/v1/agents/{name}`.
- **MCP-compatible** via `langchain-mcp-adapters` (Section 5.6).

### 5.2 Transport: existing LangGraph endpoints

The FE calls the **existing** server endpoints. No new endpoint shape is introduced.

| Method | Path                              | Purpose                                         |
| ------ | --------------------------------- | ----------------------------------------------- |
| `GET`  | `/api/v1/agents`                  | List available agents (for feature discovery)   |
| `GET`  | `/api/v1/agents/{name}`           | Agent metadata: version, description, status    |
| `POST` | `/api/v1/agents/{name}/invoke`    | Single-turn invocation (non-streaming fallback) |
| `POST` | `/api/v1/agents/{name}/stream`    | Open an SSE stream; primary transport           |

Authentication: reuses the existing bearer header (`getStoredBearerAuthHeader` from `src/utils/aiAuthHeader.ts`).

**Streaming wire shape.** The SSE stream uses LangGraph's `stream_mode=("updates", "messages", "custom")` with `version="v2"`. Every chunk is a `StreamPart` dict:

```ts
type StreamPart =
    | { type: "updates"; ns: string[]; data: Record<string, unknown> }
    | { type: "messages"; ns: string[]; data: [LLMTokenChunk, MessageMetadata] }
    | { type: "custom"; ns: string[]; data: CustomEvent };

type CustomEvent =
    | { kind: "citation"; refs: CitationRef[] }
    | { kind: "mutation_proposal"; proposal: MutationProposal }
    | { kind: "suggestion"; surface: SuggestionSurface; payload: unknown }
    | { kind: "usage"; tokensIn: number; tokensOut: number }
    | { kind: "nudge"; nudge: TriageNudge };

interface CitationRef {
    source: "task" | "column" | "member" | "project";
    id: string;
    quote: string; // required, not optional — verbatim excerpt
}
```

**Key simplifications from v2:**

- `AgentEvent` union is replaced by LangGraph's native `StreamPart` types. `updates` ≈ state diffs; `messages` ≈ token stream; `custom` ≈ tool/citation/proposal events.
- No `protocolVersion` header or HTTP 426. Version is per-agent via `GET /api/v1/agents/{name}` returning `AgentMetadata.version`. Deprecation is per-agent, not a global reload.
- No `session` event with `budget.usdRemaining`. USD is admin-only (Section 6.4).

### 5.3 Bidirectional tool flow via LangGraph interrupt

When the agent needs data from the browser or user approval for a mutation, it calls `interrupt()` inside its graph node. The SSE stream pauses and emits the interrupt payload. The FE processes the request and resumes via `Command(resume=...)` on the same thread.

**Read tools (auto-resume):** The agent calls `interrupt({"tool": "fe.boardSnapshot", "args": {...}})`. The FE executes the tool against the React Query cache, then resumes: `POST /api/v1/agents/{name}/stream` with `Command(resume=tool_result)` using the same `thread_id`.

**Mutation tools (user approval required):** The agent emits a `custom` event with `kind: "mutation_proposal"`. The FE renders the proposal UI. When the user decides, the FE resumes: `Command(resume={"choice": "accept" | "reject", "editedDiff?": ...})`.

This replaces v2's dual-path `tool_result` delivery (in-band SSE + fallback POST). The transport is always: **SSE down, plain fetch up** (resume via POST). No hybrid.

**Illustrated flow (same "rebalance workload" example as v2):**

```
FE ──POST /api/v1/agents/chat-agent/stream──────────────────────────► server
   { messages: [...], thread_id, configurable: { project_id } }

server ──StreamPart(updates, agent planning) ────────────────────────► FE
server ──StreamPart(__interrupt__, {tool: "fe.listTasks", args: {coordinatorId: "maya"}}) ► FE
FE executes fe.listTasks against React Query cache
FE ──POST /api/v1/agents/chat-agent/stream (Command(resume=tasks)) ──► server
   { thread_id, resume: ITask[] }

server ──StreamPart(messages, "Maya has 11 pts; lightest is Priya (3 pts).") ─► FE (streamed)
server ──StreamPart(custom, {kind: "mutation_proposal", proposal: {taskUpdates: [...]}}) ► FE
FE renders proposal with Accept / Edit / Reject
FE ──POST (Command(resume={choice: "accept"})) ─────────────────────► server

server ──StreamPart(__interrupt__, {tool: "fe.applyMutation", args: {proposalId}}) ──► FE
FE executes via useReactMutation, optimistic + cache invalidation
FE ──POST (Command(resume={ok: true, taskIds: [...]})) ─────────────► server

server ──StreamPart(messages, "Done. Reassigned 2 tasks; undo available for 10s.") ► FE
server ──StreamPart(custom, {kind: "usage", tokensIn, tokensOut}) ───► FE
stream ends
```

### 5.4 FE-side tool registry (browser exposes to agent)

Carried forward from v2 §5.4 with these changes:

#### 5.4.1 Read tools (auto-resume, no confirmation needed)

| Tool                | Purpose                                                      | Source of truth                   |
| ------------------- | ------------------------------------------------------------ | --------------------------------- |
| `fe.listProjects`   | Projects visible to the user                                 | `useReactQuery("projects")`       |
| `fe.listMembers`    | Org members                                                  | `useReactQuery("users/members")`  |
| `fe.getProject`     | Single project                                               | cache → fallback `useApi`         |
| `fe.listBoard`      | Columns of a project                                         | `useReactQuery("boards", {pid})`  |
| `fe.listTasks`      | Tasks of a project, filtered                                 | `useReactQuery("tasks", {pid})`   |
| `fe.getTask`        | Single task                                                  | cache → fallback `useApi`         |
| `fe.boardSnapshot`  | Compact JSON snapshot (counts, unowned, workload)            | derived from above                |
| `fe.similarTasks`   | Top-N similar tasks by client-side similarity                | `engine.semanticSearch`           |
| `fe.viewerContext`  | `{ user, role, currentRoute, focusedTaskId, selectionIds }`  | router + `useAuth` + Redux        |
| `fe.recentActivity` | Last 24h of optimistic updates                               | new `activity log` slice          |
| `fe.formDraft`      | Current value of the open Form                               | `Form.getFieldsValue` via context |

#### 5.4.2 Mutation tools (confirmation required by default)

Unchanged from v2 §5.4.2.

#### 5.4.3 UI tools (no data changes; no confirmation)

Unchanged from v2 §5.4.3.

### 5.5 BE-side tool registry (Python server — internal to agent)

These tools are internal to the agent's LangGraph graph. They do not cross the wire to the FE; the agent invokes them as regular LangGraph tool nodes.

| Tool                    | Purpose                                                      |
| ----------------------- | ------------------------------------------------------------ |
| `be.llmComplete`        | Structured-output completion against the configured provider |
| `be.embed`              | Sentence embedding for a list of texts                       |
| `be.embeddingNeighbors` | Top-K nearest tasks given an embedding                       |
| `be.summarize`          | Long-text summarisation                                      |
| `be.translate`          | Natural-language translation                                 |
| `be.detectDrift`        | Rule + LLM hybrid: WIP overflow, stale tasks, unowned bugs  |
| `be.budgetCheck`        | Enforce per-project / per-org token budget; refuse on overrun |

**Dropped from v2:** `be.scheduleDigest` and `be.dispatchDigest` (deferred to v3 — each requires OAuth integration with Slack/Confluence); `be.persistThread` (replaced by LangGraph checkpointer).

### 5.6 MCP compatibility

LangGraph has first-class MCP adapters via `langchain-mcp-adapters`. Each named agent in `app/agents/catalog/` is MCP-compatible from Phase A:

- The same agents that serve the FE can serve any external assistant (Cursor, Claude Desktop, etc.) via MCP's streamable-HTTP transport.
- FE tools exposed to the agent are registered as MCP tool schemas automatically.
- No separate MCP endpoint is needed; the agent registry is the MCP surface.

v2 deferred this to "once Phase F lands." In 2026 with a LangGraph backend, this is free leverage — ship it from Phase A.

### 5.7 Validation and safety

- Every tool argument crossing the wire is JSON-schema validated server-side and cache-validated client-side (carried from v2).
- `fe.boardSnapshot` strips notes longer than 4 KB to head + tail + hash; full notes require explicit user consent or autonomy ≥ Plan.
- All IDs in `citation.refs` and `mutation_proposal` are validated against the React Query cache before the FE acts on them.
- `mutation_proposal` events always carry `undoable: true` (non-undoable changes are not allowed in v2.1).
- Tool definitions are server-owned. The browser cannot inject tool definitions into the agent thread.

---

## 6. Trust, autonomy, and undo

### 6.1 The Autonomy Dial (simplified)

Two shipped levels plus a per-tool opt-in third level:

| Level                  | What the agent can do                                                              |
| ---------------------- | ---------------------------------------------------------------------------------- |
| **1. Suggest**         | Read tools only. Returns text + suggestions, never proposes mutations.             |
| **2. Plan** (default)  | Read tools + `mutation_proposal` events. Every proposal needs explicit user consent before execution. Accepted mutations get a 10-second toast Undo. |
| **3. Auto** (per-tool) | Admin-only opt-in, off by default. The agent may auto-execute specific low-risk tools (`assignTask`, in-column `moveTask`, `renameColumn`) with a 10-second toast Undo. High-risk tools always require Plan-level confirmation. |

**What v2 had that v2.1 drops:**

- ~~Level 3 "Act with confirmation"~~ — collapsed into Plan. Every proposal requires consent; there is no "queue in inbox and single-click confirm" mode distinct from Plan.
- ~~Level 4 "Act and notify"~~ — replaced by per-tool Auto, which is more granular and admin-controlled.
- ~~Auto-promotion thresholds (≥95% accept on last 50).~~ Promotion is an explicit admin action, not automatic. The chicken-and-egg problem (a tool can't reach 50 invocations at Plan level if every invocation requires consent) is solved by shadow mode (Section 6.6) before promotion, then an admin flip.
- ~~5-dimensional permission space (4 levels × per-tool × per-project × per-user × auto-promotion).~~ Now: 2 levels + per-tool Auto (admin) + per-project disable (existing). Three dimensions.

The dial replaces v1's binary `boardCopilot:enabled`. v1's `enabled=false` becomes Level 0 ("Off") for backward compat. The dial state persists in `localStorage` under `boardCopilot:autonomy:<projectId|"global">`.

### 6.2 Action History + Toast Undo (right-sized)

A right-edge Drawer ("History") accessible from the avatar menu.

- One row per agent-initiated mutation (or proposal that the user accepted).
- Columns: timestamp, tool, target IDs (deep-linked), inputs (collapsible), outcome (`applied` / `undone` / `failed`).
- **Toast Undo for 10 seconds** after each mutation. This is the only Undo affordance. It is proven safe by Gmail and Linear.
- **No 24-hour drawer Undo.** The History drawer is read-only. When a user wants to reverse an old change, they edit manually. This removes the IndexedDB snapshot store entirely and avoids the impossible consistency problem of undoing changes after intervening manual edits.
- `bulkApply` groups its child rows visually.
- History entries are local to the browser session by default. With server-side persistence enabled (LangGraph checkpointer), admins can view org-wide history.

### 6.3 Memory and persistence (delegated to LangGraph)

v2 invented four memory layers (per-turn, per-thread in IndexedDB, project memory, learned profile). v2.1 delegates to LangGraph's two well-defined layers:

| Layer                                    | LangGraph primitive      | Scope                          | What it stores                                                   |
| ---------------------------------------- | ------------------------ | ------------------------------ | ---------------------------------------------------------------- |
| **Per-thread memory**                    | `BaseCheckpointSaver`    | Thread-scoped (one per turn)   | Full conversation state, tool call history, intermediate results |
| **Cross-thread memory**                  | `BaseStore`              | Namespaced per project/user    | Learned profile, accepted suggestion patterns, per-coordinator workload defaults, per-epic point baselines |

**Namespace design for BaseStore:**

| Pattern                  | Namespace                              | Use case                                |
| ------------------------ | -------------------------------------- | --------------------------------------- |
| Per-user preferences     | `("users", userId, "preferences")`     | Autonomy level, display preferences     |
| Per-project profile      | `("projects", projectId, "profile")`   | Learned estimation baselines, epic patterns |
| Per-user per-project     | `("users", userId, projectId, "facts")`| User-specific project facts             |

**Persistence opt-in** is a boolean `enabled` on the store namespace, not a separate subsystem. The user can inspect and reset their learned profile from the Settings panel (which calls `store.delete` on the relevant namespace).

**What v2 had that v2.1 drops:**

- ~~IndexedDB per-thread persistence~~ — replaced by server-side checkpointer.
- ~~`boardCopilot:thread:<projectId>` in IndexedDB~~ — threads live on the server.
- ~~Client-side learned profile~~ — replaced by `BaseStore` on the server.
- ~~`be.persistThread` tool~~ — persistence is built into the checkpointer; no explicit tool needed.

The browser is stateless between sessions. LangSmith tracing is available for free via the LangGraph runtime, providing observability that the client-side memory model could not.

**Right to silence.** v1's per-project disable carries over. When a project is disabled: no turns open, no embeddings are updated, no drift detection runs, no store state is updated, and persisted threads are frozen. This is enforced both client-side (`assertRunPayloadProjectsAiAllowed`) and server-side (the agent checks `projectId` against the org allow-list before any tool execution).

### 6.4 Spend and budgets (admin-only)

- The server returns a `custom` event with `kind: "usage"` at the end of every turn with `tokensIn` and `tokensOut`.
- **USD is admin-only.** End users see latency ("median 1.4s") and reliability ("worked 47/50 times") in the Settings panel — signals they can act on. Dollar amounts create unhelpful cost-anxiety for ICs and PMs. Ari (admin) sees the full spend dashboard with per-project monthly USD caps.
- Workspace admins set per-project monthly token caps. The server enforces them via `be.budgetCheck` at the start of every turn; if exhausted, the agent returns a text message ("Budget reached for this project this month") and ends.

### 6.5 Accessibility

Every new surface specifies its ARIA pattern and keyboard interactions. WCAG 2.2 criteria 2.4.11–13, 2.5.7–8 are all implicated by the new drawers and palette.

| Surface              | ARIA pattern                   | Keyboard                                                        |
| -------------------- | ------------------------------ | --------------------------------------------------------------- |
| Command palette      | `role="combobox"` + `listbox`  | `Cmd/Ctrl+K` open; `↑↓` navigate; `Enter` select; `Esc` close; `Tab` toggles AI mode |
| Action History drawer| `role="log"` + `role="listitem"` per row | `Tab` through rows; `Enter` expands details; `Esc` closes drawer |
| Mutation proposal    | `role="alertdialog"`           | Focus trapped; `Enter` accept; `Escape` reject; `Tab` between Accept/Edit/Reject buttons |
| Triage Inbox         | `role="feed"` + `role="article"` per nudge | `Tab` through nudges; `Enter` opens action; `Esc` closes |
| Chat streaming text  | `aria-live="polite"` (carry over from v1) | —                                                               |
| Side-by-side diff    | `role="table"` with row-by-row `aria-label` | `↑↓` navigate rows; `Enter` toggles expand                     |

Focus management rules:
- All drawers trap focus while open and return focus to the invoking control on close.
- Sticky column headers must not occlude focused controls (`scroll-padding-top` on the page container).
- Every interactive element ≥ 24×24 CSS px (WCAG 2.5.8).
- Streaming text updates use `aria-live="polite"`; mutation proposals use `aria-live="assertive"`.

### 6.6 Shadow mode for safe tool promotion

Before promoting a tool from Plan to Auto, the agent must demonstrate quality without user exposure. Shadow mode provides this:

- **Shadow mode per tool:** the agent generates `mutation_proposal` events for shadowed tools, but the FE silently logs them to telemetry instead of rendering them.
- **Comparison:** the telemetry pipeline compares shadow proposals against what users actually did (manual edits that match the shadow proposal = a "would have been correct" signal).
- **Promotion:** a workspace admin reviews the shadow-vs-actual correlation and explicitly flips the tool from shadow to Auto. There is no automatic promotion.
- **Scope:** shadow mode is opt-in per tool, per project, and only available to admins in the Settings panel.

### 6.7 Redaction (server-side)

v2 proposed client-side redaction via `src/utils/ai/redact.ts`. v2.1 moves redaction to the server:

- The browser sends the full text under TLS to the server.
- The server applies the redaction pass before passing content to the LLM provider. This avoids degrading model quality by reasoning over masks, and catches more than a client-side regex can (PII names, customer IDs, multi-line secrets).
- Provider responses come back un-redacted to the user.
- The unit-test corpus for redaction belongs in `jira-python-server`, not in the FE.
- AC-V8 is rewritten: "The server's redaction pass masks emails, bearer tokens, and PII before forwarding to the LLM provider. Verified by server-side unit tests."

### 6.8 "What is shared with the agent?" panel

This is the most underrated trust feature of 2026 and deserves a full specification:

- A modal/drawer accessible from Settings → Board Copilot → "What is shared with the agent?"
- Shows, for the most recent turn, the **exact JSON payload** that left the browser — pretty-printed, with any redacted spans highlighted in the server response.
- Includes a "Copy" button for the full payload.
- **Always-on in dev mode** (visible as a collapsible panel at the bottom of every agent interaction).
- **Opt-in in prod** (accessible from Settings).
- Updated after every turn with the most recent payload.

---

## 7. Redesigned and new surfaces

Each surface is a thin UI — the heavy lifting is the named agent. v1's surfaces remain available as the "Suggest" fallback when the agent is unreachable.

### 7.1 Command palette (`Cmd/Ctrl+K`) — new

A single input that:

- Indexes all projects, tasks, columns, members for instant navigation (offline).
- Has an **AI mode** toggle (`Tab` to switch, or prefix `/` to enter agent mode).
- In AI mode, every keystroke streams a turn to `chat-agent` with the user's current focus attached.
- Built-in slash commands: `/draft`, `/estimate`, `/brief`, `/triage`, `/audit`, `/settings ai`.

**Phasing:** ships as **navigation-only** in Phase A (v2 OQ5 resolved: yes, ship nav-only first). AI mode adds in Phase E.

**Mobile:** `Cmd/Ctrl+K` is desktop-only. A single visible Copilot button remains on the board header on mobile viewports, opening the right rail to the chat tab. The palette is a desktop accelerator, not the only door (Section 7.10).

### 7.2 Smart task drafting — redesigned

- The "Draft with AI" link still launches `AiTaskDraftModal`, but the modal opens with **three suggested prompts** sourced deterministically:
  1. "Continue the last bug you reported" (last task touched by this user)
  2. "Decompose the largest unstarted task" (largest by story points)
  3. "Add a follow-up to _{taskName}_" (most recently edited task)
- These are **deterministic templates** refreshed when the React Query cache changes. No LLM call on panel open. Instantly trustworthy, never stale by more than one cache cycle.
- The breakdown action shows a picker for the breakdown axis (`by phase` / `by surface` / `by risk` / `freeform`), and the agent returns the breakdown for the chosen axis. The five hard-coded `SUBTASK_VERBS` are gone.
- Every populated field carries a `Suggested by Copilot` badge until the user edits the field.
- After Submit, a toast appears with `Undo` (10s); the new task is also visible in the Action History.

### 7.3 Inline AI in the task note editor — redesigned (scoped down)

v2 specified `/copilot` slash commands inside `Input.TextArea` with a "translucent overlay" preview. The substrate is a plain HTML textarea with no rich-text capabilities, no overlay support, and no caret position API beyond `selectionStart`. Implementing this properly requires either (a) replacing the textarea with a contenteditable / Lexical / Tiptap editor, or (b) shipping a poor imitation that breaks accessibility and IME composition.

**v2.1 design:** a small **"Rewrite with AI" button** above the textarea that opens a **side panel** with the rewrite options:
- _Rewrite as user story_
- _Add acceptance criteria_
- _Translate to \<user locale\>_
- _Summarize in 2 lines_
- _Polish tone_
- _Free prompt_

The user reviews the rewrite in the side panel and clicks Accept (replaces textarea content) or Cancel. Accepted edits show the `Suggested by Copilot` badge.

This is dramatically less code, dramatically more accessible, and does not paint future editor work into a corner. If the team later swaps to a rich-text editor, inline slash commands become a natural follow-up.

### 7.4 Estimation + readiness — redesigned

Unchanged from v2 §7.4.

### 7.5 Board brief / standup — redesigned

- The Brief Drawer remains, but its **headline is computed by what changed since the last brief the user read**, not by an abstract risk taxonomy. "What's new vs. yesterday morning" is the lede that earns daily reads.
- Headline ranking (revised from v2): load imbalance > WIP overflow > unowned bug in last 24h > backlog dilution > "balanced". This prioritizes daily relevance for Devon (tech lead), not surprise.
- New buttons in the drawer footer: `Copy as Markdown`, `Save as task note`.
- **Deferred to v3:** `Send to Slack`, `Schedule daily 09:00`. These require OAuth integration with Slack/Confluence and are full features each. Listing them in v2.1 creates false scope.
- The recommendation is a single sentence with a `Run this` button that maps to a `mutation_proposal`.

### 7.6 Conversational assistant — redesigned

- The `Ask` button is demoted: the same conversation lives in the command palette, in a side Drawer, and as a `?` shortcut on every task card.
- **Sample prompts** are deterministic templates, not LLM-generated:
  1. "What's at risk on this board?" (always available)
  2. "{lastTouchedTaskName} — what's the status?" (last task user interacted with)
  3. "Who has the most open work?" (always available)
- Refreshed when the cache changes. No LLM call on panel open.
- Tool-call internals are never shown verbatim. The assistant emits `citation` events with **required `quote` field** (verbatim excerpt, not optional). The UI shows a "Sources (N)" footnote.
- **Citation click-through:** clicking a citation scrolls the source entity into view and pulse-highlights it for 1 second (task card on the board, member row in workload, etc.). On hover, a card shows the verbatim `quote`.
- `Attach selection` affordance (board lasso) carries forward from v2.
- `Save to task note` carries forward from v2.
- Optional persistence via LangGraph checkpointer; off by default.

### 7.7 Semantic + agent search — redesigned

Unchanged from v2 §7.7.

### 7.8 Triage inbox — new (with aggregation/decay rules)

A small `Inbox` icon in the header (badge with unread count, capped at 9). Each entry is a nudge the agent generated proactively.

**Aggregation rules:**
- At most **5 active nudges per board**. Newer nudges replace older ones of the same type (e.g., a new "Maya overloaded" nudge replaces the previous one, not appends to it).
- Nudges of different types coexist (one load-imbalance + one WIP-overflow + one unowned-bug is 3 nudges, not 3 of the same).

**Decay/expiry rules:**
- A nudge **auto-dismisses** when the underlying state changes (e.g., the unowned bug gets an assignee → the nudge disappears).
- Unacted nudges expire after **4 hours** and are silently removed.
- Acknowledged nudges (user clicked "Dismiss") are removed immediately.

**Generation:**
- `triage-agent` runs `be.detectDrift` on a server-side schedule (every 15 min per active project).
- Nudges are pushed to the FE via the next-opened SSE turn or via a poll on Inbox open.
- Per-project disable mutes nudges for that project.

### 7.9 Settings — new

A consolidated "Board Copilot" section in the avatar dropdown:

- Autonomy dial (Section 6.1) — two levels + per-tool Auto (admin-only)
- Per-project disable (carry over from v1)
- Thread persistence toggle (backed by LangGraph checkpointer)
- Latency and reliability metrics (end-user view: "median 1.4s", "worked 47/50 times")
- Spend dashboard (admin-only: per-project monthly USD, token counts)
- "What is shared with the agent?" panel (Section 6.8)
- Reset learned profile per project (calls `BaseStore.delete` on the project namespace)
- Shadow mode controls (admin-only, Section 6.6)

### 7.10 Mobile

`Cmd/Ctrl+K` is desktop-only. The PRD does not mention mobile, but ICs and PMs check boards on phones daily.

- A single visible **Copilot button** on the board header on mobile viewports (opens the right rail to the Chat tab).
- The command palette is a desktop accelerator, not the only entry point.
- Phase E's "deprecate board header buttons" keeps the Copilot button on mobile — it is only the desktop header buttons that are replaced by the palette.
- Drawers render as bottom sheets on `xs`/`sm` viewports (matching the UI/UX plan §2.A.2).

### 7.11 Plan visibility (resolved)

v2 did not resolve whether the agent's plan is visible or hidden. v2.1 takes a position:

- **At Suggest level:** plan is hidden. The user sees only text + "Sources" footnotes.
- **At Plan level:** plan is visible as a **collapsible "Working: N steps" card** (Cursor-style) that expands into the step trace. Default collapsed. Each step shows the tool name, a one-line rationale, and a risk band (low/med/high).
- **At Auto level (per-tool):** plan is hidden for auto-executed tools; a toast notifies the user of what happened.

### 7.12 Feedback on text answers

v2 has accept/reject for `mutation_proposal` but no feedback on non-mutating text answers. v2.1 adds:

- **Thumbs-up / thumbs-down** on every assistant text turn. Stored in `BaseStore` under `("feedback", projectId, threadId)`.
- **"This was wrong because…" textarea** (optional, appears on thumbs-down). Stored alongside the feedback entry.
- **"Flag citation as irrelevant"** on individual citations. Stored as negative signal for the embedding pipeline.
- These signals feed into the shadow-mode quality comparison (Section 6.6) and help detect drift in non-mutating paths.

---

## 8. Technical contract for the Python server (FE-side requirements)

### 8.1 Endpoints

The FE uses the **existing LangGraph server endpoints** (Section 5.2). The only FE-specific additions:

| Method | Path                              | Purpose                                         |
| ------ | --------------------------------- | ----------------------------------------------- |
| `GET`  | `/api/v1/health`                  | Liveness; FE shows degraded indicator when down |

Budget, digest dispatch, and abort are handled within the agent stream (budget via `be.budgetCheck` at turn start; abort via closing the SSE connection, which the LangGraph runtime detects).

### 8.2 Errors

- HTTP 401: relogin required; FE drops the cached token and re-auths.
- HTTP 429: returns `Retry-After`; FE shows "Board Copilot is busy" and retries with backoff.
- HTTP 402 (or 429 with `X-Reason: budget`): budget exhausted; FE shows a message to the user and links admins to the spend dashboard.
- Within-stream errors: LangGraph emits error events in the stream; FE shows inline `<Alert type="warning">` with Retry when appropriate.

### 8.3 SLOs

Unchanged from v2 §8.3.

### 8.4 Logging

- Server logs only metadata: `agent_name`, `thread_id`, `latency_ms`, `tokens_in`, `tokens_out`, `status`, `project_id_hash`, `tool_calls_count`, `mutation_proposals_count`, `mutations_applied_count`, `undos_count`. No raw user content.
- **LangSmith tracing** is available for free via the LangGraph runtime. It provides per-turn, per-tool observability without any custom logging infrastructure.

### 8.5 Versioning

- No global `protocolVersion`. Version is per-agent via `GET /api/v1/agents/{name}` returning `AgentMetadata.version`.
- The FE checks the agent version on first use per session. If the version is deprecated, the FE shows a non-blocking toast: "Board Copilot has been updated — some features may behave differently."
- No HTTP 426. No forced global reload.

---

## 9. Backward compatibility and rollout

### 9.1 Local engine remains the fallback

If `REACT_APP_AI_BASE_URL` is empty or `health` is failing, the FE falls back to v1's local engine for the read-only surfaces (Brief, Estimate, Readiness, Search, Draft as a deterministic prompt template). All write tools are hidden in fallback mode (autonomy collapses to "Suggest"). The Inbox shows "Connect a copilot server to enable proactive nudges".

**Explicit degradation signal:** when the agent is unreachable, the FE shows a **banner**: "Copilot is offline — basic suggestions only." It does not silently route to a different brain. This addresses v2's admitted-but-unsolved local fallback drift problem.

### 9.2 Phased rollout (capability, not calendar)

- **Phase A — Wire + telemetry + MCP.**
  Ship `useAgent` (new), the SSE parser for LangGraph `StreamPart`, `agent.d.ts` types, the health check, the command palette (nav-only), and MCP adapter wiring on the server. Carry forward all v1 surfaces unchanged (read-only).

- **Phase B — Brief + Estimate via named agents.**
  Replace the local engine for Brief and Estimate with `board-brief-agent` and `task-estimation-agent`. Add citations with required `quote` field and click-to-source highlighting. Local engine becomes fallback-only.

- **Phase C — Mutation proposals + Action History.**
  Introduce `mutation_proposal` via LangGraph interrupt and the Action History drawer + toast Undo. Autonomy dial ships at Level 2 (Plan) by default.

- **Phase D — Triage inbox.**
  `triage-agent` with `be.detectDrift`. Inbox surface with aggregation/decay rules.

- **Phase E — Command palette AI mode + chat agent consolidation.**
  AI mode in the palette. Deprecate the desktop-only board header AI buttons (keep the mobile Copilot button).

- **Phase F — Shadow mode + Auto promotion.**
  Shadow mode for per-tool quality validation. Admin-toggled Auto level for approved tools.

Each phase is independently revertible behind the same `boardCopilot:enabled` flag and the `boardCopilot:autonomy:*` settings.

### 9.3 Dev-mode for json-server / no-LLM contributors

The repo's dev experience runs against `__json_server_mock__`. The agent server requires real auth, real data, and real LLM keys. Dev mode is explicitly designed:

- **Default (no env var):** local engine fallback. All AI surfaces work with deterministic outputs. No network dependency. No LLM key needed.
- **`REACT_APP_AI_BASE_URL=http://localhost:8000`:** point to a local agent server running against the same json-server mock data. The agent server ships a `--dev` flag that uses `InMemoryStore` + `MemorySaver` (no Postgres/Redis needed).
- **Tests:** all FE tests continue to mock at `global.fetch` and never need a network for AI surfaces. This is already the case for v1 and must remain true.
- **Documented in `README.md`:** a "Developing with Board Copilot" section explains both modes and the env var.

---

## 10. Acceptance criteria (v2.1)

Numbered to extend, not replace, the v1 ACs in `board-copilot.md` §5.

| ID     | Acceptance criterion                                                                                                                                                                      |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-V1  | With `REACT_APP_AI_BASE_URL` empty, the app behaves as v1: read-only AI surfaces, no Inbox, no History drawer, no autonomy dial.                                                          |
| AC-V2  | With the agent reachable, every AI feature routes through `POST /api/v1/agents/{name}/stream` with the named agent from §5.1.                                                            |
| AC-V3  | The agent never executes a `mutation_proposal` without an explicit `Command(resume={choice: "accept"})` from the FE. Verified by integration test.                                        |
| AC-V4  | Every accepted mutation produces a History row and a working toast Undo for ≥10 seconds.                                                                                                  |
| AC-V5  | Auto-level tools may execute only the pre-approved low-risk set (`assignTask`, in-column `moveTask`, `renameColumn`). Any other tool requires Plan-level confirmation. Admin-toggled only. |
| AC-V6  | Tool-call internals are never visible without explicit "Show details" toggle. Default off.                                                                                                |
| AC-V7  | Every assistant turn that cited project data emits at least one `citation` event with a required `quote` field; the FE renders "Sources (N)" with click-to-highlight.                     |
| AC-V8  | The server's redaction pass masks emails, bearer tokens, and PII before forwarding to the LLM provider. Verified by server-side unit tests.                                              |
| AC-V9  | Spend dashboard (admin-only) reflects per-project monthly tokens spent within ≤5 s of the last completed turn.                                                                            |
| AC-V10 | Per-project disable blocks turns, proactive nudges, embedding updates, drift detection, and store updates for that project.                                                               |
| AC-V11 | `Cmd/Ctrl+K` opens the command palette; AI mode toggles via `Tab` or `/`; `Esc` closes; focus is trapped while open.                                                                     |
| AC-V12 | "Rewrite with AI" button above the task note textarea opens a side panel; Accept replaces content; Cancel reverts. Accessible via keyboard.                                              |
| AC-V13 | Brief footer `Copy as Markdown` and `Save as task note` actions work. Slack/Confluence/Schedule actions are absent (deferred to v3).                                                     |
| AC-V14 | Triage Inbox: ≤5 active nudges per board; auto-dismiss on state change; expire after 4 hours; badge capped at 9.                                                                         |
| AC-V15 | When the agent is unreachable, a banner reads "Copilot is offline — basic suggestions only." The FE does not silently fall back to a different brain.                                     |
| AC-V16 | Each new surface meets its ARIA pattern from §6.5. Zero `jest-axe` violations on every surface test.                                                                                     |
| AC-V17 | Shadow mode: shadowed tools generate proposals logged to telemetry, never rendered to the user. Admin can review shadow-vs-actual correlation.                                            |
| AC-V18 | Mobile: a visible Copilot button on the board header opens the right rail on mobile viewports. `Cmd/Ctrl+K` is desktop-only.                                                             |
| AC-V19 | Cold start: empty projects show onboarding prompts, not blank personalised surfaces.                                                                                                      |
| AC-V20 | Dev mode: `REACT_APP_AI_BASE_URL` unset → local engine works end-to-end with no network. Documented in `README.md`.                                                                      |

---

## 11. Metrics

Carries M1..M7 from `board-copilot.md` §13 and adds:

- **M8 — Acceptance rate per tool.** % of `mutation_proposal` events the user accepts. Target: ≥70% per tool before admin can enable Auto.
- **M9 — Undo rate per tool.** % of accepted mutations that get undone within 10 seconds. Target: ≤5% per tool.
- **M10 — Inbox engagement.** % of nudges read / acted on per week. Target: ≥40% read.
- **M11 — Palette adoption.** % of AI invocations from the command palette vs legacy buttons. Target: ≥50% within 4 weeks of GA.
- **M12 — Drift catches.** Number of accepted nudges per board per week.
- **M13 — Shadow-vs-actual correlation.** For shadowed tools: % of shadow proposals that match what users actually did. Used to justify Auto promotion.
- **M14 — Text answer quality.** Thumbs-up rate on non-mutating text answers. Target: ≥80%.
- **M15 — Citation relevance.** % of citations not flagged as irrelevant. Target: ≥90%.

**Dropped from v2:** M10 "Time saved per turn" (server-side estimate comparing proposed mutation count × median manual time). This metric is gameable and not actionable by users. Replace with M14/M15 which are directly measurable.

All metrics flow through the same `track(event, payload)` no-op hook the UI/UX plan §2.C calls out. Concrete event names live in `src/constants/analytics.ts` (new).

---

## 12. Risks and mitigations

| Risk                                                                   | Mitigation                                                                                                               |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| The agent proposes a confidently-wrong mutation                        | Plan default; explicit accept; History + toast Undo; shadow mode before Auto promotion; admin-only Auto toggle            |
| Token spend balloons during a chatty session                           | Per-org / per-project monthly token cap enforced by `be.budgetCheck` at every turn open                                  |
| The user's note contains secrets that should not reach the LLM         | Server-side redaction pass before forwarding to the provider; "What is shared" panel for transparency                    |
| The user disables the global toggle but a scheduled process still fires | `be.detectDrift` checks per-project disable list at fire time; drops silently                                            |
| The local fallback engine gets stale vs the agent's behaviour          | Explicit "Copilot is offline — basic suggestions only" banner; no silent fallback to a different brain                   |
| Promoting a tool to Auto surprises a coworker who never opted in       | Auto is per-tool, admin-only; visible in Settings; shadow mode validates quality before exposure                          |
| Noisy triage inbox becomes a mute-button magnet                        | ≤5 active nudges per board; auto-dismiss on state change; 4-hour expiry; badge capped at 9                               |
| Citation decoration without substance                                  | `quote` is required (not optional); click-to-source highlights the cited entity; hover shows verbatim excerpt            |

---

## 13. Deferred to v3 (and reasons)

Items explicitly removed from v2.1 scope, with clear reasons:

| Item                                               | Reason                                                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `be.scheduleDigest` / `be.dispatchDigest` to Slack | Full OAuth integration feature (channel picker, webhook management). Ship digest copy/save first.       |
| `be.dispatchDigest` to Confluence                  | Full OAuth integration feature (space picker, page creation). Same rationale.                           |
| Inline `/copilot` slash commands in textarea        | Requires rich-text editor swap (Lexical/Tiptap). "Rewrite with AI" button covers the use case for now. |
| Voice / speech-to-text composer                    | UX-rich; high cost. Revisit in v3.                                                                     |
| Four-level autonomy dial                           | Over-engineered before metrics exist. Two levels + per-tool Auto is sufficient.                         |
| 24-hour drawer Undo                                | Unsafe after intervening manual edits. Toast Undo + read-only History is the safe design.               |
| Client-side memory model (IndexedDB/localStorage)  | Duplicates LangGraph checkpointer + store. Server owns persistence.                                    |
| USD display for end users                          | Creates cost-anxiety for ICs/PMs. Admin-only.                                                           |
| Client-side redaction                              | Degrades model quality; misses non-trivial PII. Server-side is strictly better.                        |
| Auto-promotion thresholds                          | Chicken-and-egg problem. Shadow mode + admin action replaces automatic promotion.                       |
| Cross-project planning                             | Scope creep risk. Revisit when per-project metrics show acceptance ≥70%.                                |

---

## 14. Open questions (resolved and remaining)

### Resolved (from v2)

| v2 OQ  | Resolution in v2.1                                                                                     |
| ------ | ------------------------------------------------------------------------------------------------------ |
| OQ1    | Action History is per-user view by default; per-project view available to admins via server-side log.  |
| OQ2    | Smallest Auto tool set: `assignTask`, in-column `moveTask`, `renameColumn`. Everything else ≤ Plan.   |
| OQ3    | Agent cannot read FE-redacted notes. User can re-send full content via explicit "Send full note" toggle per turn. |
| OQ4    | Autonomy dial lives in avatar dropdown → Settings → Board Copilot.                                    |
| OQ5    | Command palette ships in Phase A as nav-only; AI mode in Phase E.                                      |
| OQ6    | Confidence bands: "Low / Moderate / High" in the assist panel; no raw percentages in chat.             |

### New open questions

- OQ7 — Should the triage-agent run on a fixed 15-minute schedule, or be event-driven (triggered by task mutations)? Lean: event-driven is more efficient but harder to implement; start with 15-minute schedule, migrate to event-driven in v3.
- OQ8 — Should the `BaseStore` learned profile be inspectable as raw JSON by the user, or only via a summarised "What Copilot knows about this project" panel? Lean: summarised panel for end users; raw JSON for admins.
- OQ9 — Should the "Rewrite with AI" panel show a diff view (old vs. new) or just the new text? Lean: diff view for notes longer than 3 lines; plain text for shorter notes.

---

## 15. Appendix — touch list (extends `board-copilot.md` §15.1)

### New

- `src/utils/hooks/useAgent.ts` — single hook that opens an SSE stream to a named agent, parses LangGraph `StreamPart` events, handles `interrupt` → resume flow for FE tools.
- `src/utils/ai/agentClient.ts` — SSE parser for LangGraph v2 stream format; reuses `parseFetchBody` patterns; AbortController lifecycle identical to `useAi.ts`.
- `src/utils/ai/feTools/` — one file per FE tool from §5.4; each exports `{ schema, run }`.
- `src/utils/ai/history/` — Action History storage (in-memory for session; server-synced via checkpointer for admins) + selectors.
- `src/components/commandPalette/` — `Cmd/Ctrl+K` palette with `role="combobox"` + `listbox`.
- `src/components/historyDrawer/` — Action History (read-only log).
- `src/components/inboxDrawer/` — Triage inbox with aggregation/decay.
- `src/components/aiSettingsPanel/` — Autonomy dial + per-tool Auto (admin) + thread persistence + shadow mode + "What is shared" + reset learned profile.
- `src/components/mutationProposal/` — `role="alertdialog"` with Accept / Edit / Reject + diff view.
- `src/components/aiRewritePanel/` — "Rewrite with AI" side panel for task note editor.
- `src/interfaces/agent.d.ts` — wire schema for LangGraph `StreamPart` + `CustomEvent` types.
- `src/constants/analytics.ts` — event names for M1..M15.

### Modified

- `src/components/aiTaskDraftModal/index.tsx` — breakdown axis picker, deterministic sample prompts, `Suggested by Copilot` badges, post-Submit toast Undo.
- `src/components/aiTaskAssistPanel/index.tsx` — collapsible sections, "Why?" popover with citations (required `quote`), debounce → 1000 ms.
- `src/components/aiChatDrawer/index.tsx` — citations with click-to-highlight, attach-selection, save-to-note, thumbs-up/down, default-off raw tool details.
- `src/components/aiSearchInput/index.tsx` — reformulate-with-AI chip on no-result.
- `src/components/boardBriefDrawer/index.tsx` — agent-driven headline (what changed since last read), footer actions (Copy Markdown / Save as note).
- `src/components/header/index.tsx` — replace global AI toggle with Settings entry; expose Inbox + History drawers; keep Copilot button on mobile.
- `src/pages/board.tsx` — collapse Brief/Ask/Draft buttons into single `Copilot` `Dropdown.Button` on desktop; keep single Copilot button on mobile.
- `src/utils/hooks/useAiEnabled.ts` — extend with autonomy levels; keep `boardCopilot:enabled` for backward compat.
- `src/utils/ai/projectAiStorage.ts` — extend per-project disable to gate agent endpoint, proactive nudges, embedding updates, drift detection, and store updates.
- `README.md` — Board Copilot v2.1 section: named agents, autonomy dial, History, fallback semantics, dev-mode instructions.

### Deprecated (kept as fallback only when the agent is unreachable)

- `src/utils/hooks/useAi.ts`, `src/utils/ai/engine.ts`, `src/utils/hooks/useAiChat.ts`, `src/utils/ai/chatEngine.ts`, `src/utils/ai/chatTools.ts`. None are removed in Phase A; their call sites switch to `useAgent` between Phases B and E.

---

## 16. Mapping of v2 review items to v2.1 sections

This table traces every item from the v2 design review to its resolution in v2.1.

| Review item | v2.1 section | Resolution |
| --- | --- | --- |
| §1 Substrate blindness (LangGraph alignment) | §5.1, §5.2, §5.3 | Named agents in `app/agents/catalog/`; `POST /api/v1/agents/{name}/stream`; LangGraph interrupt for HITL |
| §1 Memory model reinvention | §6.3 | Delegated to `BaseCheckpointSaver` + `BaseStore` |
| §1 Wire schema overlap | §5.2 | `AgentEvent` replaced by LangGraph `StreamPart` with `stream_mode=("updates","messages","custom")` |
| §1 Protocol versioning | §8.5 | Per-agent `AgentMetadata.version` via `GET /api/v1/agents/{name}`; no global `protocolVersion` |
| §1 MCP deferred | §5.6 | MCP-compatible from Phase A via `langchain-mcp-adapters` |
| §2.1 Over-engineered autonomy dial | §6.1 | Two levels + per-tool Auto; admin-only promotion |
| §2.2 Plan visibility unresolved | §7.11 | Explicit: hidden at Suggest, collapsed-by-default at Plan, hidden+toast at Auto |
| §2.3 SSE upstream / fallback POST | §5.3 | SSE down, plain fetch up (resume via POST). No hybrid. |
| §2.4 Local fallback drift unsolved | §9.1 | Explicit banner: "Copilot is offline — basic suggestions only" |
| §2.5 Too many transports | §5.2, §8.1 | Two shapes: stream (SSE) and health (GET). Budget/abort/digest folded into agent stream. |
| §3.1 Triage inbox mute-button magnet | §7.8 | ≤5 nudges per board; auto-dismiss on state change; 4-hour expiry |
| §3.2 Slash commands in plain textarea | §7.3 | "Rewrite with AI" button + side panel instead of inline slash |
| §3.3 Headline ranking wrong priority | §7.5 | Ranked by what changed since last read; load imbalance > WIP overflow > unowned bug |
| §3.4 Citations undesigned | §7.6, AC-V7 | `quote` required; click-to-source with pulse-highlight; hover card |
| §3.5 24h Undo over-engineered | §6.2 | 10s toast Undo only; History drawer is read-only |
| §3.6 Sample prompt personalisation hand-waved | §7.2, §7.6 | Deterministic templates: last task, largest unstarted, most recently edited. Refreshed on cache change. |
| §3.7 Drawer is wrong primary surface | §7.1, §7.9 | Palette is primary verb; drawers collapse into single right-side rail with tabs (Chat / Brief / Inbox / History) |
| §4.1 Client-side redaction | §6.7 | Server-side redaction; AC-V8 rewritten |
| §4.2 USD for wrong audience | §6.4 | Admin-only; end users see latency and reliability |
| §4.3 "What is shared" half-specified | §6.8 | Full spec: modal with exact JSON payload, pretty-printed, Copy button, always-on in dev |
| §4.4 Per-project disable doesn't propagate | §6.3 | Explicit: AI off = no embeddings, no drift detection, no store updates, threads frozen |
| §5.1 Cold-start UX undefined | §3.5 | Explicit empty states for every personalised surface |
| §5.2 Dev-mode missing | §9.3 | Local engine fallback; `--dev` flag for localhost agent; documented in README |
| §5.3 Mobile not designed | §7.10 | Single Copilot button on mobile; palette is desktop-only accelerator |
| §5.4 Accessibility undeveloped | §6.5 | Full table: ARIA pattern + keyboard per surface |
| §5.5 No shadow mode | §6.6 | Shadow mode per tool; admin-reviewed; no automatic promotion |
| §5.6 No feedback on text answers | §7.12 | Thumbs-up/down, "wrong because" textarea, flag-citation-as-irrelevant |
| §6 What to trim | §4.2, §13 | Explicit deferred list with reasons |

---

## 17. Bottom line

v2.1 preserves v2's product vision — one agent that watches the board, plans before it acts, and is reversible by default — while aligning with the substrate the team already runs. The five biggest changes (LangGraph alignment, memory delegation, autonomy simplification, undo right-sizing, trust rebalancing) collectively remove half the new code v2 would have required, half the new UI surfaces, and all the parallel-state systems that would have drifted from the server.

The Python server becomes the orchestration brain it was built to be, with named agents in `app/agents/catalog/` that are individually testable, individually versionable, and MCP-compatible from day one. The browser stops being a memory system and becomes a typed tool host with explicit degradation signals when the server is unreachable.

v1's safety posture (advisory only, opt-out, validated IDs) is preserved. v2's over-engineering (four-level dial, 24-hour undo, client-side memory, client-side redaction, USD for ICs) is trimmed. What remains is the product surface that earns trust progressively: shadow before exposure, admin before automation, 10-second undo before 24-hour undo, server before client.
