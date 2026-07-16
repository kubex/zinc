---
meta:
  title: Content Block
  description:
layout: component
---

```html:preview

<zn-content-block
  time="16 Jun 2025, 13:00"
  sender="John Smith"
  avatar="JS"
>
  <div slot="text">Text formatted message goes here.</div>
  <div slot="html">HTML <b>formatted</b> message <span style="color: cornflowerblue;">goes</span> here.</div>
  <div slot="footer" style="padding: 10px;">
    <small>
      &copy; 2025 Example Corp. All trademarks are property of their respective owners.
    </small>
  </div>
</zn-content-block>
```

## Examples

### Basic Text

```html:preview

<zn-content-block
  time="16 Jun 2025, 13:00"
  sender="John Smith"
  avatar="JS"
>
  <div slot="text">Text formatted message goes here.</div>
</zn-content-block>

```

### Toggle Text & HTML

```html:preview

<zn-content-block
  time="16 Jun 2025, 13:00"
  sender="John Smith"
  avatar="JS"
>
  <div slot="text">Text formatted message goes here.</div>
  <div slot="html">HTML <b>formatted</b> message <span style="color: cornflowerblue;">goes</span> here.</div>
</zn-content-block>
```

### Subject

When a subject is available it is always shown in the header after the sender — expanded or
collapsed — in place of the truncated body preview. When `subject` is empty,
`subject-placeholder` is shown dimmed in its place. Omit both attributes to fall back to the
body preview (e.g. notes).

```html:preview

<zn-content-block
  time="16 Jun 2025, 13:00"
  sender="John Smith"
  avatar="JS"
  subject="Re: Help with my order"
>
  <div slot="text">Text formatted message goes here.</div>
</zn-content-block>

<zn-content-block
  time="16 Jun 2025, 13:05"
  sender="John Smith"
  avatar="JS"
  subject=""
  subject-placeholder="This message has no subject."
>
  <div slot="text">Text formatted message goes here.</div>
</zn-content-block>
```

### Attachments

Attachments render in a row at the bottom of the content and are only visible while the block
is expanded. Use `zn-chat-message-attachment`, which assigns itself to the `attachments` slot.
When a block has attachments, a paperclip icon and count are shown in the header after the
preview text.

```html:preview

<zn-content-block
  time="16 Jun 2025, 13:00"
  sender="John Smith"
  avatar="JS"
>
  <div slot="text">Text formatted message goes here.</div>
  <zn-chat-message-attachment href="/" name="filename1.txt" download></zn-chat-message-attachment>
  <zn-chat-message-attachment href="/" name="filename2.png" download></zn-chat-message-attachment>
</zn-content-block>
```

### Content Footer

Basic Footer

```html:preview

<zn-content-block
  time="16 Jun 2025, 13:00"
  sender="John Smith"
  avatar="JS"
>
  <div slot="text">Text formatted message goes here.</div>
  <div slot="footer" style="padding: 10px;">
    <small>
      &copy; 2025 Example Corp. All trademarks are property of their respective owners.
    </small>
  </div>
</zn-content-block>
```

Footer with Attachments

```html:preview

<zn-content-block
  time="16 Jun 2025, 13:00"
  sender="John Smith"
  avatar="JS"
>
  <div slot="text">Text formatted message goes here.</div>
  <div slot="footer">
    <zn-collapsible caption="Attachments 2" flush>
      <zn-sp divide no-gap flush style="max-height: 241px; overflow-y: auto;">
        <a href="/" target="_blank" download>
          <zn-tile caption="filename1.txt"
                   description="10mb"
                   inline>
            <zn-icon slot="image" src="attach_file" size="20"></zn-icon>
          </zn-tile>
        </a>
        <a href="/" target="_blank" download>
          <zn-tile caption="filename2.png"
                   description="100kb"
                   inline>
            <zn-icon slot="image" src="attach_file" size="20"></zn-icon>
          </zn-tile>
        </a>
      </zn-sp>
    </zn-collapsible>
  </div>
</zn-content-block>
```


