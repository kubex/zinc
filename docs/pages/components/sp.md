---
meta:
  title: Sp
  description: A flexible layout container for spacing and arranging child elements in rows or columns with configurable gap, padding, and dividers.
layout: component
fullWidth: true
---

```html:preview
<zn-sp>
  <p>Hello World</p>
  <p>Hello World</p>
  <p>Hello World</p>
  <p>Hello World</p>
</zn-sp>
```

## Examples

### Row

Use the `row` attribute to lay out children horizontally instead of vertically.

```html:preview
<zn-sp row>
  <zn-chip>One</zn-chip>
  <zn-chip>Two</zn-chip>
  <zn-chip>Three</zn-chip>
</zn-sp>
```

### Gap Sizes

Use the `gap` attribute to control the spacing between children. Available sizes are `px`, `xxs`, `xs`, `sm`, `md`, `lg`, and `xl`.

```html:preview
<zn-sp row gap="px">
  <zn-chip>px</zn-chip><zn-chip>gap</zn-chip>
</zn-sp>
<zn-sp row gap="xs">
  <zn-chip>xs</zn-chip><zn-chip>gap</zn-chip>
</zn-sp>
<zn-sp row gap="sm">
  <zn-chip>sm</zn-chip><zn-chip>gap</zn-chip>
</zn-sp>
<zn-sp row gap="md">
  <zn-chip>md</zn-chip><zn-chip>gap</zn-chip>
</zn-sp>
<zn-sp row gap="lg">
  <zn-chip>lg</zn-chip><zn-chip>gap</zn-chip>
</zn-sp>
<zn-sp row gap="xl">
  <zn-chip>xl</zn-chip><zn-chip>gap</zn-chip>
</zn-sp>
```

### No Gap

Use the `no-gap` attribute to remove all spacing between children.

```html:preview
<zn-sp row no-gap>
  <zn-chip>No</zn-chip>
  <zn-chip>Gap</zn-chip>
  <zn-chip>Between</zn-chip>
</zn-sp>
```

### Align

Use the `align` attribute to align children along the cross axis. Accepts `start`, `center`, `end`, `stretch`, or `baseline`. In a row layout the cross axis is vertical; in a column layout it is horizontal.

```html:preview
<zn-sp row align="start" style="height: 100px; border: 1px dashed #ccc;">
  <div style="background: #d0e4ff; padding: 8px;">Short</div>
  <div style="background: #d0e4ff; padding: 8px; height: 60px;">Tall</div>
  <div style="background: #d0e4ff; padding: 8px;">Short</div>
</zn-sp>
<br />
<zn-sp row align="center" style="height: 100px; border: 1px dashed #ccc;">
  <div style="background: #d0e4ff; padding: 8px;">Short</div>
  <div style="background: #d0e4ff; padding: 8px; height: 60px;">Tall</div>
  <div style="background: #d0e4ff; padding: 8px;">Short</div>
</zn-sp>
<br />
<zn-sp row align="end" style="height: 100px; border: 1px dashed #ccc;">
  <div style="background: #d0e4ff; padding: 8px;">Short</div>
  <div style="background: #d0e4ff; padding: 8px; height: 60px;">Tall</div>
  <div style="background: #d0e4ff; padding: 8px;">Short</div>
</zn-sp>
```

### Justify

Use the `justify` attribute to distribute children along the main axis. Accepts `start`, `center`, `end`, `between`, `around`, or `evenly`. In a row layout the main axis is horizontal; in a column layout it is vertical.

```html:preview
<zn-sp row justify="between" style="border: 1px dashed #ccc;">
  <zn-chip>Left</zn-chip>
  <zn-chip>Middle</zn-chip>
  <zn-chip>Right</zn-chip>
</zn-sp>
```

### Flush

By default, `zn-sp` applies padding. Use the `flush` attribute to remove all padding, or `flush-x` / `flush-y` to remove padding in a single direction.

```html:preview
<div style="background: #f5f5f5; border: 1px dashed #ccc;">
  <zn-sp>
    <p>Default padding</p>
  </zn-sp>
</div>
<br />
<div style="background: #f5f5f5; border: 1px dashed #ccc;">
  <zn-sp flush>
    <p>Flush (no padding)</p>
  </zn-sp>
</div>
<br />
<div style="background: #f5f5f5; border: 1px dashed #ccc;">
  <zn-sp flush-x>
    <p>Flush X (no horizontal padding)</p>
  </zn-sp>
</div>
<br />
<div style="background: #f5f5f5; border: 1px dashed #ccc;">
  <zn-sp flush-y>
    <p>Flush Y (no vertical padding)</p>
  </zn-sp>
</div>
```

Individual sides can also be flushed with `flush-t`, `flush-b`, `flush-l`, and `flush-r`.

### Divided

Use the `divide` attribute to add divider lines between children.

```html:preview
<zn-sp divide>
  <p>Section One</p>
  <p>Section Two</p>
  <p>Section Three</p>
</zn-sp>
```

### Grow

Use the `grow` attribute to make the container expand to fill available space.

```html:preview
<div style="display: flex; height: 120px; border: 1px dashed #ccc;">
  <zn-sp grow>
    <p>This container grows to fill the parent</p>
  </zn-sp>
</div>
```

### Restricted Width

Use the `width-container` attribute to constrain the content to a maximum width.

```html:preview
<zn-sp width-container>
  <p>This content is width-constrained</p>
  <p>Useful for readable line lengths</p>
</zn-sp>
```

### Form Container

Use `form-container` or `wide-form-container` to constrain the width for form layouts.

```html:preview
<zn-sp form-container>
  <zn-input label="Name"></zn-input>
  <zn-input label="Email"></zn-input>
</zn-sp>
```