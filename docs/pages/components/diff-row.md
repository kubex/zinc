---
meta:
  title: Diff Row
  description: One aligned row of a diff, showing the same item in both versions and tinted by how it changed.
layout: component
---

```html:preview
<zn-diff before-caption="Before" after-caption="After">
  <zn-diff-row caption="Section" heading></zn-diff-row>
  <zn-diff-row caption="Unchanged">
    <span slot="before">Same value</span>
    <span slot="after">Same value</span>
  </zn-diff-row>
  <zn-diff-row caption="Changed" change="changed">
    <span slot="before">Old value</span>
    <span slot="after">New value</span>
  </zn-diff-row>
  <zn-diff-row caption="Added" change="added">
    <span slot="after">New item</span>
  </zn-diff-row>
  <zn-diff-row caption="Removed" change="removed">
    <span slot="before">Old item</span>
  </zn-diff-row>
</zn-diff>
```

Use `heading` for a row that names the group below it. `change` is `changed`, `added` or `removed`; leave it out for an unchanged item.
