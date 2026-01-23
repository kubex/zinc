---
meta:
  title: Action Bar
  description: A horizontal container component that organizes menus on the left and action buttons on the right, commonly used for navigation and quick actions.
layout: component
---

```html:preview

<zn-action-bar>

  <zn-dropdown distance="5" slot="menu">
    <zn-button slot="trigger" color="transparent" icon-position="right" icon="arrow_drop_down">Category 1
    </zn-button>
    <zn-menu>
      <zn-menu-item>Item 1</zn-menu-item>
      <zn-menu-item>Item 2</zn-menu-item>
    </zn-menu>
  </zn-dropdown>

  <zn-dropdown distance="5" slot="menu">
    <zn-button slot="trigger" color="transparent" icon-position="right" icon="arrow_drop_down">Category 2
    </zn-button>
    <zn-menu>
      <zn-menu-item>Item 1</zn-menu-item>
      <zn-menu-item>Item 2</zn-menu-item>
    </zn-menu>
  </zn-dropdown>

  <zn-expanding-action icon="edit_note"
                       method="fill"
                       count-uri="/note/count"
                       slot="actions"
                       prefetch>
    Hello there
  </zn-expanding-action>

  <zn-expanding-action icon="new_label"
                       content-uri="/test"
                       method="drop"
                       slot="actions">
    <p>This is the content here, this will probably be loaded from one of the URIs.</p>
    <p>if count uri is set, use that to retrieve the number to display as a notification
      if prefetch is set, we need to lod the uri which should have the count with it.</p>
  </zn-expanding-action>

</zn-action-bar>
```

## Examples

### Simple Menu Bar

Use the action bar to create a simple navigation menu with dropdown categories.

```html:preview
<zn-action-bar>
  <zn-dropdown distance="5" slot="menu">
    <zn-button slot="trigger" color="transparent" icon-position="right" icon="arrow_drop_down">
      File
    </zn-button>
    <zn-menu>
      <zn-menu-item>New</zn-menu-item>
      <zn-menu-item>Open</zn-menu-item>
      <zn-menu-item>Save</zn-menu-item>
      <zn-menu-item>Close</zn-menu-item>
    </zn-menu>
  </zn-dropdown>

  <zn-dropdown distance="5" slot="menu">
    <zn-button slot="trigger" color="transparent" icon-position="right" icon="arrow_drop_down">
      Edit
    </zn-button>
    <zn-menu>
      <zn-menu-item>Cut</zn-menu-item>
      <zn-menu-item>Copy</zn-menu-item>
      <zn-menu-item>Paste</zn-menu-item>
    </zn-menu>
  </zn-dropdown>

  <zn-dropdown distance="5" slot="menu">
    <zn-button slot="trigger" color="transparent" icon-position="right" icon="arrow_drop_down">
      View
    </zn-button>
    <zn-menu>
      <zn-menu-item>Zoom In</zn-menu-item>
      <zn-menu-item>Zoom Out</zn-menu-item>
      <zn-menu-item>Full Screen</zn-menu-item>
    </zn-menu>
  </zn-dropdown>
</zn-action-bar>
```

### Action Bar with Quick Actions

Combine menu dropdowns with action buttons on the right side.

```html:preview
<zn-action-bar>
  <zn-dropdown distance="5" slot="menu">
    <zn-button slot="trigger" color="transparent" icon-position="right" icon="arrow_drop_down">
      Dashboard
    </zn-button>
    <zn-menu>
      <zn-menu-item>Overview</zn-menu-item>
      <zn-menu-item>Analytics</zn-menu-item>
      <zn-menu-item>Reports</zn-menu-item>
    </zn-menu>
  </zn-dropdown>

  <zn-button slot="actions" icon="search" color="transparent"></zn-button>
  <zn-button slot="actions" icon="notifications" color="transparent" notification="3"></zn-button>
  <zn-button slot="actions" icon="settings" color="transparent"></zn-button>
</zn-action-bar>
```

### Action Bar with Icon-Only Actions

Use icon-only buttons for a cleaner, more compact appearance.

```html:preview
<zn-action-bar>
  <zn-dropdown distance="5" slot="menu">
    <zn-button slot="trigger" color="transparent" icon-position="right" icon="arrow_drop_down">
      Projects
    </zn-button>
    <zn-menu>
      <zn-menu-item>My Projects</zn-menu-item>
      <zn-menu-item>Shared Projects</zn-menu-item>
      <zn-menu-item>Archived Projects</zn-menu-item>
    </zn-menu>
  </zn-dropdown>

  <zn-button slot="actions" icon="add" color="success"></zn-button>
  <zn-button slot="actions" icon="filter_alt" color="transparent"></zn-button>
  <zn-button slot="actions" icon="more_vert" color="transparent"></zn-button>
</zn-action-bar>
```

### Mixed Content

Combine multiple menu items and various action types for complex interfaces.

```html:preview
<zn-action-bar>
  <zn-dropdown distance="5" slot="menu">
    <zn-button slot="trigger" color="transparent" icon-position="right" icon="arrow_drop_down">
      Tickets
    </zn-button>
    <zn-menu>
      <zn-menu-item>All Tickets</zn-menu-item>
      <zn-menu-item>My Tickets</zn-menu-item>
      <zn-menu-item>Unassigned</zn-menu-item>
      <zn-menu-item>Closed</zn-menu-item>
    </zn-menu>
  </zn-dropdown>

  <zn-dropdown distance="5" slot="menu">
    <zn-button slot="trigger" color="transparent" icon-position="right" icon="arrow_drop_down">
      Customers
    </zn-button>
    <zn-menu>
      <zn-menu-item>All Customers</zn-menu-item>
      <zn-menu-item>Active</zn-menu-item>
      <zn-menu-item>Inactive</zn-menu-item>
    </zn-menu>
  </zn-dropdown>

  <zn-button slot="actions" icon="add_circle" color="success">New Ticket</zn-button>
  <zn-button slot="actions" icon="refresh" color="transparent"></zn-button>
  <zn-button slot="actions" icon="help" color="transparent"></zn-button>
</zn-action-bar>
```
