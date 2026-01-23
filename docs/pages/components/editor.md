---
meta:
  title: Editor
  description: A rich text editor component powered by Quill for composing formatted content with support for text formatting, lists, images, attachments, emojis, dates, and more.
layout: component
---

The Editor is a powerful rich text editing component built on top of Quill. It provides a customizable toolbar with formatting options, supports file attachments and uploads, includes emoji and date pickers, and offers AI-assisted writing capabilities.

```html:preview
<zn-editor
  name="content"
  value=""
  code-blocks
  dividers
  links
  images
  emojis
  style="height: 400px">
</zn-editor>
```

:::tip
This component works with standard `<form>` elements. Please refer to the section on [form controls](/getting-started/form-controls) to learn more about form submission and client-side validation.
:::

## Examples

### Basic Editor

A basic editor with default formatting options (headings, bold, italic, underline, colors, lists, etc.).

```html:preview
<zn-editor
  name="description"
  style="height: 300px">
</zn-editor>
```

### Editor with Initial Value

Set initial HTML content using the `value` attribute.

```html:preview
<zn-editor
  name="content"
  value="<h2>Welcome</h2><p>This editor has <strong>initial content</strong> with formatting.</p>"
  style="height: 300px">
</zn-editor>
```

### Interaction Types

The editor supports two interaction types: `chat` and `ticket`. In chat mode, pressing Enter submits the form if there is content. In ticket mode (default), Enter creates a new line.

#### Chat Mode

In chat mode, pressing Enter will submit the form automatically if the editor has content.

```html:preview
<form class="chat-form">
  <zn-editor
    name="message"
    interaction-type="chat"
    style="height: 200px">
  </zn-editor>
  <div style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px; font-size: 0.875rem;">
    <strong>Messages:</strong>
    <div id="chat-messages"></div>
  </div>
</form>

<script type="module">
  const form = document.querySelector('.chat-form');
  const messagesDiv = document.getElementById('chat-messages');

  await customElements.whenDefined('zn-editor');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const message = formData.get('message');
    if (message) {
      const time = new Date().toLocaleTimeString();
      messagesDiv.innerHTML += `<div style="margin-top: 0.5rem;">[${time}] ${message}</div>`;
    }
  });
</script>
```

#### Ticket Mode

In ticket mode (default), Enter creates new lines. Forms must be submitted using a submit button.

```html:preview
<form class="ticket-form">
  <zn-editor
    name="ticket-content"
    interaction-type="ticket"
    style="height: 250px">
  </zn-editor>
  <br />
  <zn-button type="submit" color="success">Submit Ticket</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.ticket-form');

  await Promise.all([
    customElements.whenDefined('zn-editor'),
    customElements.whenDefined('zn-button')
  ]);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    alert('Ticket submitted!\n\n' + formData.get('ticket-content'));
  });
</script>
```

### Enabling Features

The editor has many optional features that can be enabled with boolean attributes.

#### Code Blocks

Enable code block insertion with the `code-blocks` attribute.

```html:preview
<zn-editor
  name="content"
  code-blocks
  style="height: 300px">
</zn-editor>
```

#### Inline Code

Enable inline code formatting with the `code` attribute.

```html:preview
<zn-editor
  name="content"
  code
  value="<p>Use inline code for commands like <code>npm install</code></p>"
  style="height: 300px">
</zn-editor>
```

#### Dividers

Enable horizontal rule insertion with the `dividers` attribute.

```html:preview
<zn-editor
  name="content"
  dividers
  value="<p>Section 1</p><hr class='ql-hr'><p>Section 2</p>"
  style="height: 300px">
</zn-editor>
```

#### Links

Enable link insertion and editing with the `links` attribute.

```html:preview
<zn-editor
  name="content"
  links
  value="<p>Visit <a href='https://zinc.style'>our website</a> for more info.</p>"
  style="height: 300px">
</zn-editor>
```

#### Images

Enable image insertion with the `images` attribute.

```html:preview
<zn-editor
  name="content"
  images
  style="height: 300px">
</zn-editor>
```

#### Videos

Enable video embedding with the `videos` attribute.

```html:preview
<zn-editor
  name="content"
  videos
  style="height: 300px">
</zn-editor>
```

#### Emojis

Enable emoji picker with the `emojis` attribute. Users can type `:` to trigger autocomplete or use the emoji picker from the toolbar.

```html:preview
<zn-editor
  name="content"
  emojis
  value="<p>Express yourself! 😀 🎉 ❤️</p>"
  style="height: 300px">
</zn-editor>
```

#### Dates

Enable date picker with the `dates` attribute.

```html:preview
<zn-editor
  name="content"
  dates
  style="height: 300px">
</zn-editor>
```

#### All Features Combined

Enable all features together for a fully-featured editor.

