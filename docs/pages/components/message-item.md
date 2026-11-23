---
meta:
  title: Message Item
  description: A row in a message list, such as an inbox, with who it's from, when, a subject and a preview.
layout: component
---

```html:preview
<div style="max-width: 360px; border: 1px solid rgb(var(--zn-border-color));">
  <zn-message-item caption="Ada Lovelace" meta="12m" subject="Refund for order #1042" preview="Hi, I was charged twice for…" accent="primary" unread>
    <zn-icon slot="avatar" src="Ada Lovelace" library="avatar" size="sm" round></zn-icon>
  </zn-message-item>
  <zn-message-item caption="Grace Hopper" meta="3d" meta-alert subject="Can't log in" preview="You: Could you try resetting…" accent="error">
    <zn-icon slot="avatar" src="Grace Hopper" library="avatar" size="sm" round></zn-icon>
  </zn-message-item>
  <zn-message-item caption="Alan Turing" meta="1w" subject="Invoice copy" preview="Thanks, that's everything" accent="warning">
    <zn-icon slot="avatar" src="Alan Turing" library="avatar" size="sm" round></zn-icon>
  </zn-message-item>
</div>
```

## Examples

### States

`accent` draws a stripe at the start of the row in the primary, warning or error colour, for the message's state.
`unread` draws the caption and subject bold. `meta-alert` draws `meta` in the error colour, such as for a missed
deadline. Rows are tab triggers: give them `tab-uri` inside a `zn-tabs` and the open row is highlighted.

### Loading

Add `loading` for a placeholder in the row's shape, such as in a `zn-infinite-scroll` loader. Placeholders in a run
vary their widths.

```html:preview
<div style="max-width: 360px; border: 1px solid rgb(var(--zn-border-color));">
  <zn-message-item loading></zn-message-item>
  <zn-message-item loading></zn-message-item>
</div>
```
