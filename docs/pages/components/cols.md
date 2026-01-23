---
meta:
  title: Cols
  description: A flexible column layout component that distributes children across multiple columns with configurable layouts, gaps, borders, and padding options.
layout: component
---

```html:preview

<zn-cols layout="2,1" border>
  <zn-panel>1</zn-panel>
  <zn-panel>2</zn-panel>
  <zn-panel>3</zn-panel>
  <zn-panel>4</zn-panel>
  <zn-panel>5</zn-panel>
</zn-cols>
```

## Examples

### Equal Column Layout

Create equal-width columns by using a layout pattern like "1,1" or "1,1,1".

```html:preview
<zn-cols layout="1,1">
  <zn-panel>Column 1</zn-panel>
  <zn-panel>Column 2</zn-panel>
</zn-cols>
```

### Three Equal Columns

```html:preview
<zn-cols layout="1,1,1">
  <zn-panel>Column 1</zn-panel>
  <zn-panel>Column 2</zn-panel>
  <zn-panel>Column 3</zn-panel>
</zn-cols>
```

### Asymmetric Layout

Use different numbers in the layout to create columns of different widths. The pattern "2,1" creates a layout where the first column is twice as wide as the second.

```html:preview
<zn-cols layout="2,1">
  <zn-panel>Wide Column (2 units)</zn-panel>
  <zn-panel>Narrow Column (1 unit)</zn-panel>
</zn-cols>
```

### Three Column Asymmetric

```html:preview
<zn-cols layout="3,2,1">
  <zn-panel>Widest Column (3 units)</zn-panel>
  <zn-panel>Medium Column (2 units)</zn-panel>
  <zn-panel>Narrowest Column (1 unit)</zn-panel>
</zn-cols>
```

### Repeating Pattern

The layout pattern repeats for additional children. With "2,1", items cycle through the pattern.

```html:preview
<zn-cols layout="2,1">
  <zn-panel>1 (2 units)</zn-panel>
  <zn-panel>2 (1 unit)</zn-panel>
  <zn-panel>3 (2 units)</zn-panel>
  <zn-panel>4 (1 unit)</zn-panel>
  <zn-panel>5 (2 units)</zn-panel>
</zn-cols>
```

### With Borders

Use the `border` attribute to add borders around columns.

```html:preview
<zn-cols layout="1,1,1" border>
  <zn-panel>Column 1</zn-panel>
  <zn-panel>Column 2</zn-panel>
  <zn-panel>Column 3</zn-panel>
</zn-cols>
```

### Without Gap

Use the `no-gap` attribute to remove spacing between columns.

```html:preview
<zn-cols layout="1,1,1" no-gap border>
  <zn-panel>No Gap</zn-panel>
  <zn-panel>Between</zn-panel>
  <zn-panel>Columns</zn-panel>
</zn-cols>
```

### With Padding

Use the `pad` attribute to add padding inside each column.

```html:preview
<zn-cols layout="1,1" pad border>
  <zn-panel>Padded Column 1</zn-panel>
  <zn-panel>Padded Column 2</zn-panel>
</zn-cols>
```

### Horizontal Padding Only

Use the `pad-x` attribute to add only horizontal padding.

```html:preview
<zn-cols layout="1,1" pad-x border>
  <zn-panel>Horizontal Padding</zn-panel>
  <zn-panel>Horizontal Padding</zn-panel>
</zn-cols>
```

### Vertical Padding Only

Use the `pad-y` attribute to add only vertical padding.

```html:preview
<zn-cols layout="1,1" pad-y border>
  <zn-panel>Vertical Padding</zn-panel>
  <zn-panel>Vertical Padding</zn-panel>
</zn-cols>
```

### With Dividers

Use the `divide` attribute to add dividers between columns.

```html:preview
<zn-cols layout="1,1,1" divide>
  <zn-panel>Column 1</zn-panel>
  <zn-panel>Column 2</zn-panel>
  <zn-panel>Column 3</zn-panel>
</zn-cols>
```

### Sticky Sidebar

Create a sticky sidebar layout for scrollable content.

```html:preview
<zn-cols layout="1,1">
  <div>
    <zn-panel style="position: -webkit-sticky; position: sticky; top:10px;">
      <div class="box" style="height: 100px; margin: 10px 0; background: purple">Sticky Sidebar</div>
      <div class="box" style="height: 100px;">Navigation</div>
    </zn-panel>
  </div>

  <zn-panel>
    <div class="box" style="height: 100px; margin: 10px 0; background: orange">Scrollable Content</div>
    <div class="box" style="height: 100px; background: orange">Item 1</div>
    <div class="box" style="height: 100px; background: orange">Item 2</div>
    <div class="box" style="height: 100px; background: orange">Item 3</div>
    <div class="box" style="height: 100px; background: orange">Item 4</div>
    <div class="box" style="height: 100px; background: orange">Item 5</div>
    <div class="box" style="height: 100px; background: orange">Item 6</div>
  </zn-panel>
</zn-cols>
```

### Dashboard Layout

Combine multiple features for a complete dashboard layout.

```html:preview
<zn-cols layout="2,1" border pad>
  <zn-panel>
    <h3>Main Content</h3>
    <p>This is the main content area with a 2:1 ratio.</p>
  </zn-panel>
  <zn-panel>
    <h3>Sidebar</h3>
    <p>This is a narrower sidebar.</p>
  </zn-panel>
</zn-cols>
```


