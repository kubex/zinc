---
meta:
  title: Copy Button
  description: Copy buttons provide a simple way to copy text to the clipboard with visual feedback.
layout: component
---

```html:preview
<zn-copy-button value="Hello, World!"></zn-copy-button>
```

## Examples

### Copying a Value

Use the `value` attribute to specify the text that should be copied to the clipboard.

```html:preview
<zn-copy-button value="This text will be copied"></zn-copy-button>
<zn-copy-button value="support@example.com"></zn-copy-button>
<zn-copy-button value="npm install @kubex/zinc"></zn-copy-button>
```

### Copying from Elements

Use the `from` attribute to copy content from another element by its ID. By default, it copies the element's `textContent`.

```html:preview
<div id="content-to-copy">This is some text that can be copied.</div>
<zn-copy-button from="content-to-copy"></zn-copy-button>

<br /><br />

<input id="email-input" type="email" value="user@example.com" />
<zn-copy-button from="email-input.value"></zn-copy-button>
```

### Copying Element Attributes

Append the attribute name in square brackets to copy a specific attribute value.

```html:preview
<a id="my-link" href="https://example.com">Example Link</a>
<zn-copy-button from="my-link[href]"></zn-copy-button>

<br /><br />

<img id="my-image" src="https://via.placeholder.com/150" alt="Placeholder" />
<zn-copy-button from="my-image[src]"></zn-copy-button>
```

### Copying Element Properties

Append a dot and the property name to copy a specific property value from an element.

```html:preview
<input id="username" type="text" value="john.doe" />
<zn-copy-button from="username.value"></zn-copy-button>

<br /><br />

<textarea id="bio">Software developer passionate about web components.</textarea>
<zn-copy-button from="bio.value"></zn-copy-button>
```

### Custom Copy Label

Use the `copy-label` attribute to customize the tooltip text shown before copying.

```html:preview
<zn-copy-button value="Copy me!" copy-label="Click to copy"></zn-copy-button>
<zn-copy-button value="API Key: abc123xyz" copy-label="Copy API Key"></zn-copy-button>
<zn-copy-button value="https://example.com" copy-label="Copy URL"></zn-copy-button>
```

### Custom Icon

Use the `src` attribute to change the copy icon.

```html:preview
<zn-copy-button value="Custom icon button" src="content_paste"></zn-copy-button>
<zn-copy-button value="Another icon" src="file_copy"></zn-copy-button>
```

### Icon Size

Use the `size` attribute to control the icon size.

```html:preview
<zn-copy-button value="Small icon" size="16"></zn-copy-button>
<zn-copy-button value="Default size" size="24"></zn-copy-button>
<zn-copy-button value="Large icon" size="32"></zn-copy-button>
<zn-copy-button value="Extra large" size="48"></zn-copy-button>
```

### Custom Icons with Slots

You can provide custom icons for the copy, success, and error states using slots.

```html:preview
<zn-copy-button value="Custom icons">
  <zn-icon slot="copy-icon" src="content_copy" size="24"></zn-icon>
  <zn-icon slot="success-icon" src="check_circle" size="24"></zn-icon>
  <zn-icon slot="error-icon" src="error" size="24"></zn-icon>
</zn-copy-button>
```

### Status Feedback

The copy button provides automatic visual feedback when the copy operation succeeds or fails. Click the button to see the status change.

```html:preview
<zn-copy-button value="Click to see success feedback"></zn-copy-button>

<br /><br />

<!-- This will show error feedback since the element doesn't exist -->
<zn-copy-button from="non-existent-element"></zn-copy-button>
```

### Listening to Events

The copy button emits `zn-copy` events when text is successfully copied and `zn-error` events when the copy operation fails.

```html:preview
<zn-copy-button
  id="event-demo"
  value="Copy me to see the event"
  copy-label="Copy text">
</zn-copy-button>

<div id="event-log"></div>

<script type="module">
  const copyButton = document.getElementById('event-demo');
  const eventLog = document.getElementById('event-log');

  copyButton.addEventListener('zn-copy', (event) => {
    eventLog.innerHTML = `<zn-alert caption="Copy Success" level="success" icon="check">
      Copied: "${event.detail.value}"
    </zn-alert>`;
  });

  copyButton.addEventListener('zn-error', () => {
    eventLog.innerHTML = `<zn-alert caption="Copy Error" level="error" icon="error">
      Failed to copy to clipboard
    </zn-alert>`;
  });
</script>
```

### Real-world Examples

Here are some practical use cases for copy buttons.

```html:preview
<!-- Code snippet with copy button -->
<div style="display: flex; align-items: start; gap: 8px;">
  <pre id="code-snippet" style="background: #f5f5f5; padding: 12px; border-radius: 4px; margin: 0; flex: 1;">npm install @kubex/zinc
import { ZnButton } from '@kubex/zinc';</pre>
  <zn-copy-button from="code-snippet" copy-label="Copy code"></zn-copy-button>
</div>

<br /><br />

<!-- API Key display with copy button -->
<div style="display: flex; align-items: center; gap: 8px;">
  <span style="font-family: monospace; background: #f5f5f5; padding: 8px; border-radius: 4px;">sk_live_abc123xyz789</span>
  <zn-copy-button value="sk_live_abc123xyz789" copy-label="Copy API Key"></zn-copy-button>
</div>

<br /><br />

<!-- URL with copy button -->
<div style="display: flex; align-items: center; gap: 8px;">
  <input
    id="share-url"
    type="text"
    value="https://example.com/share/abc123"
    readonly
    style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
  <zn-copy-button from="share-url.value" copy-label="Copy share link"></zn-copy-button>
</div>
```

