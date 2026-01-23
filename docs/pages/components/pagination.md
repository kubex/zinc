---
meta:
  title: Pagination
  description: Pagination components help users navigate through pages of content.
layout: component
---

```html:preview
<zn-pagination total="100" limit="10" page="1" uri="#page#"></zn-pagination>
```

Pagination controls allow users to navigate through large sets of data by dividing content into discrete pages. The component automatically generates page number buttons, previous/next navigation, and handles the display logic for showing a reasonable number of page buttons.

## Examples

### Basic Pagination

Use the `total`, `limit`, and `page` attributes to configure the pagination. The `uri` attribute defines the URL pattern for page links, where `#page#` will be replaced with the page number.

```html:preview
<zn-pagination total="250" limit="25" page="1" uri="/items?page=#page#"></zn-pagination>
```

### Current Page

The `page` attribute sets the currently active page. The active page is highlighted and non-clickable.

```html:preview
<zn-pagination total="200" limit="20" page="5" uri="#page#"></zn-pagination>
```

### Different Page Sizes

Use the `limit` attribute to control how many items are shown per page. This affects the total number of pages calculated.

```html:preview
<zn-pagination total="100" limit="10" page="1" uri="#page#"></zn-pagination>
<br />
<zn-pagination total="100" limit="20" page="1" uri="#page#"></zn-pagination>
<br />
<zn-pagination total="100" limit="50" page="1" uri="#page#"></zn-pagination>
```

### First Page

When on the first page, the "Previous" button is disabled.

```html:preview
<zn-pagination total="100" limit="10" page="1" uri="#page#"></zn-pagination>
```

### Last Page

When on the last page, the "Next" button is disabled.

```html:preview
<zn-pagination total="100" limit="10" page="10" uri="#page#"></zn-pagination>
```

### Middle Pages

When navigating through middle pages, the component shows up to 5 page buttons centered around the current page, with Previous and Next buttons enabled.

```html:preview
<zn-pagination total="200" limit="10" page="8" uri="#page#"></zn-pagination>
```

### Few Pages

When there are 5 or fewer total pages, all page numbers are displayed.

```html:preview
<zn-pagination total="50" limit="10" page="3" uri="#page#"></zn-pagination>
<br />
<zn-pagination total="30" limit="10" page="2" uri="#page#"></zn-pagination>
```

### Many Pages

For larger datasets with many pages, the component shows a window of up to 5 page buttons. The window adjusts based on the current page position.

```html:preview
<zn-pagination total="1000" limit="10" page="1" uri="#page#"></zn-pagination>
<br />
<zn-pagination total="1000" limit="10" page="50" uri="#page#"></zn-pagination>
<br />
<zn-pagination total="1000" limit="10" page="100" uri="#page#"></zn-pagination>
```

### Custom URI Patterns

The `uri` attribute supports any URL pattern. Use `#page#` as a placeholder for the page number.

```html:preview
<zn-pagination total="150" limit="15" page="3" uri="/products/category/electronics?page=#page#"></zn-pagination>
<br />
<zn-pagination total="150" limit="15" page="3" uri="/api/users/#page#"></zn-pagination>
<br />
<zn-pagination total="150" limit="15" page="3" uri="?q=search&page=#page#&sort=asc"></zn-pagination>
```

### Dynamic Pagination with JavaScript

You can dynamically update pagination properties to respond to data changes.

```html:preview
<div id="pagination-demo">
  <div style="margin-bottom: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
    <strong>Current Settings:</strong>
    <div id="settings-display" style="margin-top: 0.5rem; font-family: monospace; font-size: 13px;"></div>
  </div>

  <zn-pagination id="dynamic-pagination" total="100" limit="10" page="1" uri="#page#"></zn-pagination>

  <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
    <zn-button id="set-page-1" size="small">Go to Page 1</zn-button>
    <zn-button id="set-page-5" size="small">Go to Page 5</zn-button>
    <zn-button id="set-total-50" size="small" color="info">Set Total: 50</zn-button>
    <zn-button id="set-total-200" size="small" color="info">Set Total: 200</zn-button>
    <zn-button id="set-limit-5" size="small" color="success">Set Limit: 5</zn-button>
    <zn-button id="set-limit-20" size="small" color="success">Set Limit: 20</zn-button>
  </div>
</div>

<script type="module">
  const pagination = document.querySelector('#dynamic-pagination');
  const display = document.querySelector('#settings-display');

  function updateDisplay() {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    display.innerHTML = `
      Page: ${pagination.page} / ${totalPages}<br>
      Total Items: ${pagination.total}<br>
      Items per Page: ${pagination.limit}<br>
      URI Pattern: ${pagination.uri}
    `;
  }

  // Initial display
  updateDisplay();

  // Listen for attribute changes
  const observer = new MutationObserver(updateDisplay);
  observer.observe(pagination, { attributes: true });

  document.querySelector('#set-page-1').addEventListener('click', () => {
    pagination.page = 1;
  });

  document.querySelector('#set-page-5').addEventListener('click', () => {
    pagination.page = 5;
  });

  document.querySelector('#set-total-50').addEventListener('click', () => {
    pagination.total = 50;
    pagination.page = Math.min(pagination.page, Math.ceil(50 / pagination.limit));
  });

  document.querySelector('#set-total-200').addEventListener('click', () => {
    pagination.total = 200;
  });

  document.querySelector('#set-limit-5').addEventListener('click', () => {
    pagination.limit = 5;
    pagination.page = Math.min(pagination.page, Math.ceil(pagination.total / 5));
  });

  document.querySelector('#set-limit-20').addEventListener('click', () => {
    pagination.limit = 20;
    pagination.page = Math.min(pagination.page, Math.ceil(pagination.total / 20));
  });
</script>
```

