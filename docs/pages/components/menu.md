---
meta:
  title: Menu
  description: Menus provide a list of options for the user to choose from.
layout: component
---

```html:preview
<zn-menu>
  <zn-menu-item>Menu Item 1</zn-menu-item>
  <zn-menu-item>Menu Item 2</zn-menu-item>
  <zn-menu-item>Menu Item 3</zn-menu-item>
  <zn-menu-item>Menu Item 4</zn-menu-item>
  <zn-menu-item>
    Menu Item 5
    <zn-menu slot="submenu">
      <zn-menu-item value="find">One</zn-menu-item>
      <zn-menu-item value="find-previous">Two</zn-menu-item>
      <zn-menu-item value="find-next">Three</zn-menu-item>
    </zn-menu>
  </zn-menu-item>
</zn-menu>
```

Menus are typically used in combination with dropdowns to display a list of actions or options. They support keyboard navigation, submenus, icons, checkboxes, disabled items, and more.

## Examples

### Basic Menu

A basic menu with simple text items.

```html:preview
<zn-menu>
  <zn-menu-item>Cut</zn-menu-item>
  <zn-menu-item>Copy</zn-menu-item>
  <zn-menu-item>Paste</zn-menu-item>
</zn-menu>
```

### Menu with Dropdown

Menus are commonly used inside dropdowns to create action menus or context menus.

```html:preview
<zn-dropdown placement="bottom-start">
  <zn-button slot="trigger" caret>Actions</zn-button>
  <zn-menu>
    <zn-menu-item>Edit</zn-menu-item>
    <zn-menu-item>Duplicate</zn-menu-item>
    <zn-menu-item>Archive</zn-menu-item>
    <zn-menu-item>Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>
```

### Menu Items with Icons

Use the `prefix` slot to add icons to menu items.

```html:preview
<zn-menu>
  <zn-menu-item>
    <zn-icon slot="prefix" src="edit" size="20"></zn-icon>
    Edit
  </zn-menu-item>
  <zn-menu-item>
    <zn-icon slot="prefix" src="content_copy" size="20"></zn-icon>
    Copy
  </zn-menu-item>
  <zn-menu-item>
    <zn-icon slot="prefix" src="content_paste" size="20"></zn-icon>
    Paste
  </zn-menu-item>
  <zn-menu-item>
    <zn-icon slot="prefix" src="delete" size="20"></zn-icon>
    Delete
  </zn-menu-item>
</zn-menu>
```

### Menu Items with Value

Use the `value` attribute to associate a value with each menu item. This is useful for identifying which item was selected.

```html:preview
<zn-dropdown placement="bottom-start">
  <zn-button slot="trigger" caret>Select Action</zn-button>
  <zn-menu id="value-menu">
    <zn-menu-item value="edit">Edit</zn-menu-item>
    <zn-menu-item value="copy">Copy</zn-menu-item>
    <zn-menu-item value="delete">Delete</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<div id="value-output" style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
  <strong>Last selected:</strong> <span id="selected-value">None</span>
</div>

<script type="module">
  const menu = document.querySelector('#value-menu');
  const output = document.querySelector('#selected-value');

  menu.addEventListener('zn-select', (event) => {
    output.textContent = event.detail.item.value;
  });
</script>
```

### Disabled Menu Items

Use the `disabled` attribute to disable menu items.

```html:preview
<zn-menu>
  <zn-menu-item>Enabled Item</zn-menu-item>
  <zn-menu-item disabled>Disabled Item</zn-menu-item>
  <zn-menu-item>Another Enabled Item</zn-menu-item>
  <zn-menu-item disabled>Another Disabled Item</zn-menu-item>
</zn-menu>
```

### Checkbox Menu Items

Use `type="checkbox"` to create checkbox menu items. Use the `checked` attribute to set the initial state.

```html:preview
<zn-menu id="checkbox-menu">
  <zn-menu-item type="checkbox" checked>Bold</zn-menu-item>
  <zn-menu-item type="checkbox">Italic</zn-menu-item>
  <zn-menu-item type="checkbox">Underline</zn-menu-item>
  <zn-menu-item type="checkbox" checked>Strikethrough</zn-menu-item>
</zn-menu>

<script type="module">
  const menu = document.querySelector('#checkbox-menu');

  menu.addEventListener('zn-select', (event) => {
    const item = event.detail.item;
    console.log(`${item.getTextLabel()}: ${item.checked ? 'checked' : 'unchecked'}`);
  });
</script>
```

