---
meta:
  title: Data Table
  description: Data tables display large sets of tabular data with sorting, filtering, pagination, and row selection capabilities.
layout: component
fullWidth: true
---

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  empty-state-caption="No records found"
  empty-state-icon="data_alert"
  headers='[
    {"key":"id","label":"ID", "required":true, "default": true},
    {"key":"name","label":"Name", "required":true, "default": true, "sortable":true},
    {"key":"email","label":"Email", "sortable":true},
    {"key":"status","label":"Status", "sortable":true},
    {"key":"date","label":"Date Joined", "sortable":true}
  ]'>

</zn-data-table>
```

## Examples

### Basic Data Table

The simplest data table fetches data from a URI and displays it with defined column headers. The `headers` property defines the columns to display.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  headers='[
    {"key":"id","label":"ID"},
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"},
    {"key":"status","label":"Status"}
  ]'>
</zn-data-table>
```

### With Search

Add a search component to filter table data. The search component emits debounced search events that trigger data reloading.

:::tip
In this preview, search sends a `search` parameter with each request but the static data file always returns the same results. With a real server endpoint, results would be filtered based on the search term.
:::

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  headers='[
    {"key":"id","label":"ID"},
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"},
    {"key":"status","label":"Status"}
  ]'>

  <zn-data-table-search
    slot="search"
    placeholder="Search by name or email..."
    debounce-delay="350">
  </zn-data-table-search>

</zn-data-table>
```

### With Sorting

Enable column sorting by marking headers as sortable. Click column headers to sort data ascending or descending.

:::tip
Server-side sorting sends `sortColumn` and `sortDirection` parameters with each request. In this preview, the static data file returns results in the same order regardless. Use `local-sort` (shown below) to see sorting in action without a server.
:::

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  sort-column="name"
  sort-direction="asc"
  headers='[
    {"key":"id","label":"ID"},
    {"key":"name","label":"Name", "sortable":true},
    {"key":"email","label":"Email", "sortable":true},
    {"key":"status","label":"Status", "sortable":true},
    {"key":"date","label":"Date", "sortable":true}
  ]'>
</zn-data-table>
```

### Local Sorting

Use `local-sort` to sort data client-side without making server requests. Best for small datasets.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  local-sort
  sort-column="name"
  sort-direction="asc"
  headers='[
    {"key":"id","label":"ID"},
    {"key":"name","label":"Name", "sortable":true},
    {"key":"email","label":"Email", "sortable":true},
    {"key":"status","label":"Status", "sortable":true}
  ]'>
</zn-data-table>
```

### Pagination

Data tables automatically display pagination controls when the total number of records exceeds the per-page limit. Users can navigate between pages and adjust rows per page.

:::tip
Pagination controls appear based on the `total` and `perPage` values in the response. In this preview, changing pages re-fetches the same static data. With a real server, each page request would return the corresponding slice of data.
:::

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  headers='[
    {"key":"id","label":"ID"},
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"},
    {"key":"status","label":"Status"}
  ]'>
</zn-data-table>
```

### Hide Pagination

Use `hide-pagination` to hide pagination controls even when multiple pages are available.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  hide-pagination
  headers='[
    {"key":"id","label":"ID"},
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"}
  ]'>
</zn-data-table>
```

### Row Selection

By default, rows can be selected by clicking. Selected rows are tracked and can be used with bulk actions.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  headers='[
    {"key":"id","label":"ID"},
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"},
    {"key":"status","label":"Status"}
  ]'>

  <zn-button slot="delete-action" color="error" icon="delete">
    Delete Selected
  </zn-button>

</zn-data-table>
```

### Hide Checkboxes

Use `hide-checkboxes` to disable row selection functionality.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  hide-checkboxes
  headers='[
    {"key":"id","label":"ID"},
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"}
  ]'>
</zn-data-table>
```

### Bulk Actions

Add action buttons to the table header for performing operations on selected rows. Use the `delete-action`, `modify-action`, and `create-action` slots.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  headers='[
    {"key":"id","label":"ID"},
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"},
    {"key":"status","label":"Status"}
  ]'>

  <zn-button slot="delete-action" color="error" icon="delete">
    Delete Selected
  </zn-button>

  <zn-button slot="modify-action" color="info" icon="edit">
    Edit Selected
  </zn-button>

  <zn-button slot="create-action" color="success" icon="add">
    Create New
  </zn-button>

</zn-data-table>
```

### Secondary Columns

