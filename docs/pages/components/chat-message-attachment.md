---
meta:
  title: Chat Message Attachment
  description: A file or link attachment for a chat message, rendered as an icon and label.
layout: component
---

`zn-chat-message-attachment` represents a single file or link beneath a message. It is intended to be
used only inside a [`zn-chat-message`](/components/chat-message) — it automatically assigns itself to
that component's `attachments` slot, so you can drop it straight into the message.

```html:preview
<zn-chat-message sender="Agent Name" time="1718193420">
  Here are the documents you requested.
  <zn-chat-message-attachment href="#" name="invoice.pdf"></zn-chat-message-attachment>
  <zn-chat-message-attachment href="#" name="statement.pdf"></zn-chat-message-attachment>
</zn-chat-message>
```

## Examples

### Custom Icon

Use the `icon` attribute to change the leading icon (any `zn-icon` name).

```html:preview
<zn-chat-message sender="Agent Name" time="1718193420">
  A couple of links for you.
  <zn-chat-message-attachment href="#" name="View dashboard" icon="link"></zn-chat-message-attachment>
  <zn-chat-message-attachment href="#" name="screenshot.png" icon="image"></zn-chat-message-attachment>
</zn-chat-message>
```

### Download

Set `download` to prompt a download rather than navigating to the link.

```html:preview
<zn-chat-message sender="Agent Name" time="1718193420">
  Your export is ready.
  <zn-chat-message-attachment href="#" name="export.csv" download></zn-chat-message-attachment>
</zn-chat-message>
```

### Custom Label

The default slot overrides the `name` attribute when you need richer label content.

```html:preview
<zn-chat-message sender="Agent Name" time="1718193420">
  See attached.
  <zn-chat-message-attachment href="#">contract_<strong>final</strong>.pdf</zn-chat-message-attachment>
</zn-chat-message>
```