### Checkbox Position

Use the `checked-position` attribute to control where the checkbox icon appears. The default is `left`, but you can set it to `right`.

```html:preview
<zn-menu>
  <zn-menu-item type="checkbox" checked checked-position="left">Left Position (default)</zn-menu-item>
  <zn-menu-item type="checkbox" checked checked-position="right">Right Position</zn-menu-item>
</zn-menu>
```

### Menu Items with Links

Menu items can function as links by using the `href` attribute. Use `target` to control where the link opens.

```html:preview
<zn-menu>
  <zn-menu-item href="https://example.com">
    <zn-icon slot="prefix" src="link" size="20"></zn-icon>
    Open Example
  </zn-menu-item>
  <zn-menu-item href="https://github.com" target="_blank">
    <zn-icon slot="prefix" src="open_in_new" size="20"></zn-icon>
    Open in New Tab
  </zn-menu-item>
</zn-menu>
```

### Submenus

Menu items can contain submenus. Hover over or navigate to a menu item with a submenu to expand it. Submenus support the same features as regular menus.

```html:preview
<zn-menu>
  <zn-menu-item>New File</zn-menu-item>
  <zn-menu-item>Open File</zn-menu-item>
  <zn-menu-item>
    Recent Files
    <zn-menu slot="submenu">
      <zn-menu-item>document1.txt</zn-menu-item>
      <zn-menu-item>document2.txt</zn-menu-item>
      <zn-menu-item>document3.txt</zn-menu-item>
    </zn-menu>
  </zn-menu-item>
  <zn-menu-item>Save File</zn-menu-item>
</zn-menu>
```

### Nested Submenus

Submenus can be nested multiple levels deep.

```html:preview
<zn-menu>
  <zn-menu-item>File</zn-menu-item>
  <zn-menu-item>
    Edit
    <zn-menu slot="submenu">
      <zn-menu-item>Undo</zn-menu-item>
      <zn-menu-item>Redo</zn-menu-item>
      <zn-menu-item>
        Find
        <zn-menu slot="submenu">
          <zn-menu-item>Find in File</zn-menu-item>
          <zn-menu-item>Find in Project</zn-menu-item>
          <zn-menu-item>
            Replace
            <zn-menu slot="submenu">
              <zn-menu-item>Replace in File</zn-menu-item>
              <zn-menu-item>Replace in Project</zn-menu-item>
            </zn-menu>
          </zn-menu-item>
        </zn-menu>
      </zn-menu-item>
    </zn-menu>
  </zn-menu-item>
  <zn-menu-item>View</zn-menu-item>
</zn-menu>
```

### Loading State

Use the `loading` attribute to show a loading state on menu items.

```html:preview
<zn-menu>
  <zn-menu-item>Regular Item</zn-menu-item>
  <zn-menu-item loading>Loading Item</zn-menu-item>
  <zn-menu-item>Another Item</zn-menu-item>
</zn-menu>
```

### Menu Item Colors

Use the `color` attribute to apply semantic colors to menu items.

```html:preview
<zn-menu>
  <zn-menu-item>Default</zn-menu-item>
  <zn-menu-item color="primary">Primary</zn-menu-item>
  <zn-menu-item color="secondary">Secondary</zn-menu-item>
  <zn-menu-item color="info">Info</zn-menu-item>
  <zn-menu-item color="success">Success</zn-menu-item>
  <zn-menu-item color="warning">Warning</zn-menu-item>
  <zn-menu-item color="error">Error</zn-menu-item>
</zn-menu>
```

### Keyboard Navigation

Menus support full keyboard navigation:

- **Arrow Up/Down** - Navigate between menu items
- **Home/End** - Jump to first/last menu item
- **Enter/Space** - Select the current menu item
- **Arrow Right** - Open a submenu
- **Arrow Left** - Close a submenu and return to parent
- **Escape** - Close the menu

```html:preview
<zn-dropdown placement="bottom-start">
  <zn-button slot="trigger" caret>Navigate with Keyboard</zn-button>
  <zn-menu>
    <zn-menu-item>
      <zn-icon slot="prefix" src="edit" size="20"></zn-icon>
      Edit
    </zn-menu-item>
    <zn-menu-item>
      <zn-icon slot="prefix" src="content_copy" size="20"></zn-icon>
      Copy
    </zn-menu-item>
    <zn-menu-item>
      More Options
      <zn-menu slot="submenu">
        <zn-menu-item>Option 1</zn-menu-item>
        <zn-menu-item>Option 2</zn-menu-item>
        <zn-menu-item>Option 3</zn-menu-item>
      </zn-menu>
    </zn-menu-item>
    <zn-menu-item disabled>Disabled Item</zn-menu-item>
    <zn-menu-item>
      <zn-icon slot="prefix" src="delete" size="20"></zn-icon>
      Delete
    </zn-menu-item>
  </zn-menu>
</zn-dropdown>
```

