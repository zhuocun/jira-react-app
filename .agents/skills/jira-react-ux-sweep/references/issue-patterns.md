# UI/UX issue patterns to look for

Use this as a checklist while reviewing screenshots. Each entry has
the shape: **what to look for**, **likely root cause**, **fix
direction**. Patterns marked ⚠ have already been hit in this repo —
look closely, they tend to recur in adjacent code.

## Theming

⚠ **Invisible text or wrong-color surfaces in dark mode.** Cause:
AntD's `cssVar: { key: "ant" }` scopes its CSS variables to
`:where(.ant)`. Any styled component that reads
`var(--ant-color-bg-container, #fff)` from outside that cascade
falls back to the hardcoded value. The repo already pins `.ant`
onto `<html>` in `appProviders.tsx`. If the cascade is reaching the
element and dark mode still doesn't flip it, look for a hardcoded
hex/rgba in the styled rule itself.

⚠ **Page chrome (body, html, layout shells) reads the AntD var as a
fallback.** Cause: AntD's vars are class-scoped; the body sees them
only because of the `html.ant` workaround. New page-level surfaces
should use `--pulse-bg-page` / `--pulse-text-base` from `App.css`
instead.

**Hardcoded brand colors that don't tint with theme.** Search for
`#5e6ad2`, `#0F1116`, `#F7F8FB`, and the `accent.*` / `brand.*`
literals; they should come from `theme/tokens.ts` and read through
AntD's `colorPrimary*` tokens at runtime.

**Gradients that don't blend with the page background in dark mode.**
The board's `ColumnsViewport::before/after` and the auth layout's
radial gradient both read the page bg color — they need
`var(--pulse-bg-page)`, not `var(--ant-color-bg-layout, #f7f8fb)`.

## Layout & overflow

⚠ **Page overflows past the viewport at desktop widths and content
gets clipped under `body { overflow-x: hidden }`.** Symptom:
fullPage screenshot is wider than the viewport. Cause: a CSS Grid
container with default `auto` track minimums grows to fit the widest
child (typically a kanban or a wide table). Fix: add
`grid-template-columns: minmax(0, 1fr)` and `min-width: 0` on the
flex/grid items inside.

⚠ **Mobile filter rows reserve a tall empty slot above each input.**
Cause: `flex: 1 1 14rem` works in row direction (basis = width) but
becomes a 14 rem-tall reserved height in column direction. Fix:
`flex: 0 0 auto; width: 100%` at the column breakpoint, restore
`flex: 1 1 14rem` only at `md+` where the row reflows.

**Action buttons clipped at the right edge** (Brief, Ask, Reset,
Add column). Cause: a flex row's items have `min-width: auto` and
push siblings off-screen rather than wrapping or shrinking. Fix:
`flex-wrap: wrap` on the parent and `min-width: 0` + an explicit
`flex` shorthand on each child.

**Sticky header growing past viewport width.** Cause: same grid
track issue as above — a downstream descendant's intrinsic width
stretches the entire grid track, which the sticky header inherits.
Fix lives at the grid container, not the header.

## Mobile-only

**Stat cards crammed into 3 columns at 320–390 px.** Labels truncate
under the values. Fix: collapse to single row on the smallest sizes
or shrink the type ramp.

**Table cells overflow horizontally on mobile.** Already mitigated
in `projectList` by hiding columns 3 and 5 with CSS. Watch for
similar tables elsewhere; add `display: none` for non-essential
columns rather than relying on horizontal scroll.

**Touch targets smaller than 44 × 44.** Causes: a custom button
with hardcoded `height: 36px`, an `IconButton` not respecting the
`pointer: coarse` token. Fix: read `touchTargetCoarse` from
`theme/tokens.ts` inside `@media (pointer: coarse)`.

## Visual disambiguation

⚠ **Two adjacent text inputs that look identical but do different
things.** The AI semantic search and the plain text filter were
both bare AntD `<Input>`s. Fix: add a distinct `prefix` icon to
each — `AiSparkleIcon` (brand color) for AI, `SearchOutlined`
(tertiary text color) for filter.

**Two buttons with the same icon and similar labels.** Pick one or
add a chip/tooltip to clarify scope.

## Page titles & breadcrumbs

⚠ **Heading or `document.title` shows a stray suffix while data
loads.** Symptom: " board" with a leading space, lowercase page
heading, "undefined board". Cause: template strings of the form
`${currentProject?.projectName} board`. Fix: ternary with a static
fallback (`currentProject?.projectName ? "X board" : "Board"`).

**Breadcrumb shows the URL segment instead of a friendly name.**
Cause: same as above — the data hasn't resolved yet, or the wrong
mock query param is returning an array.

## Empty / loading / error states

**Blank page when a list is empty.** Every list page should render
an `EmptyState` with title + description + a primary action.

**`PageSpin` indefinitely on a route.** Usually the `users` query
in `AuthProvider` is failing silently. Check the network panel /
mock matrix.

**No retry affordance on errors.** All `<Alert type="error">`
should pair with a `refetch` button.

## Forms

**Free-text fields where a select would prevent typo-duplicates.**
Project organization is a free-text input but renders as a fixed
list — leads to "Dev team 1" vs "Dev Team 1" duplicates. Switch to
an autocomplete that pulls existing values.

**No inline validation.** AntD `Form.Item` should declare `rules`
and the form should set `validateTrigger` to `["onBlur", "onSubmit"]`
so users see errors before they hit submit.

**Password fields without a visibility toggle.** Login does this
right; copy the pattern if you find a missing one.

## Drag & drop

⚠ **Card looks draggable but a drag never starts.** Cause: the
`<Drag>` wraps a node whose root is `<input>`, `<button>`, etc.
Fix: pass `disableInteractiveElementBlocking` on the `<Drag>`. See
`AGENTS.md` for the full list and the `column/index.tsx` example.

**Optimistic update flickers back to old order on slow networks.**
Look at `src/utils/optimisticUpdate/reorder.ts` and check that the
mutation's `onSettled` is correctly invalidating the query cache.

## Modals & drawers

**Modal opens behind a sticky header.** Cause: header `z-index: 10`,
modal default is also low. AntD modals render via portal — check
`getContainer={false}` isn't set anywhere.

**Drawer animation drops frames on phones.** Usually a `box-shadow:
0 0 64px rgba(...)` on the drawer header. Replace with a 1 px solid
border for the same visual weight at 1/10 the paint cost.

## Accessibility (subset — don't scope-creep into a full a11y audit)

**Missing focus rings.** Run the focus-ring probe in
`playwright-harness.md`. Custom buttons that override AntD's
`controlOutline` need their own `:focus-visible` rule.

**`aria-label` missing on icon-only buttons.** Search for
`<Button icon={...}` without a sibling `aria-label`.

**Decorative icons not marked `aria-hidden`.** Sparkle, chevrons,
search icons — they should not show up in the screen reader tree.

## Anti-patterns to NOT "fix"

These look wrong but are correct. Don't change them:

- `useState(systemPrefersDark)` — lazy initializer; React calls it
  once. Calling it eagerly (`useState(systemPrefersDark())`) is
  equivalent but slightly worse on first render.
- `flex: 1 1 14rem` inside a `flex-direction: row` parent — only a
  bug when the parent is `flex-direction: column`.
- `useTitle("Board")` becoming `useTitle(\`${name} board\`)` later
  in a hook — both calls write to `document.title`; the later one
  wins. The pattern is fine.
- AntD `App component={false}` — this is intentional to avoid an
  extra wrapper div in the HTML. The `html.ant` workaround in
  `appProviders.tsx` covers the cssVar cascade; don't remove it.
