---
meta:
  title: Checkbox Group
  description:
layout: component
---

## Examples

### Basic Checkbox Group

A basic checkbox group lays out multiple checkbox items vertically.

```html:preview
<zn-checkbox-group label="Financial products permissions" name="a">
  <zn-checkbox value="initiate-outbound">Initiate outbound transfers</zn-checkbox>
  <zn-checkbox value="approve-outbound">Approve outbound transfers </zn-checkbox>
  <zn-checkbox value="export">Export transactions</zn-checkbox>
</zn-checkbox-group>
```

### Help Text

Add descriptive help text to a checkbox group with the `help-text` attribute. For help texts that contain HTML, use the
`help-text` slot instead.

```html:preview
<zn-checkbox-group label="Financial products permissions" help-text="Outbound transfers require separate initiators and approvers" name="a">
  <zn-checkbox value="initiate-outbound">Initiate outbound transfers</zn-checkbox>
  <zn-checkbox value="approve-outbound">Approve outbound transfers </zn-checkbox>
  <zn-checkbox value="export">Export transactions</zn-checkbox>
</zn-checkbox-group>
```

### Label with Tooltip

Use the `label-tooltip` attribute to add text that appears in a tooltip triggered by an info icon next to the label.

:::tip
**Usage:** Use a **label tooltip** to provide helpful but non-essential instructions or examples to guide people when
making a selection from the checkbox group. Use **help text** to communicate instructions or requirements for making a
selection without errors.
:::

```html:preview
<zn-checkbox-group name="a" label="Financial products permissions" help-text="Outbound transfers require separate initiators and approvers" label-tooltip="These apply to cash account only">
  <zn-checkbox value="initiate-outbound">Initiate outbound transfers</zn-checkbox>
  <zn-checkbox value="approve-outbound">Approve outbound transfers </zn-checkbox>
  <zn-checkbox value="export">Export transactions</zn-checkbox>
</zn-checkbox-group>
```

### Horizontal Checkbox Group

Use the `horizontal` attribute to lay out multiple checkbox items horizontally.

:::tip
**Making the horizontal checkbox group responsive:** Use a container query to adjust the layout of the checkbox group's
`form-control-input` part (which wraps the checkbox items) at a custom target breakpoint (the container's width when the
horizontal layout breaks). In the example below, a container query checks the width of the checkbox group container and
switches the layout to vertical (setting `flex-direction` to `column`) when the container becomes too narrow for a
horizontal layout.
:::

```html:preview
<zn-checkbox-group name="a" id="permissions" label="Financial products permissions" horizontal>
  <zn-checkbox value="manage-transfers">Manage transfers</zn-checkbox>
  <zn-checkbox value="export">Export transactions</zn-checkbox>
</zn-checkbox-group>

<style>
  zn-checkbox-group[id="permissions"] {
    container-type: inline-size;
    container-name: permissions;
  }

  @container permissions (max-width: 400px) {
    zn-checkbox-group[id="permissions"]::part(form-control-input) {
      flex-direction: column;
    }
  }
</style>
```

### Contained Checkbox Group

Use the `contained` attribute to draw a card-like container around each checkbox item in the checkbox group. This style
is useful for giving more emphasis to the list of options.

This option can be combined with the `horizontal` attribute.

```html:preview
<zn-checkbox-group name="a" label="Financial products permissions" help-text="Outbound transfers require separate initiators and approvers" contained>
  <zn-checkbox value="initiate-outbound">Initiate outbound transfers</zn-checkbox>
  <zn-checkbox value="approve-outbound">Approve outbound transfers </zn-checkbox>
  <zn-checkbox value="export">Export transactions</zn-checkbox>
</zn-checkbox-group>
<br/>
<br/>
<zn-checkbox-group name="b" label="Financial products permissions" help-text="Outbound transfers require separate initiators and approvers" contained horizontal>
  <zn-checkbox value="initiate-outbound">Initiate outbound transfers</zn-checkbox>
  <zn-checkbox value="approve-outbound">Approve outbound transfers </zn-checkbox>
</zn-checkbox-group>
```

:::tip
When [checkboxes](/components/checkbox) are wrapped with the Checkbox Group , adding the `contained` attribute to the
parent Checkbox Group or to _any_ checkbox in the group will create `contained` checkboxes for the entire group.
:::

### Disabling Options

Checkboxes can be disabled by adding the `disabled` attribute to the respective options inside the checkbox group.

```html:preview
<zn-checkbox-group name="a"  label="Financial products permissions" help-text="Exporting is currently disabled for all users" required>
  <zn-checkbox value="initiate-outbound">Initiate outbound transfers</zn-checkbox>
  <zn-checkbox value="approve-outbound">Approve outbound transfers </zn-checkbox>
  <zn-checkbox value="export" disabled>Export transactions</zn-checkbox>
</zn-checkbox-group>
```

### Validation

Set the `required` attribute to make selecting at least one option mandatory. If at least one value has not been
selected, it will prevent the form from submitting and display an error message.

```html:preview
<form class="validation">
  <zn-checkbox-group name="a" label="Select at least one option" required>
    <zn-checkbox value="option-1">Option 1</zn-checkbox>
    <zn-checkbox value="option-2">Option 2</zn-checkbox>
    <zn-checkbox value="option-3">Option 3</zn-checkbox>
  </zn-checkbox-group>
  <br />
  <zn-button type="submit" variant="primary">Submit</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.validation');

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined('zn-checkbox-group'),
  ]).then(() => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      alert('All fields are valid!');
    });
  });
</script>
```

### Custom Validity

Use the `setCustomValidity()` method to set a custom validation message. This will prevent the form from submitting and
make the browser display the error message you provide. To clear the error, call this function with an empty string.

```html:preview
<form class="custom-validity">
  <zn-checkbox-group name="a" label="Select the third option" required>
    <zn-checkbox value="option-1">You can optionally choose me</zn-checkbox>
    <zn-checkbox value="option-2">I'm optional too</zn-checkbox>
    <zn-checkbox value="option-3">You must choose me</zn-checkbox>
  </zn-checkbox-group>
  <br />
  <zn-button type="submit" variant="primary">Submit</zn-button>
</form>

<script type="module">
  const form = document.querySelector('.custom-validity');
  const checkboxGroup = form.querySelector('zn-checkbox-group');
  const errorMessage = 'You must choose the last option';

  // Set initial validity as soon as the element is defined
  customElements.whenDefined('zn-checkbox').then(() => {
    checkboxGroup.setCustomValidity(errorMessage);
  });

  // Update validity when a selection is made
  form.addEventListener('zn-change', () => {
    const isValid = checkboxGroup.value.some(value => value.includes('option-3'));
    checkboxGroup.setCustomValidity(isValid ? '' : errorMessage);
  });

  // Wait for controls to be defined before attaching form listeners
  await Promise.all([
    customElements.whenDefined('zn-checkbox-group'),
  ]).then(() => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      alert('All fields are valid!');
    });
  });
</script>
```