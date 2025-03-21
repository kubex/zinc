---
meta:
  title: Tabs
  description:
layout: component
---

```html:preview

<zn-tabs caption="Example Panel" flush>
  <zn-navbar slot="top">
    <li tab>Customer</li>
    <li tab="something-else">Something Else</li>
  </zn-navbar>

  <zn-sp id="" no-gap divide>
    <zn-inline-edit padded inline caption="Label 1" value="This is Awesome"></zn-inline-edit>
    <zn-inline-edit padded inline caption="Label 2" value="This is Awesome"></zn-inline-edit>
  </zn-sp>

  <zn-sp id="something-else" no-gap divide>
    <zn-inline-edit padded inline caption="Label 3" value="This is not Awesome"></zn-inline-edit>
    <zn-inline-edit padded inline caption="Label 4" value="This is not Awesome"></zn-inline-edit>
  </zn-sp>
</zn-tabs>
```

## Examples

### Without a Caption


```html:preview

<zn-tabs flush>
  <zn-navbar slot="top">
    <li tab>Customer</li>
    <li tab="something-else">Something Else</li>
  </zn-navbar>

  <zn-sp id="" no-gap divide>
    <zn-inline-edit padded inline caption="Label 1" value="This is Awesome"></zn-inline-edit>
    <zn-inline-edit padded inline caption="Label 2" value="This is Awesome"></zn-inline-edit>
  </zn-sp>

  <zn-sp id="something-else" no-gap divide>
    <zn-inline-edit padded inline caption="Label 3" value="This is not Awesome"></zn-inline-edit>
    <zn-inline-edit padded inline caption="Label 4" value="This is not Awesome"></zn-inline-edit>
  </zn-sp>
</zn-tabs>
```

### Second Example

TODO


