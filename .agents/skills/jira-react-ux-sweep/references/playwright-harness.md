# Playwright harness for the UX sweep

This file is the source of truth for the screenshot loop. Build the
harness once at the start of a sweep and reuse it after every fix
batch. Do not invent a different mock layer.

## Environment shape

- Vite dev server runs on `http://localhost:3000` after `npm start`.
- Playwright is installed globally at
  `/opt/node22/lib/node_modules/playwright/index.js`. It is a CommonJS
  build, so import as:
  ```js
  import pw from "/opt/node22/lib/node_modules/playwright/index.js";
  const { chromium } = pw;
  ```
- Chromium binaries live under `/opt/pw-browsers/`. No download step
  needed.
- The remote API at `https://jira-python-server.vercel.app` returns
  403 from this environment. Mock everything in Playwright.

## Required mocks

Auth header is required on every endpoint except `/auth/*`. Pre-seed
`localStorage.Token = "demo"` before navigating to authenticated
routes. The frontend's contract — not the `__json_server_mock__/db.json`
shape — is what to mirror:

| Method | Path | Response |
|---|---|---|
| POST | `/api/v1/auth/login` | `IUser` (single, includes `jwt`) |
| POST | `/api/v1/auth/register` | 201 `{ message }` |
| GET | `/api/v1/users` | single `IUser` |
| GET | `/api/v1/users/members` | `IMember[]` |
| GET | `/api/v1/projects` (no `projectId`) | `IProject[]`; honor `?projectName=` and `?managerId=` filters |
| GET | `/api/v1/projects?projectId=p1` | **single** `IProject` (board.tsx expects an object, not an array) |
| POST | `/api/v1/projects` | 201 single `IProject` |
| PATCH/DELETE | `/api/v1/projects/:id` | 200 `{ ok: true }` |
| GET | `/api/v1/boards?projectId=` | `IColumn[]` |
| GET | `/api/v1/tasks?projectId=` | `ITask[]` |
| GET | `/api/v1/health` | `{ status: "ok" }` |

Type shapes (see `src/types/*.d.ts`):

```ts
IProject = { _id, projectName, managerId, organization, createdAt }
IColumn  = { _id, columnName, projectId, index }
ITask    = { _id, columnId, coordinatorId, epic, taskName, type, note, projectId, storyPoints, index }
IMember  = { _id, username, email }
IUser    = IMember & { jwt: string; likedProjects: string[] }
```

## Critical traps

- **Catch-all route ordering.** A `page.route("**/*")` registered
  after the `/api/v1/**` route wins (last handler first) and
  swallows your mocks. Either don't register a catch-all or register
  the API mock last.
- **Theme toggle is event-driven.** Don't try to click the moon icon
  in the header — flake-prone. Set the preference directly:
  ```js
  await page.evaluate(() => {
      localStorage.setItem("ui:colorScheme", "dark");
      window.dispatchEvent(
          new CustomEvent("ui:colorScheme:changed", { detail: "dark" })
      );
  });
  ```
- **`fullPage: false` for mobile.** `fullPage: true` ignores
  `body { overflow-x: hidden }` and stretches the capture past the
  viewport, hiding mobile-only issues like clipped headers.
- **Mock query param names.** The frontend sends `?projectId=p1`,
  not `?_id=p1`. Mocking the wrong key returns the array fallback
  and the board renders `" board"` with a leading space because
  `currentProject?.projectName` is undefined.

## The matrix

Capture all of these in one run. Aim for ~40 screenshots per sweep.

**Routes**

- `/login`
- `/register`
- `/projects`
- `/projects/p1/board`

**Viewports**

- `390 × 844` (iPhone 14)
- `768 × 1024` (iPad portrait)
- `1440 × 900` (laptop)
- `1920 × 1080` (wide desktop)

**Themes**: light, dark.

**Interaction states** (capture at least one viewport for each):

- Empty state — return `[]` for projects/tasks
- Populated — the default mocks
- Loading — `await new Promise(r => setTimeout(r, 99999))` inside the
  route handler
- Error — `route.fulfill({ status: 500, ... })`
- Long content — 100+ projects, a 200-char project name, a task with
  a 500-char note
- Modal open — Create project, Task modal
- Dropdown open — Manager filter, account menu
- Active filters — pre-set URL query like `?managerId=u2&projectName=foo`

## Skeleton script

Save to `tmp/screenshots.mjs` (gitignored):

```js
import pw from "/opt/node22/lib/node_modules/playwright/index.js";
import fs from "node:fs";
const { chromium } = pw;

const OUT = "/tmp/jira-screens";
fs.mkdirSync(OUT, { recursive: true });

const json = (data, status = 200) => ({
    status,
    contentType: "application/json",
    body: JSON.stringify(data)
});

const setupMocks = async (page, overrides = {}) => {
    await page.route("**/api/v1/**", async (route) => {
        const url = new URL(route.request().url());
        const path = url.pathname.replace(/^\/api\/v1\//, "");
        const method = route.request().method();
        const handler = overrides[`${method} ${path}`];
        if (handler) return handler(route, url);
        // ... default mocks per the contract table above ...
    });
    // DO NOT register a catch-all here. Last route wins.
};

const shoot = async (page, name, opts = {}) => {
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(800);
    await page.screenshot({
        path: `${OUT}/${name}.png`,
        fullPage: opts.fullPage ?? true
    });
};

// 1. Build the browser context per viewport
// 2. For each route, capture light + dark
// 3. For each interaction state, register a one-off route override
//    BEFORE navigating to that route
```

## Probing for root causes

When you spot an issue, write a one-shot probe. Three patterns that
have caught real bugs:

**Find which elements escape the viewport** (overflow):

```js
await page.evaluate(() => {
    const viewW = document.documentElement.clientWidth;
    const offenders = [];
    document.querySelectorAll("body *").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.right > viewW + 1 && r.width > 0) {
            offenders.push({
                tag: el.tagName,
                cls: el.className?.toString?.().slice(0, 80),
                right: Math.round(r.right),
                width: Math.round(r.width),
                overflowX: getComputedStyle(el).overflowX
            });
        }
    });
    return offenders.slice(0, 20);
});
```

**Find where an AntD CSS variable is actually defined** (theming):

```js
await page.evaluate((varName) => {
    for (const el of document.querySelectorAll("*")) {
        const v = getComputedStyle(el).getPropertyValue(varName);
        if (v && v.trim()) {
            return { tag: el.tagName, cls: el.className, val: v.trim() };
        }
    }
    return null;
}, "--ant-color-bg-layout");
```

**Find every focusable element with a missing or invisible focus
ring** (accessibility):

```js
await page.evaluate(() => {
    const focusables = document.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const bad = [];
    focusables.forEach((el) => {
        el.focus();
        const cs = getComputedStyle(el);
        if (cs.outlineStyle === "none" && !cs.boxShadow.includes("rgb")) {
            bad.push({
                tag: el.tagName,
                role: el.getAttribute("role"),
                label: el.getAttribute("aria-label") ?? el.textContent?.slice(0, 30)
            });
        }
    });
    return bad.slice(0, 20);
});
```

## Optional: axe-core

For an accessibility pass, install `@axe-core/playwright` only if the
sweep is explicitly asked to cover a11y. Otherwise the focus-ring and
contrast probes above are enough for a UX sweep.

```js
import { AxeBuilder } from "@axe-core/playwright";
const results = await new AxeBuilder({ page }).analyze();
results.violations.forEach((v) => console.log(v.id, v.description));
```
