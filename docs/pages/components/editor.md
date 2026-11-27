---
meta:
  title: Editor
  description: A rich text editor for composing formatted content with support for text formatting, lists, images, attachments, emojis, dates, and more.
layout: component
---

The Editor is a rich text editing component. It provides a customizable toolbar with formatting options, supports file attachments and uploads, includes emoji and date pickers, and offers AI-assisted writing capabilities.

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

The editor supports two interaction types: `chat` and `ticket`. In chat mode (the default), pressing Enter submits the form if there is content and Shift+Enter adds a line. In ticket mode, Enter adds a line.

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

In ticket mode, Enter creates new lines. Forms must be submitted using a submit button.

```html:preview
<form class="ticket-form">
  <zn-editor
    name="ticket-content"
    interaction-type="ticket"
    style="height: 250px">
  </zn-editor>
  <br />
  <zn-button type="submit" color="success">Submit Ticket</zn-button>
  <pre class="ticket-output" style="white-space: pre-wrap;"></pre>
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
    form.querySelector('.ticket-output').textContent = `Submitted: ${formData.get('ticket-content') ?? ''}`;
    // A real form hears back from its server; this tells the form it has, so its submit button works again
    setTimeout(() => form.dispatchEvent(new Event('complete')), 300);
  });
</script>
```

### Layouts

`layout` sets where the tools sit. The feature attributes, `tools` slot and `/` menu work the same way in each.

#### Toolbar

The default: the tools in a row above the text, grouped by kind, with undo and redo at the end.

```html:preview
<zn-editor name="article"
           interaction-type="ticket"
           links
           images
           emojis
           value="<h2>Release notes</h2><p>This week we <strong>shipped</strong> faster exports.</p>"
           style="height: 260px">
</zn-editor>
```

#### Quiet

`layout="quiet"` keeps the space above the text clear for long replies. Selecting text shows a formatting bar over it,
and the inserts sit in a footer beside the `actions` slot. From the keyboard, Alt+F10 moves into the bar, the arrow
keys step through it, and Escape returns to the text with the selection kept.

```html:preview
<zn-editor name="reply"
           layout="quiet"
           interaction-type="ticket"
           links
           emojis
           dates
           value="<p>Hi Sam,</p><p>We have issued the refund for your order, and it should reach your card within three to five working days.</p>"
           style="height: 260px">
  <zn-button slot="actions" type="button">Send reply</zn-button>
</zn-editor>
```

#### Composer

`layout="composer"` draws a chat-style card that grows with the text. The inserts and the `actions` slot run along its
bottom edge, and the Formatting button shows a row of formatting tools above them. Attachments sit at the top of the
card. `--editor-min-height` and `--editor-max-height` set how far it grows before it scrolls.

```html:preview
<form class="composer-form">
  <div class="composer-messages" style="margin-bottom: 1rem;">
    <small>Messages appear here.</small>
  </div>
  <zn-editor name="message" layout="composer" emojis links placeholder="Write a message">
    <zn-button slot="actions" class="composer-send" type="submit" icon="arrow-up@lu" aria-label="Send"></zn-button>
  </zn-editor>
</form>

<style>
  .composer-send::part(base) {
    width: 36px;
    min-width: 36px;
    padding: 0;
    border-radius: 50%;
  }
</style>

<script type="module">
  const form = document.querySelector('.composer-form');
  const messages = form.querySelector('.composer-messages');

  await customElements.whenDefined('zn-editor');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = new FormData(form).get('message');
    if (message) {
      // zn-chat-message shows the editor's formatting: lists, headings, colours and links
      const sent = Object.assign(document.createElement('zn-chat-message'), {
        sender: 'You',
        time: String(Math.floor(Date.now() / 1000)),
        message,
      });
      sent.toggleAttribute('agent-initiated', true);
      messages.querySelector('small')?.remove();
      messages.append(sent);
    }
    form.querySelector('zn-editor').value = '';
    // A real form hears back from its server; this tells the form it has, so its send button works again
    setTimeout(() => form.dispatchEvent(new Event('complete')), 300);
  });
</script>
```

#### Field

