---
meta:
  title: Infinite Scroll
  description: Loads further pages of server-rendered content as the user scrolls to the end.
layout: component
---

Wrap the first page of any server-rendered list. When the end of the content comes within one screen of view, the next page is fetched from `uri` (with `#page#` replaced by the page number) and its HTML is appended. Loading stops at the first empty response. With no content inside, it starts by loading page 1.

```html:preview
<div style="height: 300px; overflow: auto;">
  <zn-infinite-scroll uri="/assets/infinite-scroll/page-#page#.html">
    <zn-tile caption="Item 1" description="Rendered with the page"></zn-tile>
    <zn-tile caption="Item 2" description="Rendered with the page"></zn-tile>
    <zn-tile caption="Item 3" description="Rendered with the page"></zn-tile>
    <zn-tile caption="Item 4" description="Rendered with the page"></zn-tile>
    <zn-tile caption="Item 5" description="Rendered with the page"></zn-tile>
  </zn-infinite-scroll>
</div>
```

## Examples

### Starting Empty

Leave the component empty and it loads the first page itself.

```html:preview
<div style="height: 300px; overflow: auto;">
  <zn-infinite-scroll uri="/assets/infinite-scroll/page-#page#.html"></zn-infinite-scroll>
</div>
```

### Tile Grid

Lay the component out as a grid and each loaded page flows into it. Content in the `loader` slot is shown while a page loads and can line up with the grid's columns using `subgrid`, so placeholder tiles stand in for the next row.

```html:preview
<div class="tile-feed">
  <zn-infinite-scroll uri="/assets/infinite-scroll/tiles-#page#.html">
    <zn-tile caption="Q3 revenue report" description="Report · Updated 2h ago" icon="bar_chart" icon-color="success"></zn-tile>
    <zn-tile caption="Spring campaign" description="Campaign · 12 assets" icon="campaign" icon-color="ai"></zn-tile>
    <zn-tile caption="Supplier invoices" description="Folder · 48 files" icon="receipt_long" icon-color="warning"></zn-tile>
    <zn-tile caption="Onboarding checklist" description="Template · Shared" icon="checklist" icon-color="info"></zn-tile>
    <zn-tile caption="Churned accounts" description="Segment · 312 customers" icon="person_remove" icon-color="danger"></zn-tile>
    <zn-tile caption="Brand guidelines" description="Document · v4" icon="palette" icon-color="neutral"></zn-tile>
    <zn-tile caption="Weekly standup" description="Event · Mondays 9:30" icon="event" icon-color="info"></zn-tile>
    <zn-tile caption="Product photos" description="Folder · 126 images" icon="photo_library" icon-color="ai"></zn-tile>
    <zn-tile caption="Refund policy" description="Document · Legal review" icon="gavel" icon-color="warning"></zn-tile>
    <zn-tile caption="Renewal reminders" description="Automation · Active" icon="autorenew" icon-color="success"></zn-tile>
    <zn-tile caption="Failed payments" description="Report · 18 this week" icon="credit_card_off" icon-color="danger"></zn-tile>
    <zn-tile caption="Warehouse stock" description="Inventory · 2,410 items" icon="inventory_2" icon-color="neutral"></zn-tile>
    <div slot="loader" class="tile-skeleton-row">
      <zn-tile loading icon></zn-tile>
      <zn-tile loading icon></zn-tile>
      <zn-tile loading icon></zn-tile>
      <zn-tile loading icon></zn-tile>
    </div>
  </zn-infinite-scroll>
</div>

<style>
  /* Padding keeps tile borders and hover shadows clear of the scroll edges and scrollbar */
  .tile-feed {
    height: 360px;
    overflow: auto;
    padding: var(--zn-spacing-x-small);
  }

  /* At most 4 columns, so each page of 12 tiles fills whole rows */
  .tile-feed zn-infinite-scroll {
    --gap: var(--zn-spacing-small);
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(max(240px, calc((100% - 3 * var(--gap)) / 4)), 1fr));
    gap: var(--gap);
  }

  .tile-feed zn-tile {
    background: rgb(var(--zn-panel));
    border: 1px solid rgb(var(--zn-border-color));
    border-radius: var(--zn-border-radius-large);
  }

  .tile-feed zn-tile:not([loading]) {
    transition: border-color 150ms ease, box-shadow 150ms ease;
  }

  .tile-feed zn-tile:not([loading]):hover {
    border-color: rgb(var(--zn-primary));
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  }

  /* One row of placeholders on the grid's columns; any that don't fit collapse out of sight */
  .tile-feed .tile-skeleton-row {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    grid-template-rows: auto;
    grid-auto-rows: 0;
    row-gap: 0;
    align-items: start;
    overflow: hidden;
  }
</style>
```

