---
meta:
  title: Chat Message
  description: A single message in a chat-style conversation, with an avatar, sender, time, optional badge, and a message bubble.
layout: component
---

```html:preview
<zn-chat-message sender="Agent Name" time="1718193420">
  <zn-chip slot="badge" type="info">Internal Note</zn-chip>
  The customer disconnected before I could answer his questions.
  <zn-button slot="edit-dialog-trigger" icon="close" icon-button plain no-hover
             color="error" tooltip="Remove Note"></zn-button>
</zn-chat-message>
```

## Examples

### Basic Message

The avatar initials and colour are derived from `sender`. `time` is a unix timestamp, displayed as a localised HH:MM.

```html:preview
<zn-chat-message sender="Alan Jones" time="1718193420">
  Thanks for getting in touch — I'll take a look at your account now.
</zn-chat-message>
```

### Badge

Use the `badge` slot to annotate the message in the header, for example marking it as an internal note.

```html:preview
<zn-chat-message sender="Agent Name" time="1718193420">
  <zn-chip slot="badge" type="info">Internal Note</zn-chip>
  Customer has been refunded — keep an eye out for a follow-up email.
</zn-chat-message>
```

### Actions

Use the `edit-dialog-trigger` slot to add an action to the end of the bubble, such as a remove button.

```html:preview
<zn-chat-message sender="Agent Name" time="1718193420">
  <zn-chip slot="badge" type="info">Internal Note</zn-chip>
  Interaction abandoned — the customer disconnected before I could answer.
  <zn-button slot="edit-dialog-trigger" icon="close" icon-button plain no-hover
             color="error" tooltip="Remove Note"></zn-button>
</zn-chat-message>
```

### Custom Bubble Colour

The bubble background can be themed with the `--message-background` custom property.

```html:preview
<zn-chat-message sender="Agent Name" time="1718193420"
                 style="--message-background: rgba(var(--zn-color-info), 0.08)">
  This one uses an info-tinted bubble instead of the default cream.
</zn-chat-message>
```
