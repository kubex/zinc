---
meta:
  title: Collapsible
  description: Collapsibles toggle between showing and hiding content when clicked, useful for organizing information in a compact, expandable format.
layout: component
---

Collapsibles provide an interactive way to show and hide content. They're ideal for accordion-style interfaces, settings panels, and any scenario where you need to progressively disclose information.

```html:preview
<zn-collapsible caption="Basic Collapsible"
                description="Click to expand and view the content"
                label="Optional Label">
  <p>This is the collapsible content that can be toggled on and off.</p>
  <zn-button>Action Button</zn-button>
</zn-collapsible>
```

## Examples

### Basic Usage

A simple collapsible with caption and description. Click anywhere on the header to expand or collapse.

```html:preview
<zn-collapsible caption="Click to expand"
                description="Additional description text">
  <p>This content is hidden by default and revealed when you click the header.</p>
</zn-collapsible>
```

### Expanded State

Use the `expanded` attribute to show the collapsible in its open state by default.

```html:preview
<zn-collapsible caption="Already Expanded"
                description="This collapsible starts in the open state"
                expanded>
  <p>This content is visible by default because the expanded attribute is set.</p>
  <zn-button>Click Me</zn-button>
</zn-collapsible>
```

### Default State

Use the `default` attribute to set the initial state. This is useful when you want to control the default behavior without directly manipulating the `expanded` property.

```html:preview
<zn-collapsible caption="Default Open"
                description="Using the default attribute for initial state"
                default="open">
  <p>This collapsible opens by default using the 'default' attribute.</p>
</zn-collapsible>

<br />

<zn-collapsible caption="Default Closed"
                description="This is the default behavior"
                default="closed">
  <p>This collapsible starts closed (default behavior).</p>
</zn-collapsible>
```

### With Label

Use the `label` attribute to add a label on the right side of the header.

```html:preview
<zn-collapsible caption="Section Title"
                description="Optional description"
                label="v2.0">
  <p>Labels are useful for displaying version numbers, status, or other metadata.</p>
</zn-collapsible>
```

### Item Counter

Use the `show-number` attribute to display a count of items within the collapsible. The count appears as a chip when the collapsible is closed.

```html:preview
<zn-collapsible caption="Team Members"
                description="View all team members"
                show-number>
  <div>Alice Johnson</div>
  <div>Bob Smith</div>
  <div>Carol Williams</div>
  <div>David Brown</div>
</zn-collapsible>
```

### Custom Element Counter

Use the `count-element` attribute to count specific elements instead of all children. This is useful when you have complex content structures.

```html:preview
<zn-collapsible caption="Active Users"
                description="Users currently online"
                show-number
                count-element="zn-chip">
  <div>
    <zn-chip>User 1</zn-chip>
    <zn-chip>User 2</zn-chip>
    <zn-chip>User 3</zn-chip>
  </div>
  <p>Additional content that won't be counted</p>
</zn-collapsible>
```

### Flush Content

Use the `flush` attribute to remove the left padding/margin from the content area, making it align with the edges.

```html:preview
<zn-collapsible caption="Flush Content"
                description="No left padding on content"
                flush>
  <zn-button>This button aligns with the left edge</zn-button>
  <p>Content starts at the container edge</p>
</zn-collapsible>
```

### Custom Header Slot

Use the `header` slot to completely customize the header appearance and behavior.

```html:preview
<zn-collapsible>
  <div slot="header" style="padding: 1rem; background: var(--zn-color-primary-50); display: flex; justify-content: space-between; align-items: center;">
    <strong>Custom Header Design</strong>
    <zn-icon src="expand_more" class="expand"></zn-icon>
  </div>
  <p>When you provide a custom header, you have full control over its appearance.</p>
</zn-collapsible>
```

### Custom Caption Slot

Use the `caption` slot to add custom content to the caption area, such as icons, badges, or toggles.

```html:preview
<zn-collapsible>
  <div slot="caption" style="display: flex; align-items: center; gap: 0.5rem;">
    <zn-icon src="settings"></zn-icon>
    <span>Settings Section</span>
    <zn-chip size="small" type="info">New</zn-chip>
  </div>
  <p>The caption slot allows you to add custom elements to the title area.</p>
</zn-collapsible>
```