### Loading State

While a page is loading, the `loader` slot is shown after the content. These examples request a page that never arrives, so the loading state stays on screen.

<script>
  // Docs only: requests for pending-* pages never settle, so the examples below stay loading
  if (!window.znDocsPendingFetch) {
    window.znDocsPendingFetch = true;
    const fetch = window.fetch;
    window.fetch = (input, init) => String(input).includes('/assets/infinite-scroll/pending-')
      ? new Promise((_, reject) => init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))
      : fetch(input, init);
  }
</script>

With no `loader` slot, a skeleton bar is shown.

```html:preview
<zn-infinite-scroll uri="/assets/infinite-scroll/pending-#page#.html">
  <zn-tile caption="Item 1" description="Rendered with the page"></zn-tile>
  <zn-tile caption="Item 2" description="Rendered with the page"></zn-tile>
  <zn-tile caption="Item 3" description="Rendered with the page"></zn-tile>
</zn-infinite-scroll>
```

In the tile grid, a row of placeholder tiles stands in for the next page. This uses the styles from the [tile grid](#tile-grid) example.

```html:preview
<div class="tile-feed" style="height: auto;">
  <zn-infinite-scroll uri="/assets/infinite-scroll/pending-#page#.html">
    <zn-tile caption="Q3 revenue report" description="Report · Updated 2h ago" icon="bar_chart" icon-color="success"></zn-tile>
    <zn-tile caption="Spring campaign" description="Campaign · 12 assets" icon="campaign" icon-color="ai"></zn-tile>
    <zn-tile caption="Supplier invoices" description="Folder · 48 files" icon="receipt_long" icon-color="warning"></zn-tile>
    <zn-tile caption="Onboarding checklist" description="Template · Shared" icon="checklist" icon-color="info"></zn-tile>
    <zn-tile caption="Churned accounts" description="Segment · 312 customers" icon="person_remove" icon-color="danger"></zn-tile>
    <zn-tile caption="Brand guidelines" description="Document · v4" icon="palette" icon-color="neutral"></zn-tile>
    <zn-tile caption="Weekly standup" description="Event · Mondays 9:30" icon="event" icon-color="info"></zn-tile>
    <zn-tile caption="Product photos" description="Folder · 126 images" icon="photo_library" icon-color="ai"></zn-tile>
    <zn-tile caption="Refund policy" description="Document · Legal review" icon="gavel" icon-color="warning"></zn-tile>
    <zn-tile caption="Renewal reminders" description="Automation · Active" icon="autorenew" icon-color="success"></zn-tile>
    <zn-tile caption="Failed payments" description="Report · 18 this week" icon="credit_card_off" icon-color="danger"></zn-tile>
    <zn-tile caption="Warehouse stock" description="Inventory · 2,410 items" icon="inventory_2" icon-color="neutral"></zn-tile>
    <div slot="loader" class="tile-skeleton-row">
      <zn-tile loading icon></zn-tile>
      <zn-tile loading icon></zn-tile>
      <zn-tile loading icon></zn-tile>
      <zn-tile loading icon></zn-tile>
    </div>
  </zn-infinite-scroll>
</div>
```

### Starting Page

Set `page` to the last page the server already rendered. The next request is for `page + 1`.

```html
<zn-infinite-scroll uri="/notes?page=#page#" page="3">
  <!-- pages 1 to 3 -->
</zn-infinite-scroll>
```

### Server Responses

Each request is a `GET` with the `x-kx-inline: inline` header, and should return just the items for that page.

- **Items:** appended to the end, then `zn-load` is emitted.
- **Empty body:** loading stops, the `finished` attribute is set and `zn-finish` is emitted.
- **Error status or network failure:** loading stops, the `finished` attribute is set and `zn-error` is emitted.

### Scroll Containers

Inside a scrolling element, a screen is that element's height. While a page loads, scrolling that reaches the end stays in the element instead of moving the page. Once loading has finished for good, scrolling past the end moves the page as usual.
