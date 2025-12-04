---
meta:
  title: Input Group
  description: A wrapper component that groups inputs and selects visually.
layout: component
---

Input Groups allow you to group multiple form controls together into a single visual unit.

```html:preview
<zn-input-group>
  <zn-input placeholder="First Name"></zn-input>
  <zn-input placeholder="Last Name"></zn-input>
</zn-input-group>
```

## Examples

### Mixed Inputs and Selects

You can combine inputs and selects.

```html:preview
<zn-input-group>
  <zn-select value="http://" style="width: 125px;">
    <zn-option value="http://">http://</zn-option>
    <zn-option value="https://">https://</zn-option>
  </zn-select>
  <zn-input placeholder="example.com"></zn-input>
</zn-input-group>
```

### Multiple Inputs

```html:preview
<zn-input-group>
  <zn-input placeholder="City"></zn-input>
  <zn-input placeholder="State"></zn-input>
  <zn-input placeholder="Zip"></zn-input>
</zn-input-group>
```

### Labeled Group

Use the `label` attribute to add a label to the input group.

```html:preview
<zn-input-group label="Personal Information">
  <zn-input placeholder="First Name"></zn-input>
  <zn-input placeholder="Last Name"></zn-input>
</zn-input-group>
```
