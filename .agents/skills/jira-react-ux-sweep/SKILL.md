---
name: jira-react-ux-sweep
description: Discover and fix UI/UX regressions in this jira-react-app via headless-browser screenshots across routes, viewports, themes, and interaction states. Use when asked to audit the UI, review the design, find visual or accessibility regressions, screenshot the app, or "make the UI look right." Pairs each screenshot with a root-cause probe and a surgical fix; not for product/feature work or new pages.
---

# Jira React UX Sweep

## Overview

Find UI/UX issues by screenshot review and fix them in tight commits.
The screenshot matrix is the discovery loop — don't skip it because
"the change looks small."

## First Moves

1. `npm install`, then `npm start` in the background (Vite, port
   3000). The remote API is blocked from this environment and the
   `__json_server_mock__/` middleware does not run under json-server
   v1, so mock every endpoint inside Playwright instead.
2. Read `references/playwright-harness.md` and use the recipe verbatim
   for the screenshot script. The mock contract, viewport matrix, and
   four critical traps in that file are all hard-won.
3. Read `references/issue-patterns.md` and keep it open while
   reviewing PNGs.

## The Loop

1. **Capture** the matrix (routes × viewports × both themes ×
   interaction states).
2. **Review** every PNG against `issue-patterns.md`. Note issues
   first; don't fix yet.
3. **Verify root cause** for every issue with a one-shot
   `page.evaluate` probe before editing. Code excerpts read by an
   explore agent will guess wrong on the three traps in this repo
   (lazy-init `useState`, AntD CSS-var scoping, flex-basis-as-height
   in column direction).
4. **Fix in themed batches**, one commit each. Re-screenshot after
   every batch and confirm the issue is gone.
5. **Quality gates** before commit: `npm run typecheck` clean,
   `npx jest <touched-paths>` green, full `npm test` green.

## Quality Bar

Fix root causes. If a `var(--ant-color-bg-*)` fallback is rendering,
make the cascade reach the element — don't hardcode a dark color. If
a flex-basis is reserving 14 rem of height, swap the basis — don't
mask with margins.

Do not add features, refactor architecture, introduce dependencies,
or write new tests unless an existing test breaks.

These look wrong but are correct — don't "fix" them:

- `useState(systemPrefersDark)` — lazy initializer; React calls it
  once.
- `flex: 1 1 14rem` inside `flex-direction: row` — correct; only
  becomes a bug when the parent flips to column.
- `<AntdApp component={false}>` — intentional. The `html.ant`
  workaround in `appProviders.tsx` covers the cssVar cascade.

## Project-Specific Facts

- AntD v6 with `cssVar: { key: "ant" }` scopes its variables to
  `:where(.ant)`. `appProviders.tsx` pins the `ant` class onto
  `<html>` so styled components see the cascade. If a surface still
  doesn't flip in dark mode, look for a hardcoded color, not a
  cascade bug.
- Page-level chrome (body, html, the main and auth layout shells)
  reads `--pulse-bg-page` / `--pulse-text-base` from `src/App.css`,
  not AntD vars. Match that pattern for new page-level surfaces.
- Filter rows are `flex-direction: column` on mobile and row at
  `md+`. Guard `flex: 1 1 Nrem` behind the `md` query and use
  `flex: 0 0 auto; width: 100%` at the column breakpoint.
- Grid containers that hold horizontally-scrolling children need
  `grid-template-columns: minmax(0, 1fr)` so the track stays bounded
  by the viewport.
- The board opts out of `PageContainer`'s max-width so kanban
  columns flow full-bleed. Don't reintroduce a centered cap.

## Committing

The pre-commit hook runs prettier + eslint --fix + commitlint with
`@commitlint/config-conventional`. Two practical notes:

- Commit subjects must be `type: subject` (e.g. `fix:`, `refactor:`,
  `docs:`).
- Prettier may reformat unrelated files (e.g. `docs/prd/*.md`).
  Discard those with `git checkout -- <path>` before re-staging your
  intended changes.

Group related fixes per commit; don't dump everything into one.

## Output

End every sweep with:

1. A short report (in chat) listing each issue: severity, file path,
   root cause, before/after screenshot reference.
2. One or more conventional commits.
3. A summary: issues found, fixed, deferred (with reasons).