```html:preview
<zn-editor
  name="content"
  code-blocks
  code
  dividers
  links
  images
  videos
  dates
  emojis
  style="height: 400px">
</zn-editor>
```

### File Attachments

Enable file attachments with the `attachments` attribute. You must also provide an `attachment-url` for uploading files.

```html:preview
<form class="attachment-form">
  <zn-editor
    name="message"
    attachments
    attachment-url="/api/upload"
    style="height: 300px">
  </zn-editor>
  <input type="hidden" name="attachments" />
  <br />
  <zn-button type="submit" color="success">Submit</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.attachment-form');

  await Promise.all([
    customElements.whenDefined('zn-editor'),
    customElements.whenDefined('zn-button')
  ]);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Form submitted! In a real application, attachments would be uploaded to the server.');
  });
</script>
```

:::warning
**Note:** The attachment feature requires a server endpoint that accepts POST requests with file data and returns JSON with `uploadPath`, `uploadUrl`, and `originalFilename` properties.
:::

### Custom Toolbar Tools

Add custom tools to the editor toolbar using the `zn-editor-tool` component in the `tools` slot.

```html:preview
<zn-editor
  name="content"
  style="height: 300px">
  <zn-editor-tool
    slot="tools"
    icon="lightbulb"
    label="Insert Tip"
    handler="dialog"
    uri="/custom/tip"
    key="tip">
  </zn-editor-tool>
</zn-editor>
```

### Context Menu Quick Actions

Add custom quick actions to the context menu using the `zn-editor-quick-action` component in the `context-items` slot.

```html:preview
<zn-editor
  name="content"
  value="<p>Select this text to see custom quick actions in the context menu</p>"
  style="height: 300px">
  <zn-editor-quick-action
    slot="context-items"
    icon="translate"
    label="Translate"
    uri="/api/translate"
    key="translate"
    order="1">
  </zn-editor-quick-action>
  <zn-editor-quick-action
    slot="context-items"
    icon="auto_fix_high"
    label="Improve"
    uri="/api/improve"
    key="improve"
    order="2">
  </zn-editor-quick-action>
</zn-editor>
```

### AI-Assisted Editing

Enable AI features with the `ai` attribute and provide an `ai-path` for the AI service endpoint.

```html:preview
<zn-editor
  name="content"
  ai
  ai-path="/api/ai"
  style="height: 350px">
</zn-editor>
```

:::warning
**Note:** The AI feature requires a server endpoint that accepts POST requests and returns AI-generated content. The AI module is experimental.
:::

### Custom Actions Slot

Add custom action buttons below the editor using the `actions` slot.

```html:preview
<zn-editor
  name="content"
  style="height: 300px">
  <div slot="actions" style="display: flex; gap: 0.5rem;">
    <zn-button color="success" type="button" id="save-draft">Save Draft</zn-button>
    <zn-button color="primary" type="submit">Publish</zn-button>
  </div>
</zn-editor>

<script type="module">
  await customElements.whenDefined('zn-button');

  document.getElementById('save-draft').addEventListener('click', () => {
    alert('Draft saved!');
  });
</script>
```

### Programmatic Content Insertion

You can programmatically insert or replace content in the editor using special data attributes on clickable elements.

#### Insert Mode

Insert text at the current cursor position using `editor-mode="insert"`.

```html:preview
<div style="margin-bottom: 1rem;">
  <zn-button
    editor-id="demo-editor"
    editor-mode="insert"
    editor-content-id="insert-content">
    Insert Template
  </zn-button>
  <input type="hidden" id="insert-content" value="[Inserted template text]">
</div>

<zn-editor
  id="demo-editor"
  name="content"
  value="<p>Click the button to insert text at cursor position.</p>"
  style="height: 250px">
</zn-editor>
```

#### Replace Mode

Replace selected text or entire content using `editor-mode="replace"`.

```html:preview
<div style="margin-bottom: 1rem;">
  <zn-button
    editor-id="replace-editor"
    editor-mode="replace"
    editor-content-id="replace-content">
    Replace with Template
  </zn-button>
  <input type="hidden" id="replace-content" value="This is replacement text">
</div>

<zn-editor
  id="replace-editor"
  name="content"
  value="<p>Select some text and click the button, or click with no selection to replace all.</p>"
  style="height: 250px">
</zn-editor>
```

### Events

Listen to editor events to respond to user interactions.