Mark columns as secondary to hide them by default. Users can expand rows to view secondary data.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  headers='[
    {"key":"id","label":"ID"},
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"},
    {"key":"phone","label":"Phone", "secondary":true},
    {"key":"address","label":"Address", "secondary":true},
    {"key":"notes","label":"Notes", "secondary":true}
  ]'>
</zn-data-table>
```

### Hide Columns

Use `hide-columns` to completely hide specific columns from the table.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  hide-columns='["id", "internal_id"]'
  headers='[
    {"key":"id","label":"ID"},
    {"key":"internal_id","label":"Internal ID"},
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"}
  ]'>
</zn-data-table>
```

### Hide Headers

Use `hide-headers` to hide column header text while keeping the column content visible.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  hide-headers='["actions"]'
  headers='[
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"},
    {"key":"actions","label":"Actions"}
  ]'>
</zn-data-table>
```

### Unsortable Columns

Disable sorting on specific columns using `unsortable-headers`, or disable sorting entirely with `unsortable`.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  unsortable-headers='["actions", "status"]'
  headers='[
    {"key":"name","label":"Name", "sortable":true},
    {"key":"email","label":"Email", "sortable":true},
    {"key":"status","label":"Status"},
    {"key":"actions","label":"Actions"}
  ]'>
</zn-data-table>
```

Make the entire table unsortable:

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  unsortable
  headers='[
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"},
    {"key":"status","label":"Status"}
  ]'>
</zn-data-table>
```

### Wide Columns

Use `wide-column` to specify which column should expand to fill available space.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  wide-column="description"
  headers='[
    {"key":"id","label":"ID"},
    {"key":"name","label":"Name"},
    {"key":"description","label":"Description"},
    {"key":"status","label":"Status"}
  ]'>
</zn-data-table>
```

### Custom Empty State

Customize the empty state shown when no data is available using the `empty-state` slot or caption attributes.

```html:preview
<zn-data-table
  data-uri="/data/empty.json"
  method="GET"
  headers='[{"key":"id","label":"ID"},{"key":"name","label":"Name"}]'>

  <zn-empty-state
    slot="empty-state"
    icon="inbox"
    caption="No records found">
    <p>Try adjusting your search or filter criteria</p>
    <zn-button color="success" icon="add">Create First Record</zn-button>
  </zn-empty-state>

</zn-data-table>
```

Or use the built-in empty state with custom text:

```html:preview
<zn-data-table
  data-uri="/data/empty.json"
  method="GET"
  empty-state-caption="No customers found"
  empty-state-icon="person_off"
  caption="Customers"
  headers='[{"key":"id","label":"ID"},{"key":"name","label":"Name"}]'>
</zn-data-table>
```

### Filtering

Add advanced filtering with the `zn-data-table-filter` component. The filter opens a slideout with a query builder.

:::tip
In this preview, filter parameters are sent with the request but the static data file returns the same results regardless. With a real server endpoint, results would be filtered based on the applied criteria.
:::

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  headers='[
    {"key":"name","label":"Name", "filterable":true},
    {"key":"email","label":"Email", "filterable":true},
    {"key":"status","label":"Status", "filterable":true}
  ]'>

  <zn-data-table-search slot="search" placeholder="Search..."></zn-data-table-search>

  <zn-data-table-filter
    slot="filter"
    filters='[
      {"id":"name","name":"Name","operators":["eq","contains"]},
      {"id":"status","name":"Status","options":{"active":"Active","inactive":"Inactive"},"operators":["eq"]}
    ]'>
  </zn-data-table-filter>

</zn-data-table>
```

### Filter Top Slot

Add complex filtering options above the table using the `filter-top` slot. Perfect for search forms and advanced filters.

:::tip
This example uses `no-initial-load` so the table starts empty. Submitting the filter form triggers a data load, but the static data file returns the same results regardless of filter values. With a real server, results would be filtered accordingly.
:::

```html:preview
<zn-data-table
  data-uri="/data/products-table.json"
  method="GET"
  no-initial-load
  headers='[
    {"key":"name","label":"Name"},
    {"key":"category","label":"Category"},
    {"key":"price","label":"Price"},
    {"key":"stock","label":"Stock"}
  ]'>

  <zn-filter-wrapper slot="filter-top">
    <div class="form-spacing">
      <zn-input type="text" name="name" label="Product Name" span="4"></zn-input>
      <zn-input type="currency" name="price" label="Max Price" span="3"></zn-input>
      <zn-select name="category" span="3" label="Category" clearable>
        <zn-option value="beauty">Beauty</zn-option>
        <zn-option value="electronics">Electronics</zn-option>
      </zn-select>
      <zn-button color="success" submit>Search</zn-button>
    </div>
  </zn-filter-wrapper>

  <zn-empty-state slot="empty-state" icon="inventory_2" caption="No products found">
    <p>Use the filters above to search for products</p>
  </zn-empty-state>

