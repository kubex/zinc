---
meta:
  title: Menu Item
  description:
layout: component
---

```html:preview
<zn-menu-item>Menu item</zn-menu-item>
```

## Examples

### Colors Example

```html:preview
<zn-menu-item>Menu item</zn-menu-item>
<zn-menu-item color="primary">Menu item</zn-menu-item>
<zn-menu-item color="secondary">Menu item</zn-menu-item>
<zn-menu-item color="transparent">Menu item</zn-menu-item>
<zn-menu-item color="error">Menu item</zn-menu-item>
<zn-menu-item color="info">Menu item</zn-menu-item>
<zn-menu-item color="success">Menu item</zn-menu-item>
<zn-menu-item color="warning">Menu item</zn-menu-item>
```

### Keeping the Dropdown Open

A menu item inside a `zn-dropdown` closes it on select. `keep-open` exempts a single item, for rows
that change how the panel behaves rather than committing a choice — an operator picker above a list
of values, say. `stay-open-on-select` on the dropdown itself still covers every item at once.

```html:preview
<zn-dropdown>
  <zn-button slot="trigger" icon="chevron-down@lu" icon-position="right">Sort</zn-button>
  <zn-menu>
    <zn-menu-item type="checkbox" keep-open checked>Ascending</zn-menu-item>
    <zn-menu-item type="checkbox" keep-open>Descending</zn-menu-item>
    <zn-menu-item value="name">Name</zn-menu-item>
    <zn-menu-item value="created">Created</zn-menu-item>
  </zn-menu>
</zn-dropdown>
```



### Submitting a Form

Set `form` to the id of a `<form>` to submit it when the item is chosen, so a menu can run the same action as a
button elsewhere on the page.

```html:preview
<form id="menu-item-archive" action="/archive" method="post" onsubmit="event.preventDefault()"></form>
<zn-menu>
  <zn-menu-item form="menu-item-archive">Archive</zn-menu-item>
</zn-menu>
```
