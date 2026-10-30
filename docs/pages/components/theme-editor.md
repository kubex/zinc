---
meta:
  title: Theme Editor
  description: Theme controls on the left, a live preview frame on the right, with light/dark and device switching.
layout: component
fullWidth: true
---

Put form controls in the default slot and give each a `name`. Every control is
per-mode: it holds a light value and a dark value, and the sidebar's mode
toggle swaps which one the control displays. Changing a control harvests every
named control's *currently displayed* value and pushes the active mode's set
into the embedded [preview frame](/components/preview-frame/) as an
`hp-preview:theme` message — no save, no fetch, no page reload.

The controls column runs the full height of the component, with its own
header row on top holding the light/dark mode toggle beside its caption. The
toolbar sits opposite it, above the preview only, and switches the width the
preview renders at: desktop (full width), tablet (768px) or mobile (390px).
Because the iframe itself is resized, the embedded page's own media queries
fire.

Set `controls-caption` and `preview-caption` to label each column's header
row — both are empty by default, rendering no text (the controls column's
header row still renders either way, so the two columns stay aligned).

The preview is [interactive](/components/preview-frame/#interactivity): the
embedded page can be clicked and hovered, and it scrolls itself, so the preview
column never adds a second scrollbar beside the embed's own.

The preview always fills its column, leaving no dead space beneath it.
`min-height` (default `480`) is a floor for that column, not a fixed height —
it's still forwarded to the [preview frame](/components/preview-frame/), which
uses it the same way.

The preview column alone sets the editor's height — the controls never stretch
it, however many sections are expanded, they just scroll in place. So the
editor is as tall as its parent when that parent has a definite height, and
`min-height` tall otherwise; either way the controls and the preview scroll
independently while the header, toolbar and footer rows stay put. Stacked
(under 768px) there's no second column to take the height from, so both flow
with the page and there's only ever one scrollbar.

Controls organize themselves into tabs with collapsible groups inside each:
give each one a `group` and a `category` and the editor builds the structure
around them, no slot names required.

```html:preview
<zn-theme-editor
  id="theme-editor-demo"
  src="/components/preview-frame-demo/"
  min-height="420"
  controls-caption="Theme Builder"
  preview-caption="Live Preview">
  <zn-input group="Colors" category="Brand" name="accent" label="Accent" value="#6936f5" dark-value="#f5c542" type="color"></zn-input>
  <zn-input group="Colors" category="Background" name="background" label="Background" value="#ffffff" dark-value="#18181b" type="color"></zn-input>
  <zn-input group="Shapes" category="Radius" name="radius" label="Corner radius" type="number" value="4"></zn-input>
</zn-theme-editor>

<script>
  document.getElementById('theme-editor-demo').frameOrigin = location.origin;
</script>
```

:::tip
`frame-origin` must match the embed's origin exactly — messages from any other
origin are ignored. The example sets it at runtime because the docs site is
same-origin.
:::

## Dark values

Give a control a `dark-value` attribute alongside `value` to author its dark
variant, as `accent` and `background` do above. A control with no
`dark-value` falls back to its `value` in dark mode, so adding dark support to
an existing editor is additive:

```html
<zn-color-select name="accent" label="Accent" value="#6936f5" dark-value="#f5c542"></zn-color-select>
```

For boolean controls (`zn-checkbox`, `zn-toggle`, `input[type=checkbox]`),
two separate rules apply depending on whether `dark-value` is present:

- **Present** — parsed as truthy: `dark-value="1"` or `dark-value="true"`
  seeds the dark state checked, any other value seeds it unchecked.
- **Absent** — the dark state mirrors the control's own light `checked`
  state, whatever that is (including `true`), the same fallback rule
  non-boolean controls get.

## Reading and Persisting Values

Every change emits `zn-theme-change` with `{values, mode, device}`, where
`values` is `{light, dark}` — both full sets, regardless of which mode is
active:

```js
editor.addEventListener('zn-theme-change', event => {
  console.log(event.detail.values.light, event.detail.values.dark);
});
```

Set `action` to persist automatically instead — both sets are POSTed as
`FormData` on a longer debounce (`save-debounce`, default `1000`ms), with every
key bracketed by mode: `light[accent]`, `dark[accent]`, `light[radius]`,
`dark[radius]`. `mode` and `device` are view state and are never saved.

```html
<zn-theme-editor src="/embed?t=..." frame-origin="https://pay.example" action="/theme/save">
  <zn-color-select name="accent" label="Accent" value="#6936f5" dark-value="#f5c542"></zn-color-select>
</zn-theme-editor>
```

Saves are serialized: if changes land while a POST is in flight, exactly one
further save runs afterwards with the latest values.

### Manual saving with a submit button

Set `submit-label` to render a built-in save button at the right of the toolbar,
opposite the device controls —
empty (the default) renders no button. Add `manual` to disable the debounced
auto-save entirely, so persistence only happens when the button is clicked;
the live preview keeps updating on every change either way, only saving
becomes explicit:

```html
<zn-theme-editor
  src="/embed?t=..." frame-origin="https://pay.example"
  manual
  submit-label="Save theme">
  <zn-color-select name="accent" label="Accent" value="#6936f5" dark-value="#f5c542"></zn-color-select>
</zn-theme-editor>
```

Clicking the button flushes any pending edit, then saves immediately through
the same single-slot save queue used for auto-save — it never opens a second
concurrent request. With `action` set, a successful save emits `zn-theme-submit`
carrying `{values}` (both `light` and `dark` sets); a failed save surfaces
through the same error strip and `zn-error` as auto-save. With no `action`,
nothing is POSTed but `zn-theme-submit` still fires, so a host can persist the
values itself:

```js
editor.addEventListener('zn-theme-submit', event => {
  console.log(event.detail.values.light, event.detail.values.dark);
});
```

The button shows a loading state while its save is in flight and ignores
further clicks until it resolves.

## Controls

Any Zinc form control works. Controls must carry `name` as an **attribute** —
`zn-checkbox` and `zn-toggle` contribute their `checked` state as a boolean,
everything else contributes `value`. Disabled and unnamed controls are skipped.
Every control is per-mode with no opt-in attribute, so mode-independent values
(like `radius` above) end up duplicated across `light` and `dark` — accepted
knowingly to keep the rule uniform.

The value store is the theme, not a mirror of the currently visible controls:
removing a control from the markup keeps its key in both value sets, and it
keeps being pushed to the preview and included in saves. Clear it server-side
or re-add the control under the same name to edit it again.

The `footer` slot holds actions beneath the controls:

```html
<zn-theme-editor src="/embed?t=..." frame-origin="https://pay.example">
  <zn-color-select name="accent" label="Accent"></zn-color-select>
  <zn-button slot="footer">Save</zn-button>
</zn-theme-editor>
```

Set the controls column width with `--zn-theme-editor-controls-width`
(default `343px`, matching page-builder's palette). Below 768px the columns
stack.

## Grouping controls with `group` and `category`

The simplest way to structure an editor is to let the controls describe their
own place in it. Leave `sections` unset and give each control a `group` (which
becomes a tab) and a `category` (a collapsible inside that tab) — the editor
builds the tabs and collapsibles from those labels and slots each control into
the right one for you, so there are no slot names to keep in sync by hand:

```html
<zn-theme-editor src="/embed?t=..." frame-origin="https://pay.example">
  <zn-color-select group="Background &amp; Foreground" category="Colors"
                   name="background" label="Background" value="#ffffff"></zn-color-select>
  <zn-color-select group="Background &amp; Foreground" category="Colors"
                   name="foreground" label="Foreground" value="#18181b"></zn-color-select>
  <zn-input group="Background &amp; Foreground" category="Spacing"
            name="gap" label="Gap" type="number" value="8"></zn-input>
  <zn-input group="Typography" category="Family"
            name="font" label="Font" value="Inter"></zn-input>
</zn-theme-editor>
```

That renders a **Background & Foreground** tab holding *Colors* and *Spacing*
collapsibles, and a **Typography** tab holding *Family*. Labels are free text —
they're slugged into slot names internally, and two tabs can each hold a
category of the same name without colliding.

Either attribute works on its own: a control with only `group` sits directly in
its tab above any collapsibles, and one with only `category` becomes its own
top-level section. A control with neither stays in the default slot, ungrouped
above everything else. Tabs and collapsibles appear in the order the controls
first mention them, and controls added after mount are derived and slotted the
same way.

### Declaring the structure explicitly with `sections`

Set `sections` to take full control instead — it disables the attribute
derivation entirely, and is the way to set a group's `description` or have it
render `open`. It takes a JSON array of `{name, caption, groups}`. Each section
becomes a `zn-tabs` tab; each entry in its `groups` — `{name, caption,
description?, open?}` — becomes a collapsible inside that tab, and a control
is assigned to a group with `slot="<group-name>"`:

```html
<zn-theme-editor
  src="/embed?t=..." frame-origin="https://pay.example"
  sections='[
    {"name":"colors","caption":"Colors","groups":[
      {"name":"brand","caption":"Brand","open":true},
      {"name":"semantic","caption":"Semantic"}
    ]},
    {"name":"shapes","caption":"Shapes","groups":[{"name":"radius","caption":"Radius"}]}
  ]'>
  <zn-color-select slot="brand" name="accent" label="Accent" value="#6936f5"></zn-color-select>
  <zn-input slot="radius" name="radius" label="Corner radius" type="number" value="4"></zn-input>
</zn-theme-editor>
```

A group with no assigned controls renders no collapsible, and a section none
of whose groups are populated renders no tab — the same "no chrome for empty
config" rule flat sections already followed. Every tab's panel stays mounted
while hidden (`zn-tabs` toggles visibility, never removes a panel), so
switching tabs never drops a value out of the theme, a preview push or a save.

The editor never shows a tab with everything shut: on load, and again whenever
a tab is clicked, its first collapsible expands unless one in that tab is
already open. `open: true` therefore only matters for picking *which* group
opens — and closing them all yourself sticks, since nothing reopens until the
next tab click.

### Flat sections (no groups)

A section can omit `groups` and just take controls directly via
`slot="<section-name>"`, exactly as before nesting existed. `section-layout`
then decides the presentation — stacked `zn-collapsible`s (`"collapsible"`,
the default) or a `zn-tabs` strip (`"tabs"`) — and is otherwise ignored: once
*any* section has a populated `groups`, every section renders as a nested tab
regardless of `section-layout`. Stacked sections get the same load-time
expansion as tabs: the first one opens unless another already has `open`.

```html
<zn-theme-editor
  src="/embed?t=..." frame-origin="https://pay.example"
  section-layout="tabs"
  sections='[{"name":"colors","caption":"Colors"},{"name":"layout","caption":"Layout"}]'>
  <zn-color-select slot="colors" name="accent" label="Accent" value="#6936f5"></zn-color-select>
  <zn-input slot="layout" name="radius" label="Corner radius" type="number" value="4"></zn-input>
</zn-theme-editor>
```

An author can also slot their own `zn-collapsible` into any named slot (or the
default slot) instead of relying on `groups` — its presentation is then
entirely its own; add `flush` yourself if you want it to run the full width of
the column.

## Preview sources

Set `sources` to a JSON array of `{label, src}` to render a dropdown in the
toolbar, beside the device buttons, for switching which page the preview
loads:

```html
<zn-theme-editor
  src="/embed?t=..." frame-origin="https://pay.example"
  sources='[{"label":"Checkout","src":"/embed/checkout"},{"label":"Storefront","src":"/embed/storefront"}]'>
  <zn-color-select name="accent" label="Accent" value="#6936f5"></zn-color-select>
</zn-theme-editor>
```

The first entry is the initial selection — it wins over an explicit `src` when
`sources` is non-empty. Selecting a different entry reloads the iframe; nothing
further is needed to keep the theme, since the frame retains the last pushed
payload and replays it once the reloaded page re-announces itself ready. Leave
`sources` unset (the default) and `src` behaves exactly as it always has, with
no dropdown rendered.

## Collapsing the controls column

Set `controls-collapsed` to hide the controls column, or click the chevron
toggle that straddles the seam between the columns — the same edge chevron
the flow and page builders use for their side panels. Collapsing is purely a
layout change — it never affects harvested values or pushes a new theme to
the preview. Below the 768px stacked breakpoint the columns stack vertically
and the chevron attaches to the horizontal seam above the preview instead;
crossing into that breakpoint also auto-collapses the controls (once —
re-expanding while narrow is respected), and the toggle stays available to
bring them back.

## Standalone panel

Set `standalone` to present the editor as its own bordered, rounded panel —
useful when it isn't already embedded in a page shell that provides that
chrome. It also switches the preview's [backdrop](/components/preview-frame/)
from the dot grid to a plain panel to match.

```html
<zn-theme-editor src="/embed?t=..." frame-origin="https://pay.example" standalone>
  <zn-color-select name="accent" label="Accent" value="#6936f5" dark-value="#f5c542"></zn-color-select>
</zn-theme-editor>
```
