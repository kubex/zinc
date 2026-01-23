---
meta:
  title: Data Table Sort
  description: A sorting control component that displays a dropdown with field selection and sort direction (ascending/descending) options, with clear and update actions.
layout: component
---

```html:preview
<zn-data-table-sort></zn-data-table-sort>
```

## Examples

### Basic Usage

The data table sort component provides a dropdown interface for sorting data.

```html:preview
<zn-data-table-sort></zn-data-table-sort>
```

### In Table Header

Typically used in data table headers for sorting functionality.

```html:preview
<div style="display: flex; gap: 10px; align-items: center;">
  <span>Product List</span>
  <zn-data-table-sort></zn-data-table-sort>
</div>
```

### With Action Bar

Combine with other table controls in an action bar.

```html:preview
<zn-action-bar>
  <zn-button slot="menu" color="transparent">All Items</zn-button>
  <zn-button slot="menu" color="transparent">Active</zn-button>
  <zn-button slot="menu" color="transparent">Archived</zn-button>

  <zn-data-table-sort slot="actions"></zn-data-table-sort>
  <zn-button slot="actions" icon="filter_alt" color="transparent"></zn-button>
  <zn-button slot="actions" icon="refresh" color="transparent"></zn-button>
</zn-action-bar>
```

### Multiple Sort Controls

Use multiple sort controls for different sections or views.

```html:preview
<div class="form-spacing">
  <div>
    <h4>Customer List</h4>
    <zn-data-table-sort></zn-data-table-sort>
  </div>

  <div>
    <h4>Order History</h4>
    <zn-data-table-sort></zn-data-table-sort>
  </div>

  <div>
    <h4>Product Inventory</h4>
    <zn-data-table-sort></zn-data-table-sort>
  </div>
</div>
```

### Compact Layout

The component automatically uses a compact size suitable for table headers.

```html:preview
<div style="display: flex; align-items: center; padding: 10px; background: var(--zn-color-neutral-50); border-radius: 4px;">
  <span style="font-weight: bold; margin-right: auto;">Results (123)</span>
  <zn-data-table-sort></zn-data-table-sort>
</div>
```
