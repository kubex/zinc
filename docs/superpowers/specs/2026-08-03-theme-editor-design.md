# zn-theme-editor — Design

Date: 2026-08-03
Status: approved, ready for implementation planning

## Purpose

A theme editor surface: form controls on the left, a live `zn-preview-frame` on
the right. Changing a control pushes the new values into the preview iframe over
postMessage, so the previewed page re-themes instantly with no network
round-trip. A toolbar above the preview switches the preview's light/dark mode
and its viewport width (desktop / tablet / mobile).

## Scope

Two components are touched:

1. `zn-preview-frame` — gains a `device` property, a `setTheme()` method, and a
   guard for the empty-`data-uri` case.
2. `zn-theme-editor` — new component: layout, toolbar, value harvesting, and
   optional persistence.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Control definition | Slotted markup — the author places real Zinc form controls in the default slot | No new schema to maintain; reuses every existing control's labelling and validation |
| Dark/light | Per-mode value sets; the toolbar toggle switches which set the controls are bound to | **Revised — see Revision 2 below.** Originally a single shared set; the owner reversed this because light and dark genuinely need different values |
| Sync | Live debounced postMessage push, plus optional debounced POST auto-save | Instant feedback; persistence is opt-in via `action` |
| Composition | The editor renders its own `zn-preview-frame` internally | One tag to use, layout and toolbar wiring guaranteed correct |
| Viewport | `device` property on `zn-preview-frame` | Sizing belongs to the frame and is reusable outside the editor; narrowing the *iframe* makes the embed's own media queries fire |

Explicitly out of scope: a `preview` slot escape hatch (the editor always
renders its own frame — one code path, no missing-frame handling); saving
`device` as part of the theme.

## Revision 2 — per-mode values (2026-08-03)

The original design had one shared value set, with the mode toggle only telling
the preview which way to render. The owner revised this after the first six
tasks shipped: **every control holds a light value and a dark value**, and the
toggle switches which set the controls are bound to.

Three decisions fix the shape:

1. **Every named control is per-mode.** No opt-in attribute — a uniform rule with
   nothing for an author to remember. The cost is that genuinely
   mode-independent values (radius, spacing) are duplicated and can drift; that
   was accepted knowingly.
2. **Dark defaults are authored per control** via a `dark-value` attribute
   alongside the existing `value`. A control with no `dark-value` initialises its
   dark entry from `value`, so adding dark support to an existing editor is
   additive and never breaks it.
3. **Both sets are persisted as bracketed FormData keys** — `light[background]`,
   `dark[background]`. Because *every* control is per-mode there is no shared
   bucket, so every key is bracketed. Bracket notation keeps the body as
   `FormData`, which PHP and Go both decode natively.

Consequences that ripple through the earlier sections below — where the two
disagree, this revision wins:

- `values` becomes `{light: {...}, dark: {...}}` rather than a flat map.
- `zn-theme-change` detail becomes `{values: {light, dark}, mode, device}`.
- The **frame payload is unchanged**: still `{mode, values}` with `values` flat,
  carrying only the active mode's set. The embed never needs the inactive half.
- Toggling mode now **writes the target set back into the slotted controls** and
  then pushes. Write-back must be suppressed from re-entering the change handler,
  or the toggle would queue a spurious save.
- Booleans (`zn-checkbox`, `zn-toggle`) take their dark state from `dark-value`
  parsed as truthy (`"1"`/`"true"`), falling back to the `checked` attribute.

## Revision 3 — grouping controls into sections (2026-08-03)

The owner asked to group form inputs into sections. **No new component**: authors
wrap each group in the existing `zn-collapsible`, which already provides a
caption, an optional description, item counts, `default="open|closed"`, and
optional localStorage persistence of the open state.

This works for value collection today without any change, because harvesting
walks `[name]` descendants of each assigned element rather than only direct
children. What the editor owes is layout (`::slotted` rules so sections sit
correctly in the controls column) and documentation.

### The gap sections expose, now fixed

`slotchange` fires only when a slot's **direct** assignment changes. With
sections, controls sit one level deeper, so a control added inside an existing
section after mount was invisible to the editor: no light/dark entry seeded, no
push. This was a knowingly-deferred minor while wrappers were the exception;
sections make them the normal structure, so it moves onto the main path.

Fix: a `MutationController` over the editor's light-DOM subtree, and the
mount-race guard's comparison basis generalised from *assigned elements* to *the
deep set of named controls*. That subsumes `slotchange` and preserves all five of
the guard's correctness properties — it still compares element identity, never
values, so no push can be suppressed on the basis of what a control contains.