`layout="field"` draws the editor as a form field, to sit among other inputs: a bordered, resizable box under a small
toolbar of bold, italic, link, lists and any date or emoji picker that is turned on. `prefix` puts a short label inside
the box ahead of the text, such as a language code. `compact` is the older name for this layout and still works.

Add `source` for a button that switches to editing the raw HTML, which is submitted exactly as written. Switching back
to the editor reduces the HTML to what the editor can show.

```html:preview
<zn-editor
  name="body"
  layout="field"
  interaction-type="ticket"
  source
  links
  placeholder="Write the email"
  help-text="Use Source to paste a designed HTML email."
  value="<p>Thanks for signing up.</p><p>Reply to this email if you need anything.</p>">
</zn-editor>
```

### Help Text

Add text under the editor with the `help-text` attribute, or the `help-text` slot for HTML.

```html:preview
<zn-editor
  name="content"
  help-text="Type / to see what you can insert."
  style="height: 250px">
</zn-editor>
```

{% raw %}

### Merge Fields

Add `merge-fields` to show `{{token}}` replacements as highlighted chips. Each chip is labelled from the
`zn-editor-quick-action` whose `content` is that token, so the same actions offer them from the `/` menu. The editor's
value keeps the raw tokens, and tokens inside attributes such as a link's `href` are left as text.

```html:preview
<zn-editor
  name="body"
  interaction-type="ticket"
  merge-fields
  value="<p>Hi {{recipient.firstName}}, welcome to {{brand.displayName}}.</p>"
  style="height: 250px">
  <zn-editor-quick-action slot="context-items" icon="braces@lu" label="First name"
                          content="{{recipient.firstName}}"></zn-editor-quick-action>
  <zn-editor-quick-action slot="context-items" icon="braces@lu" label="Brand name"
                          content="{{brand.displayName}}"></zn-editor-quick-action>
</zn-editor>
```

{% endraw %}

### Focusing on Load

An editor leaves focus where it is as it loads, so one arriving inside a page someone is working through doesn't take
their place. Add `autofocus` when the editor is what the person came to write in, and it puts the cursor at the end
of its content once loaded.

```html
<zn-editor name="reply" autofocus></zn-editor>
```

### Caching Unsent Content

Set a `store-key` to cache what the agent has typed, so an unsent reply survives page reloads and navigation. Content is saved as it is typed, restored when an editor with the same key next loads, and cleared when the form is submitted or the editor is emptied.

Use a key unique to the conversation — for example the ticket or chat ID. Add the `local-storage` attribute to persist across tabs and browser restarts (otherwise `sessionStorage` is used, scoped to the current tab). Cached content expires after a day by default; tune with `store-ttl` (seconds).

```html:preview
<zn-editor
  name="reply"
  interaction-type="ticket"
  store-key="ticket-12345"
  local-storage
  style="height: 250px">
</zn-editor>
<p><small>Type something, then reload the page — your draft is restored.</small></p>
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
  value="<p>Section 1</p><hr><p>Section 2</p>"
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

Add `attachments` to show an attach button in the toolbar. Each file appears under the text as it uploads, with its
progress; once stored it links to the file, and a failed upload offers Retry. Files over 30 MB are refused. The stored
paths are submitted as a JSON list in a hidden `attachments` input inside the form.

By default each file is uploaded through `attachment-url`: the editor posts the file's `filename`, `size` and
`mimeType` there, expects JSON with `uploadPath` and `uploadUrl` back, then sends the file to `uploadUrl` with `PUT`.
To upload some other way, set `uploader` to a function. It gets each file, reports progress as it goes, stops when its
signal aborts (the person removed the file), and resolves with the stored `path` and a `url` to open it. This example
uses one that only pretends to upload: any file with "fail" in its name fails, so every state can be tried.
`attachFile(file)` adds a file from code, as if it had been picked.

Add `condensed-attachments` for smaller tiles: one line per file, with upload progress as a ring around its icon and its
status, such as why an upload failed, in its tooltip.

From four files, the files pile up: the newest in front, with a badge counting the rest, which turns red when one of
them failed. The badge fans them all out over the text, where each can be retried or removed; more than fit scroll, with
a button above and below for the ones out of view. Set `stack-attachments` to stack from a different number, or to `0`
to never stack.

```html:preview
<form class="attachment-form">
  <zn-editor id="attachment-editor"
             name="message"
             interaction-type="ticket"
             attachments
             style="height: 320px">
  </zn-editor>
  <input type="hidden" name="attachments" />
  <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem;">
    <zn-button type="button" color="secondary" data-sample="report.pdf">Attach a PDF</zn-button>
    <zn-button type="button" color="secondary" data-sample="upload-will-fail.xlsx">Attach a file that fails</zn-button>
    <zn-button type="button" color="secondary" data-sample="walkthrough.mov">Attach a 31 MB video</zn-button>
    <zn-button type="button" color="secondary" class="attachment-many">Attach four files</zn-button>
    <zn-button type="submit" color="success">Submit</zn-button>
    <zn-checkbox class="attachment-condense">Condensed tiles</zn-checkbox>
  </div>
  <pre class="attachment-output" style="margin-top: 1rem; white-space: pre-wrap;"></pre>
