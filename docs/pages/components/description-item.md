---
meta:
  title: Description Item
  description:
layout: component
---

```html:preview
<zn-sp divide no-gap>
  <zn-description-item caption="Full name">
    <zn-inline-edit name="name" value="Margot Foster"></zn-inline-edit>
  </zn-description-item>
  <zn-description-item caption="Full name">
    Margot Foster
  </zn-description-item>
  <zn-description-item caption="Full name">
    margot.foster@example.com
  </zn-description-item>
  <zn-description-item caption="Full name">
    lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
  </zn-description-item>
</zn-sp>
```

## Examples

### Lots of Content

```html:preview
<zn-description-item caption="Full name">
  lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna 
  aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</zn-description-item>
```

### Multiple Actions

Example of multiple actions in a description item.

```html:preview

<zn-description-item caption="Address">
  <p><strong>Company</strong> Example here </p>
  <p><strong>Line 1</strong> Example here </p>
  <p><strong>Line 2</strong> Example here </p>
  <p><strong>Line 3</strong> Example here </p>
  <p><strong>Town</strong> Example here </p>
  <p><strong>County</strong> Example here </p>
  <p><strong>Postal Code</strong> Example here </p>
  <p><strong>Country</strong> Example here </p>
  
  <zn-button id="address-modal" slot="actions" size="x-small" color="secondary" modal>Edit</zn-button>
  <zn-button id="address-modal" slot="actions" size="x-small" color="secondary" modal>Edit</zn-button>
  
</zn-description-item>
```