```html:preview
<zn-editor
  id="event-demo"
  name="content"
  interaction-type="chat"
  style="height: 200px">
</zn-editor>

<div id="event-log" style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px; font-family: monospace; font-size: 0.875rem; max-height: 200px; overflow-y: auto;">
  Events will appear here...
</div>

<script type="module">
  const editor = document.getElementById('event-demo');
  const eventLog = document.getElementById('event-log');

  await customElements.whenDefined('zn-editor');

  function logEvent(eventName, detail = '') {
    const time = new Date().toLocaleTimeString();
    const message = `[${time}] ${eventName}${detail ? ': ' + JSON.stringify(detail).substring(0, 50) : ''}`;
    eventLog.innerHTML = message + '<br>' + eventLog.innerHTML;
  }

  editor.addEventListener('zn-change', (e) => {
    logEvent('zn-change', 'content updated');
  });

  editor.addEventListener('zn-submit', (e) => {
    logEvent('zn-submit', {value: e.detail.value.substring(0, 30) + '...'});
  });

  editor.addEventListener('zn-element-added', (e) => {
    logEvent('zn-element-added', 'editor initialized');
  });
</script>
```

### Form Validation

The editor integrates with HTML5 form validation.

```html:preview
<form class="editor-validation-form">
  <zn-editor
    id="validation-editor"
    name="description"
    style="height: 250px">
  </zn-editor>
  <br />
  <zn-button type="submit" color="success">Submit</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.editor-validation-form');
  const editor = document.getElementById('validation-editor');

  await Promise.all([
    customElements.whenDefined('zn-editor'),
    customElements.whenDefined('zn-button')
  ]);

  // Custom validation: require at least 10 characters
  editor.addEventListener('zn-change', () => {
    const text = editor.value.replace(/<[^>]*>/g, '').trim();
    if (text.length < 10 && text.length > 0) {
      editor.setCustomValidity('Content must be at least 10 characters long');
    } else if (text.length === 0) {
      editor.setCustomValidity('Content is required');
    } else {
      editor.setCustomValidity('');
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.checkValidity()) {
      alert('Form submitted successfully!');
    } else {
      editor.reportValidity();
    }
  });
</script>
```

### Responsive Toolbar

The toolbar automatically adapts to available space, moving tools into an overflow menu on smaller screens.

```html:preview
<div style="resize: horizontal; overflow: auto; border: 2px dashed var(--zn-color-neutral-300); padding: 1rem; min-width: 300px; max-width: 100%;">
  <p style="font-size: 0.875rem; color: var(--zn-color-neutral-600); margin-bottom: 0.5rem;">Resize this container to see the toolbar adapt</p>
  <zn-editor
    name="content"
    code-blocks
    dividers
    links
    images
    emojis
    dates
    style="height: 300px">
  </zn-editor>
</div>
```

### Time Tracking Integration

The editor can integrate with hidden time tracking inputs in the form for tracking editing time.

```html:preview
<form class="time-tracking-form">
  <input type="hidden" name="startTime" id="startTime" />
  <input type="hidden" name="openTime" id="openTime" />

  <zn-editor
    name="content"
    style="height: 250px">
  </zn-editor>
  <br />
  <zn-button type="submit" color="success">Submit</zn-button>

  <div style="margin-top: 1rem; font-size: 0.875rem; color: var(--zn-color-neutral-600);">
    Time tracking is active. Check form data on submit.
  </div>
</form>

<script type="module">
  const form = document.querySelector('.time-tracking-form');

  await Promise.all([
    customElements.whenDefined('zn-editor'),
    customElements.whenDefined('zn-button')
  ]);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    alert('Form with time tracking:\n\n' + JSON.stringify(data, null, 2));
  });
</script>
```

### Advanced: Accessing Quill Instance

For advanced use cases, you can access the underlying Quill instance after the editor is initialized.

```html:preview
<zn-editor
  id="quill-access"
  name="content"
  value="<p>This editor demonstrates direct Quill API access.</p>"
  style="height: 250px">
</zn-editor>

<div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
  <zn-button id="get-length">Get Text Length</zn-button>
  <zn-button id="insert-text">Insert Text</zn-button>
  <zn-button id="format-bold">Toggle Bold</zn-button>
</div>

<script type="module">
  const editor = document.getElementById('quill-access');

  await Promise.all([
    customElements.whenDefined('zn-editor'),
    customElements.whenDefined('zn-button')
  ]);

  // Wait for editor to be fully initialized
  editor.addEventListener('zn-element-added', () => {
    const quill = editor.quillElement;

    document.getElementById('get-length').addEventListener('click', () => {
      const length = quill.getLength();
      alert(`Text length: ${length} characters`);
    });

    document.getElementById('insert-text').addEventListener('click', () => {
      const range = quill.getSelection();
      const index = range ? range.index : 0;
      quill.insertText(index, ' [Inserted via API] ');
    });

    document.getElementById('format-bold').addEventListener('click', () => {
      const range = quill.getSelection();
      if (range) {
        const format = quill.getFormat(range);
        quill.format('bold', !format.bold);
      }
    });
  });
</script>
```

:::warning
**Note:** Direct access to the Quill instance should be used with caution. Always prefer using the editor's public API when possible. The `quillElement` property is available but not officially documented and may change in future versions.
:::


