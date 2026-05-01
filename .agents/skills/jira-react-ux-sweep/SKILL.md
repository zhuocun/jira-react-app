---
name: jira-react-ux-sweep
description: Discover and fix UI/UX regressions in this jira-react-app via headless-browser screenshots across routes, viewports, themes, and interaction states. Use when asked to audit the UI, review the design, find visual or accessibility regressions, screenshot the app, or "make the UI look right." Pairs each screenshot with a root-cause probe and a surgical fix; not for product/feature work or new pages.
---

# Jira React UX Sweep

## Overview

Use this skill to find UI/UX issues by screenshot review and fix them
in tight commits. Treat every invocation as a resume from unknown
state: rebuild context, capture the full screenshot matrix, review,
then fix one themed batch at a time. The screenshot matrix is the
discovery loop; do not skip it because "the change looks small."

## First Moves

1. Inspect the workspace:
    - `git status --short`
    - `git branch --show-current` (push target is the branch already
      checked out; if you must create one, ask first).
    - `cat package.json | head -40` to confirm scripts.
2. Install + start the dev server:
    - `npm install`
    - `npm start` in the background (Vite, port 3000). The remote API
      at `https://jira-python-server.vercel.app` is blocked from this
      environment and `__json_server_mock__/` doesn't load middleware
      under json-server v1, so do **not** rely on either. Mock every
      endpoint inside Playwright instead.
3. Read `references/playwright-harness.md` and use the recipe there
   verbatim to write `tmp/screenshots.mjs`. Never reinvent the mock
   layer or the viewport matrix — both have hard-won fixes baked in.
4. Read `references/issue-patterns.md` and keep it open as your
   checklist while reviewing screenshots.

## The Discovery Loop

Run the full loop on every sweep:

1. **Capture** the matrix — every route × every viewport × both themes
   × every interaction state listed in `references/playwright-harness.md`.
2. **Review** each PNG against `references/issue-patterns.md`. Note
   issues with file path, viewport/theme, and a one-sentence
   description. Do not start fixing yet.
3. **Verify root cause** for each issue before editing. Write a
   one-shot DOM probe in Playwright (`page.evaluate`) that proves the
   diagnosis. Don't trust an explore agent's diagnosis from excerpts —
   they will guess wrong on lazy-init `useState`, on AntD's CSS-var
   scoping, and on flex-basis-as-height in column direction. (Each of
   those traps already cost a fix attempt in this repo's history.)
4. **Fix in themed batches**. One commit per batch; group related
   issues (theming, mobile flex, overflow). Re-screenshot after each
   batch and compare against the originals before moving on.
5. **Quality gates** before commit:
    - `npm run typecheck` — must be clean.
    - `npx jest <touched-paths>` — must pass.
    - `npm test` — full suite must pass (~698 tests, ~45s).
    - Re-walk the golden path in a real browser if the change is
      non-trivial.

## Quality Bar

Fix the root cause, not the symptom. If a `var(--ant-color-bg-*)`
fallback is rendering, hardcoding a dark color is the wrong fix; making
the cascade reach the element is the right one. If a flex-basis is
reserving 14 rem of height, swap to `flex: 0 0 auto` for that direction
rather than tweaking gap/margin to mask it.

Do not add features, refactor architecture, or introduce new
dependencies. No new tests unless an existing test breaks or a
regression slips past the suite — the existing 698 tests already
cover most behavior.

Do not "fix" code that looks suspicious but is correct. The two
patterns that look wrong but aren't:

- `useState(systemPrefersDark)` — lazy initializer; React calls it
  once. Don't change to `useState(systemPrefersDark())`.
- `flex: 1 1 14rem` inside `flex-direction: row` — correct; only
  becomes a bug when the parent flips to `flex-direction: column`.

## Project-Specific Rules

- AntD v6 with `cssVar: { key: "ant" }` scopes its CSS variables to
  `:where(.ant)` and the `<AntdApp component={false}>` wrapper does
  not render that class. The repo already pins `.ant` onto `<html>`
  in `src/utils/appProviders.tsx`. If you find a styled component
  whose surface still doesn't flip in dark mode, the cascade is fine
  — the fault is most likely a hardcoded fallback or a theme value
  being read once at module load.
- The page-level chrome (body, html, main-layout container, auth
  layout background) reads `--pulse-bg-page` / `--pulse-text-base`
  from `src/App.css`, not the AntD vars. New page-level surfaces
  should follow that pattern.
- Mobile widths use `flex-direction: column` for filter rows. Always
  guard `flex: 1 1 Nrem` behind `@media (min-width: ${breakpoints.md}px)`
  and use `flex: 0 0 auto; width: 100%` at the column breakpoint.
- Grid containers that hold horizontally-scrolling children need
  `grid-template-columns: minmax(0, 1fr)` to stop the track from
  stretching past the viewport.
- The board page deliberately opts out of `PageContainer`'s max-width
  because kanban columns flow horizontally. Don't reintroduce a
  centered max-width there.
- Touch targets: `controlHeight` adapts to `pointer: coarse` via
  `theme/antdTheme.ts`. Custom buttons must use `${touchTargetCoarse}`
  from `theme/tokens.ts` at coarse pointer, not a hardcoded 36 px.

## Mock Backend Discipline

The Playwright harness owns the contract. Mock every endpoint listed
in `references/playwright-harness.md` and match the **frontend's
intended** shapes (single object for `?projectId=...`, array for
unfiltered list). Do not look at `__json_server_mock__/db.json` for
shape guidance; it predates the current contract.

Critical Playwright trap: a catch-all `page.route("**/*")` registered
**after** your `/api/v1/**` route will swallow it (last handler wins).
Either don't register a catch-all at all, or register the API mock
last.

For mobile screenshots use `fullPage: false`. `fullPage` ignores
`body { overflow-x: hidden }` and stretches the capture to include
clipped content, which (a) makes overflow bugs look bigger than users
see and (b) hides genuine mobile-only issues like clipped headers.

## Committing

The pre-commit hook runs prettier + eslint --fix + commitlint with
`@commitlint/config-conventional`. Three things to know:

1. Commit subjects must be `type: subject` (e.g. `fix:`, `feat:`,
   `refactor:`).
2. Prettier may reformat unrelated files (e.g. `docs/prd/*.md`).
   `git checkout -- docs/` to discard them, then re-stage only the
   files you intentionally changed before commit.
3. Push to the dev branch already checked out, never to `main`. Use
   `git push -u origin <branch>` and retry on network errors with
   exponential backoff (2s, 4s, 8s, 16s) up to four times. Do not
   open a PR unless explicitly asked.

## Output

At the end of every sweep produce:

1. A short markdown report (in chat, not committed) listing every
   issue found with severity (P0–P3), file path:line, root cause, and
   before/after screenshot references.
2. One or more conventional commits on the dev branch. Group related
   fixes; do not dump everything in one mega-commit.
3. A final summary: number of issues found, number fixed, anything
   intentionally deferred and why.

## Completion Criteria

Stop only when all are true:

- Full screenshot matrix re-captured; every "before" issue is gone
  in the "after" capture or explicitly deferred with a reason.
- `npm run typecheck` clean.
- `npm test` passes.
- All commits pushed to the dev branch already checked out.
- No regressions on light or dark mode at any captured viewport.
- AGENTS.md updated only if a new non-obvious gotcha was discovered.
