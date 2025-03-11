---
meta:
  title: Form Examples
  description: Examples of forms using Zinc components.
---

# Form Examples

### Example Profile Form

This example demonstrates a simple profile form using Zinc form controls. The form includes a text input, a select
input,

:::tip
You can also wrap the form component in `<div class="form-spacing">` to give some automatic spacing between the
components.
:::

<zn-button>Hello</zn-button>


```html:preview
<form class="input-validation-required">
  <zn-sp pad-y divide>
    <zn-form-group 
      label="Profile" 
      label-tooltip="huh"
      help-text="This information will be displayed publicly so be careful what you share">
      
      <div class="form-spacing">
        <zn-input type="text" name="name" label="Name" required></zn-input>
        <zn-select label="Favorite Animal" clearable required>
          <zn-option value="birds">Birds</zn-option>
          <zn-option value="cats">Cats</zn-option>
          <zn-option value="dogs">Dogs</zn-option>
          <zn-option value="other">Other</zn-option>
        </zn-select>
      
        <zn-textarea name="comment" label="Comment" required></zn-textarea>
       
        <zn-checkbox required>Check me before submitting</zn-checkbox>
        
        <zn-checkbox-group label="Checkbox group" help-text="Select at least one" label-tooltip="Do you need help?" required>
          <zn-checkbox value="I'm option 1">Option 1</zn-checkbox>
          <zn-checkbox value="I'm option 2">Option 2</zn-checkbox>
          <zn-checkbox value="I'm option 3">Option 3</zn-checkbox>
        </zn-checkbox-group>
      </div>
    </zn-form-group>
    
    <zn-form-group 
      label="Profile" 
      label-tooltip="huh"
      help-text="This information will be displayed publicly so be careful what you share">
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
  </zn-sp>
</form>
```

### Example Form With Columns

If you want more control of the appearance of your form, you can add the class `.form-spacing` around any elements you
want to control with the atrribute `span="x"`

```html:preview
<form class="input-validation-required">
  <zn-form-group 
    label="Profile" 
    label-tooltip="huh"
    help-text="This information will be displayed publicly so be careful what you share">
      <zn-input type="text" name="name" label="Name" required></zn-input>
      <br />
      <div class="form-spacing">
        <zn-select span="3" label="Favorite Animal" clearable required>
          <zn-option value="birds">Birds</zn-option>
          <zn-option value="cats">Cats</zn-option>
          <zn-option value="dogs">Dogs</zn-option>
          <zn-option value="other">Other</zn-option>
        </zn-select>
        <zn-select span="3" label="Favorite Bird" clearable required>
          <zn-option value="crow">Crow</zn-option>
          <zn-option value="pidgeon">Pidgeon</zn-option>
          <zn-option value="hawk">Hawk</zn-option>
          <zn-option value="owl">Owl</zn-option>
        </zn-select>
      </div>
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
  </zn-form-group>
</form>
```