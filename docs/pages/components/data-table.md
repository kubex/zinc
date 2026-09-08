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

Data tables automatically display pagination controls when the total number of records exceeds the per-page limit. Users can navigate between pages and adjust the rows per page.

Pagination renders as a single joined control: first, previous, a sliding window of three page numbers, next, last. The window keeps the control a fixed width whatever the dataset — the same at 30 pages as at 3000 — while the first and last buttons cover jumping to either end. On narrow widths the footer wraps so pagination sits above the rows selector.

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

`delete-action` and `modify-action` sit beside the caption alongside a select-all toggle, and only appear once rows are selected. `create-action` is a primary action rather than a selection one, so it renders at the end of the header's right-hand group, after the search field.

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

### Column Select

The header carries a column select dropdown whenever the table has rows and more than one column can be toggled. Mark a header `"required": true` to pin it on, or `"default": false` to start it hidden. Set `hide-column-select` to remove the dropdown.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  standalone
  caption="Customers"
  headers='[
    {"key":"name","label":"Name", "required":true},
    {"key":"email","label":"Email"},
    {"key":"status","label":"Status"},
    {"key":"phone","label":"Phone"},
    {"key":"address","label":"Address", "default":false}
  ]'>
</zn-data-table>
```

### Refresh

Tables with a `data-uri` get a refresh button in the header, which reruns the current request. Set `hide-refresh` to remove it.

Both the refresh and column select buttons are hidden while the table has no rows, so an empty state keeps just the caption and the slotted controls.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  standalone
  caption="Customers"
  hide-column-select
  headers='[
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"}
  ]'>
</zn-data-table>
```

### Hide Columns

Use `hide-columns` to completely hide specific columns from the table. Unlike the column select, these columns cannot be turned back on.

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

Add filtering with the `zn-data-table-filter` component. The header carries a filter toggle beside the refresh button; clicking it reveals a row between the header and the rows holding the `filter` slot, where the filter component shows one pill per active filter alongside add-filter and clear controls. The row stays hidden until the toggle is clicked, and the toggle carries a count of the filters currently applied. Use `default-filters` to show a pill for a filter before the user adds it.

The table also feeds the bar typeahead values for its text filters, taken from the rows it has loaded and keyed on the column whose name matches the filter's id.

:::tip
In this preview, filter parameters are sent with the request but the static data file returns the same results regardless. With a real server endpoint, results would be filtered based on the applied criteria.
:::

```html:preview
<zn-data-table
  standalone
  caption="Users"
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
    default-filters="status"
    filters='[
      {"id":"name","name":"Name","operators":["contains"]},
      {"id":"status","name":"Status","options":{"active":"Active","inactive":"Inactive"},"operators":["eq"]},
      {"id":"role","name":"Role","options":{"admin":"Admin","user":"User"},"operators":["in"]}
    ]'>
  </zn-data-table-filter>

</zn-data-table>
```

### Filter Top Slot

Add complex filtering options above the table using the `filter-top` slot. Perfect for search forms and advanced filters.

Content in this slot renders above the table's own panel rather than inside it, so wrap it in a `zn-panel` when it needs its own frame. It never contributes a header row to the table, and with `standalone` an empty state that has no caption or header controls is left unwrapped, so a `zn-panel` around the `empty-state` slot doesn't end up nested inside another.

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

Group rows by a specific column using the `group-by` property. This loads all data and splits it into groups.

Groups render as header rows inside a single table, so every group shares the same column widths, one set of column headers and one horizontal scrollbar.

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

Use `standalone` when the table supplies its own panel rather than sitting inside one. It renders a `zn-panel`, passing `caption` through as the panel's caption, the header controls into its `actions` slot and the pagination into its `footer` slot, with the rows flush against the panel edges. Columns scroll under the panel's edges, so the border stays put on a wide table.

The panel footer is only slotted when there is pagination to show, so an empty table or one with `hide-pagination` gets no footer bar.

Leave `standalone` off when the table is already inside a `zn-panel`.

```html:preview
<zn-data-table
  data-uri="/data/data-table.json"
  method="GET"
  standalone
  caption="All Customers"
  headers='[
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"},
    {"key":"status","label":"Status"},
    {"key":"date","label":"Date Joined"},
    {"key":"phone","label":"Phone"},
    {"key":"address","label":"Address"},
    {"key":"notes","label":"Notes"}
  ]'>

  <zn-data-table-search slot="search" placeholder="Search"></zn-data-table-search>

  <zn-button slot="create-action" icon="add">New Customer</zn-button>

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

### Response Errors

Include an `error` object in the response to display a message inside the table, between the column headers and the first record, using the alert component. The error can be returned alongside row data — useful when results are valid but limited, or when a filter is invalid. The object supports `text`, an optional `icon`, and an optional `level` to control the alert level (defaults to `error`).

```html:preview
<zn-data-table
  data-uri="/data/data-table-error.json"
  method="GET"
  headers='[
    {"key":"id","label":"ID"},
    {"key":"name","label":"Name"},
    {"key":"email","label":"Email"},
    {"key":"status","label":"Status"}
  ]'>
</zn-data-table>
```

```json
{
  "rows": [...],
  "page": 1,
  "perPage": 10,
  "total": 2,
  "error": {
    "text": "Results have been limited to 10 rows, please filter for more accuracy",
    "icon": "warning",
    "level": "warning"
  }
}
```

If the response contains an error and no rows, the error is shown above the empty state.

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

Add a caption to name the table. It renders as the title on the left of the header row, and supplies the wording for the default empty state.

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
  "total": 100,
  "error": {
    "text": "Optional message displayed below the column headers",
    "icon": "warning",
    "level": "warning"
  }
}
```

- `error`: Optional object displayed as an alert row below the column headers, alongside any returned rows
  - `text`: The message to display
  - `icon`: Optional icon shown in the alert
  - `level`: Optional alert level (`primary`, `error`, `info`, `success`, `warning`, `note`), defaults to `error`

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
