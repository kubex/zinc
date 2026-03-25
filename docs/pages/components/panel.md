---
meta:
  title: Panel
  description: Panels are versatile containers that provide structure for organizing content with optional headers and footers.
layout: component
---

Panels are a fundamental component in the Zinc framework, providing a structured container for displaying content with consistent styling, borders, and spacing. They support various layouts including headers with actions and footers.

```html:preview
<zn-panel caption="Example Panel" description="Full example with all features" flush tabbed>
  <!-- Panel actions -->
  <zn-chip slot="actions" icon="home">Awesome</zn-chip>
  <zn-chip slot="actions" icon="phone" type="info">example</zn-chip>

  <!-- Panel content -->
  <zn-tabs flush>
    <zn-navbar slot="top">
      <li tab>Customer</li>
      <li tab="something-else">Something Else</li>
    </zn-navbar>

    <zn-sp id="" no-gap divide>
      <zn-inline-edit padded inline caption="Label 1" value="This is Awesome"></zn-inline-edit>
      <zn-inline-edit padded inline caption="Label 2" value="This is Awesome"></zn-inline-edit>
    </zn-sp>

    <zn-sp id="something-else" no-gap divide>
      <zn-inline-edit padded inline caption="Label 3" value="This is not Awesome"></zn-inline-edit>
      <zn-inline-edit padded inline caption="Label 4" value="This is not Awesome"></zn-inline-edit>
    </zn-sp>
  </zn-tabs>

  <!-- Panel Footer -->
  <span slot="footer">
    Some awesome footer information
  </span>
</zn-panel>
```

## Examples

### Basic Panel

Basic panels provide a simple container with consistent borders, rounded corners, and background styling. The panel can display a caption and description in its header.

```html:preview
<zn-panel caption="Example Panel" description="Simple panels are the best">
  <div>Panel Content</div>
</zn-panel>
```

### Panel with Icon

Use the `icon` attribute to add an icon to the panel header.

```html:preview
<zn-panel caption="Settings Panel" description="Configure your preferences" icon="settings">
  <div style="padding: 20px;">
    <p>Panel content goes here</p>
  </div>
</zn-panel>
```

### Actions Slot

Use the `actions` slot to add action buttons or chips to the panel header.

```html:preview
<zn-panel caption="Project Details" description="Manage your project">
  <zn-chip slot="actions" icon="edit" type="info">Edit</zn-chip>
  <zn-chip slot="actions" icon="delete" type="error">Delete</zn-chip>

  <div style="padding: 20px;">
    <p>Project content here</p>
  </div>
</zn-panel>
```

### Footer Slot

Use the `footer` slot to add footer content to the panel.

```html:preview
<zn-panel caption="Data Summary">
  <div style="padding: 20px;">
    <p>Main content area</p>
  </div>

  <div slot="footer">
    <zn-button size="small">Save</zn-button>
    <zn-button size="small" color="secondary">Cancel</zn-button>
  </div>
</zn-panel>
```

### Header Underline

Use the `header-underline` attribute to add a border beneath the header.

```html:preview
<zn-panel caption="Underlined Header" description="With a visible separator" header-underline>
  <div style="padding: 20px;">
    <p>Panel content with underlined header</p>
  </div>
</zn-panel>
```

### Flush Panels

The `flush` attribute removes all padding from the panel body, allowing content to extend to the edges. This is ideal for components like tabs or data tables that manage their own spacing.

```html:preview
<zn-panel caption="Flush Panel" flush>
  <zn-sp no-gap divide>
    <zn-inline-edit padded inline caption="Label 1" value="This is Awesome"></zn-inline-edit>
    <zn-inline-edit padded inline caption="Label 2" value="Also Awesome"></zn-inline-edit>
  </zn-sp>
</zn-panel>
```

### Flush X and Flush Y

Use `flush-x` to remove horizontal padding or `flush-y` to remove vertical padding.

```html:preview
<zn-panel caption="Flush X Panel" flush-x>
  <div style="background: rgba(var(--zn-color-info), 0.1); padding: 10px;">
    Content extends horizontally to edges
  </div>
</zn-panel>

<br />

<zn-panel caption="Flush Y Panel" flush-y>
  <div style="background: rgba(var(--zn-color-success), 0.1); padding: 10px;">
    Content extends vertically to edges
  </div>
</zn-panel>
```

### Flush Footer

Use `flush-footer` to remove padding from the footer slot.

```html:preview
<zn-panel caption="Flush Footer Panel" flush-footer>
  <div style="padding: 20px;">
    Main content with normal padding
  </div>

  <div slot="footer" style="background: rgba(var(--zn-color-secondary), 0.1); padding: 10px;">
    Footer with custom padding
  </div>
</zn-panel>
```

### Tabbed Panels

Use the `tabbed` attribute for panels containing tabs. This automatically removes body padding and applies flush styling to nested tabs.