### Pagination with Data Table

A common use case is pairing pagination with a data table or list of items.

```html:preview
<div id="table-pagination-demo">
  <div style="margin-bottom: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
    <div id="item-list" style="font-family: monospace; font-size: 13px; line-height: 1.6;"></div>
  </div>

  <zn-pagination id="table-pagination" total="50" limit="5" page="1" uri="#page#"></zn-pagination>
</div>

<script type="module">
  const pagination = document.querySelector('#table-pagination');
  const itemList = document.querySelector('#item-list');

  // Generate sample data
  const totalItems = 50;
  const items = Array.from({ length: totalItems }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`
  }));

  function renderItems() {
    const { page, limit } = pagination;
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalItems);
    const pageItems = items.slice(startIndex, endIndex);

    itemList.innerHTML = `
      <strong>Showing items ${startIndex + 1}-${endIndex} of ${totalItems}</strong><br><br>
      ${pageItems.map(item => `${item.id}. ${item.name} - ${item.description}`).join('<br>')}
    `;
  }

  // Initial render
  renderItems();

  // Listen for page changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'page') {
        renderItems();
      }
    });
  });
  observer.observe(pagination, { attributes: true });

  // Handle link clicks (in a real app, you'd use proper routing)
  document.addEventListener('click', (e) => {
    if (e.target.closest('#table-pagination a')) {
      e.preventDefault();
      const href = e.target.closest('a').getAttribute('href');
      const pageMatch = href.match(/(\d+)/);
      if (pageMatch) {
        pagination.page = parseInt(pageMatch[1]);
      }
    }
  });
</script>
```

### Single Page

When the total number of items fits within a single page, only page 1 is shown with disabled Previous and Next buttons.

```html:preview
<zn-pagination total="8" limit="10" page="1" uri="#page#"></zn-pagination>
```

### Empty State

When there are no items (total is 0), the pagination shows page 0 with disabled buttons.

```html:preview
<zn-pagination total="0" limit="10" page="1" uri="#page#"></zn-pagination>
```

## Properties

The pagination component exposes the following attributes and properties:

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| `limit` | `limit` | `number` | `10` | Number of items to display per page. This determines how many pages are calculated from the total. |
| `total` | `total` | `number` | `0` | Total number of items across all pages. Used to calculate the total number of pages. |
| `page` | `page` | `number` | `1` | Current active page number. The page button matching this number will be highlighted. |
| `uri` | `uri` | `string` | `""` | URI pattern for page links. Use `#page#` as a placeholder that will be replaced with the actual page number. |

## Behavior

### Page Button Display Logic

The pagination component uses intelligent logic to display page buttons:

- If there are 5 or fewer total pages, all page numbers are shown
- If there are more than 5 pages, a window of up to 5 page buttons is displayed
- When on page 1, buttons 1-5 are shown (or up to the last page if fewer than 5)
- When on the last page, the last 5 pages are shown (or from page 1 if fewer than 5 pages after adjustment)
- When on middle pages, the current page is centered with 2 pages on each side when possible
- The active page button is highlighted and not clickable
- Previous button is disabled on page 1
- Next button is disabled on the last page

### Link Generation

The component generates links using the `uri` pattern:

- The `#page#` placeholder is replaced with the actual page number
- If `uri` is empty, no links are generated
- The active page button does not generate a link
- Previous and Next buttons generate links for page-1 and page+1 respectively

### Accessibility

- Active page is indicated with visual styling (primary color, bold weight)
- Disabled buttons show reduced opacity and have cursor: not-allowed
- All buttons are keyboard accessible via standard tab navigation
- Links use semantic HTML `<a>` elements for proper navigation

## Styling

The pagination component supports customization through CSS variables and theme tokens:

- Background color uses `--zn-panel` and `--zn-panel-opacity`
- Text color uses `--zn-text`
- Shadow effect uses `--zn-shadow`
- Active state uses `--zn-primary`
- Border radius uses `--zn-spacing-small`
- Padding and spacing use standard Zinc spacing tokens

### CSS Parts

While the component does not currently expose CSS parts, you can style it using standard CSS selectors on the host element.

## Best Practices

### When to Use Pagination

- Use pagination for large datasets that would be overwhelming to display all at once
- Ideal for tables, search results, product listings, and content feeds
- Consider pagination when you have more than 25-50 items to display

### Choosing Page Size

- Common page sizes are 10, 20, 25, 50, or 100 items
- Smaller page sizes (10-25) work well for detailed content like product cards
- Larger page sizes (50-100) work well for compact lists or tables
- Consider your users' needs and the type of content being displayed

### URI Patterns

- Use clear, RESTful URL patterns like `/items?page=#page#`
- Ensure page URLs are shareable and bookmarkable
- Consider including other query parameters in your URI pattern
- For SPAs, you might use hash-based routing like `#/page/#page#`

### Accessibility Considerations

- Always provide a way to navigate to the first and last pages
- Ensure keyboard navigation works properly
- Consider adding ARIA labels for screen readers
- Test with keyboard-only navigation

### Performance Tips

- Load only the data for the current page from your backend
- Use URL parameters to maintain page state across refreshes
- Consider implementing infinite scroll as an alternative for certain use cases
- Cache page data when appropriate to improve navigation speed


