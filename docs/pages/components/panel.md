---
meta:
  title: Panel
  description: Panels are versatile containers that provide structure for organizing content with optional headers, footers, and sidebars.
layout: component
---

Panels are a fundamental component in the Zinc framework, providing a structured container for displaying content with consistent styling, borders, and spacing. They support various layouts including headers with actions, footers, and collapsible sidebars.

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

### Panel with Sidebar

Use the `side` slot to add a sidebar to the panel. The sidebar can be positioned on the left or right side.

```html:preview
<zn-panel caption="Panel with Sidebar" description="Sidebar on the left">
  <div slot="side">
    <h4>Sidebar Content</h4>
    <ul style="padding-left: 20px;">
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
  </div>

  <div style="padding: 20px;">
    <h3>Main Content</h3>
    <p>This is the main content area of the panel.</p>
  </div>
</zn-panel>
```

### Sidebar Position

Use the `sidebar-position` attribute to control whether the sidebar appears on the left or right side.

```html:preview
<zn-panel caption="Panel with Right Sidebar" sidebar-position="right">
  <div slot="side">
    <h4>Right Sidebar</h4>
    <ul style="padding-left: 20px;">
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
  </div>

  <div style="padding: 20px;">
    <h3>Main Content</h3>
    <p>The sidebar is now on the right side.</p>
  </div>
</zn-panel>
```

### Collapsible Sidebar

Use `enable-sidebar-toggle` to add a toggle button in the header that collapses and expands the sidebar. You can customize the button icon and tooltip.

```html:preview
<zn-panel
  caption="Collapsible Sidebar Panel"
  enable-sidebar-toggle
  sidebar-icon="menu"
  sidebar-tooltip="Toggle Navigation">
  <div slot="side">
    <h4>Navigation</h4>
    <ul style="padding-left: 20px;">
      <li>Dashboard</li>
      <li>Settings</li>
      <li>Profile</li>
      <li>Help</li>
    </ul>
  </div>

  <div style="padding: 20px;">
    <h3>Main Content</h3>
    <p>Click the menu button in the header to toggle the sidebar.</p>
  </div>
</zn-panel>
```

### Sidebar Control

Control the sidebar state programmatically using the `sidebar-open` attribute or by calling the `toggleSidebar()` method.

```html:preview
<zn-panel
  id="controlled-sidebar-panel"
  caption="Controlled Sidebar"
  enable-sidebar-toggle
  sidebar-open="false">
  <div slot="side">
    <h4>Sidebar</h4>
    <p>This sidebar starts collapsed</p>
  </div>

  <div style="padding: 20px;">
    <h3>Main Content</h3>
    <p>The sidebar starts in a collapsed state.</p>
    <br />
    <zn-button id="toggle-btn">Toggle Sidebar Programmatically</zn-button>
  </div>
</zn-panel>

<script type="module">
  const panel = document.getElementById('controlled-sidebar-panel');
  const toggleBtn = document.getElementById('toggle-btn');

  toggleBtn.addEventListener('click', () => {
    panel.toggleSidebar();
  });

  panel.addEventListener('zn-sidebar-toggle', (event) => {
    console.log('Sidebar toggled:', event.detail);
  });
</script>
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
  enable-sidebar-toggle
  sidebar-position="left"
  shadow>

  <zn-chip slot="actions" icon="settings" type="info">Configure</zn-chip>
  <zn-button slot="actions" icon="refresh" size="x-small" color="transparent" square></zn-button>

  <div slot="side">
    <h4>Quick Links</h4>
    <ul style="padding-left: 20px; margin: 10px 0;">
      <li style="margin: 5px 0;">Overview</li>
      <li style="margin: 5px 0;">Analytics</li>
      <li style="margin: 5px 0;">Reports</li>
      <li style="margin: 5px 0;">Settings</li>
    </ul>
  </div>

  <div style="padding: 20px;">
    <h3>Dashboard Overview</h3>
    <p>This panel combines a sidebar, header actions, icons, underline, and shadow effects.</p>
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

### Sidebar Width

The sidebar has a fixed width of 250px when open. When collapsed using `sidebar-open="false"` or the toggle button, it transitions smoothly to 0px width using a 0.3s ease animation.

### Header Display

The panel header only renders when one of the following conditions is met:
- A `caption` is provided
- The `actions` slot has content
- The `enable-sidebar-toggle` attribute is set to `true`

### CSS Custom Properties

The following CSS custom properties can be used to customize the panel:

- `--zn-panel-basis` - Controls the flex-basis of the panel (set via `basis-px` attribute)

### Events

The panel emits the following events:

#### zn-sidebar-toggle

Emitted when the sidebar is toggled open or closed.

```javascript
panel.addEventListener('zn-sidebar-toggle', (event) => {
  console.log('Element:', event.detail.element);
  console.log('Open state:', event.detail.open);
});
```

### Methods

The panel exposes the following methods:

#### toggleSidebar()

Toggles the sidebar open or closed state. This method also emits the `zn-sidebar-toggle` event.

```javascript
const panel = document.querySelector('zn-panel');
panel.toggleSidebar();
```