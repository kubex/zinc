---
meta:
  title: Absolute Container
  description:
layout: component
---

```html:preview

<zn-sidebar>
  <div style="display: flex; flex-direction: column; position: relative;">
    This is content on the outside
    <zn-absolute-container>
      <div style="background-color: var(--zn-color-amber-100); height: 400px; width: 100%; position: absolute;">
        This is the content of the absoloute
      </div>
    </zn-absolute-container>
  </div>
</zn-sidebar>
```

## Examples

The absolute container is used to wrap absolute elements, that would otherwise cause problems with the dom.

```html:preview

<div style="display: flex; position: relative;">
  <zn-absolute-container>
    <div style="background-color: var(--zn-color-amber-100); height: 400px; width: 100%; position: absolute;">
      This is the content of the absoloute
    </div>
  </zn-absolute-container>
</div>
```