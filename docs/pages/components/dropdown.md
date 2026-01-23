---
meta:
  title: Dropdown
  description: Dropdowns display a popup containing a menu or other content when triggered by a button or element.
layout: component
---

Dropdowns consist of a trigger and a panel. By default, activating the trigger will expose the panel and interacting outside of the panel will close it.

Dropdowns are designed to work with menus and menu items, but they can contain any content. They also provide methods to programmatically show and hide the panel.

```html:preview
<zn-dropdown>
  <zn-button slot="trigger" icon="more_vert"></zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Duplicate</zn-menu-item>
    <zn-menu-item>Archive</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>
```

## Examples

### Getting the Dropdown to Close

By default, dropdowns close when you select a menu item in the dropdown's panel. To change this behavior, set the `stay-open-on-select` attribute to prevent the dropdown from closing when menu selections are made.

```html:preview
<zn-dropdown stay-open-on-select>
  <zn-button slot="trigger">Settings</zn-button>
  <zn-menu>
    <zn-menu-item>Notifications</zn-menu-item>
    <zn-menu-item>Privacy</zn-menu-item>
    <zn-menu-item>Security</zn-menu-item>
  </zn-menu>
</zn-dropdown>
```

### Placement

The preferred placement of the dropdown can be set with the `placement` attribute. Note that the actual position may vary to ensure the panel remains in the viewport if you're using positioning features such as `flip` and `shift`.

```html:preview
<zn-dropdown placement="top-start">
  <zn-button slot="trigger">Top Start</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<zn-dropdown placement="top">
  <zn-button slot="trigger">Top</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<zn-dropdown placement="top-end">
  <zn-button slot="trigger">Top End</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<br><br>

<zn-dropdown placement="bottom-start">
  <zn-button slot="trigger">Bottom Start</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<zn-dropdown placement="bottom">
  <zn-button slot="trigger">Bottom</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<zn-dropdown placement="bottom-end">
  <zn-button slot="trigger">Bottom End</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<br><br>

<zn-dropdown placement="left-start">
  <zn-button slot="trigger">Left Start</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<zn-dropdown placement="left">
  <zn-button slot="trigger">Left</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<zn-dropdown placement="left-end">
  <zn-button slot="trigger">Left End</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<br><br>

<zn-dropdown placement="right-start">
  <zn-button slot="trigger">Right Start</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<zn-dropdown placement="right">
  <zn-button slot="trigger">Right</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<zn-dropdown placement="right-end">
  <zn-button slot="trigger">Right End</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>
```

### Distance

Use the `distance` attribute to change how far the dropdown panel is from the trigger. This value is specified in pixels.

```html:preview
<zn-dropdown distance="20">
  <zn-button slot="trigger">Distance 20px</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<zn-dropdown distance="50">
  <zn-button slot="trigger">Distance 50px</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>
```

### Skidding

Use the `skidding` attribute to move the dropdown panel along the trigger. This value is specified in pixels.

```html:preview
<zn-dropdown skidding="30">
  <zn-button slot="trigger">Skidding 30px</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<zn-dropdown skidding="-30">
  <zn-button slot="trigger">Skidding -30px</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>
```

### Hoisting

Dropdown panels will be clipped if they're inside a container that has `overflow: auto|hidden|scroll`. The `hoist` attribute forces the panel to use a fixed positioning strategy, allowing it to break out of the container. In this case, the panel will be positioned relative to its containing block, which is usually the viewport unless an ancestor uses a `transform`, `perspective`, or `filter`.

The `hoist` attribute is enabled by default to prevent clipping issues.

```html:preview
<div style="overflow: hidden; border: solid 1px var(--zn-color-neutral-200); padding: 1rem; position: relative;">
  <zn-dropdown hoist>
    <zn-button slot="trigger">Hoisted (Default)</zn-button>
    <zn-menu>
      <zn-menu-item>Edit</zn-menu-item>
      <zn-menu-item>Delete</zn-menu-item>
    </zn-menu>
  </zn-dropdown>

  <zn-dropdown hoist="false">
    <zn-button slot="trigger">Not Hoisted</zn-button>
    <zn-menu>
      <zn-menu-item>Edit</zn-menu-item>
      <zn-menu-item>Delete</zn-menu-item>
    </zn-menu>
  </zn-dropdown>
</div>
```

