---
meta:
  title: Empty State
  description: Empty states are used to communicate that there's no content to display and guide users on what to do next.
layout: component
---

```html:preview
<zn-empty-state
  caption="No items found"
  description="There are no items to display at this time."
  type="primary"
  icon="inbox">
</zn-empty-state>
```

Empty states appear when a list, table, or other container has no content to show. They help users understand why content is missing and often provide actions to resolve the empty state.

## Examples

### Basic Empty State

A basic empty state with a caption and description.

```html:preview
<zn-empty-state
  caption="No data available"
  description="Start by adding your first item to see it here."
  icon="data_usage">
</zn-empty-state>
```

### Without Icon

Empty states can be displayed without an icon if you prefer a more minimal look.

```html:preview
<zn-empty-state
  caption="Nothing to show"
  description="Your content will appear here once available.">
</zn-empty-state>
```

### Types

Use the `type` attribute to apply semantic styling to the empty state. Available types are `primary`, `info`, and `error`.

```html:preview
<zn-empty-state
  caption="Primary State"
  description="This is a primary empty state."
  type="primary"
  icon="lightbulb">
</zn-empty-state>
<br />
<zn-empty-state
  caption="Info State"
  description="This provides informational context."
  type="info"
  icon="info">
</zn-empty-state>
<br />
<zn-empty-state
  caption="Error State"
  description="Something went wrong and no content could be loaded."
  type="error"
  icon="error">
</zn-empty-state>
```

### With Action Buttons

Use the default slot to add action buttons that help users resolve the empty state.

```html:preview
<zn-empty-state
  caption="No files uploaded"
  description="Upload your first file to get started."
  icon="cloud_upload">
  <zn-button color="primary">Upload File</zn-button>
</zn-empty-state>
```

### With Multiple Actions

Combine multiple buttons using the button group component for more complex actions.

```html:preview
<zn-empty-state
  caption="No results found"
  description="Try adjusting your search or filter criteria."
  icon="search_off">
  <zn-button-group>
    <zn-button color="primary">Clear Filters</zn-button>
    <zn-button color="secondary">New Search</zn-button>
  </zn-button-group>
</zn-empty-state>
```

### Padded

Use the `padded` attribute to add extra spacing around the empty state content. This is useful when the empty state is displayed within a container that needs additional visual breathing room.

```html:preview
<zn-empty-state
  padded
  type="primary"
  caption="No notifications"
  description="You're all caught up! Check back later for new updates."
  icon="notifications_none">
  <zn-button color="primary">Manage Settings</zn-button>
</zn-empty-state>
```

### Using Slots

Empty states support slots for more flexible content customization. You can use the `caption` and `description` slots to provide rich HTML content.

#### Caption Slot

```html:preview
<zn-empty-state icon="folder_open" type="info">
  <div slot="caption">
    <strong>No Projects Found</strong>
  </div>
  <div slot="description">
    Projects you create will appear here.
  </div>
  <zn-button color="info">Create Project</zn-button>
</zn-empty-state>
```

#### Rich Description Content

```html:preview
<zn-empty-state caption="Welcome!" icon="waving_hand" type="primary">
  <div slot="description">
    <p>Get started by creating your first resource.</p>
    <p>Need help? <a href="#">View documentation</a></p>
  </div>
  <zn-button-group>
    <zn-button color="primary">Get Started</zn-button>
    <zn-button color="secondary">Take Tour</zn-button>
  </zn-button-group>
</zn-empty-state>
```

## Common Use Cases

### No Search Results

```html:preview
<zn-empty-state
  caption="No results match your search"
  description="We couldn't find anything matching your search criteria. Try different keywords or clear your filters."
  icon="search_off"
  type="info">
  <zn-button-group>
    <zn-button color="info">Clear Search</zn-button>
    <zn-button color="secondary">Reset Filters</zn-button>
  </zn-button-group>
</zn-empty-state>
```

### Empty List

```html:preview
<zn-empty-state
  caption="No items yet"
  description="Start building your collection by adding your first item."
  icon="add_circle"
  type="primary">
  <zn-button color="primary" icon="add">Add Item</zn-button>
</zn-empty-state>
```

### Connection Error

