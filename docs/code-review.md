# Code review — jira-react-app

Date: 2026-04-29  
Scope: Repository-wide review (architecture, security-sensitive paths, representative modules, tooling). Tests were not executed in the review environment (`jest` unavailable without `npm install`).

---

## Summary

The codebase is a **React 19 + Vite** SPA with **TanStack Query** for server state, **Ant Design + Emotion**, and a sizable **Board Copilot** layer (local deterministic engine + optional remote AI proxy). Tests are organized broadly alongside sources. Overall structure is clear; the main gaps are **provider lifecycle**, **some API/error-handling edges**, **documentation drift**, and **dependency hygiene**.

---

## Strengths

- **AI safety layer**: Chat tools validate IDs against known sets before calling the API (`executeChatToolCall` in `src/utils/ai/chatTools.ts`), which aligns with the PRD’s “cross-check identifiers” story.
- **Centralized HTTP wrapper**: `useApi` / `api` keeps auth and base URL in one place; `getApiErrorMessage` handles nested API error shapes.
- **Abort handling**: `useAiChat` uses `AbortController`, `mountedRef`, and a cap on tool rounds—reasonable for UX and runaway tool loops.
- **Testing culture**: Many `*.test.ts(x)` files and MSW in devDependencies suggest integration-style coverage for hooks and AI paths.

---

## Critical / high priority

### 1. `QueryClient` recreated every time `AppProviders` renders

In `src/utils/appProviders.tsx`, `new QueryClient()` is created in the component body. **Any re-render of `AppProviders` wipes the React Query cache** and can duplicate subscriptions. In React Strict Mode, dev double-mounting can also cause odd behavior. Prefer `useState(() => new QueryClient())`, a module-level singleton (with care in tests), or lifting the client to `src/index.tsx`.

### 2. Fragile auth error parsing

In `src/utils/authApis.ts`, register error handling assumes `(await res.json()).error[0].msg` for 400 responses. If the body shape differs, this throws. Login uses `await res.json()` for errors without normalizing—align with `getApiErrorMessage` in `useApi.ts` where possible.

### 3. `api()` assumes JSON for every response

In `src/utils/hooks/useApi.ts`, `res.json()` is always called. Non-JSON bodies (e.g. 502 HTML, empty body) throw before `res.ok` is handled cleanly. Consider content-type checks or try/catch with a fallback message.

---

## Medium priority

### Environment and Vite integration

`vite.config.ts` only `define`s `process.env.REACT_APP_API_URL`. Other variables (`REACT_APP_AI_BASE_URL`, `REACT_APP_AI_ENABLED`) are read in `src/constants/env.ts` at build time. **Verify** that production `vite build` actually inlines or exposes all required env vars; document the exact mechanism (e.g. additional `define` entries or `import.meta.env`).

### Mixed state libraries and commented Redux

`appProviders.tsx` has Redux commented out; README still highlights Redux. `projectModalStore` uses MobX for a small bit of UI state. Consider removing dead Redux-related code or restoring it to match docs.

### `filterRequest` mutates its argument

`src/utils/filterRequest.ts` deletes keys on the input object. Callers may pass shared references; in-place mutation can cause subtle bugs. Safer: clone then strip, or document that inputs must be disposable.

### `useAuth.refreshUser` sequencing

`refreshUser` chains `refetchQueries` with `setQueryData` merging `jwt: token`. Worth auditing for race conditions and for cases where the user profile is missing after refetch.

### Remote AI `fetch` has no auth

`useAiChat` posts to `${environment.aiBaseUrl}/api/ai/chat` without `Authorization` or cookies. If the proxy requires tenancy or quotas per user, the client may need to send credentials and CORS must allow it. Document intentional open vs authenticated proxy behavior.

---

## Lower priority / hygiene

- **`package.json`**: `@commitlint/cli` is under `dependencies`; it should be in `devDependencies` with the rest of the toolchain.
- **`engines.node`**: `"24.x"` is very narrow; document or relax if LTS contributors should be supported.
- **README**: States “Styled Components” but the app uses `@emotion/styled` (e.g. `board.tsx`)—update for accuracy.
- **Routes**: Two route objects with `path: "/"` in `src/routes/index.tsx` is unconventional; simplify if `useRoutes` ordering is the only reason it works.
- **`getError`**: Returning `Object(error)` for non-`Error` values is odd for UI; consider normalizing to `Error` or string.

---

## Security notes

- **JWT in `localStorage`**: Standard for SPAs but XSS-sensitive; avoid untrusted script injection. No `dangerouslySetInnerHTML` in app source was found in a quick sweep (good).
- **Mock middleware** (`__json_server_mock__/middleware.js`): Dev-only; ensure it is not deployed as a real backend.

---

## Testing / CI

Ensure CI runs `npm ci` (or `npm install`) before `npm test` so `jest` is available. Align CI Node version with `package.json` `engines` if strict.

---

## Bottom line

Solid structure and thoughtful AI guardrails. Highest-impact improvements: **stabilize React Query `QueryClient` lifetime**, **harden JSON and error handling in `authApis` and `api`**, and **align Vite env injection with everything `env.ts` reads**. README and dependency metadata cleanup reduces onboarding friction.
