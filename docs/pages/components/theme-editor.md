---
meta:
  title: Theme Editor
  description: Theme controls on the left, a live preview frame on the right, with light/dark and device switching.
layout: component
fullWidth: true
---

Put form controls in the default slot and give each a `name`. Every control is
per-mode: it holds a light value and a dark value, and the toolbar's mode
toggle swaps which one the control displays. Changing a control harvests every
named control's *currently displayed* value and pushes the active mode's set
into the embedded [preview frame](/components/preview-frame/) as an
`hp-preview:theme` message — no save, no fetch, no page reload.

The toolbar above the preview switches the mode the preview renders in and the
width it renders at: desktop (full width), tablet (768px) or mobile (390px).
Because the iframe itself is resized, the embedded page's own media queries
fire.

The preview always fills its column, matching the controls column's height
rather than leaving dead space beneath it. `min-height` (default `480`) is a
floor for that row, not a fixed height — it's still forwarded to the
[preview frame](/components/preview-frame/), which uses it the same way.

```html:preview
<zn-theme-editor
  id="theme-editor-demo"
  src="/components/preview-frame-demo/"
  min-height="420">
  <zn-color-select name="accent" label="Accent" value="#6936f5" dark-value="#f5c542"></zn-color-select>
  <zn-input name="radius" label="Corner radius" type="number" value="4"></zn-input>
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
variant. A control with no `dark-value` falls back to its `value` in dark
mode, so adding dark support to an existing editor is additive:

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
opposite the device and mode controls —
empty (the default) renders no button. Add `manual` to disable the debounced
auto-save entirely, so persistence only happens when the button is clicked;
the live preview keeps updating on every change either way, only saving
becomes explicit:

```html:preview
<zn-theme-editor
  id="theme-editor-manual"
  src="/components/preview-frame-demo/"
  min-height="420"
  manual
  submit-label="Save theme">
  <zn-color-select name="accent" label="Accent" value="#6936f5" dark-value="#f5c542"></zn-color-select>
  <zn-input name="radius" label="Corner radius" type="number" value="4"></zn-input>
</zn-theme-editor>

<script>
  document.getElementById('theme-editor-manual').frameOrigin = location.origin;
</script>
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

## Grouping controls into sections

Set `sections` to a JSON array of `{name, caption, description?, open?}` and
assign controls to a section with `slot="<name>"`. The editor renders each
section as a collapsible itself — no `zn-collapsible` markup needed on the
author's side. A control with no `slot` renders ungrouped, above the sections.
Harvesting and change detection walk every section's slot exactly like the
default one, so a control nested in a section is read, seeded and pushed just
like a bare one, including one added into an already-rendered section after
the page has loaded. A section with no assigned controls renders no chrome.

```html:preview
<zn-theme-editor
  id="theme-editor-grouped"
  src="/components/preview-frame-demo/"
  min-height="420"
  sections='[{"name":"colors","caption":"Colors","open":true},{"name":"layout","caption":"Layout","description":"Advanced"}]'>
  <zn-color-select slot="colors" name="accent" label="Accent" value="#6936f5" dark-value="#f5c542"></zn-color-select>
  <zn-color-select slot="colors" name="background" label="Background" value="#ffffff" dark-value="#0b0b0f"></zn-color-select>
  <zn-input slot="layout" name="radius" label="Corner radius" type="number" value="4"></zn-input>
</zn-theme-editor>

<script>
  document.getElementById('theme-editor-grouped').frameOrigin = location.origin;
</script>
```

The `colors` section above opens by default (`"open":true`); `layout` starts
closed.

## Tabbed sections

Set `section-layout="tabs"` to present the same `sections`/named-slot config
as a tab strip instead of stacked collapsibles. `description` and `open` are
meaningless for tabs and are ignored. Every tab's slot stays mounted while
hidden, so switching tabs never drops a value out of the theme, a preview
push or a save — only the active pane's visibility changes.

The strip is always a single row: with more tabs than fit the controls
column, it scrolls horizontally rather than wrapping, and a fade at the
right edge signals there's more to scroll rather than letting a tab's
caption read as clipped text. Activating a tab — by click or with the
arrow keys — scrolls it into view if it isn't already visible.

```html:preview
<zn-theme-editor
  id="theme-editor-tabs"
  src="/components/preview-frame-demo/"
  min-height="420"
  section-layout="tabs"
  sections='[{"name":"colors","caption":"Colors"},{"name":"layout","caption":"Layout"}]'>
  <zn-color-select slot="colors" name="accent" label="Accent" value="#6936f5" dark-value="#f5c542"></zn-color-select>
  <zn-input slot="layout" name="radius" label="Corner radius" type="number" value="4"></zn-input>
</zn-theme-editor>

<script>
  document.getElementById('theme-editor-tabs').frameOrigin = location.origin;
</script>
```

## Collapsing the controls column

Set `controls-collapsed` to hide the controls column, or click the chevron
toggle that sits on the seam between the columns. Collapsing is purely a
layout change — it never affects harvested values or pushes a new theme to
the preview. Below the 768px stacked breakpoint the toggle is hidden, since
there's no side-by-side seam to tuck into — the editor also un-collapses
itself if it's already showing `controls-collapsed` when the layout narrows
that far, so the controls are never stuck unreachable.

## Standalone panel

Set `standalone` to present the editor as its own bordered, rounded panel —
useful when it isn't already embedded in a page shell that provides that
chrome. It also switches the preview's [backdrop](/components/preview-frame/)
from the dot grid to a plain panel to match.

```html:preview
<zn-theme-editor
  id="theme-editor-standalone"
  src="/components/preview-frame-demo/"
  min-height="420"
  standalone>
  <zn-color-select name="accent" label="Accent" value="#6936f5" dark-value="#f5c542"></zn-color-select>
  <zn-input name="radius" label="Corner radius" type="number" value="4"></zn-input>
</zn-theme-editor>

<script>
  document.getElementById('theme-editor-standalone').frameOrigin = location.origin;
</script>
```