### Dividers

You can add visual separators between menu items using HTML elements with `role="separator"`.

```html:preview
<zn-menu>
  <zn-menu-item>Cut</zn-menu-item>
  <zn-menu-item>Copy</zn-menu-item>
  <zn-menu-item>Paste</zn-menu-item>
  <hr style="margin: 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
  <zn-menu-item>Select All</zn-menu-item>
  <hr style="margin: 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
  <zn-menu-item color="error">Delete</zn-menu-item>
</zn-menu>
```

### Complex Menu with Multiple Features

A comprehensive example showing various menu features together.

```html:preview
<zn-dropdown placement="bottom-start">
  <zn-button slot="trigger" caret>File Options</zn-button>
  <zn-menu id="complex-menu">
    <zn-menu-item value="new">
      <zn-icon slot="prefix" src="add" size="20"></zn-icon>
      New File
    </zn-menu-item>
    <zn-menu-item value="open">
      <zn-icon slot="prefix" src="folder_open" size="20"></zn-icon>
      Open File
    </zn-menu-item>
    <zn-menu-item value="recent">
      Recent Files
      <zn-menu slot="submenu">
        <zn-menu-item value="doc1">document1.txt</zn-menu-item>
        <zn-menu-item value="doc2">document2.txt</zn-menu-item>
        <zn-menu-item value="doc3">document3.txt</zn-menu-item>
      </zn-menu>
    </zn-menu-item>
    <hr style="margin: 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
    <zn-menu-item value="save">
      <zn-icon slot="prefix" src="save" size="20"></zn-icon>
      Save
    </zn-menu-item>
    <zn-menu-item value="save-as" disabled>
      <zn-icon slot="prefix" src="save_as" size="20"></zn-icon>
      Save As...
    </zn-menu-item>
    <hr style="margin: 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
    <zn-menu-item type="checkbox" value="auto-save" checked>
      Auto Save
    </zn-menu-item>
    <zn-menu-item type="checkbox" value="show-line-numbers">
      Show Line Numbers
    </zn-menu-item>
    <hr style="margin: 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
    <zn-menu-item value="export">
      Export
      <zn-menu slot="submenu">
        <zn-menu-item value="pdf">
          <zn-icon slot="prefix" src="picture_as_pdf" size="20"></zn-icon>
          Export as PDF
        </zn-menu-item>
        <zn-menu-item value="html">
          <zn-icon slot="prefix" src="code" size="20"></zn-icon>
          Export as HTML
        </zn-menu-item>
      </zn-menu>
    </zn-menu-item>
    <hr style="margin: 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
    <zn-menu-item value="close" color="error">
      <zn-icon slot="prefix" src="close" size="20"></zn-icon>
      Close File
    </zn-menu-item>
  </zn-menu>
</zn-dropdown>

<div id="complex-output" style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
  <strong>Last action:</strong> <span id="complex-action">None</span>
</div>

<script type="module">
  const menu = document.querySelector('#complex-menu');
  const output = document.querySelector('#complex-action');

  menu.addEventListener('zn-select', (event) => {
    const item = event.detail.item;
    output.textContent = `${item.value || 'No value'} - ${item.type === 'checkbox' ? (item.checked ? 'checked' : 'unchecked') : 'selected'}`;
  });
</script>
```

### Events

Menus emit the following events:

- `zn-select` - Emitted when a menu item is selected. The event detail includes the selected item.
- `zn-menu-ready` - Emitted when the menu's items have been slotted and the roving tab index is initialized.

