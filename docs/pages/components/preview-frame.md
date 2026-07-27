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

The previewed page is laid out desktop-first, so the frame renders the iframe at a virtual desktop width (`view-width`, default `1280`) and scales it down with a CSS transform to fit the panel whenever the panel is narrower than that. It's never scaled up — if the container is wider than `view-width`, the iframe just fills it at 100% as usual. The scale tracks the container's size, so resizing the surrounding panel rescales the preview without a reload.

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
