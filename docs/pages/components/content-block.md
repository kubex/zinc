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


