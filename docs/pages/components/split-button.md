---
meta:
  title: Split Button
  description:
layout: component
---

```html:preview

<zn-split-button href="#something" color="primary" caption="Hello World">
  <zn-menu slot="menu">
    <zn-menu-item href="#somewhere">Somewhere</zn-menu-item>
  </zn-menu>
</zn-split-button>
```

## Examples

### As a form Submit with different values

```html:preview

<zn-split-button type="submit" name="button" value="send-on-close" caption="Send and Close">
  <zn-menu slot="menu">
    <zn-menu-item value="send">Send</zn-menu-item>
  </zn-menu>
</zn-split-button>
```

### Second Example

TODO