### With Toggle Controls

Integrate toggles into the caption slot to create settings panels. The collapsible automatically detects toggles and adjusts the UI accordingly.

```html:preview
<zn-collapsible caption="Notification Settings">
  <div class="flex-mid" slot="caption">
    <div class="grow zn-pr">Email Notifications</div>
    <zn-toggle name="email-enabled"></zn-toggle>
  </div>
  <div style="padding: 1rem;">
    <zn-toggle name="marketing" size="medium">Marketing emails</zn-toggle>
    <br />
    <zn-toggle name="updates" size="medium" checked>Product updates</zn-toggle>
    <br />
    <zn-toggle name="alerts" size="medium" checked>Security alerts</zn-toggle>
  </div>
</zn-collapsible>
```

### Permission Panel Example

A practical example showing how to build a permission management interface.

```html:preview
<zn-collapsible>
  <div class="flex-mid" slot="caption">
    <div class="grow zn-pr">Billing Permissions</div>
    <zn-toggle name="billing-enabled" checked></zn-toggle>
  </div>

  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--zn-color-neutral-200);">
      <div>
        <strong>View Invoices</strong>
        <div style="font-size: 0.875rem; color: var(--zn-color-neutral-600);">
          Can view all billing invoices
        </div>
      </div>
      <zn-toggle name="view-invoices" size="medium" checked></zn-toggle>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--zn-color-neutral-200);">
      <div>
        <strong>Manage Payment Methods</strong>
        <div style="font-size: 0.875rem; color: var(--zn-color-neutral-600);">
          Can add or remove payment methods
        </div>
      </div>
      <zn-toggle name="manage-payments" size="medium"></zn-toggle>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem;">
      <div>
        <strong>Process Refunds</strong>
        <div style="font-size: 0.875rem; color: var(--zn-color-neutral-600);">
          Can issue refunds to customers
        </div>
      </div>
      <zn-toggle name="process-refunds" size="medium"></zn-toggle>
    </div>
  </div>
</zn-collapsible>
```

### State Persistence with Session Storage

The collapsible can remember its state across page loads using session or local storage with the `store-key` attribute.

```html:preview
<zn-collapsible caption="Preferences"
                description="State saved in session storage"
                store-key="user-preferences">
  <p>This collapsible's state will persist during your browser session.</p>
  <p>Try expanding or collapsing it, then refresh the page.</p>
</zn-collapsible>
```

### State Persistence with Local Storage

Use the `local-storage` attribute to persist state permanently across browser sessions.

```html:preview
<zn-collapsible caption="Advanced Settings"
                description="State saved permanently"
                store-key="advanced-settings"
                local-storage>
  <p>This collapsible's state persists even after closing the browser.</p>
  <p>The state is stored in localStorage instead of sessionStorage.</p>
</zn-collapsible>
```

### Storage with TTL

Use the `store-ttl` attribute to set a time-to-live (in seconds) for the stored state.

```html:preview
<zn-collapsible caption="Temporary State"
                description="State expires after 60 seconds"
                store-key="temporary-state"
                store-ttl="60">
  <p>This collapsible's state will be remembered for 60 seconds.</p>
  <p>After that, it will revert to the default closed state.</p>
</zn-collapsible>
```

### Accordion Pattern

Create an accordion by grouping multiple collapsibles together.

```html:preview
<div style="border: 1px solid var(--zn-color-neutral-200); border-radius: 4px; overflow: hidden;">
  <zn-collapsible caption="Section 1"
                  description="First section details"
                  default="open">
    <p>Content for section 1.</p>
  </zn-collapsible>

  <zn-collapsible caption="Section 2"
                  description="Second section details">
    <p>Content for section 2.</p>
  </zn-collapsible>

  <zn-collapsible caption="Section 3"
                  description="Third section details">
    <p>Content for section 3.</p>
  </zn-collapsible>
</div>
```

### Nested Collapsibles

Collapsibles can be nested to create hierarchical content structures.

