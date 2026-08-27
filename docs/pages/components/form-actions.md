---
meta:
  title: Form Actions
  description: A standard action row for the bottom of a form, built up from a lone submit button.
layout: component
---

Drops the standard action row into a form. The default is just a primary submit button — build it up with `with-cancel` and `with-reset` as the form needs. Place it inside the form it should act on.

```html:preview
<form>
  <zn-form-actions></zn-form-actions>
</form>
```

## Examples

### With a Cancel Button

Use the `with-cancel` attribute to add a cancel button. When the form lives inside a dialog or slideout, cancelling closes it; it also emits a `zn-cancel` event for the container to handle.

```html:preview
<zn-dialog trigger="form-actions-dialog" label="New Ticket">
  <form>
    <zn-form-actions with-cancel></zn-form-actions>
  </form>
</zn-dialog>
<zn-button id="form-actions-dialog">Open Dialog</zn-button>
```

### With a Reset Button

Use the `with-reset` attribute to add a button that resets the form's fields.

```html:preview
<form>
  <input type="text" name="example" value="Change me, then reset">
  <zn-form-actions with-reset></zn-form-actions>
</form>
```

### Custom Text and Icons

Each button's text and icon can be overridden with `submit-text` / `submit-icon`, `cancel-text` / `cancel-icon` and `reset-text` / `reset-icon`.

```html:preview
<form>
  <zn-form-actions with-cancel submit-text="Create Ticket" submit-icon="plus@lu" cancel-text="Discard" cancel-icon="trash-2@lu"></zn-form-actions>
</form>
```

### Extra Actions

Extra buttons placed in the default slot appear before the standard buttons.

```html:preview
<form>
  <zn-form-actions>
    <zn-button color="transparent">Preview</zn-button>
  </zn-form-actions>
</form>
```

### Targeting a Form by Id

When the component can't live inside the form, point it at one with the `form` attribute.

```html:preview
<form id="standalone-form"></form>
<zn-form-actions form="standalone-form"></zn-form-actions>
```
