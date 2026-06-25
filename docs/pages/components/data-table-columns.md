---
meta:
  title: Data Table Columns
  description: A column visibility and ordering control for data tables. Renders an icon button that opens a drawer where columns can be shown, hidden, and reordered.
layout: component
---

```html:preview
<zn-data-table-columns></zn-data-table-columns>
```

## Overview

`zn-data-table-columns` is the column control used by [`zn-data-table`](/components/data-table). The table renders it automatically into its panel header, so you rarely place it yourself. It shows an icon button; clicking it opens a top-layer drawer (`zn-slideout`) listing every column with a checkbox and a drag handle. Toggling a checkbox shows or hides a column; dragging reorders them. The last visible column cannot be hidden.

## Properties

- `columns` — array of `{ key, label }` describing every available column, in canonical order.
- `value` — array of visible column keys, in display order. This is the source of truth for both visibility and order.
- `label` — the drawer title (default `"Columns"`).

## Events

- `zn-columns-change` — emitted on every change with `detail.columns`: the ordered array of visible column keys.

## Usage with a data table

When used by `zn-data-table`, the table supplies `columns` and `value`, listens for `zn-columns-change`, and persists the result. See the [Column Visibility & Order](/components/data-table) example on the data table page.