### Syncing Width or Height

Use the `sync` attribute to make the dropdown panel match the width or height of the trigger element. This is useful when you want the panel to be the same size as the trigger.

```html:preview
<zn-dropdown sync="width">
  <zn-button slot="trigger" style="width: 200px;">Sync Width</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
    <zn-menu-item>Archive</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<zn-dropdown sync="height">
  <zn-button slot="trigger" style="height: 100px;">Sync Height</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<zn-dropdown sync="both">
  <zn-button slot="trigger" style="width: 200px; height: 100px;">Sync Both</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>
```

### Disabled

Use the `disabled` attribute to disable the dropdown so the panel will not open.

```html:preview
<zn-dropdown disabled>
  <zn-button slot="trigger">Disabled</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>
```

### Custom Trigger

Any element can be used as a trigger by placing it in the `trigger` slot. The trigger should be a focusable element like a button or link.

```html:preview
<zn-dropdown>
  <a href="#" slot="trigger" onclick="event.preventDefault()">
    Click to open
  </a>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>
```

### Non-Menu Content

Dropdowns can contain any content, not just menus. Use the default slot to add custom content to the dropdown panel.

```html:preview
<zn-dropdown>
  <zn-button slot="trigger">User Profile</zn-button>
  <div style="padding: 1rem;">
    <h3 style="margin-top: 0;">John Doe</h3>
    <p style="margin-bottom: 0;">john.doe@example.com</p>
  </div>
</zn-dropdown>
```

### Programmatic Control

You can use the `show()` and `hide()` methods to programmatically open and close the dropdown. You can also check the `open` property to determine if the dropdown is currently open.

```html:preview
<zn-dropdown id="dropdown-programmatic">
  <zn-button slot="trigger">Dropdown</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<br><br>

<zn-button onclick="document.getElementById('dropdown-programmatic').show()">Show</zn-button>
<zn-button onclick="document.getElementById('dropdown-programmatic').hide()">Hide</zn-button>

<script>
  const dropdown = document.getElementById('dropdown-programmatic');
  dropdown.addEventListener('zn-show', () => console.log('Dropdown opened'));
  dropdown.addEventListener('zn-hide', () => console.log('Dropdown closed'));
</script>
```

### Keyboard Navigation

When focused on the trigger, the following keyboard interactions are available:

- **Space/Enter** - Opens the dropdown and focuses the first menu item
- **Arrow Down** - Opens the dropdown and focuses the first menu item
- **Arrow Up** - Opens the dropdown and focuses the last menu item
- **Home** - Opens the dropdown and focuses the first menu item
- **End** - Opens the dropdown and focuses the last menu item

When the dropdown is open:

- **Escape** - Closes the dropdown and returns focus to the trigger
- **Tab** - Closes the dropdown and returns focus to the trigger
- **Arrow Down** - Moves focus to the next menu item
- **Arrow Up** - Moves focus to the previous menu item

### Remote Content

The dropdown supports loading content from a remote source using the `uri` attribute. The content will be preloaded when the user hovers over or focuses on the trigger.

```html:preview
<zn-dropdown uri="/api/menu-content">
  <zn-button slot="trigger">Load Remote Content</zn-button>
</zn-dropdown>
```

### Events

The dropdown emits several events that you can listen to:

- `zn-show` - Emitted when the dropdown is about to open
- `zn-after-show` - Emitted after the dropdown has opened and all animations are complete
- `zn-hide` - Emitted when the dropdown is about to close
- `zn-after-hide` - Emitted after the dropdown has closed and all animations are complete
- `zn-select` - Emitted when a menu item is selected (bubbles up from the menu)

```html:preview
<zn-dropdown id="dropdown-events">
  <zn-button slot="trigger">Open Dropdown</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<div id="event-log" style="margin-top: 1rem; padding: 1rem; background: var(--zn-color-neutral-100); border-radius: 4px;">
  Event log:
</div>

<script>
  const dropdown = document.getElementById('dropdown-events');
  const eventLog = document.getElementById('event-log');

  ['zn-show', 'zn-after-show', 'zn-hide', 'zn-after-hide'].forEach(eventName => {
    dropdown.addEventListener(eventName, () => {
      const log = document.createElement('div');
      log.textContent = `${eventName} event fired`;
      eventLog.appendChild(log);
    });
  });
</script>
```

