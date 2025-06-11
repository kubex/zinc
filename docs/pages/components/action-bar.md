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
  
  <zn-expanding-action icon="edit_note"
                       method="fill"
                       count-uri="/note/count"
                       slot="actions"
                       prefetch>
    <p>This is the content here, this will probably be loaded from one of the URIs.</p>
    <p>if count uri is set, use that to retrieve the number to display as a notification
      if prefetch is set, we need to lod the uri which should have the count with it.</p>
  </zn-expanding-action>

  <zn-expanding-action icon="new_label"
                       content-uri="/test"
                       method="fill"
                       slot="actions">
    <p>This is the content here, this will probably be loaded from one of the URIs.</p>
    <p>if count uri is set, use that to retrieve the number to display as a notification
      if prefetch is set, we need to lod the uri which should have the count with it.</p>
  </zn-expanding-action>

</zn-action-bar>
```

## Examples

### First Example

TODO

### Second Example

TODO
