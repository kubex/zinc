---
meta:
  title: Preview Frame
  description: Embeds a live preview iframe and keeps it in sync with surrounding forms via the hp-preview postMessage protocol.
layout: component
---

The frame loads the embed page from `src`, waits for it to post `hp-preview:ready`, fetches the JSON payload from `data-uri` and posts it back into the frame as `hp-preview:config`. The embed then reports `hp-preview:rendered` or `hp-preview:error`.

The example below embeds the [demo embed page](/components/preview-frame-demo/), which implements the embed side of the protocol. `frame-origin` must match the embed's origin exactly — messages from any other origin are ignored — so the example sets it at runtime since the docs demo is same-origin.

```html:preview
<zn-preview-frame
  id="preview-frame-demo"
  src="/components/preview-frame-demo/"
  data-uri="/data/preview-frame-payload.json"
  watch="#preview-frame-demo-form"></zn-preview-frame>

<script>
  document.getElementById('preview-frame-demo').frameOrigin = location.origin;
</script>
```

:::tip
`watch` defaults to `form[data-auto-save]`, so only forms explicitly opted in via a `data-auto-save` attribute are watched — unmarked forms keep normal submit behavior and are never intercepted. Override `watch` with your own selector to widen or change the scope — the examples here point it at a form that doesn't exist. Watched forms are auto-saved via a POST to their `action` on change, which needs a real endpoint, so it isn't demonstrated here.
:::

The frame always fills the panel; `zoom` (0–1, default `1`) zooms the previewed page out browser-style — e.g. `zoom="0.4"` renders the content at 40% size with correspondingly more of the page visible. `min-height` (default `480`) sets the visible panel height in pixels.

Set `fill` to make the panel fill its container's height instead — `min-height` then becomes a floor rather than the height, for hosts (like [`zn-theme-editor`](/components/theme-editor/)) whose layout already stretches the panel to match a taller sibling. `zoom` is ignored when `fill` is set, since its oversize maths needs a known pixel height to scale against, which `fill` deliberately doesn't have.

`device` constrains and centres the preview to `desktop` (full width), `tablet`
(768px) or `mobile` (390px), resizing the iframe itself so the embedded page's
media queries fire. `setTheme({mode, values})` posts an `hp-preview:theme` message and
replays it after each ready handshake, which is how
[`zn-theme-editor`](/components/theme-editor/) drives a live preview.

The panel behind the preview is a dot grid, so the frame's bounds stay visible
instead of blending into the page — at `tablet` or `mobile` the dots fill the
gutters either side of the narrowed iframe. Tune it with
`--zn-preview-frame-dot-spacing` (default `20px`) and
`--zn-preview-frame-dot-opacity` (default `0.08`). The iframe itself is given an
opaque background, so the dots never show through the previewed page.

Set `backdrop="panel"` to swap the dot grid for a plain `rgb(var(--zn-panel))`
fill — used by [`zn-theme-editor`](/components/theme-editor/)'s `standalone`
mode, where the frame is already inside its own bordered panel. `backdrop="dots"`
is the default.

## Interactivity

The preview is display-only: the iframe takes `pointer-events: none`, so clicks
never reach the embedded page and the previewed form can't be submitted or
navigated away from inside the frame. The embed is cross-origin, so its own
handlers can't be cancelled from out here — blocking pointer input is the only
way to stop them, and hover goes with it. Scrolling doesn't: an overflowing page
is scrolled by the panel instead, as below.