```html:preview
<zn-empty-state
  caption="Connection failed"
  description="Unable to load data. Please check your internet connection and try again."
  icon="cloud_off"
  type="error">
  <zn-button-group>
    <zn-button color="error">Retry</zn-button>
    <zn-button color="secondary">Go Back</zn-button>
  </zn-button-group>
</zn-empty-state>
```

### Permission Denied

```html:preview
<zn-empty-state
  caption="Access denied"
  description="You don't have permission to view this content. Contact your administrator for access."
  icon="lock"
  type="error">
  <zn-button color="secondary">Back to Dashboard</zn-button>
</zn-empty-state>
```

### Empty Inbox

```html:preview
<zn-empty-state
  padded
  caption="All clear!"
  description="You have no new messages. Enjoy your day!"
  icon="mark_email_read"
  type="info">
  <zn-button color="info" text>Compose Message</zn-button>
</zn-empty-state>
```

### No Data Available

```html:preview
<zn-empty-state
  caption="No data to display"
  description="Data will appear here once it becomes available. This may take a few moments."
  icon="hourglass_empty"
  type="info">
  <zn-button color="secondary" icon="refresh">Refresh</zn-button>
</zn-empty-state>
```

### First Time User

```html:preview
<zn-empty-state
  padded
  caption="Welcome aboard!"
  description="Let's get you started with a quick tour of the features."
  icon="celebration"
  type="primary">
  <zn-button-group>
    <zn-button color="primary" icon="play_arrow">Start Tour</zn-button>
    <zn-button color="secondary" icon="close">Skip</zn-button>
  </zn-button-group>
</zn-empty-state>
```

### Empty Cart

```html:preview
<zn-empty-state
  caption="Your cart is empty"
  description="Add items to your cart to continue shopping."
  icon="shopping_cart"
  type="primary">
  <zn-button color="primary" icon="storefront">Continue Shopping</zn-button>
</zn-empty-state>
```

### No Favorites

```html:preview
<zn-empty-state
  caption="No favorites yet"
  description="Items you mark as favorites will appear here for quick access."
  icon="favorite_border"
  type="info">
  <zn-button color="info" text icon="explore">Explore Items</zn-button>
</zn-empty-state>
```

### Maintenance Mode

```html:preview
<zn-empty-state
  padded
  caption="Under maintenance"
  description="We're currently performing scheduled maintenance. Please check back shortly."
  icon="construction"
  type="info">
  <zn-button color="secondary" icon="schedule">Check Status</zn-button>
</zn-empty-state>
```

### Deleted Items

```html:preview
<zn-empty-state
  caption="No items in trash"
  description="Deleted items will appear here and can be restored within 30 days."
  icon="delete_outline"
  type="primary">
</zn-empty-state>
```

### Completed Tasks

```html:preview
<zn-empty-state
  padded
  caption="All tasks completed!"
  description="Great job! You've finished all your tasks. Take a break or add new ones."
  icon="task_alt"
  type="info">
  <zn-button-group>
    <zn-button color="info" icon="add">Add Task</zn-button>
    <zn-button color="secondary" text>View Completed</zn-button>
  </zn-button-group>
</zn-empty-state>
```

## Best Practices

### Helpful Icons

Choose icons that clearly communicate the empty state's context. For example, use `inbox` for empty inboxes, `search_off` for no search results, and `cloud_off` for connection errors.

```html:preview
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
  <zn-empty-state caption="No messages" description="Your inbox is empty." icon="inbox"></zn-empty-state>
  <zn-empty-state caption="Search failed" description="No results found." icon="search_off"></zn-empty-state>
  <zn-empty-state caption="Offline" description="No connection." icon="cloud_off" type="error"></zn-empty-state>
</div>
```

### Clear Actions

Always provide clear next steps when possible. Tell users what they can do to resolve the empty state.

```html:preview
<zn-empty-state
  caption="No team members"
  description="Invite team members to start collaborating on projects together."
  icon="group_add"
  type="primary">
  <zn-button color="primary" icon="person_add">Invite Team Member</zn-button>
</zn-empty-state>
```

### Appropriate Tone

Match the tone of your message to the context. Celebratory for completed tasks, helpful for new users, and informative for errors.

```html:preview
<zn-empty-state
  padded
  caption="You're a star!"
  description="All invoices are paid and up to date. Keep up the great work!"
  icon="stars"
  type="info">
</zn-empty-state>
```

