# AI UX Patterns: A Comprehensive Research Report

**Compiled: May 2026** | Sources: 2024–2026 articles, design system documentation, and product case studies

---

## Table of Contents

1. [AI Interaction Patterns](#1-ai-interaction-patterns)
2. [Loading States and Latency in AI UX](#2-loading-states-and-latency-in-ai-ux)
3. [Error Handling in AI Features](#3-error-handling-in-ai-features)
4. [AI Onboarding and Discovery](#4-ai-onboarding-and-discovery)
5. [Multimodal AI Interfaces](#5-multimodal-ai-interfaces)
6. [Actionable Recommendations Summary](#6-actionable-recommendations-summary)

---

## 1. AI Interaction Patterns

The industry has moved beyond the "Chat-Only" era into what practitioners call **Intent-Driven Design**—choosing the right UI pattern based on the user's goal entropy, task predictability, and expertise level.

### 1.1 Inline Suggestions / Ghost Text

**How it works:** AI offers dimmed "ghost text" completions at the cursor location. The user accepts (Tab), partially accepts, or ignores by continuing to type. GitHub Copilot pioneered this for code; it now extends to writing tools and form fields.

**Real-world examples:**
- **GitHub Copilot** offers two variants: *ghost text suggestions* (classic autocomplete at cursor) and *Next Edit Suggestions (NES)*, which predict the *location* of the next edit and what that edit should be—indicated by a gutter arrow. NES spans symbols, lines, or multi-line blocks, and users navigate to suggestions with Tab.
- **Cursor** extends this with `Cmd+K` inline AI edits, where users select code and describe a transformation in natural language.
- **Grammarly** shows inline actions when text is selected in any text field.

**Pros:**
- Zero context-switching—the user stays in their flow
- Low cognitive load: validating is easier than prompting
- Invisible when not needed; doesn't clutter the UI
- Follows the principle of "Draft, Don't Ask"

**Cons:**
- Limited to predictable, short-form completions
- Difficult to communicate *why* a suggestion was made
- Can be disorienting if suggestions change rapidly or shift code layout
- Not suitable for complex, multi-step or exploratory tasks

**When to use:** Predictable tasks where the user is already typing and the AI can offer a high-confidence next step. Best for code, writing, form filling, and data entry.

---

### 1.2 Chat / Conversational Interface

**How it works:** A dedicated text input where users describe goals in natural language and receive structured responses. Modern chat is never just a text box—it includes suggested starting prompts, inline previews, follow-up chips, and smart code blocks.

**Real-world examples:**
- **ChatGPT / Claude** — full-screen conversational interfaces with follow-up suggestions, regeneration carousels, and artifact panels.
- **Cursor Agent** — a chat panel embedded in the IDE that can read files, run commands, and make multi-file edits autonomously.
- **Notion AI** — a chat interface that operates on the current document, offering inline rewrite, summarize, and translate actions.

**Five key sub-patterns (from the AI Chat Interface Playbook):**
1. **Slash Commands (`/`)** — Discoverability through browsable menus. Users learn what the AI can do by typing `/`.
2. **Context Mentions (`@`)** — Users tag files, documents, or agents to build context without copy-paste. Used in Cursor (`@file`), Notion (`@page`), and enterprise tools.
3. **Follow-up Chips** — Suggested next questions after each AI response. Reduces cognitive load and teaches users what's possible.
4. **Smart Code/Content Blocks** — Output with contextual action buttons ("Copy", "Run", "Apply to File", "Explain"). Collapses the distance from response to result.
5. **Regeneration Carousel** — Generate multiple variations and swipe between them. Transforms interaction from slot machine to buffet.

**Pros:**
- Handles "high-entropy" goals—millions of ways to express intent
- Flexible and discoverable through suggested prompts
- Good for exploration, brainstorming, multi-turn reasoning
- Can combine with other patterns (inline previews, side panels)

**Cons:**
- The "blank page problem"—users don't know what to ask
- Slower than buttons or dropdowns for predictable tasks
- Conversation history becomes unwieldy for long sessions
- Users may over-rely on chat for tasks better served by structured UI

**When to use:** When the task is open-ended, exploratory, or requires back-and-forth refinement. When a form would be too restrictive.

---

### 1.3 Command Palette / Hybrid Interface

**How it works:** A keyboard-activated overlay (typically `Cmd+K`) that accepts both fixed commands (`/deploy`) and natural language queries ("Change all primary buttons to blue"). Combines the speed of structured actions with the flexibility of AI.

**Real-world examples:**
- **Cursor** — `Cmd+K` for inline AI edits, `Cmd+Shift+I` for the full Composer, plus Agent mode for autonomous multi-file tasks.
- **Linear** — `Cmd+K` command palette for navigation, issue creation, and AI-powered search with hybrid semantic matching.
- **VS Code** — Command Palette (`Cmd+Shift+P`) extended with Copilot-powered natural language commands.

**Pros:**
- Fastest interaction pattern for power users who know what they want
- Combines discoverability (browsable command list) with flexibility (NL input)
- Doesn't require a dedicated chat panel
- Works well for internal tools, IDEs, and productivity apps

**Cons:**
- Invisible to new users—requires learning the keyboard shortcut
- Needs a visible entry point (button or status bar indicator)
- Complex to implement: must handle fixed commands, fuzzy search, and NL simultaneously
- Can feel overwhelming if the command list is too large

**When to use:** Action-heavy products with power users. CRMs, IDEs, internal tools, project management apps.

---

### 1.4 Stealth AI / Form-Like UI ("AI Inside")

**How it works:** The AI is invisible. Traditional UI elements (dropdowns, toggles, pre-filled fields) are powered by AI predictions behind the scenes. The user validates rather than prompts. A small "AI badge" indicates where predictions were made.

**Real-world examples:**
- **Linear Triage Intelligence** — When issues enter triage, AI pre-fills team, assignee, labels, project, and priority. Suggestions use the same visual language as the rest of Linear. Users accept or dismiss. Properties auto-applied by AI are clearly marked and distinguishable from human-set values.
- **Adobe Photoshop** — Partner AI models (Google Gemini, FLUX, Topaz) are integrated into familiar workflows like Generative Fill and Generative Upscale. Users interact through the existing Photoshop interface, not a chat.
- **Gmail Smart Compose** — AI pre-fills email text as you type, styled as gray ghost text.

**Pros:**
- Eliminates the "blank page problem"—users validate, not create
- Fastest path to completion for predictable tasks
- Doesn't require users to learn prompt engineering
- Feels like the software "just works"

**Cons:**
- Users may not realize AI is involved (transparency concerns)
- Hard to communicate confidence or uncertainty
- Requires high accuracy—wrong pre-fills erode trust quickly
- Limited to tasks with predictable outputs

**When to use:** When the task is predictable and the user wants to get in and out fast. Classification, categorization, form filling, and data entry.

---

### 1.5 Side Panel / Agent Control Panel

**How it works:** A persistent or on-demand panel alongside the main workspace that shows AI recommendations, agent activity, approval workflows, and action history. Used for multi-step flows, auditable processes, and tasks requiring review before execution.

**Real-world examples:**
- **Cursor Agent** — Side panel showing agent activity, file changes, terminal commands, and a plan that the user can review and edit before building.
- **Linear Triage Intelligence** — Dedicated module in the triage view with hoverable reasoning, alternative suggestions, and a thinking-state timer.
- **Adobe Firefly AI Assistant** — Agentic tool that orchestrates multi-step workflows across Creative Cloud from a conversational side panel.
- **Intercom Fin** — Agent proposes responses in a side panel; human edits and approves before sending.

**Pros:**
- Context preserved alongside the main workspace
- Supports multi-step, auditable flows with role-based approvals
- Shows reasoning, alternatives, and history
- Can include approval inbox, undo capabilities, and audit trail

**Cons:**
- Consumes screen real estate
- Can be ignored if not contextually relevant
- Adds complexity to the layout
- Risk of information overload in dense panels

**When to use:** Multi-step flows, auditable processes, tasks requiring human oversight, and agentic workflows where the AI executes a sequence of actions.

---

### 1.6 Inline Microinteractions / Contextual Cards

**How it works:** A small, contextual card that appears where the user is working—containing a recommendation, a one-line rationale, and a clear action (accept/adjust). It hides after confirmation or silences itself if ignored.

**Real-world examples:**
- **Figma Make** — Select an area on the canvas; inline actions appear for AI-guided modifications.
- **Atlassian Intelligence** — Inline preview of AI output targeted to a specific part of the document without updating the whole canvas.
- **Sourcetable** — Inline actions on individual spreadsheet cells.

**Pros:**
- Minimal friction—appears right where the user is working
- Short decision cycle: one recommendation, one action
- Self-silencing prevents notification fatigue
- Preserves user focus on the main task

**Cons:**
- Limited to short, frequent decisions
- Can't handle complex multi-step reasoning
- Risk of being missed if too subtle
- Needs careful positioning to avoid obscuring content

**When to use:** Short, frequent decisions that benefit from AI assistance without breaking the user's workflow. Inline editing, quick categorization, and contextual recommendations.

---

### 1.7 Inpainting / Targeted Regeneration

**How it works:** Users select a specific region of content (text, image area, code block) and direct the AI to modify only that region, leaving the rest untouched. Changes are previewed before committing.

**Real-world examples:**
- **Adobe Firefly** — Brush-based selection on the canvas for targeted generative fill and editing.
- **Midjourney** — Inpainting directly on generated images to modify specific regions.
- **Notion AI** — Highlight text and choose from restructuring, restyling, or transformational actions.
- **Lovable** — Point at specific UI elements on the canvas to make targeted changes.

**Pros:**
- Precise control—users choose exactly what to change
- Preserves context and surrounding content
- Reduces rework from full regeneration
- Positions AI as a collaborator, not a replacement

**Cons:**
- Requires clear selection mechanisms per medium (brush for images, highlight for text)
- Preview-before-commit adds an interaction step
- Complex to implement for different content types
- Users may struggle to define the right scope of selection

**When to use:** When users need to adjust part of a larger piece of content without regenerating the whole. Creative tools, writing, code editing, and design.

---

### 1.8 Pattern Selection Decision Framework

| User Goal | Best Pattern | Examples |
|---|---|---|
| Predictable, fast completion | Stealth AI / Form-Like | Linear auto-classification, Gmail Smart Compose |
| Open-ended exploration | Chat Interface | ChatGPT, Claude, Notion AI chat |
| Power user speed | Command Palette | Cursor Cmd+K, Linear Cmd+K |
| In-flow micro-decisions | Inline Microinteraction | Figma Make, Atlassian Intelligence |
| Continuous code writing | Ghost Text / Inline Suggestions | GitHub Copilot, Cursor autocomplete |
| Multi-step auditable flows | Side Panel / Agent Control | Cursor Agent, Adobe Firefly Assistant |
| Targeted content modification | Inpainting | Adobe Firefly, Midjourney, Notion AI |

**The Golden Rule:** "Show, Don't Tell; Draft, Don't Ask." If you can replace a text prompt with a button, do it. If you can replace a blank box with a suggested draft, do it.

---

## 2. Loading States and Latency in AI UX

AI latency is fundamentally different from traditional web latency. LLM responses can take 2–45 seconds depending on the model and complexity. The key insight: **perceived performance matters more than actual performance.** Stanford HCI research (2024) found that users perceive streaming interfaces as **40% faster** than non-streaming ones, even when total response time is identical.

### 2.1 Streaming Responses: The Table-Stakes Pattern

Streaming transforms AI interaction from "wait for complete response" to "watch the response emerge." It reduces perceived latency by **60–80%** because the first token appears within 200–500ms.

**Key metrics:**
- **Time to First Token (TTFT):** The metric that matters. Aim for <500ms.
- **Tokens per Second (TPS):** Generation speed visible to the user.
- **Stream Completion Rate:** Percentage of streams that complete without error.

| Model | Avg. TTFT | Total Response Time (500 tokens) |
|---|---|---|
| GPT-4 Turbo | 0.5–1.5s | 8–15s |
| Claude 3 Opus | 0.8–2.0s | 10–20s |
| GPT-3.5 Turbo | 0.2–0.5s | 3–6s |

**Implementation best practices:**
- Use **Server-Sent Events (SSE)** as the default (simpler than WebSockets, auto-reconnecting, works through proxies/CDNs). Use WebSockets only for bidirectional needs.
- **Buffer token rendering** in 50–100ms batches to avoid janky DOM updates. On mobile, increase to 100ms.
- **Batch DOM updates** by appending rather than replacing content.
- **Defer rendering of incomplete structures** (e.g., don't render half a markdown table).
- Add `X-Accel-Buffering: no` header for Nginx, and `Cache-Control: no-cache, no-transform` for CDNs.
- For responses under 100 tokens, streaming adds complexity without UX benefit—consider a threshold.

**When to stream vs. not:**

| Scenario | Benefit | Priority |
|---|---|---|
| Long responses (500+ tokens) | High — visible progress | Essential |
| User-facing chat | High — immediate feedback | Essential |
| Slow models (GPT-4, Claude Opus) | High — reduces perceived wait | High |
| Fast models (GPT-4o-mini) | Medium — already fast | Nice to have |
| Background processing | Low — user isn't watching | Skip |
| Batch operations | None — no UI to update | Skip |

---

### 2.2 Pre-Stream Phase: Typing Indicators

The 200–500ms before the first token is critical. Show a **typing indicator** (pulsing dots, shimmer animation) during this window so users know the system is working.

**Pattern:** Show typing indicator → first token arrives → indicator fades, streaming text appears.

**Best practices for micro-animations (2026 consensus):**
- Keep animations **100–300ms**
- Each animation communicates a **specific state change**
- Animations that run constantly become visual noise within minutes
- Use a **subtle pulse** on the AI response panel during generation
- Use **smooth height expansion** as streaming content arrives to avoid jarring layout shifts

---

### 2.3 Skeleton Screens for AI Content

For AI response panels, skeleton loaders show **3–5 lines of gray shimmer animation at decreasing widths** (mimicking natural text line-length variation) rather than a generic spinner.

**Impact:** Skeleton screens reduce perceived load time by **30–40%** compared to blank screens (Nielsen Norman Group research).

**Duration-to-pattern mapping:**
| Duration | Recommended Pattern |
|---|---|
| <100ms | No indicator needed (feels instant) |
| 100ms–1s | Subtle spinner or progress bar |
| 1s–5s | Skeleton screen + progress percentage |
| 5s+ | Multi-step progress tracker + time estimate |

---

### 2.4 Long-Running AI Tasks (5–60+ seconds)

For operations like document analysis, multi-step agent workflows, or batch processing:

**Staged Progress Indicators:**
Decompose the operation into visible, semantic stages: "Reading document structure" → "Extracting key entities" → "Analyzing relationships" → "Generating summary." Each stage resets the user's patience clock.

**Progressive Background Transition:**
- After **15 seconds:** Display a subtle "Continue in background?" option
- After **30 seconds:** Make this option more prominent
- After **60 seconds:** Proactively suggest background processing with estimated completion time

**Time Estimates:**
- For predictable operations: Show dynamic, conservative estimates that refine as processing continues
- For unpredictable operations: Show a range: "Typically completes in 30–60 seconds"
- Users tolerate underestimates poorly but respond well to "ahead of schedule" updates

**Real-world examples:**
- **Cursor Agent** — Shows a plan with visible steps, currently executing step highlighted, with terminal output streaming in real time.
- **Linear Triage Intelligence** — Shows the model's "thinking state" with a timer at the bottom of the suggestions module, letting users track activity. Processing takes 1–4 minutes, which is acceptable because most issues aren't triaged within that window anyway.
- **ChatGPT** — Shows "Searching...", "Reading...", "Analyzing..." stages during web browsing and code execution.

---

### 2.5 Optimistic Updates

For AI-assisted actions where the outcome is highly predictable (e.g., auto-categorization, smart sorting), apply the change immediately and reconcile with the server response.

**Impact:** Optimistic updates make apps feel instant even with 500ms+ server latency.

**Best practice:** Always provide an undo mechanism. If the server response differs from the optimistic update, show a non-disruptive notification with the corrected state.

---

### 2.6 Accessibility Considerations for Dynamic AI Content

- Use **`aria-live="polite"`** on AI response containers so screen readers announce new content as it streams.
- Ensure streaming text doesn't cause focus loss or unexpected scrolling for keyboard users.
- Provide text alternatives for all visual progress indicators.
- Test with screen readers to ensure streaming doesn't produce an unintelligible rapid-fire of announcements.

---

## 3. Error Handling in AI Features

AI errors are fundamentally different from traditional software errors. A 404 has clear cause and effect; AI errors feel mysterious, unpredictable, and—most dangerously—can be *confidently wrong.* **71% of enterprise employees won't use an AI tool they don't trust** (PwC, 2023), and a single badly handled error can permanently erode that trust.

### 3.1 Taxonomy of AI Failures

| Failure Type | Description | Danger Level | Detection |
|---|---|---|---|
| **Hallucination** | Confident, plausible but incorrect output | Highest — hardest for users to detect | Often undetectable by the system itself |
| **Low Confidence** | Model can't fulfill task due to uncertainty | Medium — model knows it's uncertain | Detectable via confidence scores |
| **Refusal** | Model declines to respond (safety filters, policy) | Low — clear failure signal | Fully detectable |
| **Timeout / Infrastructure** | API failure, rate limit, connection drop | Low — standard error handling | Fully detectable |
| **Off-Target Output** | Technically not wrong, but not useful | Medium — subjective quality issue | Partially detectable via user behavior |
| **Silent Failure (False Negative)** | Model misses something it should have caught | High — user may never notice | Requires dedicated QA processes |

---

### 3.2 The Confidence Cascade

Design different interaction patterns based on confidence levels:

**High Confidence (90%+):**
- Present results directly with standard formatting
- Subtle AI indicator (sparkle badge)
- Auto-execute for low-stakes actions

**Medium Confidence (60–89%):**
- Show results with mild uncertainty indicators (dotted borders, yellow badges)
- Include reasoning: "Based on partial matches"
- Require confirmation before consequential actions
- Present alternatives: "Did you mean...?"

**Low Confidence (<60%):**
- Ask for clarification with specific questions
- Provide multiple options rather than a single answer
- Explain uncertainty clearly: "I don't have enough information about..."
- Offer human handoff or manual fallback

**Qualitative labels outperform numeric scores.** MIT CSAIL research (2024) found that "Very Likely" works better than "87% confident." Users want to know how confident the AI is, but technical precision creates confusion rather than calibration. Showing confidence indicators **increased recommendation following by 30%**.

---

### 3.3 Graceful Degradation: The Fallback Chain

Design fallback levels that maintain usefulness even when AI fails:

| Level | Strategy | Speed | Capability |
|---|---|---|---|
| 1 | Primary AI model (Claude Sonnet, GPT-4o) | 1–3s | Full |
| 2 | Smaller, faster model (Claude Haiku, GPT-4o-mini) | 200–500ms | 80% of use cases |
| 3 | Semantic cache (similar past responses) | <50ms | Known queries |
| 4 | Rule-based templates | Instant | Generic but functional |
| 5 | Honest degradation message | Instant | User informed |

**Real-world example:** Intercom's chatbots visibly degrade: first attempting AI responses, then offering "Here are some related help articles," then presenting "Talk to a human" buttons—each step clearly communicated.

**Key principle:** For core product workflows that depend on AI, always have a manual fallback. If AI-powered summarization fails, show the raw document. If the AI writing assistant is down, show a standard text editor. The degraded state won't be as good, but it lets users accomplish their goal.

---

### 3.4 Handling Hallucinations

Hallucination is the hardest AI failure to design for because the system often can't detect it.

**Grounding with citations:**
- **Perplexity AI** includes numbered citations `[1][2][3]` inline with claims and displays all sources, making it obvious when AI might be hallucinating by showing gaps in sourcing.
- Every significant claim should link back to source material.
- Sources make hallucinations *detectable* by users.

**Hedging language (prompt-level strategy):**
- Instruct the model to use uncertain language: "appears to be," "based on the available information," "you may want to verify..."
- This is a prompting strategy, not a UI element—it shapes the content of the output itself.

**Verify-before-commit pattern:**
- For inline edits that alter factual claims, citations, or data, include a "see how this was changed" view.
- Show AI rewriting as traceable within context rather than hidden behind logs.
- For high-stakes outputs (legal, medical, financial), require explicit user verification before applying.

**Feedback mechanisms:**
- Thumbs up/down on every AI response
- "Was this helpful?" with quick-select options: "Too long / Too vague / Wrong topic / Other"
- Show the original prompt in an editable input alongside the output for easy refinement

---

### 3.5 Error Message Design

**Bad:** "Model inference failed with confidence threshold 0.23"
**Good:** "I'm not confident about this answer. Let me ask for more details."

Every failure should communicate three things:
1. **What happened** (in plain language)
2. **Why it happened** (brief, honest explanation)
3. **What to do next** (actionable recovery path)

**Recovery actions to always provide:**
- One-click "Try again" button
- "Ask differently" suggestions with examples
- Quick access to alternative approaches
- "Browse categories" when search fails
- "Talk to a human" when AI can't help
- Manual fallback path

**Anti-patterns to avoid:**
- Raw error messages from AI APIs
- Stack traces or technical details
- Apology-first language ("Sorry, I might be wrong...") — prefer: "Unclear because..." with an option to resolve
- Warnings with no next step
- Infinite loading states (always implement timeouts: 10–30 seconds)

---

### 3.6 Circuit Breakers and Retry Logic

**Circuit Breakers:** When an AI service starts failing, stop hammering it with requests. Detect sustained failures, route all requests to the fallback chain, and periodically probe to check if the service has recovered. Without circuit breakers, an AI service outage becomes a full application outage.

**Retry Logic:**
- **Exponential backoff:** Wait before retrying, wait longer with each attempt
- **Jitter:** Add random delay to prevent thundering herd
- **Budget:** Limit total retries (typically 2–3 max)
- Never retry immediately on rate-limited services

---

### 3.7 Confidence UI: Stakes-Based Approach

Match the confidence UI treatment to the stakes of the task:

**Low stakes (content, brainstorming):**
- Minimal confidence indicators
- Don't over-caveat—the cost of being wrong is low

**Medium stakes (internal ops, analytics):**
- Confidence bucket + reason
- Range estimates ("Expected: 12–18%")
- "Verify" action button

**High stakes (money, identity, legal, health, production):**
- Explicit uncertainty + constraints
- Required confirmations
- Tool-based verification
- Human-in-the-loop option
- Default to "Draft" mode instead of "Execute"

---

## 4. AI Onboarding and Discovery

AI features that offer value won't be used if people don't notice them. Nielsen Norman Group's research on Amazon's Rufus AI (2024) demonstrated this starkly: even valuable AI features can be completely invisible due to poor discoverability.

### 4.1 The Discoverability Challenge

**The sparkle icon problem:**
- The ✨ sparkle has become the near-universal symbol for AI features (pioneered by Google in the mid-2010s, standardized across products by 2023–2024).
- By 2024, Google alone used nearly 100 different AI Sparkle icon variants across products, with usage increasing 37% each quarter.
- **But:** As recently as September 2024, ~17% of people thought a sparkle icon signified favoriting/saving (NN/G research). The sparkle looks too much like a star, which 73% of people associate with favoriting.
- **Key insight from Google's research:** Users recognize the sparkle signals AI, but they don't have a consistent definition of *what kind* of AI or *what action* it triggers. Users care most about whether they can *trust* the information.

**Amazon Rufus case study (NN/G):** Amazon's AI chat feature failed on discoverability because:
- The hybrid chat/sparkles icon was ambiguous and unlabeled
- On the busy Amazon page, the icon was invisible among competing information
- AI-prompt suggestions blended in with regular search suggestions
- Users' existing mental model for search (keyword-based) conflicted with the AI's expectation (natural language)

---

### 4.2 Iconography Best Practices

**Established conventions (2024–2026):**
| Action | Common Icon | Notes |
|---|---|---|
| Generic AI indicator / Initial CTA | ✨ Sparkle | Broad but recognized |
| Inline editing / Rewriting | ✨ + ✏️ Sparkly pencil | Adds clarity that the action modifies, not creates |
| Summarization | 📄 + ✨ Paragraph/quote with sparkle | Differentiates from "generate" |
| Enhancement / Refinement | ✨ on existing content | Signals upgrading something that exists |
| Suggestions | ⭐⭐ Two-star icon | Smaller, inline-friendly |
| Randomize prompt | 🎲 Dice | Emerging convention |

**Design guidance from AWS Cloudscape and ShapeofAI:**
- **Standalone sparkle** for features where AI is the primary or sole function ("Ask AI" button)
- **Sparkle integrated with other icons** to indicate AI enhances an existing function (e.g., sparkle + magnifying glass for AI-enhanced search)
- **Only one primary AI button per page** — if there's already a primary action, use a secondary button with AI affordance
- **Pair icons with text labels** when clarity is critical — many users won't recognize sparkles or wands alone. Use text labels with the icon where possible, and tooltips as a fallback
- **Avoid overuse** — if all actions in a section are AI-powered and the context is communicated at the section level, individual buttons don't need the sparkle iconography. Over-sparkled interfaces lose the signal.

---

### 4.3 Progressive Disclosure for AI Features

**The three-layer model:**

1. **Initial View (Default):** Show essential content only—the AI's best suggestion and one primary action. No settings, no options, no explanation of how AI works.

2. **Expanded View (On Demand):** Reveal more details—AI insights, key data points, alternative suggestions. Triggered by "Show more," chevron, or hover.

3. **Full View (Power Users):** Show all options—settings, model selection, advanced parameters, raw confidence scores. Accessible through settings or "Advanced" expander.

**Best practices:**
- Limit to **2–3 disclosure layers maximum** — more layers bury functionality
- Use **clear triggers** (chevrons, "Show more" buttons, tooltips) — don't rely on users guessing
- Add **smooth animations** for transitions between states (100–300ms)
- **Tailor disclosure to user segments** — show more to advanced users, less to newcomers
- **Monitor usage analytics** to refine what's hidden vs. revealed by default

**Real-world examples:**
- **Loom** shows basic video tools first, then reveals AI transcription when you click "More options."
- **ChatGPT** starts with a simple text input; advanced settings (model selection, system prompts, temperature) are in a menu.
- **Linear** — AI suggestions appear automatically when creating issues; hovering reveals reasoning and alternatives. No "AI mode" to activate.
- **Cursor** — Plan Mode is suggested automatically when complex tasks are detected; users can also activate it with Shift+Tab.

---

### 4.4 First-Run Experiences for AI Features

**Principles:**
- **Value first, explanation second.** Show what the AI can do, not how it works.
- **Every step skippable.** Even if users skip onboarding, the product should work with sensible AI defaults.
- **Suggested starting points.** Don't present a blank chat—offer 3–5 contextual prompt suggestions.
- **Learn by doing.** Follow-up chips and suggested prompts serve as micro-tutorials disguised as shortcuts.

**Cherry Studio onboarding pattern (open-source reference):**
1. Language + Theme selection
2. Connect AI Provider (OAuth + API key + verification)
3. Set Default Models (for different task types)
4. Done → enter main interface

Key design decisions: Fixed card overlay (560×520), all steps skippable, all config syncs with settings page, "Restart Onboarding" option in Settings, completes in under 2 minutes.

**AI-native onboarding (emerging pattern):**
Instead of static forms, the onboarding itself is conversational:
- AI asks questions and adapts the flow based on responses
- Handles uncertainty: when a user says "I'm not sure yet," the system explores that uncertainty
- Captures intent signals, constraint signals, and uncertainty signals
- Routes users to features based on what they're trying to accomplish, not persona buckets

---

### 4.5 Discovery Mechanisms That Work

1. **Place AI features where users expect them.** Put AI-chat buttons where people expect chat—floating in the lower right corner. Don't invent new locations.

2. **Use plain language.** Don't invent unnecessary labels, cute names, or inscrutable icons. "AI Assistant" beats "Rufus." "Write with AI" beats a sparkle icon alone.

3. **Contextual triggers.** Surface AI features when they're most relevant:
   - Empty state: "Need help getting started? Try AI..."
   - After an error: "AI can help debug this"
   - During tedious tasks: "Let AI handle the classification"

4. **Inline prompt suggestions** that appear in context (e.g., in search bars, text editors) but are visually distinct from non-AI suggestions.

5. **Progressive feature announcements.** Don't announce all AI features at once. Introduce them as users reach the context where they're useful.

6. **The "Connect icons with a Gallery" pattern.** When introducing AI to new users, show visual examples of what each AI action produces, not just the icon.

---

### 4.6 The Autonomy Spectrum for Onboarding

Start new users at low autonomy and let them increase as trust builds:

| Level | Name | Behavior | Default For |
|---|---|---|---|
| 1 | Observe & Suggest | AI observes and offers suggestions; user takes all actions | New users, high-stakes domains |
| 2 | Propose & Confirm | AI proposes actions; user confirms before execution | Most users after initial trust |
| 3 | Act & Notify | AI acts autonomously; user is notified after the fact | Trusted, repetitive tasks |
| 4 | Full Autonomy | AI acts without notification | Only after explicit opt-in + proven track record |

**Key principle:** Never increase autonomy without asking. Even if the agent has been 100% accurate, the user should consciously opt in.

**Linear's approach:** Triage Intelligence starts with suggestions that users accept/dismiss. Once teams trust certain suggestion types, they can opt in to auto-apply—for example, always auto-apply suggested team and assignee, but only auto-apply the "bug" label. Automation comes gradually and with granular control.

---

## 5. Multimodal AI Interfaces

By 2025–2026, multimodal AI (combining text, voice, image, and other input types) has moved from experimental to production standard. ChatGPT, Microsoft Copilot, and Zoom all support voice, vision, and text in unified interfaces. The design challenge is no longer "can we build this?" but "how do we make it seamless?"

### 5.1 Core Design Principles

**Consistency across modalities:**
The AI's personality, capabilities, and limitations should remain consistent regardless of how users interact. A voice assistant should have the same knowledge as the text interface.

**Modality-appropriate interaction:**
Each modality has unique strengths:
- **Text:** Precision, editability, persistent history, detail
- **Voice:** Speed, hands-free operation, emotional nuance
- **Vision/Image:** Rich context, spatial information, faster than verbal description
- **Gesture:** Quick spatial actions, touchless interaction in constrained environments

Design for what each modality does best. Don't force users to type long commands when voice would be faster, or describe complex visual concepts in text when they could show a picture.

**Context preservation across modality switches:**
The AI should remember what you showed it in an image when you ask a follow-up by voice. Build a persistent context object that tracks all interactions across modalities and make this history visible when users switch modes.

---

### 5.2 Input Interface Patterns

**The standard multimodal input layout:**
- Main text box for typing
- Small mic button for voice
- Camera/upload icon for images
- Short hint text: "Type, speak, or add an image"

Keep the layout clean and consistent across web and mobile. All input options visible but not overwhelming.

**Feedback for each modality:**
- **Voice:** Show a waveform while listening; display "Listening..." state; show transcription of what the AI heard for verification
- **Image:** Show thumbnails when images are uploaded; display "Processing image..." state; show what the system detected (text, objects, regions)
- **Text:** Standard text input with streaming response

**Cross-modal confirmation for error recovery:**
- If speech-to-text is uncertain: confirm visually ("Did you say [text displayed]?")
- If gesture recognition is uncertain: confirm through voice ("I detected a wave. Did you mean to dismiss this?")
- Cross-modal checks prevent error accumulation

---

### 5.3 Modality Orchestration

When multiple modalities are active simultaneously, the system needs clear priority rules:

1. If a user taps something on screen, that takes priority over voice
2. If a user shows an image and says "explain this," combine vision + voice
3. If the last action was voice only, use the last spoken intent
4. Explicit actions (clicking, typing) override ambient signals (background audio, peripheral vision)

**The orchestration layer** (often powered by AI) resolves conflicts between modalities. Designers define clear rules for input priority and conflict resolution.

---

### 5.4 Voice-Specific Design Patterns

**Design for natural speech, not commands:**
- ❌ "Assistant, open profile mode alpha"
- ✅ "Can you explain this screen?"
- ✅ "Read the important points from this document"

**Feedback and confirmation:**
- Always confirm what the AI heard before taking consequential actions
- Layer information: start with brief summaries, offer details on request
- Provide visual fallbacks for sensitive information (passwords, personal data) that users might not want to speak aloud

**Voice interface limitations to design around:**
- No persistent visual feedback—users can't scroll back
- Design for interruption and resumption
- Keep responses brief for voice; offer "Would you like more detail?" rather than long monologues

---

### 5.5 Vision/Image Input Design Patterns

**Show what the AI sees:**
- Always display what image is being processed
- Show what the system detected (text, objects, regions)
- Provide options to correct: "This is not the issue," "Focus on the chart"

**Real-world examples:**
- **Cursor (VS Code)** — Vision support lets users paste screenshots, drag images, or attach window screenshots. Use cases: giving mockups for UI code generation, showing error screenshots, generating alt text.
- **ChatGPT** — Image upload with object detection and analysis, combined with text follow-up.
- **Adobe Photoshop** — Partner AI models process uploaded images for upscaling, fill, and enhancement with visual previews at each step.

---

### 5.6 Building Multimodal Products: Incremental Approach

Start with one modality done well. Add others deliberately:

1. **Foundation:** Text-based AI with strong core capabilities
2. **Enhancement 1:** Add visual input (image upload, screen sharing)
3. **Enhancement 2:** Add voice input for quick queries
4. **Enhancement 3:** Add gesture/touch for spatial interactions
5. **Advanced:** Add voice output, multi-modal combinations

**Key implementation considerations:**
- Use WebRTC or Web Speech API for audio
- File API or canvas for visuals
- Rich text editors for text instructions
- Route inputs through preprocessing services (image resizing, noise reduction) before the multimodal model
- Store embeddings in a vector database for retrieval-augmented generation (RAG) across modalities

---

### 5.7 Privacy and Trust in Multimodal AI

Because the system can listen and see, users must feel safe and in control:

- **Clear indicators** when the microphone is on, camera is active, or data is being stored
- **Simple toggles** to turn voice and camera off at any time
- **Transparent data handling** per modality—users should understand that voice might be processed differently than text
- **Sensitive operations** (payments, personal data changes) behind explicit confirmation steps
- **Adobe's approach:** A persistent shield icon and clear message that customer content will never be used to train AI models. Partnership agreements require external model providers to follow the same policy.

---

### 5.8 Accessibility in Multimodal Interfaces

- Every critical capability should work in **at least two modalities**
- Visual information must have voice descriptions
- Voice-only interactions must have text alternatives
- Integrate with assistive technologies (screen readers, switch controls)
- **Descriptive alt text** fuels vision encoders; **transcripts** feed audio encoders; **semantic HTML** ensures agents parse layout
- Clean DOM structures and ARIA labels benefit both screen readers and AI agents

---

## 6. Actionable Recommendations Summary

### For Any Product Adding AI Features

1. **Choose the right interaction pattern for the task.** Use the decision framework in Section 1.8. Don't default to chat for everything.

2. **Stream all AI responses over 1–2 seconds.** Use SSE, buffer at 50–100ms intervals, show a typing indicator during TTFT. This is table stakes in 2026.

3. **Design the error states before the happy path.** Map out your fallback chain (primary model → smaller model → cache → templates → honest message). Every AI call needs timeout handling.

4. **Use qualitative confidence labels, not percentages.** "Likely" beats "87%." Match the confidence UI treatment to the stakes of the task.

5. **Show citations and sources for factual claims.** This is the primary defense against hallucination damage.

6. **Start users at low autonomy.** Let trust build through demonstrated reliability before offering higher autonomy levels. Never increase autonomy without explicit user opt-in.

7. **Pair AI icons with text labels.** The sparkle icon signals AI to many users, but its meaning is not yet universal. Text labels eliminate ambiguity.

8. **Provide manual fallbacks.** Every AI-powered workflow should degrade to a functional (if less capable) manual state when AI is unavailable.

9. **Make AI output editable.** Always provide "Accept / Edit / Reject" controls. Show the AI's draft as a suggestion layer, not an overwrite.

10. **Preview before commit.** For any action that modifies user content, show the AI's proposed change and require explicit confirmation.

### For Products Adding Multimodal AI

11. **Start with text, add modalities incrementally.** Don't launch voice + image + text simultaneously. Get each modality right before combining.

12. **Maintain context across modality switches.** The AI must remember the image you showed when you ask a follow-up by voice.

13. **Show what the AI perceives.** Display transcriptions for voice, annotations for images, and parsed intent for all inputs.

14. **Design clear modality priority rules.** When voice and touch conflict, the system needs deterministic resolution.

15. **Make privacy controls prominent and per-modality.** Users need to see when mic/camera are active and be able to disable them instantly.

### Monitoring and Iteration

16. **Track TTFT, TPS, stream completion rate, and error rates** as core metrics for AI features.

17. **Measure trust calibration:** Do users' trust levels match actual AI performance? Use surveys alongside accuracy metrics.

18. **Monitor acceptance rates** for AI suggestions to detect declining model quality before users complain.

19. **Track autonomy progression:** How quickly users move to higher autonomy levels indicates trust health.

20. **After errors, measure trust recovery time:** How long until users return to the same engagement level?

---

## Sources and Further Reading

### Design System Documentation
- [AWS Cloudscape GenAI Ingress Pattern](https://cloudscape.design/patterns/genai/ingress/)
- [Google PAIR Guidebook: Errors + Graceful Failure](https://pair.withgoogle.com/guidebook-v2/chapter/errors-failing/)
- [ShapeofAI Pattern Library](https://shapeof.ai/) — Inline Action, Iconography, Inpainting patterns
- [AI UX Design Guide](https://www.aiuxdesign.guide/) — Trust Calibration, Autonomy Spectrum, Progressive Disclosure

### Research
- Stanford HCI (2024) — Streaming interfaces perceived as 40% faster
- MIT CSAIL (2024) — Confidence indicators increase recommendation following by 30%
- IBM Research (2023) — Contextualized confidence indicators reduce override rates by 22%
- Takayanagi et al. (2025) — AI confidence displays improve human-AI team performance by up to 50%
- Nielsen Norman Group (2024) — AI Discoverability: Amazon Rufus case study
- Google Design (2025) — Rise of the AI Sparkle Icon research
- PwC (2023) — 71% of enterprise employees won't use AI tools they don't trust

### Product Case Studies
- **GitHub Copilot:** Ghost text, Next Edit Suggestions (NES), gutter arrows, model switcher
- **Cursor:** Cmd+K inline edits, Agent mode, Plan Mode (Shift+Tab), multi-file Composer, vision support
- **Linear:** Triage Intelligence, auto-classification, semantic search, progressive automation
- **Adobe Firefly/Photoshop:** Partner model integration, Generative Fill, model picker, data transparency
- **Midjourney:** Discord-to-web migration, inpainting, parameter-based control, V7/V8 iterations
- **Notion AI:** Inline rewrite, document-level chat, progressive feature disclosure
- **Intercom Fin:** Graceful degradation cascade, human handoff
- **Perplexity AI:** Inline citation grounding `[1][2][3]`

### Articles and Guides
- [The New UX Patterns of AI (ShShell)](https://shshell.com/blog/ai-ux-patterns)
- [Agentic Interfaces (The Interactive Studio)](https://insights.theinteractive.studio/beyond-the-chat-agentic-interfaces-inside-your-product)
- [The AI Chat Interface Playbook (AI UX Playground)](https://aiuxplayground.com/blog/ai-chat-playbook)
- [Streaming LLM Responses (Athenic)](https://getathenic.com/blog/streaming-llm-responses-real-time-ux)
- [Long-Running AI Tasks (Particula)](https://particula.tech/blog/long-running-ai-tasks-user-interface-patterns)
- [Designing for AI Failures (Clearly Design)](https://clearly.design/articles/designing-for-ai-failures)
- [The Fallback Chain Pattern (Agentik OS)](https://www.agentik-os.com/blog/error-handling-patterns-ai-applications)
- [Confidence UI Pattern (Modexa)](https://medium.com/@Modexa/the-confidence-ui-pattern-that-users-actually-trust-ff27e1a8a956)
- [AI-Native Onboarding (Perspective AI)](https://getperspective.ai/blog/ai-native-onboarding-guide)
- [Multimodal AI UX (Flipr)](https://blog.flipr.ai/multimodal-ai-ux-designing-products-that-understand-text-voice-and-vision-together/)
- [Multi-Modal AI Experiences (Clearly Design)](https://clearly.design/articles/ai-design-9-multi-modal-ai-experiences)
