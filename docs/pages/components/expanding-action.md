---
meta:
  title: Expanding Action
  description: An expandable action button component that reveals content either in a dropdown panel or inline. Supports dynamic content loading, notification badges, and two display methods - drop and fill.
layout: component
---

```html:preview
<zn-expanding-action icon="new_label"
                     method="fill"
                     prefetch>
  This is the content here, this will probably be loaded from one of the URIs.
  if count uri is set, use that to retrieve the number to display as a notification
  if prefetch is set, we need to load the uri which should have the count with it.
</zn-expanding-action>
```

## Examples

### Drop Method

Use the `method="drop"` to display content in a dropdown panel when the icon is clicked.

```html:preview
<zn-expanding-action icon="notifications"
                     method="drop">
  <div style="padding: 15px; min-width: 250px;">
    <h4>Notifications</h4>
    <p>You have 3 new messages</p>
    <p>2 tasks are due today</p>
  </div>
</zn-expanding-action>
```

### Fill Method

Use the `method="fill"` to display content inline, expanding horizontally.

```html:preview
<zn-expanding-action icon="add"
                     method="fill">
  <div style="padding: 10px;">
    <p>This content expands inline when clicked</p>
  </div>
</zn-expanding-action>
```

### With Notification Count

Display a notification badge using the `count` attribute.

```html:preview
<zn-expanding-action icon="mail"
                     method="drop"
                     count="5">
  <div style="padding: 15px; min-width: 250px;">
    <h4>Inbox</h4>
    <p>You have 5 unread messages</p>
  </div>
</zn-expanding-action>
```

### With Custom Color

Set the icon color using the `color` attribute.

```html:preview
<zn-expanding-action icon="warning"
                     method="drop"
                     color="warning"
                     count="2">
  <div style="padding: 15px; min-width: 250px;">
    <h4>Warnings</h4>
    <p>2 items require your attention</p>
  </div>
</zn-expanding-action>
```

### Custom Width

Control the dropdown width using the `basis` attribute (for drop method).

```html:preview
<zn-expanding-action icon="menu"
                     method="drop"
                     basis="400">
  <div style="padding: 15px;">
    <h4>Wide Panel</h4>
    <p>This panel is wider than the default 300px</p>
  </div>
</zn-expanding-action>
```

### Custom Max Height

Limit the content height using the `max-height` attribute.

```html:preview
<zn-expanding-action icon="list"
                     method="drop"
                     max-height="200">
  <div style="padding: 15px;">
    <h4>Scrollable Content</h4>
    <p>Item 1</p>
    <p>Item 2</p>
    <p>Item 3</p>
    <p>Item 4</p>
    <p>Item 5</p>
    <p>Item 6</p>
    <p>Item 7</p>
    <p>Item 8</p>
  </div>
</zn-expanding-action>
```

### Multiple Expanding Actions

Use multiple expanding actions together.

```html:preview
<div style="display: flex; gap: 10px;">
  <zn-expanding-action icon="notifications"
                       method="drop"
                       count="3">
    <div style="padding: 15px; min-width: 250px;">
      <h4>Notifications</h4>
      <p>3 new updates</p>
    </div>
  </zn-expanding-action>

  <zn-expanding-action icon="mail"
                       method="drop"
                       count="7">
    <div style="padding: 15px; min-width: 250px;">
      <h4>Messages</h4>
      <p>7 unread messages</p>
    </div>
  </zn-expanding-action>

  <zn-expanding-action icon="settings"
                       method="drop">
    <div style="padding: 15px; min-width: 200px;">
      <h4>Settings</h4>
      <p>Configure your preferences</p>
    </div>
  </zn-expanding-action>
</div>
```

### In Action Bar

Use expanding actions within an action bar for navigation.

```html:preview
<zn-action-bar>
  <zn-dropdown distance="5" slot="menu">
    <zn-button slot="trigger" color="transparent" icon-position="right" icon="arrow_drop_down">
      Dashboard
    </zn-button>
    <zn-menu>
      <zn-menu-item>Overview</zn-menu-item>
      <zn-menu-item>Analytics</zn-menu-item>
    </zn-menu>
  </zn-dropdown>

  <zn-expanding-action icon="edit_note"
                       method="drop"
                       count="2"
                       slot="actions">
    <div style="padding: 15px; min-width: 250px;">
      <h4>Notes</h4>
      <p>2 draft notes</p>
    </div>
  </zn-expanding-action>

  <zn-expanding-action icon="notifications"
                       method="drop"
                       count="5"
                       slot="actions">
    <div style="padding: 15px; min-width: 250px;">
      <h4>Alerts</h4>
      <p>5 new notifications</p>
    </div>
  </zn-expanding-action>
</zn-action-bar>
```

### With Form Content

Include form elements within the expanding action.

```html:preview
<zn-expanding-action icon="add_circle"
                     method="drop"
                     basis="350">
  <div style="padding: 15px;">
    <h4>Quick Add</h4>
    <form class="form-spacing">
      <zn-input label="Title" required></zn-input>
      <zn-textarea label="Description"></zn-textarea>
      <zn-button type="submit" color="success">Add</zn-button>
    </form>
  </div>
</zn-expanding-action>
```

### Nested in Defined Label

Combine with other components like defined-label.

```html:preview
<zn-expanding-action icon="label"
                     method="fill"
                     basis="400">
  <zn-defined-label
    allow-custom
    predefined-labels="[{&quot;name&quot;:&quot;priority&quot;,&quot;options&quot;:[&quot;low&quot;,&quot;medium&quot;,&quot;high&quot;]},{&quot;name&quot;:&quot;status&quot;,&quot;options&quot;:[&quot;open&quot;,&quot;closed&quot;]}]">
  </zn-defined-label>
</zn-expanding-action>
```

### User Profile Menu

A practical example for a user profile dropdown.

```html:preview
<zn-expanding-action icon="account_circle"
                     method="drop"
                     basis="250">
  <div style="padding: 15px;">
    <h4>John Doe</h4>
    <p style="color: var(--zn-color-neutral-500); margin: 0;">john@example.com</p>
    <hr style="margin: 10px 0;">
    <zn-button text color="transparent" style="width: 100%; justify-content: flex-start;">Profile</zn-button>
    <zn-button text color="transparent" style="width: 100%; justify-content: flex-start;">Settings</zn-button>
    <zn-button text color="transparent" style="width: 100%; justify-content: flex-start;">Logout</zn-button>
  </div>
</zn-expanding-action>
```