```html:preview
<zn-dropdown placement="bottom-start">
  <zn-button slot="trigger" caret>Actions</zn-button>
  <zn-menu id="event-menu">
    <zn-menu-item value="action1">Action 1</zn-menu-item>
    <zn-menu-item value="action2">Action 2</zn-menu-item>
    <zn-menu-item value="action3">Action 3</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<div id="menu-event-output" style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
  <strong>Events:</strong>
  <ul id="menu-event-list" style="margin: 0.5rem 0 0 0; padding-left: 1.5rem;"></ul>
</div>

<script type="module">
  const menu = document.querySelector('#event-menu');
  const eventList = document.querySelector('#menu-event-list');

  function logEvent(eventName, detail = '') {
    const li = document.createElement('li');
    li.textContent = `${eventName}${detail ? ': ' + detail : ''}`;
    eventList.insertBefore(li, eventList.firstChild);

    // Keep only last 5 events
    while (eventList.children.length > 5) {
      eventList.removeChild(eventList.lastChild);
    }
  }

  menu.addEventListener('zn-select', (e) => {
    logEvent('zn-select', `value = ${e.detail.item.value}`);
  });

  menu.addEventListener('zn-menu-ready', () => {
    logEvent('zn-menu-ready');
  });
</script>
```

### Menu Item Events

Individual menu items emit their own events:

- `zn-menu-select` - Emitted when the menu item is selected. The event detail includes the item's value and element.

```html:preview
<zn-dropdown placement="bottom-start">
  <zn-button slot="trigger" caret>Select Item</zn-button>
  <zn-menu>
    <zn-menu-item id="item1" value="first">First Item</zn-menu-item>
    <zn-menu-item id="item2" value="second">Second Item</zn-menu-item>
    <zn-menu-item id="item3" value="third">Third Item</zn-menu-item>
  </zn-menu>
</zn-dropdown>

<div id="item-event-output" style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
  <strong>Menu item events:</strong>
  <ul id="item-event-list" style="margin: 0.5rem 0 0 0; padding-left: 1.5rem;"></ul>
</div>

<script type="module">
  const items = document.querySelectorAll('#item1, #item2, #item3');
  const eventList = document.querySelector('#item-event-list');

  function logEvent(eventName, detail = '') {
    const li = document.createElement('li');
    li.textContent = `${eventName}${detail ? ': ' + detail : ''}`;
    eventList.insertBefore(li, eventList.firstChild);

    // Keep only last 5 events
    while (eventList.children.length > 5) {
      eventList.removeChild(eventList.lastChild);
    }
  }

  items.forEach(item => {
    item.addEventListener('zn-menu-select', (e) => {
      logEvent('zn-menu-select', `${item.id}: value = ${e.detail.value}`);
    });
  });
</script>
```

### Suffix Slot

Use the `suffix` slot to add content to the right side of menu items, such as keyboard shortcuts or badges.

```html:preview
<zn-menu>
  <zn-menu-item>
    <zn-icon slot="prefix" src="content_copy" size="20"></zn-icon>
    Copy
    <span slot="suffix" style="opacity: 0.6; font-size: 0.875rem;">Ctrl+C</span>
  </zn-menu-item>
  <zn-menu-item>
    <zn-icon slot="prefix" src="content_cut" size="20"></zn-icon>
    Cut
    <span slot="suffix" style="opacity: 0.6; font-size: 0.875rem;">Ctrl+X</span>
  </zn-menu-item>
  <zn-menu-item>
    <zn-icon slot="prefix" src="content_paste" size="20"></zn-icon>
    Paste
    <span slot="suffix" style="opacity: 0.6; font-size: 0.875rem;">Ctrl+V</span>
  </zn-menu-item>
</zn-menu>
```

### Programmatic Control

You can programmatically control menu items using their methods.

```html:preview
<zn-menu>
  <zn-menu-item id="prog-item1">Item 1</zn-menu-item>
  <zn-menu-item id="prog-item2">Item 2</zn-menu-item>
  <zn-menu-item id="prog-item3">Item 3</zn-menu-item>
</zn-menu>

<div style="margin-top: 1rem;">
  <zn-button id="focus-item2" size="small">Focus Item 2</zn-button>
  <zn-button id="click-item3" size="small" color="info">Click Item 3</zn-button>
</div>

<div id="prog-output" style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
  <strong>Status:</strong> <span id="prog-status">Ready</span>
</div>

<script type="module">
  const item2 = document.querySelector('#prog-item2');
  const item3 = document.querySelector('#prog-item3');
  const status = document.querySelector('#prog-status');

  document.querySelector('#focus-item2').addEventListener('click', () => {
    item2.focus();
    status.textContent = 'Focused Item 2';
  });

  document.querySelector('#click-item3').addEventListener('click', () => {
    item3.click();
    status.textContent = 'Clicked Item 3';
  });

  item3.addEventListener('zn-menu-select', () => {
    status.textContent = 'Item 3 was selected';
  });
</script>
```