</form>

<script type="module">
  const form = document.querySelector('.attachment-form');
  const editor = document.getElementById('attachment-editor');

  await customElements.whenDefined('zn-editor');

  // Pretends to upload over two seconds; a real one would send the file to your server
  editor.uploader = (file, {onProgress, signal}) => new Promise((resolve, reject) => {
    let sent = 0;
    const timer = setInterval(() => {
      sent += 0.1;
      onProgress(Math.min(sent, 1));
      if (sent < 1) return;
      clearInterval(timer);
      if (file.name.includes('fail')) reject(new Error('The demo upload failed'));
      else resolve({path: `uploads/${file.name}`, url: URL.createObjectURL(file)});
    }, 200);
    signal.addEventListener('abort', () => {
      clearInterval(timer);
      reject(new Error('Upload cancelled'));
    });
  });

  form.querySelector('.attachment-condense').addEventListener('zn-change', (e) => {
    editor.condensedAttachments = e.target.checked;
  });

  const sizes = {'report.pdf': 240 * 1024, 'upload-will-fail.xlsx': 80 * 1024, 'walkthrough.mov': 31 * 1024 * 1024};
  form.querySelector('.attachment-many').addEventListener('click', () => {
    ['brief.docx', 'logo.png', 'notes.txt', 'budget.xlsx'].forEach(name => editor.attachFile(new File([new Uint8Array(40 * 1024)], name)));
  });

  form.querySelectorAll('[data-sample]').forEach(button => button.addEventListener('click', () => {
    const name = button.dataset.sample;
    editor.attachFile(new File([new Uint8Array(sizes[name])], name));
  }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    form.querySelector('.attachment-output').textContent =
      `message: ${data.get('message') ?? ''}\nattachments: ${data.get('attachments') || '[]'}`;
    // A real form hears back from its server; this tells the form it has, so its submit button works again
    setTimeout(() => form.dispatchEvent(new Event('complete')), 300);
  });
</script>
```

### Custom Toolbar Tools

Add buttons to the toolbar with `zn-editor-tool` in the `tools` slot. `handler` names what the button does and `uri` is
the value it passes: any format the editor knows, such as `handler="color" uri="orange"`, or `divider` on an editor with
`dividers`. Add `context-menu` to offer the tool in the `/` menu too, under its `label`. Slotted tools sit in their own
group before undo and redo, or in the footer bar in the quiet and composer layouts.

```html:preview
<zn-editor name="content"
           interaction-type="ticket"
           value="<p>Select some text and use the highlighter, or type / and choose Highlight.</p>"
           style="height: 250px"
           dividers>
  <zn-editor-tool slot="tools"
                  icon="highlighter@lu"
                  label="Highlight"
                  handler="color"
                  uri="orange"
                  key="highlight"
                  context-menu></zn-editor-tool>
  <zn-editor-tool slot="tools"
                  icon="separator-horizontal@lu"
                  label="Section break"
                  handler="divider"
                  key="section-break"></zn-editor-tool>
</zn-editor>
```

With the default `handler="dialog"`, the tool opens `uri` in a dialog over the editor: an app page that can send
content back into the editor, such as a list of canned responses. The page needs a Kubex app to serve it.

```html
<zn-editor name="reply">
  <zn-editor-tool slot="tools" icon="messages-square@lu" label="Canned responses"
                  uri="/canned-responses" key="canned" context-menu></zn-editor-tool>
