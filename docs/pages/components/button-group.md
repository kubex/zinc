---
meta:
  title: Button Group
  description: Button groups are used to organize related buttons into a cohesive unit, with options for layout, spacing, and alignment.
layout: component
---

```html:preview
<zn-button-group>
  <zn-button>First</zn-button>
  <zn-button>Inner 1</zn-button>
  <zn-button>Inner 2</zn-button>
  <zn-button>Last</zn-button>
</zn-button-group>
```

## Examples

### Basic Usage

By default, button groups display buttons horizontally with no gaps, creating a seamless connected appearance.

```html:preview
<zn-button-group>
  <zn-button>Left</zn-button>
  <zn-button>Center</zn-button>
  <zn-button>Right</zn-button>
</zn-button-group>
```

### Direction

Use the `direction` attribute to control the orientation of the button group. The default is `horizontal`, but you can set it to `vertical` for a stacked layout.

```html:preview
<zn-button-group direction="horizontal">
  <zn-button>Horizontal 1</zn-button>
  <zn-button>Horizontal 2</zn-button>
  <zn-button>Horizontal 3</zn-button>
</zn-button-group>

<br />
<br />

<zn-button-group direction="vertical">
  <zn-button>Vertical 1</zn-button>
  <zn-button>Vertical 2</zn-button>
  <zn-button>Vertical 3</zn-button>
</zn-button-group>
```

### Grow

Use the `grow` attribute to make buttons expand equally to fill the full width of their container. This is useful for creating full-width button groups.

```html:preview
<zn-button-group grow>
  <zn-button>First</zn-button>
  <zn-button>Second</zn-button>
  <zn-button>Third</zn-button>
  <zn-button>Fourth</zn-button>
</zn-button-group>
```

### Alignment

By default, button groups are right-aligned (flex-end). Use the `start` attribute to align buttons to the left (flex-start).

```html:preview
<zn-button-group>
  <zn-button>Right Aligned 1</zn-button>
  <zn-button>Right Aligned 2</zn-button>
  <zn-button>Right Aligned 3</zn-button>
</zn-button-group>

<br />
<br />

<zn-button-group start>
  <zn-button>Left Aligned 1</zn-button>
  <zn-button>Left Aligned 2</zn-button>
  <zn-button>Left Aligned 3</zn-button>
</zn-button-group>
```

### Spacing

Use the `gap` attribute to add spacing between buttons. This creates visual separation while maintaining the logical grouping.

```html:preview
<zn-button-group gap>
  <zn-button>First</zn-button>
  <zn-button>Second</zn-button>
  <zn-button>Third</zn-button>
  <zn-button>Fourth</zn-button>
</zn-button-group>
```

### Gap with Grow

Combine `gap` and `grow` attributes to create evenly-spaced, full-width button groups.

```html:preview
<zn-button-group gap grow>
  <zn-button>First</zn-button>
  <zn-button>Second</zn-button>
  <zn-button>Third</zn-button>
  <zn-button>Fourth</zn-button>
</zn-button-group>
```

### Button Variants

Button groups work with all button variants including colors, sizes, and styles.

```html:preview
<zn-button-group>
  <zn-button color="default">Default</zn-button>
  <zn-button color="secondary">Secondary</zn-button>
  <zn-button color="success">Success</zn-button>
</zn-button-group>

<br />
<br />

<zn-button-group gap>
  <zn-button color="error">Error</zn-button>
  <zn-button color="warning">Warning</zn-button>
  <zn-button color="info">Info</zn-button>
</zn-button-group>

<br />
<br />

<zn-button-group>
  <zn-button outline>Outline 1</zn-button>
  <zn-button outline>Outline 2</zn-button>
  <zn-button outline>Outline 3</zn-button>
</zn-button-group>
```

### Button Sizes

Button groups respect the size of their contained buttons.

```html:preview
<zn-button-group>
  <zn-button size="small">Small 1</zn-button>
  <zn-button size="small">Small 2</zn-button>
  <zn-button size="small">Small 3</zn-button>
</zn-button-group>

<br />
<br />

<zn-button-group>
  <zn-button size="medium">Medium 1</zn-button>
  <zn-button size="medium">Medium 2</zn-button>
  <zn-button size="medium">Medium 3</zn-button>
</zn-button-group>

<br />
<br />

<zn-button-group>
  <zn-button size="large">Large 1</zn-button>
  <zn-button size="large">Large 2</zn-button>
  <zn-button size="large">Large 3</zn-button>
</zn-button-group>
```

### With Icons

Button groups work seamlessly with icon buttons.

```html:preview
<zn-button-group>
  <zn-button icon="format_bold"></zn-button>
  <zn-button icon="format_italic"></zn-button>
  <zn-button icon="format_underlined"></zn-button>
  <zn-button icon="format_align_left"></zn-button>
</zn-button-group>

<br />
<br />

<zn-button-group gap>
  <zn-button icon="add" color="success">Add</zn-button>
  <zn-button icon="edit" color="info">Edit</zn-button>
  <zn-button icon="delete" color="error">Delete</zn-button>
</zn-button-group>
```

### Vertical with Gap

Combine vertical direction with gap for a spaced vertical layout.

```html:preview
<zn-button-group direction="vertical" gap>
  <zn-button>Option 1</zn-button>
  <zn-button>Option 2</zn-button>
  <zn-button>Option 3</zn-button>
  <zn-button>Option 4</zn-button>
</zn-button-group>
```

### Action Button Groups

A common pattern is to use button groups for action buttons like save/cancel or submit/reset combinations.

```html:preview
<zn-button-group start>
  <zn-button color="transparent">Cancel</zn-button>
  <zn-button color="success">Save Changes</zn-button>
</zn-button-group>

<br />
<br />

<zn-button-group gap>
  <zn-button color="secondary">Reset</zn-button>
  <zn-button color="default">Submit</zn-button>
</zn-button-group>
```

### Segmented Controls

Button groups can be used to create segmented control-like interfaces for toggling between views or options.

```html:preview
<zn-button-group>
  <zn-button>Day</zn-button>
  <zn-button>Week</zn-button>
  <zn-button>Month</zn-button>
  <zn-button>Year</zn-button>
</zn-button-group>

<br />
<br />

<zn-button-group>
  <zn-button icon="view_list">List</zn-button>
  <zn-button icon="grid_view">Grid</zn-button>
  <zn-button icon="view_kanban">Board</zn-button>
</zn-button-group>
```

### Toolbar Pattern

Button groups are ideal for creating toolbars with related actions.

```html:preview
<zn-button-group gap>
  <zn-button icon="undo" color="transparent"></zn-button>
  <zn-button icon="redo" color="transparent"></zn-button>
</zn-button-group>

<zn-button-group>
  <zn-button icon="format_bold"></zn-button>
  <zn-button icon="format_italic"></zn-button>
  <zn-button icon="format_underlined"></zn-button>
</zn-button-group>

<zn-button-group>
  <zn-button icon="format_align_left"></zn-button>
  <zn-button icon="format_align_center"></zn-button>
  <zn-button icon="format_align_right"></zn-button>
</zn-button-group>
```

### Responsive Wrapping

Button groups support wrapping by default, allowing buttons to flow to multiple lines on smaller screens.

```html:preview
<div style="max-width: 300px;">
  <zn-button-group>
    <zn-button>Button 1</zn-button>
    <zn-button>Button 2</zn-button>
    <zn-button>Button 3</zn-button>
    <zn-button>Button 4</zn-button>
    <zn-button>Button 5</zn-button>
    <zn-button>Button 6</zn-button>
  </zn-button-group>
</div>
```
