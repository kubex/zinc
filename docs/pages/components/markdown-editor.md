---
meta:
  title: Markdown Editor
  description: A markdown editor with live preview, split view, and fullscreen mode.
layout: component
---

`zn-markdown-editor` wraps the full markdown authoring workflow in a single
form control: a textarea for writing, a live preview rendered with
[`marked`](https://marked.js.org/) (bundled with the component), toggleable
editor / split / preview modes, a fullscreen toggle, and `localStorage`
persistence for the selected view.

```html:preview
<zn-markdown-editor
  label="Content"
  name="content"
  help-text="Supports GitHub-flavored markdown"
  value="# Hello

Write some **markdown** on the left — use the toolbar to switch to split or preview."
></zn-markdown-editor>
```

## Examples

### Initial Value via Attribute

Set the initial markdown with the `value` attribute.

```html:preview
<zn-markdown-editor
  label="Article"
  name="article"
  value="## Release notes

- New payments dashboard
- Faster settlement reporting"
></zn-markdown-editor>
```

### Initial Value via Light DOM

If no `value` attribute is set, `zn-markdown-editor` reads its initial markdown
from its own text-node children. This is handy when rendering server-side
content into the tag without escaping quotes:

```html:preview
<zn-markdown-editor name="content" label="Terms">
# Terms of Service

This copy was rendered from a server-side template and picked up automatically.
</zn-markdown-editor>
```

### Setting the Default View

Use the `view-mode` attribute to open directly in `editor` (default), `split`,
or `preview`.

```html:preview
<zn-markdown-editor
  name="content"
  label="Split by default"
  view-mode="split"
  value="## Split view

See both at once."
></zn-markdown-editor>

<br />

<zn-markdown-editor
  name="content"
  label="Preview by default"
  view-mode="preview"
  value="## Preview view

Toggle to the editor to edit."
></zn-markdown-editor>
```

### Persisting the Selected View

The chosen view mode is persisted in `localStorage` under the key set by
`storage-key` (default `zn-markdown-editor-view-mode`). Use distinct keys
when multiple editors should remember their own preference.

```html:preview
<zn-markdown-editor
  name="email_template"
  label="Email template"
  storage-key="email-template-view"
></zn-markdown-editor>
```

To opt out of persistence, set `storage-key` to an empty string:

```html

<zn-markdown-editor storage-key=""></zn-markdown-editor>
```

### Help Text

Add descriptive help text with the `help-text` attribute, or use the slot for
HTML content.

```html:preview
<zn-markdown-editor
  label="Release notes"
  name="notes"
  help-text="Use headings, lists, and code fences for emphasis."
></zn-markdown-editor>

<br />

<zn-markdown-editor label="Release notes" name="notes">
  <div slot="help-text">
    See the <a href="https://commonmark.org/help/">CommonMark cheatsheet</a>
    for a full syntax reference.
  </div>
</zn-markdown-editor>
```

### Rows

Use `rows` to change the initial height of the editor before it overflows.
Default is `20`.

```html:preview
<zn-markdown-editor label="Short editor" rows="6"></zn-markdown-editor>
```

### Required, Readonly, Disabled

`zn-markdown-editor` forwards standard form-control state onto its underlying
textarea.

```html:preview
<zn-markdown-editor label="Required" name="content" required></zn-markdown-editor>

<br />

<zn-markdown-editor
  label="Readonly"
  name="content"
  readonly
  value="## Read-only content

Visible but not editable."
></zn-markdown-editor>

<br />

<zn-markdown-editor
  label="Disabled"
  name="content"
  disabled
  value="Disabled editor."
></zn-markdown-editor>
```

### Form Integration

`zn-markdown-editor` is a [form control](/getting-started/form-controls), so
its value is submitted with the surrounding form.

```html:preview
<form class="markdown-editor-form">
  <zn-markdown-editor
    name="content"
    label="Document"
    required
    value="## Getting started

Write your content here."
  ></zn-markdown-editor>
  <br />
  <zn-button type="submit" color="success">Submit</zn-button>
  <zn-button type="reset" color="secondary">Reset</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.markdown-editor-form');

  await customElements.whenDefined('zn-button');
  await customElements.whenDefined('zn-markdown-editor');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    alert('Submitted!\n\n' + JSON.stringify(data, null, 2));
  });
</script>
```

### Reacting to Events

Listen for content and view-mode changes.

```html:preview
<zn-markdown-editor
  id="event-editor"
  name="content"
  label="Event demo"
  value="Type here..."
></zn-markdown-editor>

<div id="event-log" style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px; font-family: monospace; font-size: 0.875rem; max-height: 200px; overflow-y: auto;">
  Events will appear here...
</div>

<script type="module">
  const editor = document.getElementById('event-editor');
  const log = document.getElementById('event-log');

  await customElements.whenDefined('zn-markdown-editor');

  function push(name, detail = '') {
    const t = new Date().toLocaleTimeString();
    log.innerHTML = `[${t}] ${name}${detail ? ': ' + detail : ''}<br>` + log.innerHTML;
  }

  editor.addEventListener('zn-input', () => push('zn-input', `length=${editor.value.length}`));
  editor.addEventListener('zn-change', () => push('zn-change'));
  editor.addEventListener('zn-view-mode-change', (e) => push('zn-view-mode-change', e.detail.mode));
</script>
```

### Programmatic Control

`focus()`, `blur()`, `checkValidity()`, and `reportValidity()` are all
available on the element.

```html:preview
<zn-markdown-editor
  id="control-editor"
  name="content"
  label="Controlled editor"
  value="## Controlled"
></zn-markdown-editor>
<br />
<zn-button id="editor-focus">Focus</zn-button>
<zn-button id="editor-blur">Blur</zn-button>
<zn-button id="editor-split">Switch to split</zn-button>
<zn-button id="editor-preview">Switch to preview</zn-button>
<zn-button id="editor-clear" color="error">Clear</zn-button>

<script type="module">
  const editor = document.getElementById('control-editor');

  await customElements.whenDefined('zn-button');
  await customElements.whenDefined('zn-markdown-editor');

  document.getElementById('editor-focus').addEventListener('click', () => editor.focus());
  document.getElementById('editor-blur').addEventListener('click', () => editor.blur());
  document.getElementById('editor-split').addEventListener('click', () => { editor.viewMode = 'split'; });
  document.getElementById('editor-preview').addEventListener('click', () => { editor.viewMode = 'preview'; });
  document.getElementById('editor-clear').addEventListener('click', () => { editor.value = ''; });
</script>
```

### Fullscreen Mode

Click the fullscreen icon in the top-right to expand the editor to cover its
nearest positioned ancestor. Click again to collapse. This is driven by the
`expanded` state on the element, so you can also toggle it programmatically:

```html

<zn-markdown-editor id="fs-editor"></zn-markdown-editor>

<script>
  document.getElementById('fs-editor').expanded = true;
</script>
```

## Events

| Event                 | Detail                                       | Description                                 |
|-----------------------|----------------------------------------------|---------------------------------------------|
| `zn-input`            | –                                            | Fired on every keystroke in the editor.     |
| `zn-change`           | –                                            | Fired when the editor's value is committed. |
| `zn-view-mode-change` | `{ mode: 'editor' \| 'split' \| 'preview' }` | Fired when the user switches view modes.    |

## Slots

| Slot        | Description                                                         |
|-------------|---------------------------------------------------------------------|
| `label`     | Custom HTML label. Alternatively use the `label` attribute.         |
| `help-text` | Custom HTML help text. Alternatively use the `help-text` attribute. |

## CSS Parts

| Part      | Description                         |
|-----------|-------------------------------------|
| `base`    | The component's base wrapper.       |
| `toolbar` | The view-mode / fullscreen toolbar. |
| `editor`  | The textarea wrapper.               |
| `preview` | The rendered markdown preview pane. |
