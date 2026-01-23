---
meta:
  title: Data Table Search
  description: A search component for data tables with debounced input and support for additional form controls.
layout: component
---

## Examples

### Basic Search

Use the `zn-data-table-search` component to provide search functionality for data tables. The component includes a search input with a search icon prefix and is clearable by default.

```html:preview
<zn-data-table-search></zn-data-table-search>
```

:::tip
This component works with standard `<form>` elements and integrates seamlessly with data tables. The search input is debounced to prevent excessive event firing while the user types.
:::

### Custom Placeholder

Use the `placeholder` attribute to customize the input placeholder text.

```html:preview
<zn-data-table-search placeholder="Search products..."></zn-data-table-search>
```

### Help Text

Add descriptive help text to guide users with the `help-text` attribute.

```html:preview
<zn-data-table-search
  placeholder="Search users..."
  help-text="Search by name, email, or user ID">
</zn-data-table-search>
```

### Default Value

Set a default search value using the `value` attribute.

```html:preview
<zn-data-table-search value="example search" placeholder="Search..."></zn-data-table-search>
```

### Custom Field Name

Use the `name` attribute to set a custom field name for form submission. The default name is "search".

```html:preview
<zn-data-table-search name="query" placeholder="Search..."></zn-data-table-search>
```

### Debounce Delay

Control the debounce delay using the `debounce-delay` attribute. The default is 350 milliseconds.

```html:preview
<zn-data-table-search
  debounce-delay="1000"
  placeholder="Search..."
  help-text="1 second debounce delay">
</zn-data-table-search>
<br />
<zn-data-table-search
  debounce-delay="100"
  placeholder="Search..."
  help-text="100ms debounce delay (very responsive)">
</zn-data-table-search>
```

### Search URI

Use the `search-uri` attribute to specify a URI for search operations. This will be included in the `zn-search-change` event detail.

```html:preview
<zn-data-table-search
  search-uri="/api/products/search"
  placeholder="Search products...">
</zn-data-table-search>

<script type="module">
  const search = document.querySelector('zn-data-table-search');

  await customElements.whenDefined('zn-data-table-search');

  search.addEventListener('zn-search-change', (event) => {
    console.log('Search URI:', event.detail.searchUri);
    console.log('Search value:', event.detail.value);
  });
</script>
```

### Listening to Search Events

The component emits a `zn-search-change` event when the search value changes (after the debounce delay). The event detail includes the search value, any additional form data from slotted inputs, and the search URI if provided.

```html:preview
<zn-data-table-search class="search-demo" placeholder="Type to search..."></zn-data-table-search>

<div class="search-results" style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-50); border-radius: var(--zn-border-radius-medium);">
  <strong>Search Results:</strong>
  <div class="results-content">No search performed yet</div>
</div>

<script type="module">
  const search = document.querySelector('.search-demo');
  const resultsDiv = document.querySelector('.results-content');

  await customElements.whenDefined('zn-data-table-search');

  search.addEventListener('zn-search-change', (event) => {
    const { value, formData, searchUri } = event.detail;
    if (value) {
      resultsDiv.textContent = `Searching for: "${value}"`;
    } else {
      resultsDiv.textContent = 'Search cleared';
    }
  });
</script>
```

### Additional Form Controls

The component supports slotting additional form controls that will be included in the search event data. This is useful for adding filters or other search parameters.

```html:preview
<zn-data-table-search placeholder="Search...">
  <zn-select name="category" value="all">
    <zn-option value="all">All Categories</zn-option>
    <zn-option value="electronics">Electronics</zn-option>
    <zn-option value="books">Books</zn-option>
    <zn-option value="clothing">Clothing</zn-option>
  </zn-select>

  <zn-select name="status" value="active">
    <zn-option value="all">All Status</zn-option>
    <zn-option value="active">Active</zn-option>
    <zn-option value="inactive">Inactive</zn-option>
  </zn-select>
</zn-data-table-search>

<div class="filter-results" style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-50); border-radius: var(--zn-border-radius-medium);">
  <strong>Search Parameters:</strong>
  <pre class="filter-content" style="margin-top: 0.5rem; font-size: 0.875rem;">No search performed yet</pre>
</div>

<script type="module">
  const filterSearch = document.querySelectorAll('zn-data-table-search')[document.querySelectorAll('zn-data-table-search').length - 1];
  const filterResults = document.querySelector('.filter-content');

  await customElements.whenDefined('zn-data-table-search');

  filterSearch.addEventListener('zn-search-change', (event) => {
    const { value, formData } = event.detail;
    filterResults.textContent = JSON.stringify({
      search: value,
      ...formData
    }, null, 2);
  });
</script>
```

:::tip
Slotted form controls are hidden from view but their values are collected and included in the `formData` property of the `zn-search-change` event. This allows you to manage additional search parameters without cluttering the UI.
:::

