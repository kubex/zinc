---
meta:
  title: Page Builder
  description: A config-driven page composer with a palette of predefined section types, a linear canvas of section cards, and an inspector for editing each section's content.
layout: component
fullWidth: true
---

The Page Builder composes pages from **predefined section types** the host application provides.
Editors pick sections from the palette, order them on the canvas, and edit each section's content
in the inspector — the output is a plain JSON config (`PageState`) the host persists and
renders however it likes.

Section types are declared as `<template type slot="config">` children. The template's attributes
(`type`, `label`, `icon`, `icon-library`, `color`, `category`, `description`) define the palette
entry; its content is stamped into the inspector when a section of that type is selected. Controls
are bound by their `name` attribute: values prefill from the section's data and write back on
`change` / `zn-change`.

```html:preview
<zn-page-builder id="kb-homepage-demo" heading="KB Homepage" subheading="Last updated 7th July 2026" auto-save style="height: 560px">
  <zn-button slot="header-left" icon="refresh-cw@lu" panel-bg
             onclick="this.closest('zn-page-builder').undo()">Undo</zn-button>
  <zn-button slot="header-right" icon="check@lu" color="primary"
             onclick="alert(JSON.stringify(this.closest('zn-page-builder').state, null, 2))">Save All Changes</zn-button>
  <template type="hero" slot="config" label="Hero" icon="star" category="Headers"
            description="Large banner with optional search">
    <zn-input name="title" label="Title"></zn-input>
    <zn-input name="subtitle" label="Subtitle"></zn-input>
    <zn-input name="gradient" label="Background gradient" placeholder="linear-gradient(135deg, #00aaff, #aa00ff)"
              help-text="CSS gradient painted behind the hero. Leave empty for the theme default."></zn-input>
    <zn-toggle name="showSearch" label="Show search"
               description="Draws the site search box in the banner."></zn-toggle>
  </template>
  <template type="article-list" slot="config" label="Article List" icon="list" category="Content"
            description="A list of KB articles">
    <zn-input name="limit" type="number" label="Max articles"></zn-input>
  </template>
</zn-page-builder>
```

Listen for `zn-page-change` to persist the config, or read/write the `state` property.
Types can also be registered programmatically via `sectionTypes` /
`registerSectionTypes()`, including a `renderConfig(section, update)` callback for
inspector bodies that need real logic.

## The inspector

