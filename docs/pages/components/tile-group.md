---
meta:
  title: Tile Group
  description: Aligns a list of tiles into shared, content-driven columns so values and actions line up across every row.
layout: component
---

A plain list of `zn-tile` rows lays each row out independently, so columns drift out of alignment whenever content widths differ (for example a wider "Manual Renewal" chip shifts that row). `zn-tile-group` wraps the rows in a shared grid: every tile becomes a row of the same columns, so captions, values and actions line up down the list.

```html:preview
<zn-tile-group divide>
  <zn-tile caption="Test" plain>
    <span slot="properties">Default</span>
    <span slot="properties">£9.99/mo</span>
    <zn-chip slot="actions" type="info">Auto Renewal</zn-chip>
    <zn-chip slot="actions" type="success">Active</zn-chip>
  </zn-tile>

  <zn-tile caption="Test" plain>
    <span slot="properties">Default</span>
    <span slot="properties">£9.99/mo</span>
    <zn-chip slot="actions" type="warning">Manual Renewal</zn-chip>
    <zn-chip slot="actions" type="success">Active</zn-chip>
  </zn-tile>

  <zn-tile caption="Test" plain>
    <span slot="properties">Default</span>
    <span slot="properties">£9.99/mo</span>
    <zn-chip slot="actions" type="info">Auto Renewal</zn-chip>
    <zn-chip slot="actions" type="success">Active</zn-chip>
  </zn-tile>
</zn-tile-group>
```

## Examples

### Dividers

Add the `divide` attribute to draw a border between rows.

```html:preview
<zn-tile-group divide>
  <zn-tile caption="Leslie Alexander" plain>
    <span slot="properties">Co-Founder / CEO</span>
    <zn-chip slot="actions" type="success">Active</zn-chip>
  </zn-tile>

  <zn-tile caption="Michael Foster" plain>
    <span slot="properties">Engineering Lead</span>
    <zn-chip slot="actions" type="success">Active</zn-chip>
  </zn-tile>

  <zn-tile caption="Emma Davis" plain>
    <span slot="properties">Product Manager</span>
    <zn-chip slot="actions">Away</zn-chip>
  </zn-tile>
</zn-tile-group>
```

### Without Dividers

Omit `divide` for a borderless list.

```html:preview
<zn-tile-group>
  <zn-tile caption="Wireless Headphones" plain>
    <span slot="properties">In Stock</span>
    <span slot="properties">$299</span>
  </zn-tile>

  <zn-tile caption="Smart Watch" plain>
    <span slot="properties">Low Stock</span>
    <span slot="properties">$399</span>
  </zn-tile>
</zn-tile-group>
```

## How It Works

The group is a CSS grid: a flexible caption column on the left, then one shared, content-sized column for each value/action. Each tile is rendered as a [subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid) row spanning those columns, so a column is only as wide as its widest cell across the whole list and every row aligns to it. Value/action columns are right-aligned, so chips of differing widths (Auto vs Manual Renewal) still share a clean right edge.

The number of shared columns is detected automatically from the row with the most `properties` + `actions`, and published as the `--zn-tile-cols` custom property.

## Usage Notes

- Use a consistent set of `properties`/`actions` across rows for the cleanest alignment; rows with fewer cells leave trailing columns empty.
- Captions render in the bold tile weight by default; add `plain` to the tiles for the regular table-content weight (as in the examples above).
- Dividers are drawn between rows and are inset by the group's horizontal padding.

## CSS Custom Properties

- `--zn-tile-cols` - The number of shared value/action columns. Set automatically; you normally don't need to touch it.