</zn-data-table>
```

### Filter Top with Tabs

Combine the `filter-top` slot with tabs for multiple filtering interfaces.

:::tip
In this preview, filter and search parameters are sent with each request but the static data file returns the same results. With a real server endpoint, each tab's filters would produce different results.
:::

```html:preview
<zn-data-table
  data-uri="/data/products-table.json"
  method="GET"
  headers='[
    {"key":"name","label":"Name"},
    {"key":"category","label":"Category"},
    {"key":"price","label":"Price"},
    {"key":"stock","label":"Stock"}
  ]'>

  <zn-panel flush-x slot="filter-top">
    <zn-tabs>
      <zn-navbar slot="top">
        <li tab>Quick Search</li>
        <li tab="advanced">Advanced Search</li>
      </zn-navbar>

      <zn-sp gap="sm">
        <zn-filter-wrapper with-submit>
          <zn-form-group label="Quick Search" help-text="Search by common fields">
            <zn-input type="text" name="search" label="Keyword" span="6"></zn-input>
            <zn-input type="currency" name="price" label="Max Price" span="3"></zn-input>
            <zn-select name="category" span="3" label="Category" clearable>
              <zn-option value="beauty">Beauty</zn-option>
            </zn-select>
          </zn-form-group>
        </zn-filter-wrapper>
      </zn-sp>

      <zn-sp id="advanced" flush-y>
        <zn-filter-wrapper with-submit>
          <zn-query-builder
            filters='[
              {"id":"name","name":"Name","operators":["eq","contains"]},
              {"id":"category","name":"Category","options":{"beauty":"Beauty"},"operators":["eq"]}
            ]'
            name="query">
          </zn-query-builder>
        </zn-filter-wrapper>
      </zn-sp>
    </zn-tabs>
  </zn-panel>

</zn-data-table>
```

### Additional Input Parameters

Use the `inputs` slot to include additional form inputs that get sent with every data request.

:::tip
In this preview, the input values are sent as parameters with each request but the static data file returns the same results. With a real server, these additional parameters would filter or modify the response data.
:::

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  headers='[
    {"key":"name","label":"Name"},
    {"key":"status","label":"Status"}
  ]'>

  <zn-select slot="inputs" name="filter_type" value="active">
    <zn-option value="active">Active Only</zn-option>
    <zn-option value="all">All Records</zn-option>
  </zn-select>

  <input slot="inputs" name="user_id" value="123" type="hidden">

</zn-data-table>
```

### Grouping Data

Group rows by a specific column using the `group-by` property. This loads all data and splits it into separate tables.

```html:preview
<zn-data-table
  data-uri="/data/products-table.json"
  method="GET"
  group-by="category"
  headers='[
    {"key":"name","label":"Name"},
    {"key":"category","label":"Category"},
    {"key":"price","label":"Price"},
    {"key":"stock","label":"Stock"},
    {"key":"rating","label":"Rating"}
  ]'>

  <zn-empty-state slot="empty-state" icon="inventory_2" caption="No products found">
    <p>No products match your criteria</p>
  </zn-empty-state>

</zn-data-table>
```

### Specific Groups

When using grouping, control which groups to show with the `groups` property.

```html:preview
<zn-data-table
  data-uri="/data/products-table.json"
  method="GET"
  group-by="category"
  groups="Beauty, Electronics, *"
  headers='[
    {"key":"name","label":"Name"},
    {"key":"category","label":"Category"},
    {"key":"price","label":"Price"}
  ]'>
</zn-data-table>
```

Use `*` as a wildcard to include all other groups not explicitly listed.

### No Initial Load

Prevent automatic data loading on mount with `no-initial-load`. Call the `refresh()` method to manually trigger loading.

```html:preview
<zn-data-table
  id="manual-table"
  data-uri="/data/data-table.json"
  method="GET"
  no-initial-load
  headers='[
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"}
  ]'>

  <zn-filter-wrapper slot="filter-top">
    <zn-input name="search" label="Search" span="6"></zn-input>
    <zn-button color="success" submit>Load Data</zn-button>
  </zn-filter-wrapper>

</zn-data-table>

<script type="module">
  const table = document.querySelector('#manual-table');
  const form = table.querySelector('zn-filter-wrapper');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    table.refresh();
  });
</script>
```

