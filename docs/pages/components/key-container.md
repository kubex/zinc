---
meta:
  title: Key Container
  description: A legend container that manages key items, typically used alongside charts to toggle visibility of data series by category.
layout: component
---

```html:preview
<zn-key-container filter-attribute="data-type">
  <zn-key icon="circle" color="primary" attribute="sale" active>Sales</zn-key>
  <zn-key icon="circle" color="success" attribute="refund" active>Refunds</zn-key>
  <zn-key icon="circle" color="warning" attribute="pending" active>Pending</zn-key>

  <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 4px;">
    <zn-chip data-type="sale" type="primary">Sale #1001</zn-chip>
    <zn-chip data-type="refund" type="success">Refund #2001</zn-chip>
    <zn-chip data-type="sale" type="primary">Sale #1002</zn-chip>
    <zn-chip data-type="pending" type="warning">Pending #3001</zn-chip>
    <zn-chip data-type="refund" type="success">Refund #2002</zn-chip>
  </div>
</zn-key-container>
```

## Examples

### Basic Usage

Place `zn-key` elements and filterable content inside a `zn-key-container`. Use `filter-attribute` to specify which attribute on content items should be matched against each key's `attribute` value. Deactivating a key hides items that match it.

```html:preview
<zn-key-container filter-attribute="data-category">
  <zn-key icon="circle" color="primary" attribute="frontend" active>Frontend</zn-key>
  <zn-key icon="circle" color="success" attribute="backend" active>Backend</zn-key>
  <zn-key icon="circle" color="info" attribute="devops" active>DevOps</zn-key>

  <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 4px;">
    <zn-chip data-category="frontend" type="primary">React component</zn-chip>
    <zn-chip data-category="backend" type="success">API endpoint</zn-chip>
    <zn-chip data-category="devops" type="info">CI pipeline</zn-chip>
    <zn-chip data-category="frontend" type="primary">CSS update</zn-chip>
    <zn-chip data-category="backend" type="success">Database migration</zn-chip>
  </div>
</zn-key-container>
```

### Using Attribute and Value

When keys specify both `attribute` and `value`, items are matched by checking if the given attribute contains the given value.

```html:preview
<zn-key-container>
  <zn-key icon="circle" color="success" attribute="data-status" value="active" active>Active</zn-key>
  <zn-key icon="circle" color="warning" attribute="data-status" value="pending" active>Pending</zn-key>
  <zn-key icon="circle" color="error" attribute="data-status" value="closed" active>Closed</zn-key>

  <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 4px;">
    <zn-chip data-status="active" type="success">Ticket #101 - Active</zn-chip>
    <zn-chip data-status="pending" type="warning">Ticket #102 - Pending</zn-chip>
    <zn-chip data-status="closed" type="error">Ticket #103 - Closed</zn-chip>
    <zn-chip data-status="active" type="success">Ticket #104 - Active</zn-chip>
    <zn-chip data-status="pending" type="warning">Ticket #105 - Pending</zn-chip>
  </div>
</zn-key-container>
```

### External Target

Use the `target` attribute to filter content in a separate element by its ID, instead of filtering slotted content.

```html:preview
<zn-key-container target="target-list" filter-attribute="data-type">
  <zn-key icon="circle" color="primary" attribute="order" active>Orders</zn-key>
  <zn-key icon="circle" color="success" attribute="payment" active>Payments</zn-key>
</zn-key-container>

<div id="target-list" style="margin-top: 16px; display: flex; flex-direction: column; gap: 4px;">
  <zn-chip data-type="order" type="primary">Order #5001</zn-chip>
  <zn-chip data-type="payment" type="success">Payment #6001</zn-chip>
  <zn-chip data-type="order" type="primary">Order #5002</zn-chip>
  <zn-chip data-type="payment" type="success">Payment #6002</zn-chip>
</div>
```

### No Scroll

By default, the container allows its content to scroll. Use the `no-scroll` attribute to disable this behaviour.

```html:preview
<zn-key-container filter-attribute="data-type" no-scroll>
  <zn-key icon="circle" color="primary" attribute="alpha" active>Alpha</zn-key>
  <zn-key icon="circle" color="error" attribute="beta" active>Beta</zn-key>

  <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 4px;">
    <zn-chip data-type="alpha" type="primary">Alpha item 1</zn-chip>
    <zn-chip data-type="beta" type="error">Beta item 1</zn-chip>
    <zn-chip data-type="alpha" type="primary">Alpha item 2</zn-chip>
  </div>
</zn-key-container>
```

### Custom Item Selector

Use the `item-selector` attribute to change the CSS selector used to find filterable items. The default is `[data-type]`.

```html:preview
<zn-key-container item-selector=".filterable">
  <zn-key icon="circle" color="info" attribute="class" value="filterable" active>Show items</zn-key>

  <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 4px;">
    <zn-chip class="filterable" type="info">Filterable item</zn-chip>
    <zn-chip type="neutral">Always visible (no class)</zn-chip>
    <zn-chip class="filterable" type="info">Another filterable item</zn-chip>
  </div>
</zn-key-container>
```