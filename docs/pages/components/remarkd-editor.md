---
meta:
  title: Remarkd Editor
  description: A Notion-style block editor for remarkd content — blocks render inline and are edited in place.
layout: component
---

`zn-remarkd-editor` is a Notion-style editor for
[remarkd](https://github.com/packaged/remarkd) content. The document is a list
of blocks rendered inline with remarkd — there is no separate preview. Click a
block to edit its raw remarkd source in place; it re-renders when you click
away (or press Escape / Ctrl+Enter). The `value` is always plain remarkd
source, submitted with the surrounding form.

```html:preview
<zn-remarkd-editor
  name="content"
  value="# Product Guide

This is a paragraph with **strong text**, __emphasis__, and a [link](https://example.com).

- [ ] Draft the guide
- [x] Review the output

NOTE: Click any block to edit its source."
></zn-remarkd-editor>
```

## Examples

### Adding and Moving Blocks

Hover a block to reveal its gutter actions: add a block below it, or grab the
handle to drag the block somewhere else in the document. Clicking the empty
area at the end of the document starts a new block. A block committed empty
is removed.

```html:preview
<zn-remarkd-editor
  name="content"
  value="Hover me to see the block actions."
></zn-remarkd-editor>
```

### Images

Adding an image shows a `zn-file` drop area inline, at the point in the
document where the image will go. Choosing a file uploads it straight away:
the file's metadata is POSTed to the `attachment-url` endpoint, which must
respond with `{uploadPath, uploadUrl}`; the file is then PUT to `uploadUrl`
and the returned `uploadPath` is embedded as the image URL. Dropping an image
file straight onto the editor uploads it directly. `attachment-url` is
required for image support.

```html
<zn-remarkd-editor name="content" attachment-url="/upload"></zn-remarkd-editor>
```

### Remarkd Blocks

Remarkd's block syntax — hints, containers, code fences — renders with the
official remarkd styles. Fenced content stays a single block, blank lines and
all.

````html:preview
<zn-remarkd-editor name="content" value="TIP: Hint blocks are remarkd-specific.

====
An example **container** block.
====

```
a code fence

with a blank line inside
```"
></zn-remarkd-editor>
````

### Form Integration

`zn-remarkd-editor` is a [form control](/getting-started/form-controls); its
remarkd source is submitted under `name`, and `required` is supported.

```html:preview
<form class="remarkd-editor-form">
  <zn-remarkd-editor name="content" required value="Edit me, then submit."></zn-remarkd-editor>
  <br />
  <zn-button type="submit" color="success">Submit</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.remarkd-editor-form');

  await customElements.whenDefined('zn-button');
  await customElements.whenDefined('zn-remarkd-editor');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    alert('Submitted!\n\n' + JSON.stringify(data, null, 2));
  });
</script>
```