### Standalone Mode

Use `standalone` to render the table without a container wrapper, useful for embedding in other components.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  standalone
  headers='[
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"}
  ]'>
</zn-data-table>
```

### Request Method

Choose between GET and POST requests using the `method` property. POST is default and sends parameters in the request body.

:::tip
This preview uses GET against a static file. In production, POST requests send pagination, sorting, and filter parameters in the request body rather than as query string parameters.
:::

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  headers='[
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"}
  ]'>
</zn-data-table>
```

### Cell Styling

Cells support various styling options through the data response format. Each cell can have colors, icons, links, chips, and hover content.

```json
{
  "rows": [
    {
      "id": "1",
      "cells": [
        {"text": "John Doe", "column": "name", "style": "bold"},
        {"text": "Active", "column": "status", "chipColor": "success"},
        {"text": "admin@example.com", "column": "email", "copyable": true},
        {"text": "View", "column": "action", "uri": "/users/1", "color": "info"}
      ]
    }
  ],
  "page": 1,
  "perPage": 10,
  "total": 100
}
```

Available cell properties:
- `text`: The display text
- `column`: Column key this cell belongs to
- `style`: Comma-separated styles (bold, italic, mono, code, border, center)
- `color`: Text color
- `chipColor`: Renders as a chip with specified color
- `uri`: Makes cell content a link
- `target`: Link target attribute
- `copyable`: Adds a copy button
- `iconSrc`: Icon to display with text
- `iconColor`: Icon color
- `hoverContent`: HTML content shown on hover
- `hoverPlacement`: Hover tooltip placement
- `sortValue`: Value to use for sorting (overrides text)
- `gaid`: Google Analytics ID for tracking

### Column-level cell defaults

Two header-level shortcuts customise the built-in cell renderer without requiring a render function:

- **`cellTemplate`** — a partial `Cell` whose properties are applied as defaults to every row's cell in that column. The row's own cell properties win on conflict, so this is the right place for column-wide defaults (a baseline `chipColor`, an `iconSrc`, a `style`, etc.) that individual rows can still override.
- **`ifEmpty`** — a partial `Cell` used as a fallback when the row's cell has neither `text` nor `iconSrc`. Useful for showing a placeholder (em-dash, "—", a muted "n/a", etc.) so empty rows don't render as blank cells.

