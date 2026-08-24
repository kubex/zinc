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

Hover a block to reveal its actions: a drag handle with an add-block button
below it in the left gutter, and a delete button in its top-right corner.
Clicking the empty area at the end of the document starts a new block. A
block committed empty is removed.

```html:preview
<zn-remarkd-editor
  name="content"
  value="Hover me to see the block actions."
></zn-remarkd-editor>
```

### Slash Menu

Typing `/` in an empty block opens a [slash menu](/components/slash-menu) of
block types at the caret. Keep typing to narrow it, `↑`/`↓` to move, `Enter` or
`Tab` to insert, `Escape` to dismiss. The menu only appears in a block that is
nothing but the slash command — a prefix like `## ` is not valid remarkd
part-way through a line — so `/` in the middle of a sentence stays literal
text.

Choosing a block type replaces the command with its remarkd prefix and leaves
the caret ready to type: `Heading 2` gives you `## `, `Code` opens a fence with
the caret inside it, and `Image` opens the upload picker instead of inserting
text. The same block types are on the toolbar, which inserts them as new blocks
at the end of the document.

```html:preview
<zn-remarkd-editor
  name="content"
  value="Click the empty space below this block, then type / to see the menu."
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

Clicking an image block opens its controls: caption, alignment
(left / center / right), width, height, and alt text — plus edit-source and
delete actions. These write standard remarkd syntax back to the value: the
caption as a `.Caption` title line, alignment as an `[.align-center]` /
`[.align-right]` class, and size as `image::src[alt,width,height]`.

```html:preview
<zn-remarkd-editor
  name="content"
  value=".The Zinc logo
[.align-center]
image::/assets/images/watermark.svg[Zinc,220]"
></zn-remarkd-editor>
```

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

### Raw Source

Add `allow-raw` for a toolbar toggle that swaps the block view for the whole
document as editable remarkd source. Useful for pasting in a finished document
or fixing syntax the block view makes awkward. Toggling back re-splits the
source into blocks, normalising the spacing between them to a single blank
line. The toggle is only offered on editable editors — `readonly` and
`disabled` instances hide the toolbar entirely.

```html:preview
<zn-remarkd-editor
  name="content"
  allow-raw
  value="# Raw Source

Hit the toggle at the right of the toolbar to edit this whole document at once.

NOTE: The value is the same remarkd source either way."
></zn-remarkd-editor>
```

### Height

The editor never grows taller than the viewport: past that, its body scrolls and
the toolbar stays in reach. Override the cap with `--remarkd-editor-max-height` —
useful when the editor sits below a header and should only fill the space left on
screen.

All scrolling stays inside the editor's own body: adding a block or opening the
image / include picker brings the new content into view, and dragging a block to a
scroll edge keeps the content moving. Neither touches the page or panel around the
editor.

```html:preview
<zn-remarkd-editor
  style="--remarkd-editor-max-height: 20rem"
  value="A short editor.

Add blocks from the toolbar and the body starts scrolling once the content
outgrows the 20rem cap set here."
></zn-remarkd-editor>
```

### Actions

The toolbar and the `/` slash menu are driven by one shared registry of actions, grouped
under ten headings: **Text**, **Inline**, **Lists**, **Admonitions**, **Blocks**,
**Structured**, **Media**, **Objects**, **Breaks**, and **Logic**. The toolbar shows as
many groups as fit its width and folds the rest into an overflow menu; the slash menu
carries every action regardless of width, and typing narrows it by label or keyword — so
a folded toolbar group is never actually out of reach.

{% raw %}

```html:preview
<zn-remarkd-editor value='{{button:action text="Get started" href=/}}

{{video:dQw4w9WgXcQ source=youtube}}

{{reflist}}'></zn-remarkd-editor>
```

{% endraw %}

### Inline Formatting

Inline actions — Strong, Emphasis, Code, Underline, Strikethrough, Highlight, and the
rest of the Inline group — apply to the current selection inside the block being edited,
so they only make sense while a block is open: the toolbar disables them until one is
(the slash menu lists them regardless, since it can only ever open inside a block in the
first place). Choosing one from the toolbar wraps the selection in its mark, or — with
nothing selected — inserts a placeholder inside the mark with the placeholder selected so
typing replaces it; from the slash menu it always inserts the full construct with the
caret collapsed at the start of the placeholder, since there is no selection to wrap.
Choosing the same action again on a selection that already carries the mark unwraps it
rather than nesting a second one.

```html:preview
<zn-remarkd-editor value="Click into this block, select a word, then choose Strong or Emphasis from the toolbar."></zn-remarkd-editor>
```

### Variables and Conditionals

The Logic group's actions insert document attributes (`:name: value`) and remarkd's
conditional directives (`ifdef`, `ifndef`, `ifeval`) — but the editor only ever *marks*
them, it never evaluates them: an attribute line renders as a chip, a `{name}` reference
in surrounding text renders as a token, and an `ifdef`/`ifndef`/`ifeval` range renders as
a labelled wrapper whose content stays visible regardless of whether the flag is defined.
Evaluating conditionals belongs to the renderer the finished document is published
through, not to this editor — showing both branches of an if/else here means neither one
ever disappears while you're still editing it.

```html:preview
<zn-remarkd-editor value=":product: Remarkd

This documents {product}.

ifdef::beta[]
Only for the beta.
endif::[]"></zn-remarkd-editor>
```

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