</zn-editor>
```

### Context Menu Quick Actions

Type `/` in the editor to open its menu of formats and inserts. Add entries of your own with `zn-editor-quick-action`
in the `context-items` slot: one with `content` inserts that text at the caret, one with `key` runs the toolbar tool
with the same `key`, and one with `uri` opens that page in a dialog, like a dialog tool. `order` places it among them.

```html:preview
<zn-editor name="content"
           interaction-type="ticket"
           placeholder="Type / to insert a greeting or sign-off"
           style="height: 250px">
  <zn-editor-quick-action slot="context-items"
                          icon="hand@lu"
                          label="Greeting"
                          content="Hi there, thanks for getting in touch."
                          order="1"></zn-editor-quick-action>
  <zn-editor-quick-action slot="context-items"
                          icon="pen-line@lu"
                          label="Sign-off"
                          content="Kind regards, The Support Team"
                          order="2"></zn-editor-quick-action>
</zn-editor>
```

### AI-Assisted Editing

Add `ai` and an `ai-path` to offer AI help with the text. Selecting more than 25 characters shows a Refine button,
which opens a panel of prompts. Choosing one posts JSON with the selected `text` (or the whole content when nothing is
selected) and the `prompt` to `ai-path`. A successful response is HTML shown in the panel, for the person to use or
refine further; an error response holding a JSON string replaces the selection with it. In the quiet layout, Refine
sits in the formatting bar that appears over the selection instead. This needs that endpoint, so there's no live
example here.

```html
<zn-editor name="reply" ai ai-path="/api/editor/ai"></zn-editor>
```

### Custom Actions Slot

Add custom action buttons below the editor using the `actions` slot.

```html:preview
<zn-editor id="actions-editor"
           name="content"
           interaction-type="ticket"
           style="height: 300px">
  <div slot="actions" style="display: flex; gap: 0.5rem;">
    <zn-button color="secondary" type="button" id="save-draft">Save Draft</zn-button>
    <zn-button color="primary" type="button" id="publish">Publish</zn-button>
  </div>
</zn-editor>
<p id="actions-output"><small>Nothing saved yet.</small></p>

<script type="module">
  const editor = document.getElementById('actions-editor');
  const output = document.getElementById('actions-output');

  await customElements.whenDefined('zn-button');

  document.getElementById('save-draft').addEventListener('click', () => {
    output.textContent = `Draft saved at ${new Date().toLocaleTimeString()}.`;
  });
  document.getElementById('publish').addEventListener('click', () => {
    output.textContent = editor.value ? `Published: ${editor.value}` : 'Write something before publishing.';
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

`zn-change` fires after every change to the content, and `zn-submit` when Enter sends a chat message from a form.
Type in this chat editor and press Enter.

```html:preview
<form id="event-form">
  <zn-editor
    id="event-demo"
    name="content"
    interaction-type="chat"
    style="height: 200px">
  </zn-editor>
</form>

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

  document.getElementById('event-form').addEventListener('submit', (e) => e.preventDefault());
</script>
```

### Form Validation

Set a message with `setCustomValidity()` to make the editor invalid, and the form's `checkValidity()` then fails. This
example asks for at least 10 characters and shows why under the editor.

```html:preview
<form class="editor-validation-form">
  <zn-editor
    id="validation-editor"
    name="description"
    interaction-type="ticket"
    style="height: 250px">
  </zn-editor>
  <br />
  <zn-button type="submit" color="success">Submit</zn-button>
  <p class="validation-result"></p>
</form>

<script type="module">
  const form = document.querySelector('.editor-validation-form');
  const editor = document.getElementById('validation-editor');
  const result = form.querySelector('.validation-result');

  await Promise.all([
    customElements.whenDefined('zn-editor'),
    customElements.whenDefined('zn-button')
  ]);

  const validate = () => {
    const text = (editor.value ?? '').replace(/<[^>]*>/g, '').trim();
    const message = !text ? 'Write a description.' : text.length < 10 ? 'Write at least 10 characters.' : '';
    editor.setCustomValidity(message);
    editor.helpText = message;
  };

  editor.addEventListener('zn-change', () => {
    if (editor.helpText) validate();
  });

  // On capture, so the form checks validity after this has set it
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    validate();
    result.textContent = form.checkValidity() ? 'Submitted.' : '';
    // A real form hears back from its server; this tells the form it has, so its submit button works again
    setTimeout(() => form.dispatchEvent(new Event('complete')), 300);
  }, {capture: true});
</script>
```

### Responsive Toolbar

When the toolbar layout's row runs out of room, its trailing groups move into a More tools menu, which applies them
just the same. The quiet and composer bars keep their inserts behind a + menu, so they stay narrow.

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

Put hidden `openTime` and `startTime` inputs in the editor's form and it fills them in Unix seconds: `openTime` when
the editor loads, and `startTime` at the first edit, so the server can tell how long a reply took to start and write.

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

  <pre class="time-output" style="white-space: pre-wrap;">Type something, then submit to see the timestamps.</pre>
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
    form.querySelector('.time-output').textContent = JSON.stringify(data, null, 2);
    // A real form hears back from its server; this tells the form it has, so its submit button works again
    setTimeout(() => form.dispatchEvent(new Event('complete')), 300);
  });
