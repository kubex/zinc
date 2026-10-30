---
meta:
  title: Key
  description: A legend key item, typically used alongside charts to label and toggle visibility of data series by category.
layout: component
---

```html:preview
<div style="display: flex; flex-direction: column; gap: 8px;">
  <zn-key icon="circle" color="primary" active>Primary active</zn-key>
  <zn-key icon="circle" color="success">Success inactive</zn-key>
  <zn-key icon="circle" color="warning" active>Warning active</zn-key>
</div>
```

## Examples

### Basic Key

A key displays a chip alongside a description. Clicking it toggles the active state.

```html:preview
<zn-key icon="circle" color="primary">Sales</zn-key>
```

### Active State

Use the `active` attribute to set the key as active by default. When active, the chip displays the assigned color; when inactive, it appears transparent.

```html:preview
<zn-key icon="circle" color="primary" active>Active key</zn-key>
<zn-key icon="circle" color="primary">Inactive key</zn-key>
```

### Colors

Use the `color` attribute to set the semantic color of the key chip. Available colors are `primary`, `success`, `warning`, `error`, `info`, and `neutral`.

```html:preview
<div style="display: flex; flex-direction: column; gap: 8px;">
  <zn-key icon="circle" color="primary" active>Primary</zn-key>
  <zn-key icon="circle" color="success" active>Success</zn-key>
  <zn-key icon="circle" color="warning" active>Warning</zn-key>
  <zn-key icon="circle" color="error" active>Error</zn-key>
  <zn-key icon="circle" color="info" active>Info</zn-key>
  <zn-key icon="circle" color="neutral" active>Neutral</zn-key>
</div>
```

### Icons

Use the `icon` attribute to set the icon displayed in the chip.

```html:preview
<div style="display: flex; flex-direction: column; gap: 8px;">
  <zn-key icon="payments" color="success" active>Revenue</zn-key>
  <zn-key icon="shopping_cart" color="primary" active>Orders</zn-key>
  <zn-key icon="person" color="info" active>Customers</zn-key>
</div>
```

### Icon Size

Use the `icon-size` attribute to control the size of the icon within the chip.

```html:preview
<div style="display: flex; flex-direction: column; gap: 8px;">
  <zn-key icon="circle" color="primary" icon-size="14" active>Small icon</zn-key>
  <zn-key icon="circle" color="primary" active>Default icon (24)</zn-key>
  <zn-key icon="circle" color="primary" icon-size="32" active>Large icon</zn-key>
</div>
```

### Filtering Attributes

Use the `attribute` and `value` attributes to define what content this key filters. These are used by `zn-key-container` to match items.

```html:preview
<zn-key icon="circle" color="primary" attribute="data-type" value="sale" active>Sales</zn-key>
<zn-key icon="circle" color="error" attribute="data-type" value="refund" active>Refunds</zn-key>
```

### Events

Keys emit a `zn-change` event when toggled.

```html:preview
<zn-key id="event-key" icon="circle" color="primary" active>Click me</zn-key>
<div id="key-output" style="margin-top: 1rem; padding: 0.75rem; background: #f5f5f5; border-radius: 4px;">
  Click the key to toggle it
</div>

<script type="module">
  const key = document.querySelector('#event-key');
  const output = document.querySelector('#key-output');

  key.addEventListener('zn-change', () => {
    output.textContent = `Key is now: ${key.active ? 'active' : 'inactive'}`;
  });
</script>
```