```html:preview
<zn-panel caption="Tabbed Panel" flush tabbed>
  <zn-chip slot="actions" icon="home">Awesome</zn-chip>
  <zn-chip slot="actions" icon="phone" type="info">example</zn-chip>

  <zn-tabs flush>
    <zn-navbar slot="top">
      <li tab>Customer</li>
      <li tab="something-else">Something Else</li>
    </zn-navbar>

    <zn-sp id="" no-gap divide>
      <zn-inline-edit padded inline caption="Label 1" value="This is Awesome"></zn-inline-edit>
      <zn-inline-edit padded inline caption="Label 2" value="This is Awesome"></zn-inline-edit>
    </zn-sp>

    <zn-sp id="something-else" no-gap divide>
      <zn-inline-edit padded inline caption="Label 3" value="This is not Awesome"></zn-inline-edit>
      <zn-inline-edit padded inline caption="Label 4" value="This is not Awesome"></zn-inline-edit>
    </zn-sp>
  </zn-tabs>

  <span slot="footer">
    Some awesome footer information
  </span>
</zn-panel>
```

### Transparent Panels

Use the `transparent` attribute to remove the panel background and border, creating a borderless container.

```html:preview
<zn-panel caption="Transparent Panel" description="No background or border" transparent>
  <div style="padding: 20px; background: rgba(var(--zn-color-info), 0.1);">
    Content in transparent panel
  </div>
</zn-panel>
```

### Shadow Panels

Use the `shadow` attribute to add a prominent drop shadow to the panel.

```html:preview
<zn-panel caption="Shadow Panel" description="With drop shadow effect" shadow>
  <div style="padding: 20px;">
    Content with enhanced shadow
  </div>
</zn-panel>
```

### Moving the Caption

When using tabs, you can move the caption to the tabs component instead of the panel header.

```html:preview
<zn-panel flush>
  <zn-tabs caption="Example Panel">
    <zn-navbar slot="top">
      <li tab>Customer</li>
      <li tab="something-else">Something Else</li>
    </zn-navbar>

    <zn-sp id="" no-gap divide>
      <zn-inline-edit padded inline caption="Label 1" value="This is Awesome"></zn-inline-edit>
      <zn-inline-edit padded inline caption="Label 2" value="This is Awesome"></zn-inline-edit>
    </zn-sp>

    <zn-sp id="something-else" no-gap divide>
      <zn-inline-edit padded inline caption="Label 3" value="This is not Awesome"></zn-inline-edit>
      <zn-inline-edit padded inline caption="Label 4" value="This is not Awesome"></zn-inline-edit>
    </zn-sp>
  </zn-tabs>

  <span slot="footer">
    Some awesome footer information
  </span>
</zn-panel>
```

### Cosmic Panel

Use the `cosmic` attribute to add an animated cosmic border effect to the panel.

```html:preview
<zn-panel flush cosmic>
  <zn-sp flush no-gap divide>
    <zn-inline-edit padded inline caption="Label 1" value="This is Awesome"></zn-inline-edit>
    <zn-inline-edit padded inline caption="Label 2" value="This is Awesome"></zn-inline-edit>
  </zn-sp>

  <span slot="footer">
    Some awesome footer information
  </span>
</zn-panel>
```

### Basis Width

Use the `basis-px` attribute to set a custom flex-basis width for the panel in pixels.

```html:preview
<div style="display: flex; gap: 10px;">
  <zn-panel caption="Panel 1" basis-px="300">
    <div style="padding: 20px;">
      300px basis
    </div>
  </zn-panel>

  <zn-panel caption="Panel 2" basis-px="500">
    <div style="padding: 20px;">
      500px basis
    </div>
  </zn-panel>
</div>
```

### Combining Features

All panel features can be combined to create rich, complex layouts.

```html:preview
<zn-panel
  caption="Advanced Panel"
  description="Combining multiple features"
  icon="dashboard"
  header-underline
  shadow>

  <zn-chip slot="actions" icon="settings" type="info">Configure</zn-chip>
  <zn-button slot="actions" icon="refresh" size="x-small" color="transparent" square></zn-button>

  <div style="padding: 20px;">
    <h3>Dashboard Overview</h3>
    <p>This panel combines header actions, icons, underline, and shadow effects.</p>
  </div>

  <div slot="footer">
    <zn-button size="small" color="success">Save Changes</zn-button>
    <zn-button size="small" color="secondary">Cancel</zn-button>
  </div>
</zn-panel>
```

## Usage Notes

### Layout Behavior

Panels are designed to work within flexible layouts. They have a default `flex-grow: 1` and respond to their container's sizing. Use `basis-px` to control the initial width when using multiple panels in a flex layout.

### Automatic Tab Handling

When a panel contains a `zn-tabs` component and the `tabbed` attribute is not set, the panel automatically applies `flush-x` to the tabs and adjusts body styling to remove top padding.

### Header Display

The panel header only renders when one of the following conditions is met:
- A `caption` is provided
- The `actions` slot has content

### CSS Custom Properties

The following CSS custom properties can be used to customize the panel:

- `--zn-panel-basis` - Controls the flex-basis of the panel (set via `basis-px` attribute)

