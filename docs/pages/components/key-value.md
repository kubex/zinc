---
meta:
  title: Key Value
  description: Edits a list of name and value pairs, submitted as a JSON object.
layout: component
---

```html:preview
<zn-key-value label="Placeholders" name="placeholders" key-label="Name" value-label="Value"
              value='{"1": "{{recipient.firstName}}"}'></zn-key-value>
```

## Examples

### Labels

Use `key-label` and `value-label` for the placeholder of each input, and `add-text` for the add button.

```html:preview
<zn-key-value label="Headers" key-label="Header" value-label="Content" add-text="Add header"></zn-key-value>
```

### Merge fields

`slash-items` is passed to each value input, so typing `/` offers the same insertions as `zn-input`.

### Actions

Buttons in the `actions` slot sit beside the add button, wrapping below it when there is no room.

```html:preview
<zn-key-value list key-label="10.0.0.0/24" add-text="Add IP / CIDR">
  <zn-button slot="actions" icon="plus@lu" color="secondary" size="small">Add my IP (203.0.113.7)</zn-button>
</zn-key-value>
```
