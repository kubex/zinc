---
meta:
  title: Action Bar
  description:
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

  <zn-dropdown placement="bottom-end" distance="10" slot="actions">
    <zn-button slot="trigger"
               color="transparent"
               size="x-small"
               notification="5"
               icon="new_label"
               icon-size="24">
    </zn-button>
    <div class="label-action">
      Label Dropdown
    </div>
  </zn-dropdown>

  <zn-dropdown placement="bottom-end" distance="10" slot="actions">
    <zn-button slot="trigger"
               color="transparent"
               size="x-small"
               icon="edit_note"
               notification="3"
               icon-size="24">
    </zn-button>
    <div class="note-action">
      Note Dropdown
    </div>
  </zn-dropdown>

</zn-action-bar>
```

## Examples

### First Example

TODO

### Second Example

TODO