### Supported Slotted Input Types

The following input types are supported in the default slot and will have their values included in the form data:

- `zn-input`
- `zn-select`
- `zn-query-builder`
- `zn-multiselect`
- `zn-params-select`
- `zn-datepicker`
- Native HTML `input`, `select`, and `textarea` elements

```html:preview
<zn-data-table-search placeholder="Search users...">
  <zn-select name="role">
    <zn-option value="">All Roles</zn-option>
    <zn-option value="admin">Admin</zn-option>
    <zn-option value="user">User</zn-option>
  </zn-select>

  <zn-datepicker name="dateFrom"></zn-datepicker>
  <zn-datepicker name="dateTo"></zn-datepicker>

  <input type="hidden" name="includeArchived" value="false" />
</zn-data-table-search>

<div class="advanced-results" style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-50); border-radius: var(--zn-border-radius-medium);">
  <strong>All Search Parameters:</strong>
  <pre class="advanced-content" style="margin-top: 0.5rem; font-size: 0.875rem;">No search performed yet</pre>
</div>

<script type="module">
  const advancedSearch = document.querySelectorAll('zn-data-table-search')[document.querySelectorAll('zn-data-table-search').length - 1];
  const advancedResults = document.querySelector('.advanced-content');

  await customElements.whenDefined('zn-data-table-search');
  await customElements.whenDefined('zn-datepicker');

  advancedSearch.addEventListener('zn-search-change', (event) => {
    const { value, formData } = event.detail;
    advancedResults.textContent = JSON.stringify({
      search: value,
      ...formData
    }, null, 2);
  });
</script>
```

### Programmatic Control

You can programmatically control the search component by setting its `value` property or by calling the clear functionality through the internal input component.

```html:preview
<zn-data-table-search class="programmatic-search" placeholder="Search..."></zn-data-table-search>

<div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
  <zn-button class="set-value-btn" variant="primary" outline>Set Value</zn-button>
  <zn-button class="clear-value-btn" variant="default" outline>Clear Value</zn-button>
</div>

<script type="module">
  const progSearch = document.querySelector('.programmatic-search');
  const setBtn = document.querySelector('.set-value-btn');
  const clearBtn = document.querySelector('.clear-value-btn');

  await Promise.all([
    customElements.whenDefined('zn-data-table-search'),
    customElements.whenDefined('zn-button')
  ]);

  setBtn.addEventListener('click', () => {
    progSearch.value = 'programmatic value';
  });

  clearBtn.addEventListener('click', () => {
    progSearch.value = '';
  });
</script>
```

### Integration with Data Tables

The `zn-data-table-search` component is designed to work seamlessly with the `zn-data-table` component. Here's a complete example showing how to integrate search functionality with a data table:

```html:preview
<zn-data-table-search
  class="table-search"
  search-uri="/api/users"
  placeholder="Search users by name or email...">
</zn-data-table-search>

<div class="search-status" style="margin: 1rem 0; padding: 0.75rem; background: var(--zn-color-primary-50); border-radius: var(--zn-border-radius-medium); font-size: 0.875rem;">
  Ready to search
</div>

<script type="module">
  const tableSearch = document.querySelector('.table-search');
  const statusDiv = document.querySelector('.search-status');

  await customElements.whenDefined('zn-data-table-search');

  tableSearch.addEventListener('zn-search-change', async (event) => {
    const { value, searchUri } = event.detail;

    if (!value) {
      statusDiv.textContent = 'Search cleared - showing all results';
      statusDiv.style.background = 'var(--zn-color-neutral-50)';
      return;
    }

    statusDiv.textContent = `Searching for "${value}" at ${searchUri}...`;
    statusDiv.style.background = 'var(--zn-color-warning-50)';

    // Simulate API call
    setTimeout(() => {
      statusDiv.textContent = `Found results for "${value}"`;
      statusDiv.style.background = 'var(--zn-color-success-50)';
    }, 500);
  });
</script>
```

:::tip
**Usage Pattern:** Use `zn-data-table-search` as the primary search interface for data tables. The component handles debouncing automatically, so you can safely make API calls in response to the `zn-search-change` event without worrying about excessive requests.
:::

### Form Integration

The component implements the `ZincFormControl` interface and can be used within forms. The search value will be submitted with the form.

```html:preview
<form class="search-form">
  <zn-data-table-search
    name="userSearch"
    placeholder="Search users...">
  </zn-data-table-search>

  <zn-button type="submit" variant="primary" style="margin-top: 1rem;">
    Submit Form
  </zn-button>
</form>

<div class="form-output" style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-50); border-radius: var(--zn-border-radius-medium);">
  <strong>Form Data:</strong>
  <pre class="form-content" style="margin-top: 0.5rem; font-size: 0.875rem;">No form submission yet</pre>
</div>

<script type="module">
  const searchForm = document.querySelector('.search-form');
  const formOutput = document.querySelector('.form-content');

  await Promise.all([
    customElements.whenDefined('zn-data-table-search'),
    customElements.whenDefined('zn-button')
  ]);

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(searchForm);
    const data = Object.fromEntries(formData);
    formOutput.textContent = JSON.stringify(data, null, 2);
  });
</script>
```

