---
meta:
  title: Confirm
  description:
layout: component
---

```html:preview
<zn-button id="action-trigger">Trigger Confirm Content</zn-button>
<zn-confirm trigger="action-trigger"
                    type="error"
                    caption="Do Something"
                    content="Are you sure you want to do that?">
</zn-confirm>

<zn-button id="action-trigger-2">Trigger Confirm Content with Form</zn-button>
<zn-confirm trigger="action-trigger-2"
                    type="error"
                    caption="Do Something"
                    content="Are you sure you want to do that?">
                    
                    <form class="form-spacing">
                      <zn-input label="Name" required></zn-input>
                      <zn-input label="Email" type="email" required></zn-input>
                    </form>
</zn-confirm>
```

## Examples

### Announcement Confirmations

```html:preview
<zn-button id="action-trigger">Trigger Confirm Content</zn-button>
<zn-confirm trigger="action-trigger"
                    variant="announcement"
                    type="warning"
                    caption="Changing the status of this item"
                    content="By changing the status of this item, you will be affecting the status of all related items.">
                    
                    <form class="form-spacing">
                      <zn-input label="Name" required></zn-input>
                      <zn-input label="Email" type="email" required></zn-input>
                    </form>
</zn-confirm>
```

### Second Example

TODO


