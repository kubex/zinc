---
meta:
  title: Channel Tile
  description: A channel/queue slot tile with an active (occupied) face showing an in-progress item, and an available (empty) face advertising capacity with optional auto-accept.
layout: component
---

The channel tile represents a single slot in a queue or channel rail. It has two faces:

- **Active** — the slot is occupied by an in-progress item (header, leading icon, title/subtitle, and a progress/SLA bar).
- **Available** — the slot is empty and advertising capacity. When `incoming` is set it reserves an arriving item with a countdown that can auto-accept.

Tiles are designed to sit side by side in a horizontal rail; each is a fixed-width block with a right divider.

```html:preview
<div style="display: flex;">
  <zn-channel-tile
    header="Acme Support"
    icon="chat"
    color="info"
    title="Jane Cooper"
    subtitle="Billing question"
    progress="60"
    progress-color="rgb(var(--zn-color-info))">
  </zn-channel-tile>
  <zn-channel-tile available header="Acme Support" subtitle="Waiting for the next chat"></zn-channel-tile>
</div>
```

## Examples

### Active Tile

The default (occupied) face. Set `header` for the top bar, `icon` + `color` for the leading badge, and `title`/`subtitle` for the item. The `progress` value (0–100) fills the SLA bar along the bottom edge.

```html:preview
<div style="display: flex;">
  <zn-channel-tile
    header="Acme Support"
    icon="chat"
    color="info"
    title="Jane Cooper"
    subtitle="Billing question"
    progress="45"
    progress-color="rgb(var(--zn-color-info))">
  </zn-channel-tile>
</div>
```

### Available Tile

Set `available` to render the empty face. When `title` is omitted it defaults to "Available". The leading slot shows a built-in accept button.

```html:preview
<div style="display: flex;">
  <zn-channel-tile available subtitle="Ready for the next interaction"></zn-channel-tile>
</div>
```

### Accepting an Item

Provide `accept-uri` and the built-in accept button becomes a link to it. When a tile is accepted, a cancelable `zn-accept` event fires before the fetch — call `preventDefault()` on it to take over the accept yourself.

```html:preview
<div style="display: flex;">
  <zn-channel-tile
    available
    fid="chat-4821"
    accept-uri="/queue/accept/chat-4821"
    subtitle="Click to accept">
  </zn-channel-tile>
</div>
```

### Incoming with Auto-Accept

An `available` tile with `incoming` reserves an arriving item. Provide `reserved-until` (an epoch in seconds or milliseconds marking the end of the window) and `auto-accept-delay` (the window length in milliseconds) to drive the countdown overlay. When the window elapses the tile auto-accepts via `accept-uri`.

```html:preview
<div style="display: flex;">
  <zn-channel-tile
    available
    incoming
    rejectable
    fid="chat-5500"
    title="Incoming chat"
    subtitle="Auto-accepting…"
    accept-uri="/queue/accept/chat-5500"
    auto-accept-delay="15000">
  </zn-channel-tile>
</div>

<script>
  // Set the reservation window relative to now so the countdown animates.
  const tile = document.currentScript.previousElementSibling.querySelector('zn-channel-tile');
  tile.reservedUntil = Date.now() + 15000;
</script>
```

### Rejectable

Add `rejectable` to an incoming tile to offer a reject control. Pressing it emits `zn-reject` (and suppresses accept).

```html:preview
<div style="display: flex;">
  <zn-channel-tile
    available
    incoming
    rejectable
    fid="call-7700"
    title="Incoming call"
    subtitle="Reject to pass"
    reject-icon="call_end"
    reject-label="Reject call">
  </zn-channel-tile>
</div>
```

### Colors

The `color` attribute sets the accent (the leading icon badge and the `--channel-tile-color` custom property). Available colors are: `default`, `primary`, `info`, `success`, `warning`, `error`, and `disabled`.

```html:preview
<div style="display: flex; flex-wrap: wrap;">
  <zn-channel-tile icon="chat" color="primary" title="Primary" subtitle="Accent example"></zn-channel-tile>
  <zn-channel-tile icon="chat" color="info" title="Info" subtitle="Accent example"></zn-channel-tile>
  <zn-channel-tile icon="chat" color="success" title="Success" subtitle="Accent example"></zn-channel-tile>
  <zn-channel-tile icon="chat" color="warning" title="Warning" subtitle="Accent example"></zn-channel-tile>
  <zn-channel-tile icon="chat" color="error" title="Error" subtitle="Accent example"></zn-channel-tile>
  <zn-channel-tile icon="chat" color="disabled" title="Disabled" subtitle="Accent example"></zn-channel-tile>
</div>
```

### Custom Leading Content

Use the `leading` slot to replace the leading icon in the active state.

```html:preview
<div style="display: flex;">
  <zn-channel-tile header="Acme Support" title="Jane Cooper" subtitle="VIP customer">
    <zn-icon slot="leading" library="avatar" src="Jane Cooper" size="36" round></zn-icon>
  </zn-channel-tile>
</div>
```

### Custom Action

Use the `action` slot to replace the default accept button on an available tile — for example with a form.

```html:preview
<div style="display: flex;">
  <zn-channel-tile available subtitle="Pick a queue to join">
    <zn-button slot="action" icon="login" icon-size="20" icon-button="round" color="success"></zn-button>
  </zn-channel-tile>
</div>
```

### Footer

Use the `footer` slot for trailing content such as status badges in the active state.

```html:preview
<div style="display: flex;">
  <zn-channel-tile header="Acme Support" icon="chat" color="info" title="Jane Cooper" subtitle="Billing question">
    <zn-chip slot="footer" type="warning">SLA</zn-chip>
  </zn-channel-tile>
</div>
```
