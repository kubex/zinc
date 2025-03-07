---
meta:
  title: Form Examples
  description: Examples of forms using Zinc components.
---

# Form Examples

### Example Profile Form

This example demonstrates a simple profile form using Zinc form controls. The form includes a text input, a select
input,

```html:preview
<form class="input-validation-required">
  <zn-form-group label="Profile" help-text="This information will be displayed publicly so be careful what you share">
    <zn-input name="name" label="Name" required>
      <input type="text" id="text" name="text">
    </zn-input>
    <br />
    <zn-select label="Favorite Animal" clearable required>
      <zn-option value="birds">Birds</zn-option>
      <zn-option value="cats">Cats</zn-option>
      <zn-option value="dogs">Dogs</zn-option>
      <zn-option value="other">Other</zn-option>
    </zn-select>
    <br />
    <zn-textarea name="comment" label="Comment" required></zn-textarea>
    <br />
    <zn-checkbox required>Check me before submitting</zn-checkbox>
    <br /><br />
    <zn-checkbox-group label="Checkbox group" help-text="Select at least one" label-tooltip="Do you need help?" required>
      <zn-checkbox value="I'm option 1">Option 1</zn-checkbox>
      <zn-checkbox value="I'm option 2">Option 2</zn-checkbox>
      <zn-checkbox value="I'm option 3">Option 3</zn-checkbox>
     </zn-checkbox-group>
    <br /><br />
    <zn-button type="submit" variant="primary">Submit</zn-button>
  </zn-form-group>
</form>
```