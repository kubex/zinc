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
<zn-page-builder heading="KB Homepage" subheading="Last updated 7th July 2026" style="height: 560px">
  <template type="hero" slot="config" label="Hero" icon="star" category="Headers"
            description="Large banner with optional search">
    <zn-input name="title" label="Title"></zn-input>
    <zn-input name="subtitle" label="Subtitle"></zn-input>
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

## JavaScript API

- `state` — get/set the current `PageState`. The getter returns a deep copy; the setter
  replaces the state wholesale (like the `config` attribute, it does not emit `zn-page-change`).
- `addSection(type, index?)` — insert a new section of a registered type (default: at the end).
- `addSectionToSlot(type, containerId, slotIndex)` — insert into a container's empty slot,
  honouring its `accepts` list. Returns the new section, or `null` if not allowed.
- `undo()` / `redo()` — step through edit history (bounded at 50 entries). There is no built-in
  toolbar: wire these to your own header buttons or keyboard shortcuts.
- `registerSectionType(type)` / `registerSectionTypes(types)` — programmatic registration,
  equivalent to slotting templates. Registration is additive — removing an entry from
  `sectionTypes` later does not unregister it.

## The config

Every edit emits `zn-page-change` with the full page state (`event.detail.state`, also
readable via the `state` property) — plain JSON the host persists and later feeds back in
through the `config` attribute. Sections appear in page order; container sections carry a
`children` array sized to their slot count, with `null` for empty slots:

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
      "children": [
        {"id": "s-mc42h-2", "type": "article-tile", "data": {"article": "art_42"}},
        {"id": "s-mc42p-3", "type": "article-tile", "data": {"article": "art_7"}},
        null, null, null, null
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

## Container tiles

A section type with a `slots` attribute becomes a full-row container: its card renders a
3-column grid of that many child slots beneath it. Drag sections from the palette into empty
cells, drag children **between cells to reorder**, or out onto the page. `accepts` restricts
which types the slots take. Containers can't be placed inside other containers, and slot
contents persist as `children` on the section (empty slots are `null`).

```html:preview
<zn-page-builder heading="KB Homepage" style="height: 560px"
  config='{"sections":[{"id":"g1","type":"article-grid","data":{}}]}'>
  <template type="article-grid" slot="config" label="Article Grid" icon="grid_view"
            category="Layout" description="A 3x2 grid of article tiles"
            slots="6" accepts="article-tile">
    <zn-input name="title" label="Grid title"></zn-input>
  </template>
  <template type="article-tile" slot="config" label="Article" icon="article" category="Content"
            description="A single article tile">
    <zn-input name="article" label="Article id"></zn-input>
  </template>
</zn-page-builder>
```

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