</script>
```

### Commands

`editor.commands` reads and changes the content by character index once the editor has rendered (`await editor.updateComplete`). Every character and embed counts as one, and each line ends with one for its line break, so `getText()` on two lines `Hi` and `there` is `"Hi\nthere\n"`.

| Command | Does |
| --- | --- |
| `getHTML()` / `setHTML(html)` | The content as saved; `setHTML` replaces it without emitting `zn-change`. |
| `getText(index?, length?)` / `getLength()` | The plain text, and its length. |
| `getSelection(focus?)` / `setSelection(index, length?)` | The selection as `{index, length}`, or null when the editor isn't focused. With `focus`, focuses the editor and returns where its selection last was. |
| `insertText(index, text, formats?)` | Inserts text, optionally formatted, e.g. `{bold: true}`. |
| `insertHTML(index, html)` | Inserts sanitised HTML, returning the index after it. |
| `insertEmbed(index, name, value)` | Inserts `hr`, `image` (`{src, alt}`), `video` (a URL) or `mergeField` (a token). |
| `deleteText(index, length)` | Removes a range. |
| `format(name, value)` / `formatText(index, length, name, value)` | Applies a format to the selection or a range; `false` removes it. Formats: `bold`, `italic`, `underline`, `strike`, `code`, `color`, `link`, `header` (`1`, `2`), `blockquote`, `code-block`, `list` (`bullet`, `ordered`, `checked`). |
| `getFormat(index?, length?)` | The formats the whole range shares, e.g. `{bold: true, header: 1}`. |
| `removeFormat(index, length)` | Clears every format in a range. |
| `undo()` / `redo()` | Steps through the editor's history. |

```html:preview
<zn-editor
  id="editor-commands"
  name="content"
  value="<p>This editor is driven through its commands.</p>"
  style="height: 250px">
</zn-editor>

<div style="margin-top: 1rem; display: flex; gap: 0.5rem; align-items: center;">
  <zn-button id="get-length">Get Text Length</zn-button>
  <zn-button id="insert-text">Insert Text</zn-button>
  <zn-button id="format-bold">Toggle Bold</zn-button>
  <span id="commands-output"></span>
</div>

<script type="module">
  const editor = document.getElementById('editor-commands');

  await Promise.all([
    customElements.whenDefined('zn-editor'),
    customElements.whenDefined('zn-button')
  ]);

  // The commands exist from the editor's first render
  await editor.updateComplete;
  const commands = editor.commands;

  document.getElementById('get-length').addEventListener('click', () => {
    document.getElementById('commands-output').textContent = `${commands.getLength()} characters, counting line breaks`;
  });

  // The button takes focus, so getSelection(true) returns where the editor's selection was
  document.getElementById('insert-text').addEventListener('click', () => {
    const {index} = commands.getSelection(true);
    commands.insertText(index, ' [Inserted via API] ');
  });

  document.getElementById('format-bold').addEventListener('click', () => {
    const {index, length} = commands.getSelection(true);
    commands.formatText(index, length, 'bold', !commands.getFormat(index, length).bold);
  });
</script>
```