Selecting a section opens the inspector, which heads the panel with the section type's
icon and colour, the section's name, its type (shown only where a renamed section makes
it useful), and a close button that clears the selection. Below that, a **Section name**
field renames the section (the card's label), followed by the type's stamped config form.
A type whose template has no content gets a hint in place of the form rather than an
empty panel.

Because the panel is narrow, the inspector sets its own form-label and help-text
typography rather than inheriting your app's full-width form styling, and its `gap` is
the single source of spacing between fields — a control's own outer margins are zeroed
so they can't stack with it. Stamped `<zn-toggle>`s are laid out as a row, with the
label and description left and the switch right; set `label-position` yourself on a
toggle to opt out.

Style the panel through `inspector`, `inspector-header` and `inspector-body` parts.

A container section additionally gets a **Layout** group at the top of the inspector: a column
count, a weight per column, a "Keep adding rows" toggle, and — when growing is off — a row count.
Every edit here is lossless: changing the column count re-chunks the same ordered list of
stacks into the new shape, changing the row count only pads or trims trailing empty rows
(clamping at the last row that still holds content), and changing a column's weight leaves
every cell's contents untouched. All of it is undoable like any other edit.

## JavaScript API

- `state` — get/set the current `PageState`. The getter returns a deep copy; the setter
  replaces the state wholesale (like the `config` attribute, it does not emit `zn-page-change`).
- `addSection(type, index?)` — insert a new section of a registered type (default: at the end).
- `addSectionToCell(type, containerId, cellIndex, insertIndex?)` — insert a new section of a
  registered type into a container's cell. `cellIndex` is the position in the container's flat,
  row-major `cells` list; `insertIndex` (default `0`, the top of the stack) is where in that
  cell's stack it lands. Returns the new section, or `null` if the drop isn't allowed — because
  the type isn't in the container's `accepts` list, or because it would exceed the two-level
  nesting cap.
- `undo()` / `redo()` — step through edit history (bounded at 50 entries). There is no built-in
  toolbar: wire these to your own header buttons or keyboard shortcuts.
- `registerSectionType(type)` / `registerSectionTypes(types)` — programmatic registration,
  equivalent to slotting templates. Registration is additive — removing an entry from
  `sectionTypes` later does not unregister it.
- `restoreAutoSave()` — load the auto-saved draft, if one exists within its 1-day TTL
  (returns `false` otherwise). See Saving below.

## Saving

Wire your own save action into the header slots (rendered only when filled, as in the
flow builder) and read `state` — or persist on every `zn-page-change`:

```html
<zn-page-builder id="kb-home" heading="KB Homepage" auto-save>
  <zn-button slot="header-right" color="primary" id="save-page">Save All Changes</zn-button>
  <!-- templates… -->
</zn-page-builder>
<script>
  const builder = document.querySelector('#kb-home');
  document.querySelector('#save-page').addEventListener('click', () => {
    fetch('/api/pages/home', {method: 'PUT', body: JSON.stringify(builder.state)});
  });
</script>
```

Add the `auto-save` attribute to also snapshot the page into localStorage, keyed by the
builder's `id` (falling back to its `heading`), with a **1-day TTL** — identical to the
flow builder's auto-save:

```html
<zn-page-builder id="kb-home" auto-save></zn-page-builder>      <!-- every 5 minutes -->
<zn-page-builder id="kb-home" auto-save="2"></zn-page-builder>  <!-- every 2 minutes -->
```

Without the attribute nothing is saved, and an empty page is never written. While auto-save
is on, a status pill in the canvas's bottom-left flashes "Auto-saved" as each snapshot lands
and otherwise shows how long ago the last one happened. When a page is loaded (`config` /
`state`) that differs from a fresh auto-saved draft, a banner offers to restore the draft —
or call `restoreAutoSave()` yourself.

## The config

Every edit emits `zn-page-change` with the full page state (`event.detail.state`, also
readable via the `state` property) — plain JSON the host persists and later feeds back in
through the `config` attribute. Sections appear in page order; a container section additionally
carries `layout` and `cells`, per the Containers section below:

```json
{
  "sections": [
    {
      "id": "s-mc41z-0",
      "type": "hero",
      "data": {"title": "Help Centre", "showSearch": true}
    },
    {
      "id": "s-mc42a-1",
      "type": "article-grid",
      "label": "Popular articles",
      "data": {"title": "Popular"},
      "layout": {"widths": [1, 1, 1], "grow": false},
      "cells": [
        [{"id": "s-mc42h-2", "type": "article-tile", "data": {"article": "art_42"}}],
        [{"id": "s-mc42p-3", "type": "article-tile", "data": {"article": "art_7"}}],
        []
      ]
    },
    {
      "id": "s-mc43b-4",
      "type": "article-list",
      "data": {"articles": ["art_1", "art_3"]}
    }
  ]
}
```

A host loading a config saved before this model — the old flat, null-padded `children` array —
still has it accepted and migrated on load; see "Legacy `slots`" further down for what that
older shape looked like and how it's converted.

## A required first section

Pages that must always open with a particular section — a hero banner, a masthead — set
`required-first` to that section type. The builder hoists an existing section of the type to
the top of the page, or inserts an empty one when there is none, and pins it there: it has no
remove action, ignores <kbd>Delete</kbd>, can't be dragged or moved into a container slot, and
nothing can be dropped above it. Its content stays fully editable in the inspector, and the
type stays in the palette, so further sections of it can still be added below.

Which section is pinned is derived from the state — `sections[0]` when its type matches — so
nothing about the lock is written into the persisted config.

```html:preview
<zn-page-builder heading="KB Homepage" required-first="hero" style="height: 420px"
  config='{"sections":[{"id":"t1","type":"rich-text","data":{"content":"Welcome"}}]}'>
  <template type="hero" slot="config" label="Hero" icon="star" category="Headers"
            description="Banner with a heading and optional search">
    <zn-input name="title" label="Title"></zn-input>
    <zn-toggle name="showSearch" label="Show search"></zn-toggle>
  </template>
  <template type="rich-text" slot="config" label="Rich Text" icon="notes" category="Content"
            description="A block of markdown content">
    <zn-input name="content" label="Content"></zn-input>
  </template>
</zn-page-builder>
```

The config above declares only a rich-text section, so the hero is inserted above it — loading a
page that lacks the required section normalises it rather than rejecting it. Two things follow
from that. The inserted section's `data` is empty, so a host that wants the pinned section
prefilled should put it into the `config` it hands over rather than rely on the insert. And the
guard is client-side, so a host that persists the config should enforce the same rule on save.

## Containers

A section type with the `container` attribute becomes a full-row container: its card renders a
grid of **cells** beneath it, and each cell holds an ordered **stack** of sections. The type
author only declares that it's a container and what it starts as; the editor reshapes it after
placing it, from the inspector's Layout group.

| Attribute | Meaning |
|---|---|
| `container` | Marks the type a container. Required. |
| `columns="4"` | Seeds a new instance with 4 equal columns. |
| `widths="1 2 1"` | Seeds the column weights directly (comma- or whitespace-separated). Wins over `columns`. |
| `grow` | Seeds the instance growable — it always offers a further empty row. |
| `accepts="a,b"` | Restricts which types the cells take. Omit to allow any type, within the nesting cap below. |

If `widths` is present but unparsable — non-numeric tokens are discarded rather than kept as
columns — the container falls back to `columns`, and if that's absent too, to three equal
columns (`[1, 1, 1]`).

Drag sections from the palette into a cell, stack several sections in one cell, or drag them
between cells or out onto the page. Containers may nest **two levels deep** — a container inside
a cell, itself holding another container — and a drop that would nest a third level is refused.
That cap holds even when a container's `accepts` list names another container type: `accepts`
can't be used to bypass it.

```html:preview
<zn-page-builder heading="KB Homepage" style="height: 560px"
  config='{"sections":[{"id":"g1","type":"row","data":{},"layout":{"widths":[1,2,1],"grow":false},"cells":[[],[],[]]}]}'>
  <template type="row" slot="config" label="Row" icon="view_column" category="Layout"
            description="A row of columns you can weight" container widths="1 2 1">
    <zn-input name="title" label="Row title"></zn-input>
  </template>
  <template type="grid" slot="config" label="Tile Grid" icon="grid_view" category="Layout"
            description="Keeps adding rows as you fill it" container columns="3" grow>
    <zn-input name="title" label="Grid title"></zn-input>
  </template>
  <template type="article" slot="config" label="Article" icon="article" category="Content"
            description="A single article tile">
    <zn-input name="article" label="Article id"></zn-input>
  </template>
</zn-page-builder>
```

### The container config

A container persists its `layout` and its `cells` — a flat, row-major list of stacks whose
length is always a whole multiple of `layout.widths.length`. Rows are implicit
(`cells.length / layout.widths.length`), so there's no row count to keep in sync:

```json
{
  "id": "s-mc42a-1",
  "type": "row",
  "layout": { "widths": [1, 2, 1], "grow": false },
  "cells": [
    [ { "id": "s-1", "type": "nav", "data": {} },
      { "id": "s-2", "type": "links", "data": {} } ],
    [ { "id": "s-3", "type": "hero", "data": {} } ],
    []
  ]
}
```

Render it by mapping each weight to a grid track and each cell to a stack. A **growable**
container never persists a trailing all-empty row — the builder adds that row itself at render
time, so don't expect it in the JSON. A **fixed** container's trailing empty row, by contrast, is
part of its layout and does persist.

### Legacy `slots`

`slots="6"` still declares a container, and pages persisted with the old flat, null-padded
`children` array still load: they're migrated to `layout` + `cells` on load and re-saved in the
new shape — `children` is never written back. A `slots`-declared container that has no explicit
`accepts` also keeps its older, stricter rule of refusing container types in its cells (rather
than allowing anything up to the nesting cap). Prefer `container` going forward.

## List sections

Sections that show a set of existing items (categories, articles, …) reference them by id:
bind a multi-select by `name` and the chosen ids persist as an array in the section's data
(e.g. `"data": {"articles": ["art_42", "art_7"]}`). Options can be inlined as below, or loaded
from a backend with `<zn-data-select multiple>`.

```html:preview
<zn-page-builder heading="KB Category Page" style="height: 420px">
  <template type="article-list" slot="config" label="Article List" icon="list"
            description="Shows a chosen set of KB articles">
    <zn-select multiple name="articles" label="Articles to show">
      <zn-option value="art_1">How to reset your password</zn-option>
      <zn-option value="art_2">Billing FAQ</zn-option>
      <zn-option value="art_3">Getting started guide</zn-option>
    </zn-select>
  </template>
</zn-page-builder>
```