**Observe `childList` and `subtree` only — never `attributes`.** Some Zinc
controls reflect state to attributes (`zn-checkbox` reflects `checked`), so
observing attributes would make mode write-back trigger the observer and feed
back into the change path.

### Known constraint on styling inside a section

Sections and their controls all live in the editor's **light DOM**, so the
editor's stylesheet can reach the sections via `::slotted(...)` but cannot style
controls nested inside them. Stacking of controls within a section is
`zn-collapsible`'s own concern or the page's; the docs must show a pattern that
looks right rather than assuming the editor can fix it from outside.

## `zn-preview-frame` changes

### `device`

```ts
@property({reflect: true}) device: 'desktop' | 'tablet' | 'mobile' = 'desktop';
```

Constrains and centres the iframe: `desktop` = 100%, `tablet` = 768px,
`mobile` = 390px.

Implemented as a `.preview__stage` wrapper between `.preview` and the iframe,
carrying `width: <device width>; max-width: 100%; margin: 0 auto`. The iframe
keeps its existing percentage width, now relative to the stage, so the zoom
transform and all existing zoom assertions are untouched. The `max-width`
prevents a tablet width from overflowing a narrower panel.

Composes with `zoom`: at `zoom=1` (the editor's case) a `tablet` iframe is
exactly 768 CSS px. At `zoom<1` the iframe lays out at `768/zoom` px and scales
back down, so the embed sees proportionally more CSS pixels — which is the
correct browser-zoom-out semantics.

Because the iframe element itself is narrowed, the embedded document reports the
narrow viewport width and its own media queries fire. A wrapper-based approach
would not achieve this.

### `setTheme(values)`

```ts
setTheme(theme: Record<string, unknown>): void
```

Stores the payload and posts `{type: 'hp-preview:theme', ...theme}` to the
frame, checked against `frameOrigin` as with all other traffic. The stored
payload is **re-posted after every `hp-preview:ready` handshake**, so a frame
reload does not drop the in-progress theme.

The frame remains the sole postMessage gatekeeper — it is the only thing that
knows the iframe and its trusted origin. The editor never touches
`contentWindow`.

### Empty-`data-uri` guard

`_sendConfig()` currently runs on every `hp-preview:ready`, unconditionally. A
theme-editor-only setup has no `data-uri`, so this becomes `fetch('')`, which
returns the current page's HTML, fails to parse as JSON, and paints the error
overlay over an otherwise working preview. Fix: skip the config fetch when
`dataUri` is empty.

## `zn-theme-editor`

### Markup

```html
<zn-theme-editor
    src="/embed?t=..."
    frame-origin="https://pay.example"
    data-uri="/theme/config"
    action="/theme/save"
    mode="light"
    device="desktop">
  <zn-color-select name="background" label="Background"></zn-color-select>
  <zn-input name="radius" type="number" label="Corner radius"></zn-input>
  <zn-button slot="footer">Save</zn-button>
</zn-theme-editor>
```

### Properties

| Property | Attribute | Type | Default | Notes |
|---|---|---|---|---|
| `src` | `src` | string | `''` | Forwarded to the frame |
| `frameOrigin` | `frame-origin` | string | `''` | Forwarded; fail-closed as today |
| `dataUri` | `data-uri` | string | `''` | Forwarded; optional base config |
| `action` | `action` | string | `''` | POST target; empty = no persistence |
| `mode` | `mode` | `light \| dark` | `light` | Reflected |
| `device` | `device` | `desktop \| tablet \| mobile` | `desktop` | Reflected; forwarded to the frame |
| `minHeight` | `min-height` | number | `480` | Forwarded to the frame |
| `debounce` | `debounce` | number | `150` | Debounce before the postMessage push |
| `saveDebounce` | `save-debounce` | number | `1000` | Debounce before the POST |

`values` is a read-only getter returning the current harvested map.

### Slots

- default — the controls, rendered in the left column.
- `footer` — actions pinned beneath the controls (rendered only when present,
  via `HasSlotController`).

### Events

- `zn-theme-change` — `{values, mode, device}`, emitted whenever any of the three
  changes (debounced for value changes, immediate for the toolbar), so a host
  can drive its own save button when `action` is unset. A new event, not
  `zn-change`: `src/events/zn-change.ts` types that event's detail as
  `Record<PropertyKey, never>` repo-wide, so it cannot carry a payload. Follows
  the `zn-flow-change` precedent.
- `zn-error` — `{message}` for failed saves. Frame errors already bubble and
  compose out through the editor, so they are captured for display but not
  re-emitted.

### Layout

Two columns: controls at `--zn-theme-editor-controls-width` (default `280px`),
preview filling the rest, stacking on narrow viewports. Above the preview sits a
toolbar with a three-way device segmented control (lucide `monitor`, `tablet`,
`smartphone`) and a `sun`/`moon` mode toggle. An inline `part="error"` strip
renders above the toolbar when there is an error.

The toolbar uses **native `<button>` elements** with `zn-icon` glyphs, not
`zn-button`. Two reasons: `zn-button` does not forward an accessible name to its
internal `<button>`, so icon-only Zinc buttons fail the axe check; and native
buttons carry proper `aria-pressed` toggle semantics. Styling them natively is
safe because `zn-.min.css`'s native-button rules do not cross the shadow
boundary, so the component's own SCSS is the only stylesheet in play. Lucide
glyphs render `aria-hidden`, so `aria-label` on each button is the accessible
name.

CSS parts: `base`, `controls`, `footer`, `toolbar`, `preview`, `error`.

## Value harvesting

Slotted controls are light-DOM children, so their `zn-change`, `zn-input`,
`change` and `input` events bubble to the editor host. One listener set covers
every control, including ones added to the slot later.

On each such event — and on `slotchange`, and once on first render — the editor
walks the default slot's assigned elements and collects every `[name]`
descendant (and any assigned element that is itself named) into a map. The
`[name]` **attribute** is the selector, so controls must carry `name` in markup
— which the slotted-markup design makes the norm anyway. Setting only the `.name`
property in JS will not register the control.

- boolean controls contribute `.checked`; everything else contributes `.value`.
  "Boolean" means specifically `zn-checkbox`, `zn-toggle`, and
  `input[type=checkbox]`. Radios are not special-cased — `zn-radio-group`
  carries the selected value on `.value` like any other control.
- disabled and unnamed controls are skipped, matching native form semantics
- on duplicate names, the last one wins

The initial harvest matters: it pushes the authored attribute defaults into the
preview immediately, so the frame never renders un-themed and then snaps to the
real values.

## Theme message

```js
{ type: 'hp-preview:theme', mode: 'light', values: { background: '#ffffff', radius: '8' } }
```

`mode` travels in the payload because the embed cannot infer it. `device`
deliberately does not — the embed learns its width from the actual iframe box.

Consequently: **a mode change re-pushes the payload; a device change only
resizes the frame.** `zn-change` reports both regardless.

## Persistence

When `action` is set, changes also POST a `FormData` of the harvested values
(`credentials: 'same-origin'`) on the `saveDebounce` timer. `mode` and `device`
are view state and are not included.

Saves serialize through a single-slot queue: if changes land while a POST is in
flight, exactly one further save runs afterwards with the latest values. Without
this, overlapping POSTs can complete out of order and leave the server holding a
stale value.

## Error handling

Save failures emit `zn-error` and render into the inline `part="error"` strip.
Frame errors are captured into the same strip; they already bubble and compose
out to the host on their own, so the editor does not re-emit them.

No generation counter is needed here — the single-slot save queue guarantees at
most one POST in flight, so there is no stale response to discard. (This differs
from `zn-preview-frame`, where concurrent `refresh()` calls genuinely can race.)

## Testing

`zn-theme-editor` (`npx web-test-runner --group theme-editor`):

1. renders and is accessible
2. pushes the authored control defaults to the frame on first render
3. harvests and pushes updated values when a slotted control changes
4. toggling mode reflects the attribute and re-pushes with the new `mode`
5. the device buttons set the frame's `device` property
6. no POST is issued when `action` is unset; one is issued when it is set
   (stubbed `fetch`)

`zn-preview-frame` (`npx web-test-runner --group preview-frame`):

1. `device` constrains the iframe width
2. `setTheme()` is replayed after a `hp-preview:ready` handshake
3. no config fetch when `dataUri` is empty

Notes: `npm run test:component` is watch-mode only and hangs non-interactive
shells. `zn-button` overrides `click()` and dispatches nothing — tests must
dispatch a composed, bubbling `MouseEvent` instead. Gate lint on touched files
with `npx eslint <paths>`; the repo-wide run has many pre-existing problems.

## Docs

- New `docs/pages/components/theme-editor.md` following the existing component
  page conventions.
- Extend `docs/pages/components/preview-frame-demo.njk` to handle
  `hp-preview:theme` (apply the background value and a mode class) so the
  theme-editor docs example is genuinely live. The existing preview-frame
  examples must keep working.
- Docs example scripts run before `zn.min.js` registers elements: method calls
  need `customElements.whenDefined(...)`; property assignment is safe.
- Any literal `{{ }}` in docs markdown needs `{% raw %}…{% endraw %}`.

## Build

Do not run `npm run build` — it kills the running `npm run watch`, which
rebuilds `dist` incrementally. New component must be exported from
`src/zinc.ts`.
