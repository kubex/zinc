---
meta:
  title: Pane
  description: A flexible container component for organizing content with optional headers and automatic overflow handling.
layout: component
---

Panes are versatile container components designed to manage content layout with automatic scrolling, flexible display, and seamless integration with headers. They serve as the primary building blocks for organizing page content in a structured, scrollable format.

```html:preview
<div style="height: 400px; border: 1px solid var(--zn-color-neutral-300);">
  <zn-pane>
    <zn-header caption="Example Pane" description="A basic pane with header"></zn-header>
    <p>This is the main content area of the pane. It will automatically scroll when the content exceeds the available space.</p>
    <p>The pane component provides a flexible container with built-in overflow handling and padding.</p>
    <p>You can add any content here, and it will be properly contained within the pane.</p>
  </zn-pane>
</div>
```

## Examples

### Basic Pane

A simple pane with default padding displays content in a flexible, scrollable container. The pane automatically manages overflow and applies standard spacing around the content.

```html:preview
<div style="height: 300px; border: 1px solid var(--zn-color-neutral-300);">
  <zn-pane>
    <p>This is a basic pane with default padding.</p>
    <p>Content is automatically wrapped with the standard spacing.</p>
    <p>The pane will scroll if content exceeds the available height.</p>
  </zn-pane>
</div>
```

### Pane with Header

When a `zn-header` is included as a child element, the pane automatically integrates it as a sticky header at the top. The header remains visible while scrolling through the content.

```html:preview
<div style="height: 400px; border: 1px solid var(--zn-color-neutral-300);">
  <zn-pane>
    <zn-header caption="Customer Details"
               description="View and manage customer information"
               icon="person">
      <zn-button slot="actions" primary>Save</zn-button>
      <zn-button slot="actions">Cancel</zn-button>
    </zn-header>

    <h3>Customer Information</h3>
    <p>Name: John Smith</p>
    <p>Email: john.smith@example.com</p>
    <p>Phone: (555) 123-4567</p>

    <h3>Address</h3>
    <p>123 Main Street</p>
    <p>Anytown, ST 12345</p>

    <h3>Order History</h3>
    <p>Total Orders: 15</p>
    <p>Last Order: 2025-01-15</p>
  </zn-pane>
</div>
```

### Flush Pane

Use the `flush` attribute to remove all padding from the content area. This is useful when working with components that need to extend to the edges of the pane, such as tables, tabs, or other full-width layouts.

```html:preview
<div style="height: 400px; border: 1px solid var(--zn-color-neutral-300);">
  <zn-pane flush>
    <zn-header caption="Flush Content"></zn-header>
    <zn-tabs flush>
      <zn-navbar slot="top">
        <li tab>Overview</li>
        <li tab="details">Details</li>
        <li tab="settings">Settings</li>
      </zn-navbar>

      <zn-sp id="" divide no-gap>
        <div style="padding: var(--zn-spacing-medium);">
          <h3>Overview Tab</h3>
          <p>This content extends to the edges of the pane.</p>
        </div>
        <div style="padding: var(--zn-spacing-medium);">
          <p>No extra padding around the tabs component.</p>
        </div>
      </zn-sp>

      <zn-sp id="details" divide no-gap>
        <div style="padding: var(--zn-spacing-medium);">
          <h3>Details Tab</h3>
          <p>Details content goes here.</p>
        </div>
      </zn-sp>

      <zn-sp id="settings" divide no-gap>
        <div style="padding: var(--zn-spacing-medium);">
          <h3>Settings Tab</h3>
          <p>Settings content goes here.</p>
        </div>
      </zn-sp>
    </zn-tabs>
  </zn-pane>
</div>
```

### Scrollable Content

Panes automatically handle overflow with scrollbars when content exceeds the available height. The header remains sticky while content scrolls beneath it.

```html:preview
<div style="height: 300px; border: 1px solid var(--zn-color-neutral-300);">
  <zn-pane>
    <zn-header caption="Long Content" description="Scroll to see more"></zn-header>
    <h3>Section 1</h3>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

    <h3>Section 2</h3>
    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>

    <h3>Section 3</h3>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>

    <h3>Section 4</h3>
    <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

    <h3>Section 5</h3>
    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>

    <h3>Section 6</h3>
    <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum.</p>
  </zn-pane>
</div>
```

### Nested Panes

Panes can be nested within layouts or other container components to create complex, multi-section interfaces with independent scrolling regions.

```html:preview
<div style="height: 400px; display: flex; gap: 10px;">
  <div style="flex: 1; border: 1px solid var(--zn-color-neutral-300);">
    <zn-pane>
      <zn-header caption="Left Pane" icon="list"></zn-header>
      <h4>Navigation</h4>
      <ul>
        <li>Dashboard</li>
        <li>Customers</li>
        <li>Orders</li>
        <li>Products</li>
        <li>Reports</li>
        <li>Settings</li>
      </ul>
    </zn-pane>
  </div>

  <div style="flex: 2; border: 1px solid var(--zn-color-neutral-300);">
    <zn-pane>
      <zn-header caption="Main Content" icon="article">
        <zn-button slot="actions" primary>Action</zn-button>
      </zn-header>
      <h3>Content Area</h3>
      <p>This is the main content area with independent scrolling.</p>
      <p>Each pane manages its own overflow and scrolling behavior.</p>
      <p>You can have multiple panes side by side or stacked vertically.</p>
    </zn-pane>
  </div>
</div>
```

### Flush Pane with Data Table

A common pattern is using a flush pane with data tables or other components that manage their own spacing and borders.

```html:preview
<div style="height: 400px; border: 1px solid var(--zn-color-neutral-300);">
  <zn-pane flush>
    <zn-header caption="Customer List" description="All active customers">
      <zn-button slot="actions" primary icon="add">Add Customer</zn-button>
    </zn-header>
    <zn-sp divide no-gap flush>
      <div style="padding: var(--zn-spacing-medium);">
        <strong>Customer 1</strong> - john@example.com
      </div>
      <div style="padding: var(--zn-spacing-medium);">
        <strong>Customer 2</strong> - jane@example.com
      </div>
      <div style="padding: var(--zn-spacing-medium);">
        <strong>Customer 3</strong> - bob@example.com
      </div>
      <div style="padding: var(--zn-spacing-medium);">
        <strong>Customer 4</strong> - alice@example.com
      </div>
      <div style="padding: var(--zn-spacing-medium);">
        <strong>Customer 5</strong> - charlie@example.com
      </div>
    </zn-sp>
  </zn-pane>
</div>
```

### Full Height Layout

Panes are designed to work within full-height layouts, automatically expanding to fill the available space and managing overflow appropriately.

```html:preview
<div style="height: 500px; border: 1px solid var(--zn-color-neutral-300);">
  <zn-pane>
    <zn-header caption="Dashboard"
               description="System overview and metrics"
               icon="dashboard">
      <zn-button slot="actions" icon="refresh">Refresh</zn-button>
    </zn-header>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--zn-spacing-medium);">
      <zn-stat caption="Total Users" value="1,234"></zn-stat>
      <zn-stat caption="Active Sessions" value="567"></zn-stat>
      <zn-stat caption="Revenue" value="$12,345"></zn-stat>
    </div>

    <h3>Recent Activity</h3>
    <p>New user registration: john.doe@example.com</p>
    <p>Order placed: #12345</p>
    <p>Payment received: $99.99</p>
    <p>Support ticket opened: #456</p>

    <h3>System Status</h3>
    <p>All systems operational</p>
    <p>Last backup: 2025-01-23 02:00 AM</p>
    <p>Uptime: 99.9%</p>
  </zn-pane>
</div>
```