Set `interactive` when the embed is meant to be used rather than looked at. The
frame then behaves as a viewport: it stays the panel's own height and the embed
scrolls itself, so there's a single scrollbar and the embed's `100vh`,
`position: fixed` and sticky content size to what's actually on screen. The
[reported content height](#overflowing-content) is ignored while `interactive`
is set — it exists to make an *inert* frame's overflow reachable, which an
interactive one does for itself.

```html:preview
<zn-preview-frame
  id="preview-frame-interactive"
  src="/components/preview-frame-demo/"
  data-uri="/data/preview-frame-payload.json"
  watch="#preview-frame-interactive-none"
  interactive></zn-preview-frame>

<script>
  document.getElementById('preview-frame-interactive').frameOrigin = location.origin;
</script>
```

## Overflowing Content

An inert page taller than the panel is scrolled by the panel, not inside the
frame. The frame can't do it itself: a cross-origin document can't be scrolled
from the host (`contentWindow.scrollTo` is blocked), and with pointer input off
the wheel never reaches it anyway. So the frame is instead laid out at its full
content height — nothing scrolls inside it — and the panel scrolls that. An
[`interactive`](#interactivity) frame doesn't need any of this and opts out of
it: it keeps the panel's height and the embed scrolls itself.

For the frame to be sized that way, the embed reports its height alongside
`hp-preview:rendered`:

```js
post({
  type: 'hp-preview:rendered',
  height: document.documentElement.scrollHeight
});
```

A page that grows after its first render — a revealed section, a lazy-loaded
image — reports the new height on its own:

```js
post({type: 'hp-preview:height', height: document.documentElement.scrollHeight});
```

Heights that aren't a positive number are ignored, as is one reported while the
error overlay is up. A height under the panel's own is kept but changes nothing:
the frame still fills the panel, so the backdrop never shows under a short page.
The height is dropped whenever `src` changes, since the next page has its own.

The example below previews a long itemised page, so the panel scrolls. Scrolling
works with the frame inert — clicking `Pay` still does nothing.

```html:preview
<zn-preview-frame
  id="preview-frame-tall"
  src="/components/preview-frame-demo/"
  data-uri="/data/preview-frame-payload-tall.json"
  watch="#preview-frame-tall-none"></zn-preview-frame>

<script>
  document.getElementById('preview-frame-tall').frameOrigin = location.origin;
</script>
```

:::tip
A **same-origin** embed doesn't need to report anything — its document is
measured directly. The measurement only ever grows the frame: the frame's own
height feeds back into it, so a value at or under the current height is ignored
rather than flipping the frame between two sizes forever. An embed that shrinks
has to report its height to be followed back down, and one whose root is sized
to the viewport (`html {height: 100%}`) can't be measured at all — it reports or
it clips.
:::

## Live Form Updates

In a real deployment, editing a watched form auto-saves it and the preview refreshes with the newly saved config. This docs site is static, so the example simulates the save: form changes are encoded into a `data:` payload URI and `refresh()` re-runs the fetch → `hp-preview:config` cycle — the same path a real save triggers.

```html:preview
<form id="preview-frame-live-form" class="preview-frame-live-form">
  <zn-input name="merchant" label="Merchant" value="Acme Donuts"></zn-input>
  <zn-input name="amount" label="Amount" value="£24.99"></zn-input>
  <zn-input name="buttonLabel" label="Button label" value="Pay £24.99"></zn-input>
  <label class="preview-frame-live-form__color">Accent
    <input type="color" name="accent" value="#6936f5">
  </label>
</form>

<zn-preview-frame
  id="preview-frame-live"
  src="/components/preview-frame-demo/"
  watch="#preview-frame-live-none"></zn-preview-frame>

<script>
  customElements.whenDefined('zn-preview-frame').then(() => {
    const frame = document.getElementById('preview-frame-live');
    const form = document.getElementById('preview-frame-live-form');
    frame.frameOrigin = location.origin;

    const update = () => {
      const payload = Object.fromEntries(new FormData(form));
      frame.dataUri = 'data:application/json,' + encodeURIComponent(JSON.stringify(payload));
      frame.refresh();
    };

    form.addEventListener('zn-input', update);
    form.addEventListener('input', update);
    update();
  });
</script>

<style>
  .preview-frame-live-form {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-end;
    margin-bottom: 16px;
  }

  .preview-frame-live-form zn-input {
    flex: 1;
    min-width: 140px;
  }

  .preview-frame-live-form__color {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.875rem;
    font-weight: 500;
  }
</style>
```

## Error Overlay

When the embed reports `hp-preview:error` (or fetching the payload fails), the message is shown in an overlay and `zn-error` is emitted. This example uses a payload that asks the demo embed to fail.

```html:preview
<zn-preview-frame
  id="preview-frame-demo-error"
  src="/components/preview-frame-demo/"
  data-uri="/data/preview-frame-payload-error.json"
  watch="#preview-frame-demo-error-form"></zn-preview-frame>

<script>
  document.getElementById('preview-frame-demo-error').frameOrigin = location.origin;
</script>
```