```html:preview
<zn-collapsible caption="Parent Section" expanded>
  <p>This is the parent content.</p>

  <zn-collapsible caption="Child Section 1" flush>
    <p>Nested collapsible content 1</p>
  </zn-collapsible>

  <zn-collapsible caption="Child Section 2" flush>
    <p>Nested collapsible content 2</p>
  </zn-collapsible>
</zn-collapsible>
```

### Programmatic Control

You can control the collapsible programmatically by setting the `expanded` property.

```html:preview
<zn-collapsible id="programmatic-collapsible"
                caption="Programmatic Control"
                description="Control via JavaScript">
  <p>This collapsible can be controlled programmatically.</p>
</zn-collapsible>

<br />

<zn-button id="expand-btn">Expand</zn-button>
<zn-button id="collapse-btn" color="secondary">Collapse</zn-button>
<zn-button id="toggle-btn" color="info">Toggle</zn-button>

<script type="module">
  const collapsible = document.getElementById('programmatic-collapsible');

  document.getElementById('expand-btn').addEventListener('click', () => {
    collapsible.expanded = true;
  });

  document.getElementById('collapse-btn').addEventListener('click', () => {
    collapsible.expanded = false;
  });

  document.getElementById('toggle-btn').addEventListener('click', () => {
    collapsible.expanded = !collapsible.expanded;
  });
</script>
```

### State Change Detection

Monitor the collapsible's state changes using property observation or mutation observers.

```html:preview
<zn-collapsible id="state-monitor"
                caption="State Monitor"
                description="Watch for state changes">
  <p>Click the header to expand or collapse.</p>
</zn-collapsible>

<div id="state-output" style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
  <strong>State:</strong> <span id="state-text">Collapsed</span>
</div>

<script type="module">
  const collapsible = document.getElementById('state-monitor');
  const stateText = document.getElementById('state-text');

  // Use a MutationObserver to watch for attribute changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'expanded') {
        const isExpanded = collapsible.hasAttribute('expanded');
        stateText.textContent = isExpanded ? 'Expanded' : 'Collapsed';
        stateText.style.color = isExpanded ? 'var(--zn-color-success)' : 'var(--zn-color-neutral-600)';
      }
    });
  });

  observer.observe(collapsible, { attributes: true });
</script>
```

### Methods

The collapsible provides a public method for recalculating item counts:

- `recalculateNumberOfItems()` - Recalculates the number of items when using `show-number`. Useful when content is dynamically updated.

```html:preview
<zn-collapsible id="dynamic-collapsible"
                caption="Dynamic Items"
                description="Items can be added dynamically"
                show-number>
  <div id="item-container">
    <div>Item 1</div>
  </div>
</zn-collapsible>

<br />

<zn-button id="add-item-btn">Add Item</zn-button>

<script type="module">
  const collapsible = document.getElementById('dynamic-collapsible');
  const container = document.getElementById('item-container');
  let itemCount = 1;

  document.getElementById('add-item-btn').addEventListener('click', () => {
    itemCount++;
    const newItem = document.createElement('div');
    newItem.textContent = `Item ${itemCount}`;
    container.appendChild(newItem);

    // Manually trigger recalculation
    collapsible.recalculateNumberOfItems();
  });
</script>
```

### Complete Example

A comprehensive example demonstrating multiple features together.

```html:preview
<div style="max-width: 600px;">
  <zn-collapsible
    caption="User Profile Settings"
    description="Manage your profile preferences"
    label="Required"
    show-number
    count-element="zn-toggle"
    store-key="profile-settings"
    local-storage>

    <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem;">
      <div>
        <h4 style="margin: 0 0 0.5rem 0;">Privacy Settings</h4>
        <zn-toggle name="profile-public" checked>Make profile public</zn-toggle>
        <zn-toggle name="show-email">Show email address</zn-toggle>
        <zn-toggle name="show-phone">Show phone number</zn-toggle>
      </div>

      <div>
        <h4 style="margin: 0 0 0.5rem 0;">Notification Preferences</h4>
        <zn-toggle name="email-notifications" checked>Email notifications</zn-toggle>
        <zn-toggle name="sms-notifications">SMS notifications</zn-toggle>
        <zn-toggle name="push-notifications" checked>Push notifications</zn-toggle>
      </div>

      <zn-button color="primary">Save Changes</zn-button>
    </div>
  </zn-collapsible>
</div>
```
