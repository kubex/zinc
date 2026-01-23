---
meta:
  title: Filter Wrapper
  description: A wrapper component for filter inputs that automatically submits filter parameters to a parent data-table component. Provides a default submit button or allows custom submit controls.
layout: component
---

```html:preview
<zn-filter-wrapper>
  <zn-input name="search" label="Search" placeholder="Enter search term"></zn-input>
</zn-filter-wrapper>
```

## Examples

### Basic Usage

Wrap filter inputs to automatically submit to a parent data-table.

```html:preview
<zn-filter-wrapper>
  <zn-input name="search" label="Search" placeholder="Search items..."></zn-input>
</zn-filter-wrapper>
```

### Multiple Filter Inputs

Combine multiple input fields for complex filtering.

```html:preview
<zn-filter-wrapper>
  <div class="form-spacing">
    <zn-input name="name" label="Name" placeholder="Filter by name"></zn-input>
    <zn-input name="email" label="Email" placeholder="Filter by email"></zn-input>
  </div>
</zn-filter-wrapper>
```

### With Select Dropdown

Use select components for dropdown filters.

```html:preview
<zn-filter-wrapper>
  <div class="form-spacing">
    <zn-select name="status" label="Status">
      <zn-option value="">All</zn-option>
      <zn-option value="active">Active</zn-option>
      <zn-option value="inactive">Inactive</zn-option>
      <zn-option value="pending">Pending</zn-option>
    </zn-select>
    <zn-select name="role" label="Role">
      <zn-option value="">All</zn-option>
      <zn-option value="admin">Admin</zn-option>
      <zn-option value="user">User</zn-option>
      <zn-option value="guest">Guest</zn-option>
    </zn-select>
  </div>
</zn-filter-wrapper>
```

### With Data Select

Use data-select components for predefined options.

```html:preview
<zn-filter-wrapper>
  <div class="form-spacing">
    <zn-data-select name="country" label="Country" provider="country"></zn-data-select>
    <zn-data-select name="currency" label="Currency" provider="currency"></zn-data-select>
  </div>
</zn-filter-wrapper>
```

### Custom Button Text

Change the default button text using the `button` attribute.

```html:preview
<zn-filter-wrapper button="Apply Filters">
  <zn-input name="search" label="Search" placeholder="Search..."></zn-input>
</zn-filter-wrapper>
```

### Custom Submit Button

Provide your own submit button by adding the `submit` attribute to a button.

```html:preview
<zn-filter-wrapper>
  <div class="form-spacing">
    <zn-input name="query" label="Query" placeholder="Enter query"></zn-input>
    <div style="display: flex; gap: 10px;">
      <zn-button submit color="success">Apply</zn-button>
      <zn-button color="secondary">Clear</zn-button>
    </div>
  </div>
</zn-filter-wrapper>
```

### Omit Empty Values

Use the `omit-empty` attribute on inputs to exclude them from the filter when empty.

```html:preview
<zn-filter-wrapper>
  <div class="form-spacing">
    <zn-input name="required_field" label="Required Field"></zn-input>
    <zn-input name="optional_field" label="Optional Field" omit-empty></zn-input>
  </div>
</zn-filter-wrapper>
```

### Date Range Filter

Create a date range filter with multiple inputs.

```html:preview
<zn-filter-wrapper>
  <div class="form-spacing">
    <zn-input name="start_date" label="Start Date" type="date"></zn-input>
    <zn-input name="end_date" label="End Date" type="date"></zn-input>
  </div>
</zn-filter-wrapper>
```

### Number Range Filter

Filter by number ranges.

```html:preview
<zn-filter-wrapper>
  <div class="form-spacing">
    <zn-input name="min_price" label="Min Price" type="number" placeholder="0"></zn-input>
    <zn-input name="max_price" label="Max Price" type="number" placeholder="1000"></zn-input>
  </div>
</zn-filter-wrapper>
```

### Advanced Filter Form

A complete filter form with multiple field types.

```html:preview
<zn-filter-wrapper button="Search">
  <div class="form-spacing">
    <zn-input name="keyword" label="Keyword" placeholder="Search keyword"></zn-input>

    <zn-select name="category" label="Category">
      <zn-option value="">All Categories</zn-option>
      <zn-option value="electronics">Electronics</zn-option>
      <zn-option value="clothing">Clothing</zn-option>
      <zn-option value="books">Books</zn-option>
    </zn-select>

    <zn-cols layout="1,1">
      <zn-input name="min_price" label="Min Price" type="number"></zn-input>
      <zn-input name="max_price" label="Max Price" type="number"></zn-input>
    </zn-cols>

    <zn-select name="sort" label="Sort By">
      <zn-option value="name">Name</zn-option>
      <zn-option value="price">Price</zn-option>
      <zn-option value="date">Date</zn-option>
    </zn-select>
  </div>
</zn-filter-wrapper>
```

### With Query Builder

Integrate with query builder for advanced filtering.

```html:preview
<zn-filter-wrapper>
  <zn-query-builder
    name="filters"
    filters="[{&quot;id&quot;:&quot;name&quot;,&quot;name&quot;:&quot;Name&quot;,&quot;operators&quot;:[&quot;eq&quot;]},{&quot;id&quot;:&quot;status&quot;,&quot;name&quot;:&quot;Status&quot;,&quot;options&quot;:{&quot;active&quot;:&quot;Active&quot;,&quot;inactive&quot;:&quot;Inactive&quot;},&quot;operators&quot;:[&quot;eq&quot;]}]">
  </zn-query-builder>
</zn-filter-wrapper>
```
