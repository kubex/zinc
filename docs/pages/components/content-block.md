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

### Editor Formatting

Text that holds escaped HTML, such as a note saved from `zn-editor`, is sanitized and rendered with the
editor's formatting. Only the text and background colour survive from a `style` attribute.

```html:preview

<zn-content-block
  time="16 Jun 2025, 13:00"
  sender="John Smith"
  avatar="JS"
>
  <div slot="text">
    &lt;p&gt;&lt;strong&gt;Bold&lt;/strong&gt;&lt;/p&gt;
    &lt;p&gt;&lt;em&gt;Italic&lt;/em&gt;&lt;/p&gt;
    &lt;p&gt;&lt;u&gt;Underline&lt;/u&gt;&lt;/p&gt;
    &lt;p&gt;&lt;s&gt;Strikethrough&lt;/s&gt;&lt;/p&gt;
    &lt;blockquote&gt;Blockquote&lt;/blockquote&gt;
    &lt;p&gt;&lt;code&gt;Inline code&lt;/code&gt;&lt;/p&gt;
    &lt;pre data-language=plain&gt;Code block&lt;/pre&gt;
    &lt;p&gt;&lt;span style=color:red&gt;Coloured text&lt;/span&gt;&lt;/p&gt;
    &lt;ul&gt;&lt;li&gt;Bullet&lt;/li&gt;&lt;li&gt;Bullet&lt;ul&gt;&lt;li&gt;Nested bullet&lt;/li&gt;&lt;/ul&gt;&lt;/li&gt;&lt;/ul&gt;
    &lt;ol&gt;&lt;li&gt;Numbered&lt;ol&gt;&lt;li&gt;Nested numbered&lt;/li&gt;&lt;li&gt;Nested numbered&lt;/li&gt;&lt;/ol&gt;&lt;/li&gt;&lt;/ol&gt;
    &lt;ul&gt;&lt;li data-list=checked&gt;Checked&lt;/li&gt;&lt;li data-list=unchecked&gt;Unchecked&lt;/li&gt;&lt;/ul&gt;
    &lt;hr class=ql-hr&gt;
    &lt;p&gt;Divider above&lt;/p&gt;
    &lt;p&gt;&lt;a href=https://example.com&gt;Link&lt;/a&gt;&lt;/p&gt;
  </div>
  <div slot="html">
    <p><strong>Bold</strong></p>
    <p><em>Italic</em></p>
    <p><u>Underline</u></p>
    <p><s>Strikethrough</s></p>
    <blockquote>Blockquote</blockquote>
    <p><code>Inline code</code></p>
    <pre data-language="plain">Code block</pre>
    <p><span style="color:red">Coloured text</span></p>
    <ul><li>Bullet</li><li>Bullet<ul><li>Nested bullet</li></ul></li></ul>
    <ol><li>Numbered<ol><li>Nested numbered</li><li>Nested numbered</li></ol></li></ol>
    <ul><li data-list="checked">Checked</li><li data-list="unchecked">Unchecked</li></ul>
    <hr class="ql-hr">
    <p>Divider above</p>
    <p><a href="https://example.com">Link</a></p>
  </div>
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


