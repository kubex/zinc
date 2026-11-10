---
meta:
  title: Context Menu
  description: Opens a menu where its content is right-clicked.
layout: component
---

Wrap content in `<zn-context-menu>` and put a `<zn-menu>` in its `menu` slot. Right-clicking anywhere in the content
opens the menu at the pointer. <kbd>Shift</kbd>+<kbd>F10</kbd> and the context menu key open it under the focused
element. Choosing an item closes the menu.

```html:preview
<zn-context-menu>
  <zn-panel caption="Right-click me">Right-click anywhere in this panel.</zn-panel>
  <zn-menu slot="menu">
    <zn-menu-item value="settings">Settings for this app</zn-menu-item>
    <zn-menu-item value="mute">Mute this category</zn-menu-item>
  </zn-menu>
</zn-context-menu>
```

Use `disabled` to leave the browser's own context menu in place.

### Opening From a Button

A descendant with `context-menu-trigger` opens the menu below itself on click, so the menu is reachable without a
right-click, on touch screens and with the keyboard.

```html:preview
<zn-context-menu>
  <zn-panel caption="Notification">
    <zn-button slot="actions" icon="ellipsis@lu" icon-button="small" tooltip="More" context-menu-trigger plain></zn-button>
    Right-click, or use the button.
  </zn-panel>
  <zn-menu slot="menu">
    <zn-menu-item value="read">Mark as read</zn-menu-item>
    <zn-menu-label>Settings</zn-menu-label>
    <zn-menu-item value="settings">This app</zn-menu-item>
  </zn-menu>
</zn-context-menu>
```