### Getting Form Data

Use the `getFormData()` method to retrieve all form data from the search component and any slotted input elements.

```html:preview
<zn-data-table-search
  class="form-data-search"
  name="search"
  value="test search"
  placeholder="Search...">
  <zn-select name="filter" value="active">
    <zn-option value="all">All</zn-option>
    <zn-option value="active">Active</zn-option>
    <zn-option value="inactive">Inactive</zn-option>
  </zn-select>
  <input type="hidden" name="page" value="1" />
</zn-data-table-search>

<zn-button class="get-data-btn" variant="primary" outline style="margin-top: 1rem;">
  Get Form Data
</zn-button>

<div class="data-output" style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-50); border-radius: var(--zn-border-radius-medium);">
  <strong>Form Data Object:</strong>
  <pre class="data-content" style="margin-top: 0.5rem; font-size: 0.875rem;">Click the button to retrieve form data</pre>
</div>

<script type="module">
  const formDataSearch = document.querySelector('.form-data-search');
  const getDataBtn = document.querySelector('.get-data-btn');
  const dataOutput = document.querySelector('.data-content');

  await Promise.all([
    customElements.whenDefined('zn-data-table-search'),
    customElements.whenDefined('zn-button'),
    customElements.whenDefined('zn-select')
  ]);

  getDataBtn.addEventListener('click', () => {
    const formData = formDataSearch.getFormData();
    dataOutput.textContent = JSON.stringify(formData, null, 2);
  });
</script>
```

## Usage Guidelines

### When to Use

- **Data Table Filtering:** Use as the primary search interface for data tables and lists
- **Real-time Search:** When you need debounced search input to reduce API calls
- **Complex Filtering:** When you need to combine search with additional filter parameters
- **Form Integration:** When search needs to be part of a larger form submission

### Best Practices

1. **Placeholder Text:** Use clear, descriptive placeholder text that indicates what users can search for
2. **Help Text:** Provide help text when the search behavior isn't obvious or when there are special search features
3. **Debounce Delay:** The default 350ms delay works well for most cases. Increase it for expensive operations, decrease it for very fast searches
4. **Search URI:** Always provide a `search-uri` when the search data will be sent to a specific endpoint
5. **Event Handling:** Handle the `zn-search-change` event to trigger searches. The event includes both the search value and any additional form data
6. **Loading States:** Show loading indicators during search operations to provide feedback to users

### Accessibility

The component is built with accessibility in mind:

- Uses semantic HTML with proper input type (`search`)
- Includes a visible search icon prefix for visual recognition
- Supports keyboard navigation and clearing via the clearable input
- Integrates with form validation and submission
- Provides proper labeling through the help-text attribute

## Properties

| Property        | Attribute        | Type     | Default      | Description |
|----------------|------------------|----------|--------------|-------------|
| `name`         | `name`           | `string` | `'search'`   | The name of the search input field for form submission |
| `value`        | `value`          | `string` | `''`         | The current search value |
| `placeholder`  | `placeholder`    | `string` | `'Search...'`| The placeholder text for the search input |
| `helpText`     | `help-text`      | `string` | `''`         | Help text displayed below the search input |
| `searchUri`    | `search-uri`     | `string` | `undefined`  | Optional URI to use for search operations |
| `debounceDelay`| `debounce-delay` | `number` | `350`        | The delay in milliseconds before triggering a search after the user stops typing |

## Events

| Event              | Description | Event Detail |
|--------------------|-------------|--------------|
| `zn-search-change` | Emitted when the search value changes after the debounce delay. Also emitted immediately when the search is cleared. | `{ value: string, formData: Record<string, any>, searchUri?: string }` |

## Methods

| Method         | Description |
|----------------|-------------|
| `getFormData()` | Returns an object containing all form data from the search input and any slotted form controls |
| `checkValidity()` | Checks the validity of the form control (always returns `true` for this component) |
| `reportValidity()` | Reports the validity of the form control (always returns `true` for this component) |
| `setCustomValidity()` | Sets custom validity (no-op for this component, but required by the form control interface) |
| `getForm()` | Returns the parent form element if one exists |

## Slots

| Name      | Description |
|-----------|-------------|
| (default) | Additional form inputs to be included in the search form data. Slotted elements are hidden but their values are collected. |

## CSS Parts

| Part   | Description |
|--------|-------------|
| `base` | The component's base wrapper |

## Dependencies

- `zn-input` - Used for the search input field
- `zn-icon` - Used for the search icon prefix
