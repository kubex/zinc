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

The avatar initials and color are derived from `sender`. `time` is a unix timestamp, displayed as a localised HH:MM.

```html:preview
<zn-chat-message sender="John Smith" time="1718193420">
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

### Message Attribute

Instead of slotting content, pass an HTML string via the `message` attribute. It is sanitized
(scripts and event handlers stripped), newlines become line breaks and bare URLs become links.

```html:preview
<zn-chat-message sender="Agent Name" time="1718193420"
                 message="Here's the link to your invoice: https://example.com/invoice/123 — let me know if you have any questions."></zn-chat-message>
```

### Conversation Sides

`agent-initiated` and `customer-initiated` mark which side sent the message. Consecutive messages from
the same side within a minute are grouped (the avatar and header are hidden on the follow-ups).

```html:preview
<zn-chat-message sender="John Smith" time="1718193420" agent-initiated
                 message="Hi! How can I help you today?"></zn-chat-message>
<zn-chat-message sender="Customer" time="1718193440" customer-initiated
                 message="I was charged twice for my subscription."></zn-chat-message>
<zn-chat-message sender="Customer" time="1718193450" customer-initiated
                 message="Can you take a look?"></zn-chat-message>
```

### Internal Note

`action-type="internal"` tints the bubble and adds an INTERNAL badge to the header.

```html:preview
<zn-chat-message sender="Agent Name" time="1718193420" agent-initiated action-type="internal"
                 message="Customer has been refunded — keep an eye out for a follow-up email."></zn-chat-message>
```

### Sending State

`action-type="message-sending"` shows the bubble as a pending message with a "Sending..." indicator.

```html:preview
<zn-chat-message sender="Agent Name" agent-initiated action-type="message-sending"
                 message="This message hasn't been delivered yet."></zn-chat-message>
```

### System Events

System action types render as a centred card instead of a message bubble. A default label is shown
when no `message` is provided. Supported types: `connected.agent`, `customer.connected`,
`customer.disconnected`, `transfer`, `attachment.added`, `ended`, `customer.ended`.

```html:preview
<zn-chat-message action-type="customer.connected" time="1718193420"></zn-chat-message>
<zn-chat-message action-type="transfer" time="1718193460" message="Transferred to Billing"></zn-chat-message>
<zn-chat-message action-type="ended" time="1718193500"></zn-chat-message>
```