Both apply only to the built-in renderer. If the column has a `render` or `renderTemplate` set (see [Custom cell rendering](#custom-cell-rendering) below), the render function wins and `cellTemplate` / `ifEmpty` are skipped — your function receives the row's raw cell data unchanged.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  headers='[
    {"key":"name","label":"Name"},
    {"key":"status","label":"Status","cellTemplate":{"chipColor":"info"}},
    {"key":"phone","label":"Phone","ifEmpty":{"text":"—","style":"italic"}}
  ]'>
</zn-data-table>
```

In this example the status column renders every value as an `info`-coloured chip by default; individual rows can still override `chipColor` in their own cell data. Phone cells with no text and no icon would fall back to an italic em-dash — the syntax holds regardless of whether the preview dataset happens to exercise that fallback.

### Custom cell rendering

By default each cell is built from its `Cell` properties — `text`, `style`, `chipColor`, `iconSrc`, `uri`, `copyable`, and so on (see [Cell Styling](#cell-styling) above). When those properties aren't enough — you need a conditional, a computed value, or markup the built-in vocabulary doesn't cover — register a **render function** on the column and take full control of its output.

A render function fully replaces the default rendering for that column. The built-in chip, icon, hover, copy, and uri decorations are not applied on top — your function owns the cell.

#### Function signature

```ts
type DisplayTemplate = (cell: Cell, row: Row, header: HeaderConfig) =>
  TemplateResult | string;
```

**Parameters**

| Name | Type | Description |
|------|------|-------------|
| `cell` | `Cell` | The cell object for this column. Contains `text` plus any cell-level properties set on it (`chipColor`, `iconSrc`, `uri`, `sortValue`, etc.). |
| `row` | `Row` | The full row the cell belongs to — including `id`, `uri`, `actions`, and all of its other cells. Use this when a column's presentation depends on values in other columns. |
| `header` | `HeaderConfig` | The header configuration for this column (`key`, `label`, and any other column-level settings). |

**Return value**

Either a Lit `TemplateResult` (returned from a `` html`...` `` tagged template) or a string of HTML. Strings are inserted via the `unsafeHTML` directive, so any markup is rendered as-is — sanitize values that come from untrusted sources yourself.

#### Where the function can live

There are three places a render function can be registered. They are resolved in this order, highest precedence first:

1. **`header.render`** — an inline function placed directly on a header. Only reachable when `headers` is assigned as a JS property, because functions cannot appear in a JSON attribute.
2. **`displayTemplates[name]`** — an instance property of the table, mapping template names to functions. Assigned from a regular `<script>`. The header references it by name via `renderTemplate`.
3. **`<script type="zn-templates">`** — a script block placed inside the table that returns a name-to-function map. Compiled once when the table connects. The header references each template by name via `renderTemplate`. The component identifies these scripts by their `type` attribute — no `slot` attribute is required or used.

The instance `displayTemplates` map overrides scripts-compiled templates per name; an inline `header.render` overrides both.

#### Defining templates in HTML

Place a `<script type="zn-templates">` block inside the table. The body must `return` an object mapping names to render functions. Reference each template from its header with `renderTemplate`.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  headers='[
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email","renderTemplate":"emailLink"},
    {"key":"date","label":"Joined","renderTemplate":"shortDate"}
  ]'>

  <script type="zn-templates">
    return {
      emailLink: (cell) => `<a href="mailto:${cell.text}"><code>${cell.text}</code></a>`,
      shortDate: (cell) => new Date(cell.text).toLocaleDateString(),
    };
  </script>
</zn-data-table>
```

:::warning
The script body is compiled with `new Function()`, so this form requires `'unsafe-eval'` in your `script-src` Content-Security-Policy when one is set. Compilation runs once when the table connects.
:::

#### `displayTemplates` property

Assign the same name-to-function map from a normal `<script type="module">`. This path is CSP-safe — no `unsafe-eval` required — and useful when the templates already live in your application's JavaScript.

```html:preview
<zn-data-table
  id="dt-display-templates"
  data-uri="/data/data-table.json"
  method="GET"
  headers='[
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email","renderTemplate":"emailLink"},
    {"key":"date","label":"Joined","renderTemplate":"shortDate"}
  ]'>
</zn-data-table>

<script type="module">
  document.querySelector('#dt-display-templates').displayTemplates = {
    emailLink: (cell) => `<a href="mailto:${cell.text}"><code>${cell.text}</code></a>`,
    shortDate: (cell) => new Date(cell.text).toLocaleDateString(),
  };
</script>
```

#### Inline `header.render`

Skip the named-template indirection and place the function directly on a header. Useful for one-off renderers that don't need to be reused. Only available when `headers` is assigned as a JS property — JSON attributes cannot carry functions.

```html:preview
<zn-data-table id="dt-inline-render" data-uri="/data/data-table.json" method="GET"></zn-data-table>

<script type="module">
  document.querySelector('#dt-inline-render').headers = [
    { key: 'name', label: 'Name' },
    {
      key: 'email',
      label: 'Email',
      render: (cell) => `<a href="mailto:${cell.text}"><code>${cell.text}</code></a>`,
    },
    {
      key: 'date',
      label: 'Joined',
      render: (cell) => new Date(cell.text).toLocaleDateString(),
    },
  ];
</script>
```

#### Using `row` and `header`

A render function can read values from sibling cells via `row.cells` — useful when a column's presentation depends on another column's data.

```html:preview
<zn-data-table
  id="dt-row-aware"
  data-uri="/data/data-table.json"
  method="GET"
  headers='[
    {"key":"name","label":"Name","renderTemplate":"nameWithStatus"},
    {"key":"email","label":"Email"}
  ]'>

  <script type="zn-templates">
    return {
      nameWithStatus: (cell, row) => {
        const status = row.cells.find(c => c.column === 'status')?.text ?? '';
        const dim = status === 'Inactive' ? 'opacity:.5;text-decoration:line-through;' : '';
        return `<span style="${dim}">${cell.text}</span>`;
      },
    };
  </script>
</zn-data-table>
```

#### Showcase


```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  headers='[
    {"key":"name",    "label":"Customer", "renderTemplate":"customer"},
    {"key":"status",  "label":"Status",   "renderTemplate":"pulse"},
    {"key":"address", "label":"Address",  "renderTemplate":"marquee"},
    {"key":"date",    "label":"Joined",   "renderTemplate":"yearsAgo"}
  ]'>

  <script type="zn-templates">
    const initials = (s) => s.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
    const yearsAgo = (d) => {
      const years = Math.floor((Date.now() - new Date(d)) / (365.25 * 24 * 3600 * 1000));
      return years <= 0 ? 'this year' : `${years} year${years > 1 ? 's' : ''} ago`;
    };

    return {
      customer: (cell, row) => {
      const description = row.cells.find(c => c.column === 'description')?.text ?? '';
      return `
        <div style="display:block;max-width: 280px;overflow: clip;"> 
          <span style="display:inline-flex;align-items:center;gap:8px;">
            <span style="display:inline-flex;align-items:center;justify-content:center;
                         width:28px;height:28px;border-radius:50%;
                         background:linear-gradient(135deg,#6366f1,#ec4899);
                         color:white;font-weight:700;font-size:11px;">
              ${initials(cell.text)}
            </span>
            <strong>${cell.text}</strong>           
          </span>
          <div><small>${description}</small></div>
        </div>
        `
        },

      pulse: (cell) => {
        const color = cell.text === 'Active' ? '#22c55e' : '#f59e0b';
        return `
          <span style="display:inline-flex;align-items:center;gap:6px;">
            <span style="width:8px;height:8px;border-radius:50%;background:${color};
                         animation:zn-pulse 1.6s infinite;"></span>
            ${cell.text}
          </span>
          <style>
            @keyframes zn-pulse {
              0%   { box-shadow: 0 0 0 0 ${color}80; }
              70%  { box-shadow: 0 0 0 6px ${color}00; }
              100% { box-shadow: 0 0 0 0 ${color}00; }
            }
          </style>`;
      },

      marquee: (cell) => `
        <marquee scrollamount="3"
                 style="max-width:200px;font-family:monospace;
                        background:#fff7ed;padding:2px 6px;border-radius:4px;">
          🏠 ${cell.text}
        </marquee>`,

      yearsAgo: (cell) => `<em style="opacity:.75">${yearsAgo(cell.text)}</em>`,
    };
  </script>
</zn-data-table>
```

### Row Actions

Rows can have contextual actions that appear in a dropdown menu.

```json
{
  "rows": [
    {
      "id": "1",
      "uri": "/users/1",
      "actions": [
        {
          "text": "Edit",
          "uri": "/users/1/edit",
          "icon": "edit",
          "gaid": "edit-user"
        },
        {
          "text": "Delete",
          "uri": "/users/1/delete",
          "icon": "delete",
          "confirmType": "error",
          "confirmTitle": "Delete User",
          "confirmContent": "Are you sure you want to delete this user?"
        }
      ],
      "cells": [...]
    }
  ]
}
```

### Caption

Add a caption to describe the table data.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  caption="Customer Records"
  headers='[
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"}
  ]'>
</zn-data-table>
```

### Programmatic Control

Access table methods programmatically to control behavior.

```html:preview
<zn-data-table
  id="controlled-table"
  data-uri="/data/data-table.json"
  method="GET"
  headers='[
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"},
    {"key":"status","label":"Status"}
  ]'>
</zn-data-table>

<br />

<zn-button id="refresh-btn" icon="refresh">Refresh Data</zn-button>
<zn-button id="select-all-btn" icon="check_box">Select All</zn-button>

<script type="module">
  const table = document.querySelector('#controlled-table');

  document.querySelector('#refresh-btn').addEventListener('click', () => {
    table.refresh();
  });

  document.querySelector('#select-all-btn').addEventListener('click', () => {
    table.selectAll(new Event('click'));
  });
</script>
```

## Data Format

The data table expects responses in the following format:

```json
{
  "rows": [
    {
      "id": "unique-row-id",
      "uri": "/path/to/resource",
      "target": "_blank",
      "actions": [],
      "cells": [
        {
          "text": "Display Value",
          "column": "column_key",
          "color": "success",
          "style": "bold,mono",
          "uri": "/link",
          "copyable": true
        }
      ]
    }
  ],
  "page": 1,
  "perPage": 10,
  "total": 100
}
```

## Request Format

For POST requests, the table sends:

```json
{
  "page": 1,
  "perPage": 10,
  "sortColumn": "name",
  "sortDirection": "asc",
  "filter": "",
  "search": "search term"
}
```

Additional parameters from the `inputs` slot are merged into the request.
